"use client";
"use no memo";
// three.js objects (uniforms, camera, render targets) are mutated every frame by design.
/* eslint-disable react-hooks/immutability */

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import fullscreenVert from "@/shaders/fullscreen.vert";
import surfaceFrag from "@/shaders/surface.frag";
import trailFrag from "@/shaders/trail.frag";
import { THEMES, clamp, damp, hexToRgb, state } from "@/lib/store";

const MAX_SECTIONS = 16;
const TRAIL_SCALE = 8;

function makeTarget(w, h) {
  return new THREE.WebGLRenderTarget(w, h, {
    type: THREE.HalfFloatType,
    minFilter: THREE.LinearFilter,
    magFilter: THREE.LinearFilter,
    depthBuffer: false,
  });
}

export default function Surface() {
  const gl = useThree((s) => s.gl);
  const size = useThree((s) => s.size);
  const sections = useRef([]);
  const smooth = useRef({ band: 0, prevMouse: new THREE.Vector2(-1, -1) });

  const quad = useMemo(() => new THREE.PlaneGeometry(2, 2), []);

  const trail = useMemo(() => {
    const material = new THREE.ShaderMaterial({
      vertexShader: fullscreenVert,
      fragmentShader: trailFrag,
      uniforms: {
        uPrev: { value: null },
        uMouse: { value: new THREE.Vector2(-1, -1) },
        uPrevMouse: { value: new THREE.Vector2(-1, -1) },
        uAspect: { value: 1 },
        uRadius: { value: 0.05 },
        uStrength: { value: 0 },
        uDecay: { value: 0.95 },
      },
      depthTest: false,
      depthWrite: false,
    });
    const scene = new THREE.Scene();
    scene.add(new THREE.Mesh(quad, material));
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    return { material, scene, camera, read: makeTarget(8, 8), write: makeTarget(8, 8) };
  }, [quad]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: fullscreenVert,
        fragmentShader: surfaceFrag,
        uniforms: {
          uResolution: { value: new THREE.Vector2(1, 1) },
          uDpr: { value: 1 },
          uScroll: { value: 0 },
          uTime: { value: 0 },
          uCell: { value: 22 },
          uBand: { value: 40 },
          uTops: { value: new Array(MAX_SECTIONS).fill(1e6) },
          uColors: { value: Array.from({ length: MAX_SECTIONS }, () => new THREE.Vector3(...hexToRgb(THEMES.blue.bg))) },
          uAccents: { value: Array.from({ length: MAX_SECTIONS }, () => new THREE.Vector3(...hexToRgb(THEMES.blue.accent))) },
          uKinds: { value: new Array(MAX_SECTIONS).fill(THEMES.blue.kind) },
          uCount: { value: 1 },
          uTrail: { value: null },
        },
        depthTest: false,
        depthWrite: false,
      }),
    []
  );

  // Resize the trail buffers with the viewport.
  useEffect(() => {
    const w = Math.max(8, Math.ceil(size.width / TRAIL_SCALE));
    const h = Math.max(8, Math.ceil(size.height / TRAIL_SCALE));
    trail.read.setSize(w, h);
    trail.write.setSize(w, h);
    trail.material.uniforms.uAspect.value = size.width / size.height;
    material.uniforms.uResolution.value.set(size.width, size.height);
    material.uniforms.uCell.value = size.width < 768 ? 16 : 22;
  }, [size, trail, material]);

  // Collect themed sections from the DOM.
  useEffect(() => {
    const collect = () => {
      const els = Array.from(document.querySelectorAll("[data-theme]")).slice(0, MAX_SECTIONS);
      sections.current = els;
      const u = material.uniforms;
      els.forEach((el, i) => {
        const theme = THEMES[el.dataset.theme] ?? THEMES.dark;
        u.uColors.value[i].set(...hexToRgb(theme.bg));
        u.uAccents.value[i].set(...hexToRgb(theme.accent));
        u.uKinds.value[i] = theme.kind;
      });
      u.uCount.value = Math.max(1, els.length);
    };
    collect();
    const t = setTimeout(collect, 500);
    return () => clearTimeout(t);
  }, [material]);

  useEffect(
    () => () => {
      trail.read.dispose();
      trail.write.dispose();
      trail.material.dispose();
      material.dispose();
      quad.dispose();
    },
    [trail, material, quad]
  );

  useFrame((st, dt) => {
    const u = material.uniforms;
    const s = smooth.current;
    u.uTime.value = st.clock.elapsedTime;
    u.uDpr.value = gl.getPixelRatio();
    u.uScroll.value = state.scroll;

    // Section seams.
    const els = sections.current;
    for (let i = 0; i < els.length; i++) {
      u.uTops.value[i] = i === 0 ? -1e6 : els[i].getBoundingClientRect().top;
    }
    const cell = u.uCell.value;
    const targetBand = cell * 1.5 + clamp(Math.abs(state.velocity) * 2.5, 0, 140);
    s.band = damp(s.band, targetBand, 5, dt);
    u.uBand.value = s.band;

    // Cursor trail ping-pong.
    const m = state.mouse;
    const tu = trail.material.uniforms;
    const hasMouse = m.x > -1000;
    const mx = hasMouse ? m.x / size.width : -1;
    const my = hasMouse ? 1 - m.y / size.height : -1;
    if (s.prevMouse.x < 0) s.prevMouse.set(mx, my);
    tu.uPrevMouse.value.copy(s.prevMouse);
    tu.uMouse.value.set(mx, my);
    tu.uStrength.value = hasMouse ? clamp(m.speed / 40, 0, 0.6) : 0;
    tu.uRadius.value = 0.035 + clamp(m.speed / 1200, 0, 0.03);
    tu.uDecay.value = Math.pow(0.955, dt * 60);
    tu.uPrev.value = trail.read.texture;
    gl.setRenderTarget(trail.write);
    gl.render(trail.scene, trail.camera);
    gl.setRenderTarget(null);
    const tmp = trail.read;
    trail.read = trail.write;
    trail.write = tmp;
    u.uTrail.value = trail.read.texture;
    s.prevMouse.set(mx, my);
    m.speed *= Math.pow(0.8, dt * 60);
  });

  return <mesh geometry={quad} material={material} renderOrder={-10} frustumCulled={false} />;
}

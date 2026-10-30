"use client";
"use no memo";
// three.js objects (uniforms, camera, render targets) are mutated every frame by design.
/* eslint-disable react-hooks/immutability */

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import vert from "@/shaders/media.vert";
import frag from "@/shaders/media.frag";
import { getMediaSnapshot, getServerSnapshot, subscribeMedia } from "@/lib/media";
import { clamp, damp, hexToRgb, PALETTE, state } from "@/lib/store";
import { loadTexture } from "./textures";

let sharedGeometry = null;
const getGeometry = () => (sharedGeometry ??= new THREE.PlaneGeometry(1, 1, 24, 24));

function MediaPlane({ item }) {
  const size = useThree((s) => s.size);
  const mesh = useRef(null);
  const anim = useRef({
    hover: 0,
    hoverTarget: 0,
    reveal: 0,
    loaded: 0,
    fade: 0,
    vel: 0,
    mouse: new THREE.Vector2(0.5, 0.5),
  });

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uTexture: { value: null },
          uTexture2: { value: null },
          uImageSize: { value: new THREE.Vector2(1, 1) },
          uImageSize2: { value: new THREE.Vector2(1, 1) },
          uPlaneSize: { value: new THREE.Vector2(1, 1) },
          uHover: { value: 0 },
          uReveal: { value: 0 },
          uShift: { value: 0 },
          uLoaded: { value: 0 },
          uLoaded2: { value: 0 },
          uTime: { value: 0 },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uTint: { value: new THREE.Vector3(...hexToRgb(PALETTE.blue)) },
          uBend: { value: 0 },
          uAxis: { value: item.axis === "x" ? 1 : 0 },
          uParallax: { value: new THREE.Vector2(0, 0) },
        },
      }),
    [item.axis]
  );
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    let alive = true;
    const u = material.uniforms;
    loadTexture(item.src).then((tex) => {
      if (!alive) return;
      u.uTexture.value = tex;
      u.uImageSize.value.set(tex.image.width, tex.image.height);
      anim.current.loaded = 1;
    });
    // The hover shot is optional; without it the wipe has nothing to reveal.
    if (item.hoverSrc) {
      loadTexture(item.hoverSrc).then((tex) => {
        if (!alive) return;
        u.uTexture2.value = tex;
        u.uImageSize2.value.set(tex.image.width, tex.image.height);
        u.uLoaded2.value = 1;
      });
    }
    return () => {
      alive = false;
    };
  }, [item.src, item.hoverSrc, material]);

  useEffect(() => {
    const node = item.el;
    const a = anim.current;
    const enter = () => (a.hoverTarget = 1);
    const leave = () => (a.hoverTarget = 0);
    node.addEventListener("pointerenter", enter);
    node.addEventListener("pointerleave", leave);
    return () => {
      node.removeEventListener("pointerenter", enter);
      node.removeEventListener("pointerleave", leave);
    };
  }, [item.el]);

  useFrame((st, dt) => {
    const m = mesh.current;
    if (!m) return;
    const r = item.el.getBoundingClientRect();
    const visible = r.width > 0 && r.bottom > -200 && r.top < size.height + 200 && r.right > -200 && r.left < size.width + 200;
    m.visible = visible;
    if (!visible) return;

    const a = anim.current;
    const u = material.uniforms;
    m.position.set(r.left + r.width / 2 - size.width / 2, -(r.top + r.height / 2 - size.height / 2), 0);
    m.scale.set(r.width, r.height, 1);
    u.uPlaneSize.value.set(r.width, r.height);
    u.uTime.value = st.clock.elapsedTime;

    const inView = r.top < size.height * 0.95 && r.bottom > 0 && r.left < size.width * 0.98;
    if (inView && state.intro) a.reveal = Math.min(1, a.reveal + dt / 1.8);
    u.uReveal.value = a.reveal;
    a.fade = damp(a.fade, a.loaded, 4, dt);
    u.uLoaded.value = a.fade;

    // Image drifts inside its frame as the frame travels across the screen.
    if (item.axis === "x") u.uParallax.value.set(clamp((r.left + r.width / 2 - size.width / 2) / size.width, -1, 1), 0);
    else u.uParallax.value.set(0, clamp((r.top + r.height / 2 - size.height / 2) / size.height, -1, 1));

    a.hover = damp(a.hover, a.hoverTarget, a.hoverTarget ? 2.2 : 3.2, dt);
    u.uHover.value = a.hover;
    a.mouse.set((state.mouse.x - r.left) / r.width, 1 - (state.mouse.y - r.top) / r.height);
    u.uMouse.value.lerp(a.mouse, 1 - Math.exp(-6 * dt));

    a.vel = damp(a.vel, state.velocity, 6, dt);
    u.uBend.value = clamp(-a.vel * 0.001, -0.1, 0.1);
    u.uShift.value = clamp(a.vel * 0.00025, -0.012, 0.012);
  });

  return <mesh ref={mesh} geometry={getGeometry()} material={material} frustumCulled={false} />;
}

export default function MediaLayer() {
  const items = useSyncExternalStore(subscribeMedia, getMediaSnapshot, getServerSnapshot);
  return items.map((item) => <MediaPlane key={item.id} item={item} />);
}

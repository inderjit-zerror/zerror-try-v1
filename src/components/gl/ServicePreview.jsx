"use client";
"use no memo";
// three.js objects (uniforms, camera, render targets) are mutated every frame by design.
/* eslint-disable react-hooks/immutability */

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import vert from "@/shaders/preview.vert";
import frag from "@/shaders/preview.frag";
import { clamp, damp, hexToRgb, state } from "@/lib/store";

// Cursor-following card that shows a generative pattern for the hovered service.
export default function ServicePreview() {
  const size = useThree((s) => s.size);
  const mesh = useRef(null);
  const anim = useRef({ x: 0, y: 0, show: 0, from: 0, to: 0, mix: 1, skew: 0 });

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1), []);
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uTime: { value: 0 },
          uShow: { value: 0 },
          uFrom: { value: 0 },
          uTo: { value: 0 },
          uMix: { value: 1 },
          uSize: { value: new THREE.Vector2(320, 400) },
          uSkew: { value: 0 },
          uBlue: { value: new THREE.Vector3(...hexToRgb("#0000ff")) },
          uRed: { value: new THREE.Vector3(...hexToRgb("#ea4f3d")) },
          uInk: { value: new THREE.Vector3(...hexToRgb("#0f0f10")) },
          // Dark "paper" so the off-white row titles stay legible on top of the card.
          uOff: { value: new THREE.Vector3(...hexToRgb("#302f32")) },
        },
        depthTest: false,
        depthWrite: false,
        transparent: true,
      }),
    []
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material]
  );

  useFrame((st, dt) => {
    const m = mesh.current;
    if (!m) return;
    const a = anim.current;
    const u = material.uniforms;
    const p = state.preview;

    a.show = damp(a.show, p.show, p.show ? 5 : 8, dt);
    m.visible = a.show > 0.002;
    if (!m.visible) {
      a.x = state.mouse.x;
      a.y = state.mouse.y;
      return;
    }

    if (p.index !== a.to) {
      a.from = a.mix > 0.5 ? a.to : a.from;
      a.to = p.index;
      a.mix = 0;
    }
    a.mix = Math.min(1, a.mix + dt * 2.2);

    const w = clamp(size.width * 0.21, 240, 340);
    const h = w * 1.25;
    const px = a.x;
    a.x = damp(a.x, state.mouse.x, 7, dt);
    a.y = damp(a.y, state.mouse.y, 7, dt);
    a.skew = damp(a.skew, clamp((a.x - px) * 0.012, -0.35, 0.35), 8, dt);

    m.position.set(a.x - size.width / 2, -(a.y - size.height / 2), 0);
    m.scale.set(w, h, 1);
    m.rotation.z = -a.skew * 0.25;

    u.uTime.value = st.clock.elapsedTime;
    u.uShow.value = a.show;
    u.uFrom.value = a.from;
    u.uTo.value = a.to;
    u.uMix.value = a.mix;
    u.uSize.value.set(w, h);
    u.uSkew.value = -a.skew;
  });

  return <mesh ref={mesh} geometry={geometry} material={material} frustumCulled={false} renderOrder={20} />;
}

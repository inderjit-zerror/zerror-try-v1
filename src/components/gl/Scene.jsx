"use client";
"use no memo";
// three.js objects (uniforms, camera, render targets) are mutated every frame by design.
/* eslint-disable react-hooks/immutability */

import { Canvas, useThree } from "@react-three/fiber";
import { useLayoutEffect } from "react";
import { state } from "@/lib/store";
import Surface from "./Surface";
import PixelLogo from "./PixelLogo";
import MediaLayer from "./MediaLayer";
import FieldLayer from "./FieldLayer";

const CAM_Z = 1000;

// Perspective camera where one world unit equals one CSS pixel at z = 0,
// so planes can be laid over DOM rects one-to-one.
function PixelCamera() {
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);

  useLayoutEffect(() => {
    camera.fov = (2 * Math.atan(size.height / 2 / CAM_Z) * 180) / Math.PI;
    camera.position.set(0, 0, CAM_Z);
    camera.near = 1;
    camera.far = 5000;
    camera.updateProjectionMatrix();
  }, [camera, size]);

  return null;
}

export default function Scene() {
  return (
    <Canvas
      className="gl"
      linear
      flat
      dpr={[1, 1.75]}
      gl={{ antialias: true, alpha: false, powerPreference: "high-performance" }}
      camera={{ position: [0, 0, CAM_Z], fov: 50, near: 1, far: 5000 }}
      onCreated={() => {
        state.glReady = true;
        document.documentElement.classList.add("gl-ready");
      }}
    >
      <PixelCamera />
      <Surface />
      <FieldLayer />
      <PixelLogo target="#hero-logo" mode="hero" />
      <PixelLogo target="#footer-logo" mode="footer" />
      <MediaLayer />
    </Canvas>
  );
}

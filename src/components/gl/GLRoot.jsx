"use client";

import dynamic from "next/dynamic";
import { useEffect, useSyncExternalStore } from "react";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

let support = null;
function hasWebGL() {
  if (support === null) {
    try {
      const c = document.createElement("canvas");
      support = !!(c.getContext("webgl2") || c.getContext("webgl"));
    } catch {
      support = false;
    }
  }
  return support;
}

const noop = () => () => {};

// Mounts the canvas only where WebGL exists; otherwise CSS fallbacks take over.
export default function GLRoot() {
  const ok = useSyncExternalStore(noop, hasWebGL, () => false);

  useEffect(() => {
    if (!hasWebGL()) document.documentElement.classList.add("no-gl");
  }, []);

  return ok ? <Scene /> : null;
}

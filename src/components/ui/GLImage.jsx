"use client";

import { useEffect, useId, useRef } from "react";
import { registerMedia } from "@/lib/media";

// A DOM slot that a WebGL plane mirrors. The <img> stays for SEO, a11y and
// the no-WebGL fallback; it is hidden once the canvas is live.
export default function GLImage({ src, alt, className = "", axis = "y", cursor = "view", cursorLabel, style }) {
  const ref = useRef(null);
  const id = useId();

  useEffect(() => registerMedia(id, { id, el: ref.current, src, axis }), [id, src, axis]);

  return (
    <div ref={ref} className={`glimg ${className}`} data-cursor={cursor} data-cursor-label={cursorLabel} style={style}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} loading="lazy" decoding="async" draggable={false} />
    </div>
  );
}

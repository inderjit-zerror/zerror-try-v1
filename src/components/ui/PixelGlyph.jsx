"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

// 5x5 brand pixel cluster. On hover its pixels rebuild in a smooth wave
// from the centre out.
export default function PixelGlyph({ glyph, className = "", active }) {
  const ref = useRef(null);

  const wave = () => {
    const cells = ref.current?.children;
    if (!cells) return;
    gsap.fromTo(
      cells,
      { scale: 0.2 },
      {
        scale: 1,
        duration: 0.7,
        ease: "back.out(2.2)",
        stagger: { grid: [5, 5], from: "center", amount: 0.32 },
        overwrite: true,
      }
    );
  };

  useEffect(() => {
    if (active) wave();
  }, [active]);

  return (
    <div ref={ref} className={`glyph ${className}`} onPointerEnter={active === undefined ? wave : undefined} aria-hidden="true">
      {glyph.split("").map((c, i) => (
        <span key={i} className={c === "1" ? "on" : ""} />
      ))}
    </div>
  );
}

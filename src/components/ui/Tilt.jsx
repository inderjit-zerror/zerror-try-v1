"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

// Leans its content towards the cursor in 3D, with a soft light that follows.
export default function Tilt({ children, className = "", max = 8, as: Tag = "div", ...rest }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia("(hover: none)").matches) return;
    const inner = el.querySelector(".tilt__inner");
    gsap.set(inner, { transformPerspective: 900, transformOrigin: "50% 50%" });
    const rx = gsap.quickTo(inner, "rotationX", { duration: 0.8, ease: "power3.out" });
    const ry = gsap.quickTo(inner, "rotationY", { duration: 0.8, ease: "power3.out" });

    const move = (e) => {
      const r = el.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width;
      const py = (e.clientY - r.top) / r.height;
      ry((px - 0.5) * max * 2);
      rx(-(py - 0.5) * max * 2);
      el.style.setProperty("--mx", `${px * 100}%`);
      el.style.setProperty("--my", `${py * 100}%`);
    };
    const leave = () => {
      rx(0);
      ry(0);
    };
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerleave", leave);
    return () => {
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerleave", leave);
    };
  }, [max]);

  return (
    <Tag ref={ref} className={`tilt ${className}`} {...rest}>
      <div className="tilt__inner">{children}</div>
    </Tag>
  );
}

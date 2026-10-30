"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

// Dot + lagging ring. Elements opt into states with data-cursor="view|drag|..."
// and an optional data-cursor-label.
export default function Cursor() {
  const root = useRef(null);
  const ring = useRef(null);
  const dot = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
    const html = document.documentElement;
    html.classList.add("has-cursor");

    const ringX = gsap.quickTo(ring.current, "x", { duration: 0.5, ease: "power3.out" });
    const ringY = gsap.quickTo(ring.current, "y", { duration: 0.5, ease: "power3.out" });
    const dotX = gsap.quickTo(dot.current, "x", { duration: 0.08, ease: "power2.out" });
    const dotY = gsap.quickTo(dot.current, "y", { duration: 0.08, ease: "power2.out" });

    let current = "";
    const setMode = (mode, text) => {
      if (mode === current) return;
      current = mode;
      root.current.dataset.mode = mode;
      label.current.textContent = text ?? "";
    };

    const onMove = (e) => {
      root.current.classList.add("is-visible");
      ringX(e.clientX);
      ringY(e.clientY);
      dotX(e.clientX);
      dotY(e.clientY);
    };
    const onOver = (e) => {
      const t = e.target.closest?.("[data-cursor], a, button, input, textarea, label");
      if (!t) return setMode("");
      if (t.dataset.cursor) return setMode(t.dataset.cursor, t.dataset.cursorLabel ?? t.dataset.cursor);
      if (t.matches("input, textarea")) return setMode("text");
      setMode("link");
    };
    const onDown = () => root.current.classList.add("is-down");
    const onUp = () => root.current.classList.remove("is-down");
    const onLeave = () => root.current.classList.remove("is-visible");

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown);
    window.addEventListener("pointerup", onUp);
    html.addEventListener("pointerleave", onLeave);
    return () => {
      html.classList.remove("has-cursor");
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerover", onOver);
      window.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointerup", onUp);
      html.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div ref={root} className="cursor" aria-hidden="true">
      <div ref={ring} className="cursor__ring">
        <span ref={label} className="cursor__label" />
      </div>
      <div ref={dot} className="cursor__dot" />
    </div>
  );
}

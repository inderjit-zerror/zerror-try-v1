"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { state } from "@/lib/store";

// Endless strip that speeds up with scroll and flips with scroll direction.
export default function Marquee({ items, speed = 1.2, className = "" }) {
  const track = useRef(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    let x = 0;
    let dir = -1;
    let boost = 0;
    const tick = (_, dtMs) => {
      const half = el.scrollWidth / 2;
      if (!half) return;
      const v = state.velocity;
      if (Math.abs(v) > 0.5) dir = v > 0 ? -1 : 1;
      const dt = dtMs / 16.67;
      // Ease the scroll boost in and out instead of following raw velocity.
      boost += (Math.min(Math.abs(v) * 0.3, 22) - boost) * Math.min(1, 0.08 * dt);
      x += dir * (speed + boost) * dt;
      if (x <= -half) x += half;
      if (x > 0) x -= half;
      el.style.transform = `translate3d(${x}px,0,0)`;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, [speed]);

  const row = (key) =>
    items.map((t, i) => (
      <span key={`${key}-${i}`} className="marquee__item">
        {t}
        <i className="marquee__sep" />
      </span>
    ));

  return (
    <div className={`marquee ${className}`} aria-hidden="true">
      <div ref={track} className="marquee__track">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}

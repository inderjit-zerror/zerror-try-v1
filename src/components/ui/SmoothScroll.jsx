"use client";

import Lenis from "lenis";
import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { setLenis } from "@/lib/scroll";
import { on, state } from "@/lib/store";

// Lenis drives the scroll, GSAP's ticker drives Lenis, and both feed the
// shared state the WebGL layer reads every frame.
export default function SmoothScroll() {
  useEffect(() => {
    if ("scrollRestoration" in history) history.scrollRestoration = "manual";
    window.scrollTo(0, 0);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lenis = new Lenis({ lerp: reduce ? 1 : 0.072, wheelMultiplier: 0.95, smoothWheel: !reduce });
    setLenis(lenis);
    lenis.stop();
    lenis.on("scroll", ScrollTrigger.update);

    const tick = (time) => {
      lenis.raf(time * 1000);
      state.scroll = lenis.animatedScroll;
      state.velocity = lenis.velocity;
    };
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    const onMove = (e) => {
      const m = state.mouse;
      const first = m.x < -1000;
      const dx = first ? 0 : e.clientX - m.x;
      const dy = first ? 0 : e.clientY - m.y;
      m.px = m.x;
      m.py = m.y;
      m.x = e.clientX;
      m.y = e.clientY;
      m.active = true;
      m.speed = Math.min(160, Math.max(m.speed, Math.hypot(dx, dy)));
    };
    const onLeave = () => {
      state.mouse.x = -9999;
      state.mouse.y = -9999;
      state.mouse.active = false;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    document.documentElement.addEventListener("pointerleave", onLeave);

    // Layout settles once fonts are in and the preloader is gone.
    const refresh = () => {
      ScrollTrigger.sort();
      ScrollTrigger.refresh();
    };
    const offIntro = on("intro", refresh);
    document.fonts.ready.then(refresh);

    return () => {
      offIntro();
      gsap.ticker.remove(tick);
      window.removeEventListener("pointermove", onMove);
      document.documentElement.removeEventListener("pointerleave", onLeave);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  return null;
}

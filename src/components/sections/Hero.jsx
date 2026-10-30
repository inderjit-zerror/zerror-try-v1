"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/scroll";
import { on, state } from "@/lib/store";
import Logo from "../ui/Logo";
import Reveal from "../ui/Reveal";

export default function Hero() {
  const root = useRef(null);
  const coords = useRef(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray(".hero__fade");
      gsap.set(items, { opacity: 0, y: 24 });
      const play = () => gsap.to(items, { opacity: 1, y: 0, duration: 1.3, ease: "zr", stagger: 0.07, delay: 1.1 });
      const off = state.intro ? (play(), null) : on("intro", play);

      gsap.to(".hero__bottom", {
        yPercent: -35,
        opacity: 0,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top top", end: "60% top", scrub: true },
      });

      // Live cursor readout, because precision is the brand.
      const [xEl, yEl] = coords.current.querySelectorAll("b");
      const tick = () => {
        const m = state.mouse;
        if (m.x < -1000) return;
        xEl.textContent = String(Math.round(m.x)).padStart(4, "0");
        yEl.textContent = String(Math.round(m.y + state.scroll)).padStart(4, "0");
      };
      gsap.ticker.add(tick);
      return () => {
        off?.();
        gsap.ticker.remove(tick);
      };
    },
    { scope: root }
  );

  return (
    <section id="top" ref={root} className="hero" data-theme="blue">
      <h1 className="sr-only">Zerror Studios, a multidisciplinary design-led tech studio in Mumbai</h1>

      <div className="hero__meta">
        <span className="t-label hero__fade">Multidisciplinary Design Studio</span>
        <span className="t-label hero__fade">Est. 2022 / Mumbai, India</span>
        <span ref={coords} className="t-label hero__fade hero__coords tnum">
          X <b>0000</b> Y <b>0000</b>
        </span>
      </div>

      <div className="hero__stage">
        <div id="hero-logo" className="hero__logo" aria-hidden="true">
          <Logo className="logo-fallback" />
        </div>
      </div>

      <div className="hero__bottom">
        <Reveal as="p" intro delay={0.9} className="hero__lead t-m">
          We build brands that people stop for, remember, and come back to.
        </Reveal>
        <div className="hero__aside">
          <p className="t-label hero__fade">Websites / eCommerce / Software / Brand</p>
          <p className="t-label hero__fade hero__hint">[ Move the cursor to break the system ]</p>
        </div>
        <button type="button" className="hero__scroll hero__fade t-label" onClick={() => scrollToTarget("#manifesto")}>
          Scroll <span className="hero__scroll-line" />
        </button>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { PILLARS, VALUES } from "@/data/content";
import Reveal from "../ui/Reveal";
import PixelGlyph from "../ui/PixelGlyph";
import Tilt from "../ui/Tilt";

export default function Studio() {
  const root = useRef(null);
  const text = useRef(null);
  const tabs = useRef(null);
  const indicator = useRef(null);
  const [tab, setTab] = useState(0);
  const [hovered, setHovered] = useState(-1);

  // Indicator glides to the active tab; copy eases in underneath.
  useEffect(() => {
    const btn = tabs.current?.querySelectorAll(".tab")[tab];
    if (!btn) return;
    gsap.to(indicator.current, {
      x: btn.offsetLeft,
      y: btn.offsetTop,
      width: btn.offsetWidth,
      height: btn.offsetHeight,
      duration: 0.7,
      ease: "zr",
    });
    gsap.fromTo(
      text.current,
      { opacity: 0, y: 14, filter: "blur(6px)" },
      { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8, ease: "zr" }
    );
  }, [tab]);

  useGSAP(
    () => {
      gsap.from(".value", {
        y: 90,
        opacity: 0,
        duration: 1.4,
        ease: "zr",
        stagger: 0.1,
        scrollTrigger: { trigger: ".studio__values", start: "top 85%", once: true },
      });
      gsap.from(".studio__pillars", {
        y: 40,
        opacity: 0,
        duration: 1.3,
        ease: "zr",
        scrollTrigger: { trigger: ".studio__pillars", start: "top 85%", once: true },
      });
      gsap.to(".studio__title", {
        xPercent: 6,
        ease: "none",
        scrollTrigger: { trigger: root.current, start: "top bottom", end: "40% top", scrub: 0.8 },
      });
    },
    { scope: root }
  );

  return (
    <section id="studio" ref={root} className="studio" data-theme="dark">
      <div className="studio__top">
        <span className="t-label">(Studio)</span>
        <span className="t-label">Founded 2022 / Mumbai</span>
      </div>
      <Reveal as="h2" className="t-huge studio__title">
        Brands, built whole.
      </Reveal>

      <div className="studio__grid">
        <Reveal as="p" className="studio__lead t-m">
          Zerror is a system-driven studio at the intersection of design and technology. We build structured,
          scalable and performance-led work that brings clarity to complex digital environments.
        </Reveal>

        <div className="studio__pillars">
          <div ref={tabs} className="tabs" role="tablist" aria-label="What we stand for">
            <span ref={indicator} className="tabs__indicator" aria-hidden="true" />
            {PILLARS.map((p, i) => (
              <button
                key={p.key}
                role="tab"
                type="button"
                aria-selected={tab === i}
                className={`tab ${tab === i ? "is-active" : ""}`}
                onClick={() => setTab(i)}
                onPointerEnter={() => setTab(i)}
              >
                <span className="tnum">0{i + 1}</span> {p.key}
              </button>
            ))}
          </div>
          <p ref={text} className="studio__pillar-text" role="tabpanel">
            {PILLARS[tab].text}
          </p>
        </div>
      </div>

      <div className="studio__values">
        {VALUES.map((v, i) => (
          <Tilt
            key={v.name}
            className="value"
            max={7}
            onPointerEnter={() => setHovered(i)}
            onPointerLeave={() => setHovered(-1)}
          >
            <PixelGlyph glyph={v.glyph} active={hovered === i} />
            <span className="value__idx t-label tnum">0{i + 1}</span>
            <span className="value__name">{v.name}</span>
          </Tilt>
        ))}
      </div>
    </section>
  );
}

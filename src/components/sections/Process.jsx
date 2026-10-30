"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { PROCESS, VALUES } from "@/data/content";
import Reveal from "../ui/Reveal";
import PixelGlyph from "../ui/PixelGlyph";

export default function Process() {
  const root = useRef(null);

  useGSAP(
    () => {
      const cards = gsap.utils.toArray(".pcard");
      cards.forEach((card, i) => {
        // Content lifts in as the card arrives; the big number trails behind.
        gsap.from(card.querySelectorAll(".pcard__title, .pcard__line, .pcard__text"), {
          y: 50,
          opacity: 0,
          duration: 1.3,
          ease: "zr",
          stagger: 0.08,
          scrollTrigger: { trigger: card, start: "top 70%", once: true },
        });
        gsap.fromTo(
          card.querySelector(".pcard__no"),
          { yPercent: 35 },
          { yPercent: -5, ease: "none", scrollTrigger: { trigger: card, start: "top bottom", end: "top 15%", scrub: 0.8 } }
        );

        const next = cards[i + 1];
        if (!next) return;
        gsap.to(card.querySelector(".pcard__inner"), {
          scale: 0.9,
          filter: "brightness(0.72)",
          ease: "none",
          scrollTrigger: { trigger: next, start: "top bottom", end: "top 20%", scrub: 0.6 },
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="process" data-theme="light">
      <div className="process__head">
        <span className="t-label">(Process)</span>
        <Reveal as="h2" className="t-xl process__title">
          Thoughtful design. Technology that holds.
        </Reveal>
      </div>

      <div className="process__cards">
        {PROCESS.map((p, i) => (
          <article key={p.no} className={`pcard pcard--${i}`} style={{ "--i": i }}>
            <div className="pcard__inner">
              <div className="pcard__top">
                <span className="t-label">Step {p.no}</span>
                <PixelGlyph glyph={VALUES[i].glyph} className="pcard__glyph" />
              </div>
              <div className="pcard__body">
                <span className="pcard__no tnum">{p.no}</span>
                <div>
                  <h3 className="pcard__title">{p.title}</h3>
                  <p className="pcard__line">{p.line}</p>
                  <p className="pcard__text">{p.text}</p>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { STATS } from "@/data/content";
import GLField from "../ui/GLField";
import Reveal from "../ui/Reveal";
import SectionBar from "../ui/SectionBar";

// In numbers. Each figure counts up beside a liquid bar that fills to its
// level, sloshes with scroll speed and ripples under the cursor.
export default function Numbers() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.utils.toArray(".num__value[data-to]").forEach((el) => {
        const to = Number(el.dataset.to);
        const suffix = el.dataset.suffix ?? "";
        const o = { v: Number(el.dataset.from) || 0 };
        gsap.to(o, {
          v: to,
          duration: 2.2,
          ease: "zr",
          scrollTrigger: { trigger: el, start: "top 88%", once: true },
          onUpdate: () => (el.textContent = `${Math.round(o.v)}${suffix}`),
        });
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="numbers" data-theme="light">
      <SectionBar no="05" label="In numbers" aside="Since 2022" />

      <div className="numbers__head">
        <Reveal as="h2" className="t-xl numbers__title">
          Small team. Serious output.
        </Reveal>
        <p className="numbers__intro">Every figure below was designed, built and shipped by the same people, under one roof in Bandra.</p>
      </div>

      <div className="numbers__rows">
        <GLField
          effect="liquid"
          data-axis="x"
          data-gap="12"
          data-levels={STATS.map((s) => s.level).join(",")}
          className="numbers__field"
          aria-hidden="true"
        />
        {STATS.map((s) => (
          <div key={s.label} className="num">
            <div className="num__fig">
              <span className="num__kicker t-label">{s.kicker}</span>
              {s.text ? (
                <span className="num__value">{s.text}</span>
              ) : (
                <span className="num__value tnum" data-to={s.value} data-from={s.from ?? 0} data-suffix={s.suffix}>
                  {s.value}
                  {s.suffix}
                </span>
              )}
            </div>
            <span className="num__label">{s.label}</span>
            <span className="num__track" aria-hidden="true" />
          </div>
        ))}
      </div>
    </section>
  );
}

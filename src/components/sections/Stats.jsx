"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { STATS } from "@/data/content";
import Reveal from "../ui/Reveal";

// Stable pseudo-random delays for the pixel wipe (same on server and client).
const DELAYS = Array.from({ length: 40 }, (_, i) => ((i * 23) % 40) * 9);
const METER = 16;

function count(num, to, duration) {
  const obj = { v: 0 };
  return gsap.to(obj, {
    v: to,
    duration,
    ease: "power3.out",
    overwrite: true,
    onUpdate: () => (num.textContent = Math.round(obj.v)),
  });
}

export default function Stats() {
  const root = useRef(null);

  useGSAP(
    () => {
      const stats = gsap.utils.toArray(".stat");
      gsap.from(stats, {
        opacity: 0,
        y: 70,
        duration: 1.4,
        ease: "zr",
        stagger: 0.1,
        scrollTrigger: { trigger: ".stats__grid", start: "top 85%", once: true },
      });
      stats.forEach((stat, i) => {
        const num = stat.querySelector(".stat__num");
        num.textContent = "0";
        gsap.timeline({ scrollTrigger: { trigger: ".stats__grid", start: "top 85%", once: true } })
          .add(() => count(num, Number(num.dataset.to), 2.4), 0.2 + i * 0.1)
          .from(stat.querySelectorAll(".stat__meter i"), { scaleY: 0, duration: 0.6, ease: "back.out(2)", stagger: 0.035 }, 0.4 + i * 0.1);
      });
    },
    { scope: root }
  );

  const replay = (e) => {
    const num = e.currentTarget.querySelector(".stat__num");
    count(num, Number(num.dataset.to), 1.1);
  };

  return (
    <section ref={root} className="stats" data-theme="blue">
      <div className="stats__head">
        <span className="t-label">(In numbers)</span>
        <Reveal as="h2" className="t-xl">
          Built to last.
        </Reveal>
      </div>
      <div className="stats__grid">
        {STATS.map((s) => (
          <div key={s.label} className="stat" onPointerEnter={replay}>
            <span className="stat__fill" aria-hidden="true">
              {DELAYS.map((d, i) => (
                <i key={i} style={{ "--d": `${d}ms` }} />
              ))}
            </span>
            <span className="stat__value tnum">
              <span className="stat__num" data-to={s.value}>
                {s.value}
              </span>
              <span className="stat__suffix">{s.suffix}</span>
            </span>
            <span className="stat__meter" aria-hidden="true">
              {Array.from({ length: METER }, (_, i) => (
                <i key={i} />
              ))}
            </span>
            <span className="stat__label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

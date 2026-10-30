"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { MANIFESTO } from "@/data/content";

// Split "*emphasis*" markup into word spans that know whether they're strong.
function words(text) {
  const out = [];
  text.split("*").forEach((chunk, i) => {
    chunk
      .split(" ")
      .filter(Boolean)
      .forEach((w) => out.push({ w, strong: i % 2 === 1 }));
  });
  return out;
}

export default function Manifesto() {
  const root = useRef(null);

  useGSAP(
    () => {
      const items = gsap.utils.toArray(".manifesto__item");
      const labels = gsap.utils.toArray(".manifesto__labels li");
      const segs = gsap.utils.toArray(".manifesto__seg i");
      const last = items.length - 1;

      items.forEach((item, i) => {
        if (i > 0) gsap.set(item.querySelectorAll(".w"), { opacity: 0, yPercent: 80 });
      });

      const tl = gsap.timeline({
        defaults: { ease: "power2.out" },
        scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.9 },
      });

      items.forEach((item, i) => {
        const ws = item.querySelectorAll(".w");
        if (i > 0) {
          tl.to(ws, { yPercent: 0, opacity: 0.14, duration: 0.5, stagger: 0.012 });
        }
        const read = ws.length * 0.06 + 0.4;
        tl.to(ws, { opacity: (_, el) => (el.dataset.strong ? 1 : 0.36), duration: 0.4, stagger: 0.06, ease: "none" });
        tl.fromTo(segs[i], { scaleX: 0 }, { scaleX: 1, duration: read, ease: "none" }, "<");

        if (i < last) {
          tl.to({}, { duration: 0.5 });
          tl.to(ws, { yPercent: -80, opacity: 0, duration: 0.5, stagger: 0.012, ease: "power2.in" });
          tl.to(".manifesto__index-col", { yPercent: (-100 / items.length) * (i + 1), duration: 0.7, ease: "power3.inOut" }, "<");
          tl.to(labels[i], { opacity: 0.35, x: 0, duration: 0.4 }, "<");
          tl.to(labels[i + 1], { opacity: 1, x: 12, duration: 0.4 }, "<0.2");
        } else {
          tl.to({}, { duration: 0.6 });
        }
      });
    },
    { scope: root }
  );

  return (
    <section id="manifesto" ref={root} className="manifesto" data-theme="blue">
      <div className="manifesto__sticky">
        <div className="manifesto__head">
          <span className="t-label">(Manifesto)</span>
          <span className="t-label">What we stand for</span>
        </div>

        <div className="manifesto__stage">
          <aside className="manifesto__aside">
            <div className="manifesto__index" aria-hidden="true">
              <div className="manifesto__index-col">
                {MANIFESTO.map((_, i) => (
                  <span key={i}>0{i + 1}</span>
                ))}
              </div>
            </div>
            <ul className="manifesto__labels">
              {MANIFESTO.map((m, i) => (
                <li key={m.label} className="t-label" style={i === 0 ? { opacity: 1, transform: "translateX(12px)" } : undefined}>
                  <i aria-hidden="true" />
                  {m.label}
                </li>
              ))}
            </ul>
          </aside>

          <div className="manifesto__texts">
            {MANIFESTO.map((m) => (
              <p className="manifesto__item manifesto__text" key={m.label}>
                {words(m.text).map((t, j) => (
                  <span key={j} className="w" data-strong={t.strong || undefined}>
                    {t.w}
                  </span>
                ))}
              </p>
            ))}
          </div>
        </div>

        <div className="manifesto__foot">
          {MANIFESTO.map((m) => (
            <span key={m.label} className="manifesto__seg">
              <i />
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}

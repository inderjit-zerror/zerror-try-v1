"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { PROCESS } from "@/data/content";
import GLField from "../ui/GLField";
import SectionBar from "../ui/SectionBar";

// Pinned process. The entropy field resolves from error into order across
// the section while the four steps take turns on stage.
export default function Process() {
  const root = useRef(null);
  const [step, setStep] = useState(0);

  useGSAP(
    () => {
      const last = PROCESS.length - 1;
      ScrollTrigger.create({
        trigger: root.current,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => setStep(Math.min(last, Math.floor(self.progress * PROCESS.length))),
      });
      gsap.fromTo(
        ".process__fill",
        { scaleX: 0 },
        { scaleX: 1, ease: "none", scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: true } }
      );
    },
    { scope: root }
  );

  return (
    <section ref={root} className="process" data-theme="dark">
      <div className="process__sticky">
        <GLField effect="entropy" className="process__field" aria-hidden="true" />
        <SectionBar no="04" label="Process" aside="From error to order" />

        <div className="process__stage">
          <div className="process__count tnum" aria-hidden="true">
            <span key={step} className="process__digit">
              0{step + 1}
            </span>
            <span className="process__of">/0{PROCESS.length}</span>
          </div>
          <div className="process__steps">
            {PROCESS.map((p, i) => (
              <article key={p.no} className={`pstep ${i === step ? "is-active" : i < step ? "is-past" : ""}`}>
                <h3 className="pstep__title">{p.title}</h3>
                <p className="pstep__line t-m">{p.line}</p>
                <p className="pstep__text">{p.text}</p>
              </article>
            ))}
          </div>
        </div>

        <div className="process__rail">
          <div className="process__labels">
            {PROCESS.map((p, i) => (
              <span key={p.no} className={`t-label tnum ${i <= step ? "is-on" : ""}`}>
                {p.no} {p.title}
              </span>
            ))}
          </div>
          <span className="process__bar">
            <span className="process__fill" />
          </span>
        </div>
      </div>
    </section>
  );
}

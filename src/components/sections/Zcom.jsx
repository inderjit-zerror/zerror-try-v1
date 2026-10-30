"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { emit } from "@/lib/store";
import { ZCOM } from "@/data/content";
import GLField from "../ui/GLField";
import Magnetic from "../ui/Magnetic";
import Reveal from "../ui/Reveal";
import RollText from "../ui/RollText";
import SectionBar from "../ui/SectionBar";

// Zcom, the studio's own commerce platform. Five bills get struck out one
// by one beside a dithered metaball mass.
export default function Zcom() {
  const root = useRef(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: ".zcom__bills", start: "top 75%", once: true } });
      tl.from(".bill", { y: 30, opacity: 0, duration: 0.9, ease: "zr", stagger: 0.06 })
        .to(".bill__strike", { scaleX: 1, duration: 0.5, ease: "zr-io", stagger: 0.16 }, "-=0.2")
        .to(".bill", { opacity: 0.35, duration: 0.4, stagger: 0.16 }, "<0.1")
        .from(".zcom__equals", { y: 30, opacity: 0, duration: 1, ease: "zr" }, "-=0.2");
      gsap.from(".zpillar, .zai", {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "zr",
        stagger: 0.08,
        scrollTrigger: { trigger: ".zcom__pillars", start: "top 85%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <section id="zcom" ref={root} className="zcom" data-theme="dark">
      <SectionBar no="06" label="Our platform" aside="Zcom / Commerce, built in-house" />

      <div className="zcom__hero">
        <div className="zcom__copy">
          <h2 className="zcom__word">Zcom</h2>
          <Reveal as="p" className="t-m zcom__lead">
            Our own commerce platform. Stop paying five bills for one store.
          </Reveal>
          <div className="zcom__bills">
            {ZCOM.bills.map((b) => (
              <span key={b} className="bill">
                {b}
                <i className="bill__strike" />
              </span>
            ))}
            <span className="zcom__equals">= One Zcom plan</span>
          </div>
        </div>
        <GLField effect="blob" className="zcom__visual" aria-hidden="true">
          <span className="zcom__fig t-label">Fig. 06 / One system, every channel</span>
          <span className="zcom__hint t-label">[ Hover to pull the mass ]</span>
        </GLField>
      </div>

      <div className="zcom__pillars">
        {ZCOM.pillars.map((p, i) => (
          <article key={p.title} className="zpillar">
            <span className="t-label tnum">0{i + 1}</span>
            <h3 className="zpillar__title">{p.title}</h3>
            <p>{p.text}</p>
          </article>
        ))}
      </div>

      <div className="zcom__aiwrap">
        <div className="zcom__ai-head">
          <span className="t-label">Built-in AI</span>
          <h3 className="t-l">A store that thinks with you.</h3>
          <Magnetic>
            <button type="button" className="btn btn--pill btn--lg btn--blue" onClick={() => emit("contact:open", "Zcom store")}>
              <span className="btn__dot" />
              <RollText text="Get a Zcom store" />
            </button>
          </Magnetic>
        </div>
        <ul className="zcom__ai">
          {ZCOM.ai.map((a, i) => (
            <li key={a.title} className="zai">
              <span className="t-label tnum">0{i + 1}</span>
              <h4 className="zai__title">{a.title}</h4>
              <p className="zai__text">{a.text}</p>
              <span className={`pill t-label ${a.status === "Live" ? "pill--live" : ""}`}>{a.status}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

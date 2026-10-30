"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { SERVICES, SERVICES_INTRO } from "@/data/content";
import GLField from "../ui/GLField";
import Reveal from "../ui/Reveal";
import SectionBar from "../ui/SectionBar";

// Capabilities. A sticky shader panel on the left changes scene with a
// pixel dissolve as each service passes the middle of the screen.
export default function Services() {
  const root = useRef(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      gsap.utils.toArray(".svc").forEach((el, i) => {
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && setActive(i),
        });
      });
      gsap.from(".svc__title", {
        y: 60,
        opacity: 0,
        duration: 1.2,
        ease: "zr",
        stagger: 0.1,
        scrollTrigger: { trigger: ".services__list", start: "top 80%", once: true },
      });
    },
    { scope: root }
  );

  const current = SERVICES[active];

  return (
    <section id="services" ref={root} className="services" data-theme="blue">
      <SectionBar no="03" label="Capabilities" aside="Design / Build / Grow" />

      <header className="services__head">
        <Reveal as="h2" className="t-xl services__title">
          {SERVICES_INTRO.title}
        </Reveal>
        <p className="services__intro">{SERVICES_INTRO.text}</p>
      </header>

      <div className="services__body">
        <div className="services__stage">
          <GLField effect="services" data-active={active} className="services__panel" aria-hidden="true">
            <span className="services__fig t-label tnum">
              Fig. {current.no} / {current.type}
            </span>
            <span className="services__corner services__corner--tl" />
            <span className="services__corner services__corner--br" />
          </GLField>
          <div className="services__dots" aria-hidden="true">
            {SERVICES.map((s, i) => (
              <span key={s.no} className={i === active ? "is-on" : ""} />
            ))}
          </div>
        </div>

        <ol className="services__list">
          {SERVICES.map((s, i) => (
            <li key={s.no} className={`svc ${i === active ? "is-active" : ""}`} onClick={() => setActive(i)}>
              <div className="svc__top t-label">
                <span className="tnum">{s.no}</span>
                <span>{s.kicker}</span>
              </div>
              <h3 className="svc__title">{s.title}</h3>
              <p className="svc__tagline t-m">{s.tagline}</p>
              <p className="svc__text">{s.text}</p>
              <ul className="svc__tags">
                {s.tags.map((t) => (
                  <li key={t} className="t-label">
                    {t}
                  </li>
                ))}
              </ul>
              <dl className="svc__metrics">
                {s.metrics.map((m) => (
                  <div key={m.label}>
                    <dd className="tnum">{m.value}</dd>
                    <dt className="t-label">{m.label}</dt>
                  </div>
                ))}
              </dl>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

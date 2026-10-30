"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { setPreview } from "@/lib/store";
import { SERVICES } from "@/data/content";
import Reveal from "../ui/Reveal";
import Marquee from "../ui/Marquee";
import RollText from "../ui/RollText";

export default function Services() {
  const root = useRef(null);
  const [active, setActive] = useState(-1);

  useGSAP(
    () => {
      gsap.from(".service", {
        yPercent: 40,
        opacity: 0,
        duration: 1.4,
        ease: "zr",
        stagger: 0.1,
        clearProps: "opacity,transform",
        scrollTrigger: { trigger: ".services__list", start: "top 85%", once: true },
      });
    },
    { scope: root }
  );

  const canHover = () => window.matchMedia("(hover: hover)").matches;
  const enter = (i) => {
    if (!canHover()) return;
    setActive(i);
    setPreview(1, i);
  };
  const leaveList = () => {
    setPreview(0);
    if (canHover()) setActive(-1);
  };

  return (
    <section id="services" ref={root} className="services" data-theme="dark">
      <div className="services__head">
        <span className="t-label">(Services)</span>
        <Reveal as="h2" className="t-xl services__title">
          Everything a brand needs. One studio.
        </Reveal>
        <p className="services__intro">
          Design-led and engineering-backed. Identity, platforms and growth treated as one connected system, so
          nothing gets lost in a hand-off.
        </p>
      </div>

      <ul className={`services__list ${active > -1 ? "has-active" : ""}`} onPointerLeave={leaveList}>
        {SERVICES.map((s, i) => (
          <li
            key={s.no}
            className={`service ${active === i ? "is-active" : ""}`}
            onPointerEnter={() => enter(i)}
            data-cursor="explore"
            data-cursor-label="Explore"
          >
            <span className="service__line" aria-hidden="true" />
            <button
              type="button"
              className="service__row"
              aria-expanded={active === i}
              onClick={() => setActive((a) => (a === i ? -1 : i))}
            >
              <span className="service__no">{s.no}</span>
              <span className="service__title">{s.title}</span>
              <span className="service__short t-label">
                <RollText text={s.short} />
              </span>
              <span className="service__plus" aria-hidden="true" />
            </button>
            <div className="service__body">
              <div className="service__inner">
                <p className="service__text">{s.text}</p>
                <ul className="service__tags">
                  {s.tags.map((t, j) => (
                    <li key={t} style={{ "--j": j }}>
                      {t}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <Marquee
        className="services__marquee"
        items={["Websites", "eCommerce", "Custom software", "Headless CMS", "Brand identity", "Motion", "SEO", "Growth"]}
      />
    </section>
  );
}

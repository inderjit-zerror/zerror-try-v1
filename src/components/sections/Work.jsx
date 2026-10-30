"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { CASES, MORE_WORK, WORK_INTRO } from "@/data/content";
import GLImage from "../ui/GLImage";
import GLField from "../ui/GLField";
import Reveal from "../ui/Reveal";
import RollText from "../ui/RollText";
import SectionBar from "../ui/SectionBar";

const pad = (n) => String(n).padStart(2, "0");

// Editorial case list: big frames that alternate sides, drifting against
// the scroll, then a typographic index of everything else.
export default function Work() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.utils.toArray(".wcase").forEach((el) => {
        gsap.fromTo(
          el.querySelector(".wcase__media"),
          { yPercent: 8 },
          { yPercent: -8, ease: "none", scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: 0.6 } }
        );
        gsap.from(el.querySelectorAll(".wcase__info > *"), {
          y: 40,
          opacity: 0,
          duration: 1.2,
          ease: "zr",
          stagger: 0.06,
          scrollTrigger: { trigger: el, start: "top 70%", once: true },
        });
      });
      gsap.from(".more__row", {
        y: 30,
        opacity: 0,
        duration: 1,
        ease: "zr",
        stagger: 0.04,
        scrollTrigger: { trigger: ".more", start: "top 85%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <section id="work" ref={root} className="work" data-theme="dark">
      <SectionBar no="02" label="Selected work" aside="2024 / 2026" />

      <header className="work__head">
        <h2 className="t-huge work__title">
          Selected
          <br />
          work<sup className="work__count tnum">({pad(CASES.length)})</sup>
        </h2>
        <div className="work__intro">
          <Reveal as="p" className="t-m">
            {WORK_INTRO.title}
          </Reveal>
          <p className="work__sub">{WORK_INTRO.text}</p>
        </div>
      </header>

      <div className="work__list">
        {CASES.map((c, i) => (
          <article key={c.id} className={`wcase ${i % 2 ? "wcase--r" : "wcase--l"}`}>
            <div className="wcase__media">
              <GLImage src={c.cover} hoverSrc={c.hover} alt={`${c.client}: ${c.title}`} className="wcase__img" cursorLabel="View" />
              <span className="wcase__tag t-label tnum">
                {pad(i + 1)} / {pad(CASES.length)}
              </span>
            </div>
            <div className="wcase__info">
              <div className="wcase__meta t-label">
                <span>{c.sector}</span>
                <span className="tnum">{c.year}</span>
              </div>
              <h3 className="wcase__client">{c.client}</h3>
              <p className="wcase__title t-m">{c.title}</p>
              <p className="wcase__text">{c.text}</p>
              <dl className="wcase__metrics">
                {c.metrics.map((m) => (
                  <div key={m.label}>
                    <dd className="tnum">{m.value}</dd>
                    <dt className="t-label">{m.label}</dt>
                  </div>
                ))}
              </dl>
            </div>
          </article>
        ))}
      </div>

      <GLField effect="pixels" data-variant="2" data-seed="9" className="work__band" aria-hidden="true" />

      <div className="more">
        <div className="more__head t-label">
          <span>More projects</span>
          <span className="tnum">({pad(MORE_WORK.length)})</span>
        </div>
        <ul>
          {MORE_WORK.map((m, i) => (
            <li key={m.name} className="more__row roll-trigger">
              <span className="t-label tnum">{pad(CASES.length + i + 1)}</span>
              <span className="more__name">
                <RollText text={m.name} />
              </span>
              <span className="more__type">{m.type}</span>
              <span className="more__year t-label tnum">{m.year}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

"use client";

import { Fragment, useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { PRINCIPLES, STATEMENT, STUDIO } from "@/data/content";
import GLField from "../ui/GLField";
import Reveal from "../ui/Reveal";
import SectionBar from "../ui/SectionBar";

// The studio in one sentence. Words light up as it is read, and three
// living pixel chips sit inline in the type.
export default function Intro() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.fromTo(
        ".intro__word",
        { opacity: 0.12 },
        {
          opacity: 1,
          ease: "none",
          stagger: 0.1,
          scrollTrigger: { trigger: ".intro__statement", start: "top 78%", end: "bottom 40%", scrub: true },
        }
      );
      gsap.from(".principle", {
        y: 90,
        opacity: 0,
        duration: 1.4,
        ease: "zr",
        stagger: 0.1,
        scrollTrigger: { trigger: ".intro__principles", start: "top 88%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <section id="studio" ref={root} className="intro" data-theme="light">
      <SectionBar no="01" label="The studio" aside="Est. 2022 / Mumbai" />

      <p className="intro__statement">
        {STATEMENT.map((w, i) =>
          typeof w === "string" ? (
            <Fragment key={i}>
              <span className="intro__word">{w}</span>{" "}
            </Fragment>
          ) : (
            <Fragment key={i}>
              <GLField
                as="span"
                effect="pixels"
                data-variant="0"
                data-seed={w.chip * 5 + 1}
                className="intro__chip"
                aria-hidden="true"
              />{" "}
            </Fragment>
          )
        )}
      </p>

      <div className="intro__foot">
        <div className="intro__lead">
          <Reveal as="p" className="t-m">
            {STUDIO.lead}
          </Reveal>
          <p className="t-label intro__hint">[ Hover the pixels to scramble them ]</p>
        </div>
        <div className="intro__principles">
          {PRINCIPLES.map((p, i) => (
            <article key={p.title} className="principle">
              <GLField effect="pixels" data-variant="1" data-seed={i * 3 + 4} className="principle__field" aria-hidden="true" />
              <div className="principle__meta">
                <span className="t-label tnum">0{i + 1}</span>
                <h3 className="principle__title">{p.title}</h3>
              </div>
              <p className="principle__text">{p.text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

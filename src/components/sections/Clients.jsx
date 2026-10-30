"use client";

import { useRef } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { CLIENTS, CLIENTS_INTRO } from "@/data/content";
import GLField from "../ui/GLField";
import Reveal from "../ui/Reveal";
import SectionBar from "../ui/SectionBar";

// A hairline wall of client marks, each printed as a halftone shader that
// floods electric blue from the cursor.
export default function Clients() {
  const root = useRef(null);

  useGSAP(
    () => {
      gsap.from(".client__name", {
        y: 12,
        opacity: 0,
        duration: 0.9,
        ease: "zr",
        stagger: 0.03,
        scrollTrigger: { trigger: ".clients__grid", start: "top 80%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <section ref={root} className="clients" data-theme="light">
      <SectionBar no="07" label="Clients" aside="100+ brands since 2022" />

      <header className="clients__head">
        <Reveal as="h2" className="t-xl clients__title">
          {CLIENTS_INTRO.title}
        </Reveal>
        <p className="clients__intro">{CLIENTS_INTRO.text}</p>
      </header>

      <ul className="clients__grid">
        {CLIENTS.map((c) => (
          <li key={c.file} className="client" data-cursor="hidden">
            <GLField effect="logo" data-src={`/images/clients/${c.file}.png`} className="client__field" aria-hidden="true" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img className="client__img" src={`/images/clients/${c.file}.png`} alt={c.name} loading="lazy" style={{ "--r": c.ratio }} />
            <span className="client__name t-label">{c.name}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

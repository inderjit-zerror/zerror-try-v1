"use client";

import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { CLIENTS } from "@/data/content";
import Reveal from "../ui/Reveal";
import Marquee from "../ui/Marquee";
import Tilt from "../ui/Tilt";

const pad = (n) => String(n).padStart(2, "0");
const logo = (c) => ({ "--logo": `url(/images/clients/${c.file}.png)`, "--r": c.ratio });

// Editorial index of clients. The sticky spotlight on the left follows
// whichever name is hovered, or the one passing the middle of the screen.
export default function Clients() {
  const root = useRef(null);
  const hovering = useRef(false);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 900px)", () => {
        gsap.utils.toArray(".crow").forEach((row, i) => {
          ScrollTrigger.create({
            trigger: row,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => {
              if (self.isActive && !hovering.current) setActive(i);
            },
          });
        });
      });

      // Scrolling hands control back from hover to the scroll position.
      const release = () => {
        hovering.current = false;
      };
      window.addEventListener("wheel", release, { passive: true });
      window.addEventListener("touchmove", release, { passive: true });

      gsap.from(".crow", {
        y: 40,
        opacity: 0,
        duration: 1.2,
        ease: "zr",
        stagger: 0.035,
        clearProps: "opacity,transform",
        scrollTrigger: { trigger: ".clients__list", start: "top 85%", once: true },
      });
      gsap.from(".spotlight", {
        y: 70,
        opacity: 0,
        duration: 1.4,
        ease: "zr",
        scrollTrigger: { trigger: ".clients__body", start: "top 80%", once: true },
      });

      return () => {
        window.removeEventListener("wheel", release);
        window.removeEventListener("touchmove", release);
        mm.revert();
      };
    },
    { scope: root }
  );

  const current = CLIENTS[active];

  return (
    <section ref={root} className="clients" data-theme="light">
      <div className="clients__head">
        <div className="clients__top">
          <span className="t-label">(Clients)</span>
          <span className="t-label">{CLIENTS.length} of 100+ brands since 2022</span>
        </div>
        <Reveal as="h2" className="t-huge clients__title">
          The company we keep.
        </Reveal>
      </div>

      <div className="clients__body">
        <aside className="clients__aside">
          <div className="spotlight">
            <Tilt className="spotlight__tilt" max={6}>
              <div className="spotlight__card">
                <span className="spotlight__grid" aria-hidden="true" />
                {CLIENTS.map((c, i) => (
                  <span
                    key={c.file}
                    className={`spotlight__logo ${i === active ? "is-active" : i < active ? "is-past" : ""}`}
                    style={logo(c)}
                    aria-hidden="true"
                  />
                ))}
                <span className="spotlight__corner spotlight__corner--tl" aria-hidden="true" />
                <span className="spotlight__corner spotlight__corner--br" aria-hidden="true" />
                <span className="spotlight__meta t-label">
                  <span>Client</span>
                  <span className="tnum">
                    {pad(active + 1)} / {pad(CLIENTS.length)}
                  </span>
                </span>
              </div>
            </Tilt>

            <div className="spotlight__names" aria-live="polite">
              <span className="sr-only">{current.name}</span>
              {CLIENTS.map((c, i) => (
                <span
                  key={c.file}
                  className={`spotlight__name ${i === active ? "is-active" : i < active ? "is-past" : ""}`}
                  aria-hidden="true"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>

          <p className="clients__lede">
            Publishers, film houses, fashion labels and founders who dream in beta.
            <span className="clients__hint"> Hover a name, or keep scrolling.</span>
          </p>
        </aside>

        <ol
          className="clients__list"
          onPointerLeave={() => {
            hovering.current = false;
          }}
        >
          {CLIENTS.map((c, i) => (
            <li
              key={c.file}
              className={`crow ${i === active ? "is-active" : ""}`}
              onPointerEnter={() => {
                hovering.current = true;
                setActive(i);
              }}
            >
              <span className="crow__idx t-label tnum">{pad(i + 1)}</span>
              <span className="crow__name">{c.name}</span>
              <span className="crow__logo" style={logo(c)} role="img" aria-label={`${c.name} logo`} />
              <span className="crow__arrow" aria-hidden="true">
                →
              </span>
            </li>
          ))}
        </ol>
      </div>

      <Marquee
        className="clients__marquee"
        speed={0.9}
        items={CLIENTS.map((c) => (
          <span key={c.file} className="clients__mlogo" style={logo(c)} role="img" aria-label={c.name} />
        ))}
      />
    </section>
  );
}

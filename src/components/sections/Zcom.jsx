"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { emit } from "@/lib/store";
import { ZCOM } from "@/data/content";
import Reveal from "../ui/Reveal";
import Magnetic from "../ui/Magnetic";
import RollText from "../ui/RollText";
import Tilt from "../ui/Tilt";

// Where each separate bill floats before they collapse into one Zcom plan.
const SPREAD = [
  { x: -0.34, y: -0.2, r: -8 },
  { x: 0.3, y: -0.26, r: 6 },
  { x: -0.22, y: 0.24, r: 5 },
  { x: 0.36, y: 0.18, r: -7 },
  { x: 0.06, y: 0.27, r: -3 },
];

export default function Zcom() {
  const root = useRef(null);

  useGSAP(
    () => {
      const bills = gsap.utils.toArray(".bill");
      const place = () => {
        const w = Math.min(window.innerWidth, 1400) * (window.innerWidth < 700 ? 0.62 : 1);
        const h = window.innerHeight;
        bills.forEach((b, i) =>
          gsap.set(b, { xPercent: -50, yPercent: -50, x: SPREAD[i].x * w, y: SPREAD[i].y * h, rotation: SPREAD[i].r })
        );
      };
      place();

      const tl = gsap.timeline({
        defaults: { ease: "none" },
        scrollTrigger: {
          trigger: ".zcom__pin",
          start: "top top",
          end: "bottom bottom",
          scrub: 0.9,
          invalidateOnRefresh: true,
          onRefreshInit: place,
        },
      });

      // Wordmark letters rise out of a mask as the section arrives.
      const brand = SplitText.create(".zcom__word", { type: "chars", mask: "chars" });
      gsap.from(brand.chars, {
        yPercent: 105,
        ease: "none",
        stagger: 0.12,
        scrollTrigger: { trigger: ".zcom__brand", start: "top 95%", end: "top 45%", scrub: 0.8 },
      });

      tl.from(bills, { opacity: 0, scale: 0.6, duration: 0.3, stagger: 0.04 })
        .to({}, { duration: 0.25 })
        .to(bills, { x: 0, y: 0, rotation: 0, scale: 0.5, duration: 0.6, stagger: 0.04, ease: "power2.in" })
        .to(bills, { opacity: 0, duration: 0.15 }, ">-0.12")
        .to(".cap--a", { opacity: 0, yPercent: -60, duration: 0.2 }, "<-0.2")
        .fromTo(".zcom__one", { scale: 0.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(1.6)" }, "<")
        .fromTo(".cap--b", { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, duration: 0.2 }, "<0.1")
        .fromTo(".zfact", { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.25 }, "<0.1")
        .to({}, { duration: 0.3 });

      gsap.from(".zpillar, .zai", {
        y: 60,
        opacity: 0,
        duration: 1.1,
        ease: "zr",
        stagger: 0.08,
        scrollTrigger: { trigger: ".zcom__details", start: "top 80%", once: true },
      });

      return () => brand.revert();
    },
    { scope: root }
  );

  return (
    <section id="zcom" ref={root} className="zcom" data-theme="dark">
      <div className="zcom__intro">
        <div className="zcom__intro-top">
          <span className="t-label">(Our product)</span>
          <span className="t-label">Website as a Service</span>
        </div>
        <h2 className="zcom__brand">
          <span className="zcom__word">zcom</span>
          <sup className="t-label">by Zerror</sup>
        </h2>
        <Reveal as="p" className="zcom__lede t-m">
          Every brand deserves a store that looks like no one else&apos;s, and the team to run it. A custom store, a
          team that keeps it running and AI that helps it sell, for one monthly fee.
        </Reveal>
      </div>

      <div className="zcom__pin">
        <div className="zcom__sticky">
          <div className="zcom__caption">
            <span className="cap cap--a">Five bills for one store.</span>
            <span className="cap cap--b">One subscription. One team.</span>
          </div>

          <div className="zcom__stage">
            {ZCOM.bills.map((b, i) => (
              <div key={b} className="bill">
                <span className="t-label tnum">0{i + 1}</span>
                <span className="bill__name">{b}</span>
                <span className="bill__tag t-label">Billed separately</span>
              </div>
            ))}
            <div className="zcom__one">
              <Tilt className="zcom__one-tilt" max={10}>
                <span className="zcom__one-mark">zcom</span>
                <span className="t-label">Store / Team / AI</span>
              </Tilt>
            </div>
          </div>

          <div className="zcom__facts">
            <div className="zfact">
              <b>0</b>
              <span>Upfront build or onboarding fee</span>
            </div>
            <div className="zfact">
              <b>1</b>
              <span>Monthly fee for build, hosting, apps and upkeep</span>
            </div>
            <div className="zfact">
              <b>1</b>
              <span>In-house team for every change, at code level</span>
            </div>
          </div>
        </div>
      </div>

      <div className="zcom__details">
        <div className="zcom__pillars">
          {ZCOM.pillars.map((p, i) => (
            <Tilt key={p.title} className="zpillar" max={5}>
              <span className="t-label tnum">0{i + 1}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </Tilt>
          ))}
        </div>

        <div className="zcom__ai">
          <div className="zcom__ai-head">
            <span className="t-label">(AI built in)</span>
            <p className="t-m">An AI team that knows the store from the inside.</p>
          </div>
          <ul>
            {ZCOM.ai.map((a) => (
              <li key={a.title} className="zai roll-trigger">
                <span className={`pill ${a.status === "Live" ? "pill--live" : ""}`}>{a.status}</span>
                <h3>
                  <RollText text={a.title} />
                </h3>
                <p>{a.text}</p>
              </li>
            ))}
          </ul>
          <Magnetic strength={0.3}>
            <button type="button" className="btn btn--pill btn--blue btn--lg" onClick={() => emit("contact:open", "Zcom store")}>
              <span className="btn__dot" /> <RollText text="Launch a Zcom store" />
            </button>
          </Magnetic>
        </div>
      </div>
    </section>
  );
}

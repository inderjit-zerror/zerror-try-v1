"use client";

import { useRef } from "react";
import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { getLenis } from "@/lib/scroll";
import { emit } from "@/lib/store";
import { CASES, MORE_WORK } from "@/data/content";
import GLImage from "../ui/GLImage";
import Reveal from "../ui/Reveal";
import Magnetic from "../ui/Magnetic";
import RollText from "../ui/RollText";

export default function Work() {
  const root = useRef(null);
  const pin = useRef(null);
  const track = useRef(null);
  const bar = useRef(null);
  const counter = useRef(null);
  const nav = useRef({ jump: null });

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      // Desktop: vertical scroll (or dragging) drives a horizontal track in a sticky frame.
      mm.add("(min-width: 900px)", () => {
        const sticky = pin.current.querySelector(".work__sticky");
        const cards = gsap.utils.toArray(".case:not(.case--end)", track.current);
        const links = gsap.utils.toArray(".work__index button", root.current);
        const distance = () => track.current.scrollWidth - window.innerWidth;
        const pinTop = () => pin.current.getBoundingClientRect().top + window.scrollY;
        let stops = [];

        const measure = () => {
          pin.current.style.height = `${distance() + window.innerHeight}px`;
          const pad = parseFloat(getComputedStyle(track.current).paddingLeft) || 0;
          stops = cards.map((c) => Math.min(distance(), c.offsetLeft - pad));
        };
        measure();
        ScrollTrigger.addEventListener("refreshInit", measure);

        let active = -1;
        const scroller = gsap.to(track.current, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: pin.current,
            start: "top top",
            end: "bottom bottom",
            scrub: 0.7,
            invalidateOnRefresh: true,
            onUpdate: (self) => {
              bar.current.style.transform = `scaleX(${self.progress})`;
              const x = self.progress * distance() + window.innerWidth * 0.35;
              let i = 0;
              stops.forEach((s, k) => s <= x && (i = k));
              if (i !== active) {
                active = i;
                counter.current.textContent = `0${i + 1}`;
                links.forEach((l, k) => l.classList.toggle("is-active", k === i));
              }
            },
          },
        });

        nav.current.jump = (i) => getLenis()?.scrollTo(pinTop() + stops[i], { duration: 1.6 });

        // Copy animates in as each card slides into frame.
        gsap.utils.toArray(".case__info").forEach((info) => {
          gsap.from(info.querySelectorAll(".case__in"), {
            x: 60,
            opacity: 0,
            duration: 1.2,
            ease: "zr",
            stagger: 0.06,
            scrollTrigger: { trigger: info, containerAnimation: scroller, start: "left 90%", once: true },
          });
        });

        // Click-and-drag the track, with a little fling on release.
        let dragging = false;
        let moved = 0;
        let startX = 0;
        let startScroll = 0;
        let lastX = 0;
        let vx = 0;
        const clampScroll = (y) => gsap.utils.clamp(pinTop(), pinTop() + distance(), y);
        const down = (e) => {
          if (e.pointerType !== "mouse" || e.button !== 0) return;
          const lenis = getLenis();
          if (!lenis) return;
          dragging = true;
          moved = 0;
          startX = lastX = e.clientX;
          startScroll = lenis.targetScroll;
          vx = 0;
          sticky.classList.add("is-dragging");
        };
        const move = (e) => {
          if (!dragging) return;
          const dx = e.clientX - startX;
          moved = Math.max(moved, Math.abs(dx));
          vx = vx * 0.6 + (e.clientX - lastX) * 0.4;
          lastX = e.clientX;
          getLenis()?.scrollTo(clampScroll(startScroll - dx * 1.2), { lerp: 0.12 });
        };
        const up = () => {
          if (!dragging) return;
          dragging = false;
          sticky.classList.remove("is-dragging");
          const lenis = getLenis();
          if (lenis && Math.abs(vx) > 1) lenis.scrollTo(clampScroll(lenis.targetScroll - vx * 18), { lerp: 0.06 });
        };
        const blockClick = (e) => {
          if (moved > 6) {
            e.preventDefault();
            e.stopPropagation();
          }
        };
        sticky.addEventListener("pointerdown", down);
        window.addEventListener("pointermove", move);
        window.addEventListener("pointerup", up);
        sticky.addEventListener("click", blockClick, true);

        return () => {
          ScrollTrigger.removeEventListener("refreshInit", measure);
          sticky.removeEventListener("pointerdown", down);
          window.removeEventListener("pointermove", move);
          window.removeEventListener("pointerup", up);
          sticky.removeEventListener("click", blockClick, true);
          nav.current.jump = null;
          pin.current.style.height = "";
          gsap.set(track.current, { clearProps: "transform" });
        };
      });

      mm.add("(max-width: 899px)", () => {
        gsap.utils.toArray(".case__info").forEach((info) => {
          gsap.from(info.querySelectorAll(".case__in"), {
            y: 40,
            opacity: 0,
            duration: 1.1,
            ease: "zr",
            stagger: 0.06,
            scrollTrigger: { trigger: info, start: "top 85%", once: true },
          });
        });
      });

      gsap.from(".more__row", {
        yPercent: 60,
        opacity: 0,
        duration: 1.2,
        ease: "zr",
        stagger: 0.08,
        scrollTrigger: { trigger: ".more", start: "top 85%", once: true },
      });

      // The big title drifts sideways as it passes, for depth.
      gsap.to(".work__title", {
        xPercent: -8,
        ease: "none",
        scrollTrigger: { trigger: ".work__intro", start: "top bottom", end: "bottom top", scrub: 0.8 },
      });

      return () => mm.revert();
    },
    { scope: root }
  );

  return (
    <section id="work" ref={root} className="work" data-theme="light">
      <div className="work__intro">
        <div className="work__intro-top">
          <span className="t-label">(Selected work)</span>
          <span className="t-label">2022 / 2026</span>
        </div>
        <Reveal as="h2" className="t-huge work__title">
          Case studies
        </Reveal>
        <div className="work__intro-bottom">
          <p className="work__lede t-m">We build systems designed for your business. Not websites forced into templates.</p>
          <span className="t-label">Scroll or drag to explore ({String(CASES.length).padStart(2, "0")})</span>
        </div>
      </div>

      <div ref={pin} className="work__pin">
        <div className="work__sticky" data-cursor="drag" data-cursor-label="Drag">
          <div ref={track} className="work__track">
            {CASES.map((c, i) => (
              <article key={c.id} className="case">
                <div className="case__media">
                  <GLImage src={c.images[0]} alt={`${c.client} website on desktop`} axis="x" className="case__img case__img--main" cursor="drag" cursorLabel="Drag" />
                  <GLImage src={c.images[1]} alt={`${c.client} website detail`} axis="x" className="case__img case__img--a" cursor="drag" cursorLabel="Drag" />
                  <GLImage src={c.images[2]} alt={`${c.client} website on mobile`} axis="x" className="case__img case__img--b" cursor="drag" cursorLabel="Drag" />
                </div>
                <div className="case__info">
                  <div className="case__top case__in">
                    <span className="case__no tnum">0{i + 1}</span>
                    <span className="t-label">{c.sector}</span>
                  </div>
                  <h3 className="case__client case__in">{c.client}</h3>
                  <p className="case__title case__in">{c.title}</p>
                  <p className="case__text case__in">{c.text}</p>
                  <ul className="case__scope case__in">
                    {c.scope.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  <dl className="case__metrics case__in">
                    {c.metrics.map((m) => (
                      <div key={m.label}>
                        <dt>{m.value}</dt>
                        <dd>{m.label}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </article>
            ))}

            <article className="case case--end">
              <span className="t-label">(Next)</span>
              <p className="case-end__title">Your brand could be next.</p>
              <Magnetic strength={0.3}>
                <button type="button" className="btn btn--pill btn--blue btn--lg" onClick={() => emit("contact:open")}>
                  <span className="btn__dot" /> <RollText text="Start a project" />
                </button>
              </Magnetic>
            </article>
          </div>

          <div className="work__hud">
            <span className="t-label tnum work__count">
              <span ref={counter}>01</span> / 0{CASES.length}
            </span>
            <span className="work__progress">
              <span ref={bar} />
            </span>
            <nav className="work__index" aria-label="Case studies">
              {CASES.map((c, i) => (
                <button key={c.id} type="button" className={i === 0 ? "is-active" : ""} onClick={() => nav.current.jump?.(i)}>
                  <RollText text={c.client} />
                </button>
              ))}
            </nav>
          </div>
        </div>
      </div>

      <div className="more">
        <div className="more__head">
          <span className="t-label">(Also shipped)</span>
        </div>
        <ul className="more__list">
          {MORE_WORK.map((w, i) => (
            <li key={w.name} className="more__row roll-trigger">
              <span className="more__idx tnum">0{i + 1}</span>
              <span className="more__name">
                <RollText text={w.name} />
              </span>
              <span className="more__type">{w.type}</span>
              <span className="more__year tnum">{w.year}</span>
              <span className="more__arrow" aria-hidden="true">
                ↗
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { scrollToTarget, getLenis } from "@/lib/scroll";
import { emit, state } from "@/lib/store";
import { CONTACT, NAV } from "@/data/content";
import Logo from "./Logo";
import Magnetic from "./Magnetic";
import RollText from "./RollText";
import Clock from "./Clock";

export default function Header() {
  const header = useRef(null);
  const menu = useRef(null);
  const [open, setOpen] = useState(false);

  // Header + cursor colours follow the section underneath, and the bar
  // tucks away while scrolling down.
  useEffect(() => {
    const html = document.documentElement;
    let frame = 0;
    let lastScroll = 0;
    const tick = () => {
      if (++frame % 4) return;
      const probe = 36;
      let theme = "blue";
      for (const el of document.querySelectorAll("[data-theme]")) {
        const r = el.getBoundingClientRect();
        if (r.top <= probe && r.bottom > probe) {
          theme = el.dataset.theme;
          break;
        }
      }
      if (html.dataset.ui !== theme) html.dataset.ui = theme;

      const s = state.scroll;
      const down = s > lastScroll + 2;
      const up = s < lastScroll - 2;
      if (down && s > 240) header.current?.classList.add("is-hidden");
      else if (up || s < 240) header.current?.classList.remove("is-hidden");
      lastScroll = s;
    };
    gsap.ticker.add(tick);
    return () => gsap.ticker.remove(tick);
  }, []);

  useEffect(() => {
    const el = menu.current;
    if (!el) return;
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      gsap.set(el, { visibility: "visible" });
      gsap
        .timeline()
        .fromTo(el, { clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0% 0)", duration: 0.9, ease: "zr-io" })
        .fromTo(el.querySelectorAll(".menu__link"), { yPercent: 110 }, { yPercent: 0, duration: 0.9, stagger: 0.06, ease: "zr" }, 0.35)
        .fromTo(el.querySelectorAll(".menu__foot > *"), { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.05 }, 0.6);
    } else if (el.style.visibility === "visible") {
      gsap
        .timeline({ onComplete: () => gsap.set(el, { visibility: "hidden" }) })
        .to(el, { clipPath: "inset(100% 0 0% 0)", duration: 0.8, ease: "zr-io" });
      if (state.intro) lenis?.start();
    }
  }, [open]);

  const go = (e, href) => {
    e.preventDefault();
    setOpen(false);
    setTimeout(() => scrollToTarget(href, { offset: href === "#top" ? 0 : -1 }), open ? 450 : 0);
  };

  return (
    <>
      <header ref={header} className="header">
        <a href="#top" className="header__logo" aria-label="Zerror Studios, back to top" onClick={(e) => go(e, "#top")}>
          <Logo />
        </a>

        <nav className="header__nav" aria-label="Primary">
          {NAV.map((n, i) => (
            <a key={n.href} href={n.href} className="header__link" onClick={(e) => go(e, n.href)}>
              <span className="header__idx">0{i + 1}</span>
              <RollText text={n.label} />
            </a>
          ))}
        </nav>

        <div className="header__right">
          <Clock className="header__clock t-label" />
          <Magnetic strength={0.25}>
            <button type="button" className="btn btn--pill" onClick={() => emit("contact:open")}>
              <span className="btn__dot" />
              <RollText text="Start a project" />
            </button>
          </Magnetic>
          <button
            type="button"
            className={`header__burger ${open ? "is-open" : ""}`}
            aria-expanded={open}
            aria-controls="menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <i />
            <i />
          </button>
        </div>
      </header>

      <div ref={menu} id="menu" className="menu" data-lenis-prevent>
        <nav className="menu__nav" aria-label="Mobile">
          {NAV.map((n, i) => (
            <a key={n.href} href={n.href} className="menu__item" onClick={(e) => go(e, n.href)}>
              <span className="menu__link">
                <small>0{i + 1}</small>
                {n.label}
              </span>
            </a>
          ))}
        </nav>
        <div className="menu__foot">
          <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
          <span>Mumbai, India</span>
          <button
            type="button"
            className="btn btn--pill btn--invert"
            onClick={() => {
              setOpen(false);
              emit("contact:open");
            }}
          >
            Start a project
          </button>
        </div>
      </div>
    </>
  );
}

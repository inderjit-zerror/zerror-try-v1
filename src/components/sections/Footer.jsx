"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/scroll";
import { emit } from "@/lib/store";
import { CONTACT } from "@/data/content";
import Logo from "../ui/Logo";
import GLField from "../ui/GLField";
import Magnetic from "../ui/Magnetic";
import RollText from "../ui/RollText";
import Clock from "../ui/Clock";
import SectionBar from "../ui/SectionBar";

export default function Footer() {
  const root = useRef(null);
  const [copied, setCopied] = useState(false);
  const timer = useRef(null);

  // Click the big address to copy it; fall back to the mail app if the
  // clipboard isn't available.
  const copyEmail = async (e) => {
    e.preventDefault();
    try {
      await navigator.clipboard.writeText(CONTACT.email);
      setCopied(true);
      clearTimeout(timer.current);
      timer.current = setTimeout(() => setCopied(false), 2200);
    } catch {
      window.location.href = `mailto:${CONTACT.email}`;
    }
  };

  useGSAP(
    () => {
      gsap.from(".footer__line > span", {
        yPercent: 110,
        duration: 1.4,
        ease: "zr",
        stagger: 0.08,
        scrollTrigger: { trigger: ".footer__headline", start: "top 85%", once: true },
      });
      gsap.from(".footer__circle", {
        scale: 0,
        rotation: -90,
        duration: 1.4,
        ease: "zr",
        scrollTrigger: { trigger: ".footer__actions", start: "top 90%", once: true },
      });
      gsap.from(".footer__col", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "zr",
        stagger: 0.07,
        scrollTrigger: { trigger: ".footer__cols", start: "top 92%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <footer id="contact" ref={root} className="footer" data-theme="blue">
      <SectionBar no="08" label="Contact" aside={<Clock prefix="Mumbai" />} />

      <div className="footer__cta">
        <h2 className="footer__headline">
          <span className="footer__line">
            <span>Let&apos;s build</span>
          </span>
          <span className="footer__line">
            <span>
              something <em>precise.</em>
            </span>
          </span>
        </h2>
        <div className="footer__actions">
          <Magnetic strength={0.4}>
            <button type="button" className="footer__circle" onClick={() => emit("contact:open")} data-cursor="hidden">
              <RollText text="Start a project" />
              <span className="footer__circle-arrow" aria-hidden="true">
                →
              </span>
            </button>
          </Magnetic>
          <div className="footer__mailwrap">
            <span className={`footer__status t-label ${copied ? "is-copied" : ""}`} aria-live="polite">
              <span>Click to copy</span>
              <span>Copied to clipboard ✓</span>
            </span>
            <a
              className="footer__mail"
              href={`mailto:${CONTACT.email}`}
              onClick={copyEmail}
              data-cursor="copy"
              data-cursor-label={copied ? "Copied" : "Copy"}
            >
              <RollText text={CONTACT.email} />
            </a>
          </div>
        </div>
      </div>

      <GLField effect="wave" className="footer__wave" aria-hidden="true">
        <span className="t-label footer__wave-hint">[ Move to bend the signal ]</span>
      </GLField>

      <div className="footer__cols">
        <div className="footer__col">
          <span className="t-label">Studio</span>
          <address>
            {CONTACT.address.map((l) => (
              <span key={l}>{l}</span>
            ))}
          </address>
        </div>
        <div className="footer__col">
          <span className="t-label">Contact</span>
          <a href={`mailto:${CONTACT.email}`}>
            <RollText text={CONTACT.email} />
          </a>
          <a href={CONTACT.phoneHref}>
            <RollText text={CONTACT.phone} />
          </a>
        </div>
        <div className="footer__col">
          <span className="t-label">Follow</span>
          {CONTACT.socials.map((s) => (
            <a key={s.label} href={s.href} target="_blank" rel="noreferrer">
              <RollText text={s.label} /> ↗
            </a>
          ))}
        </div>
        <div className="footer__col">
          <span className="t-label">Sitemap</span>
          <button type="button" onClick={() => scrollToTarget("#work")}>
            <RollText text="Work" />
          </button>
          <button type="button" onClick={() => scrollToTarget("#services")}>
            <RollText text="Capabilities" />
          </button>
          <button type="button" onClick={() => scrollToTarget("#zcom")}>
            <RollText text="Zcom" />
          </button>
        </div>
      </div>

      <div id="footer-logo" className="footer__logo" aria-hidden="true">
        <Logo className="logo-fallback" />
      </div>

      <div className="footer__bar t-label">
        <span>© 2026 Zerror Studios</span>
        <span>Systems. Structure. Precision.</span>
        <button type="button" onClick={() => scrollToTarget(0, { duration: 2.4 })}>
          Back to top ↑
        </button>
      </div>
    </footer>
  );
}

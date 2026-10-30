"use client";

import { useRef, useState } from "react";
import { gsap, useGSAP } from "@/lib/gsap";
import { scrollToTarget } from "@/lib/scroll";
import { emit } from "@/lib/store";
import { CONTACT } from "@/data/content";
import Logo from "../ui/Logo";
import Reveal from "../ui/Reveal";
import Magnetic from "../ui/Magnetic";
import RollText from "../ui/RollText";
import Clock from "../ui/Clock";

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
      gsap.from(".footer__col", {
        y: 40,
        opacity: 0,
        duration: 1,
        ease: "zr",
        stagger: 0.07,
        scrollTrigger: { trigger: ".footer__cols", start: "top 90%", once: true },
      });
      gsap.from(".footer__circle", {
        scale: 0,
        rotation: -90,
        duration: 1.4,
        ease: "zr",
        scrollTrigger: { trigger: ".footer__actions", start: "top 85%", once: true },
      });
    },
    { scope: root }
  );

  return (
    <footer id="contact" ref={root} className="footer" data-theme="blue">
      <div className="footer__cta">
        <span className="t-label">(Let&apos;s build together)</span>
        <Reveal as="h2" className="t-xl footer__headline">
          For founders who move fast and brands that refuse to look average.
        </Reveal>
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
          <span className="t-label">Local time</span>
          <Clock prefix="Mumbai" />
          <span className="footer__muted">Working with founders worldwide</span>
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

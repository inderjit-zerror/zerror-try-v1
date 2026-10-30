"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { getLenis } from "@/lib/scroll";
import { on, state } from "@/lib/store";
import { CONTACT, PROJECT_TYPES } from "@/data/content";

// "Start a project" panel. Sends through the visitor's mail client, so no
// backend is needed.
export default function ContactModal() {
  const root = useRef(null);
  const first = useRef(null);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState(PROJECT_TYPES[0]);
  const [form, setForm] = useState({ name: "", email: "", company: "", message: "" });

  useEffect(
    () =>
      on("contact:open", (preset) => {
        if (preset) setType(preset);
        setOpen(true);
      }),
    []
  );

  useEffect(() => {
    const el = root.current;
    const lenis = getLenis();
    if (open) {
      lenis?.stop();
      gsap.set(el, { visibility: "visible" });
      gsap
        .timeline({ onComplete: () => first.current?.focus() })
        .fromTo(el.querySelector(".modal__scrim"), { opacity: 0 }, { opacity: 1, duration: 0.5 })
        .fromTo(
          el.querySelector(".modal__panel"),
          { clipPath: "inset(100% 0 0 0)" },
          { clipPath: "inset(0% 0 0 0)", duration: 0.9, ease: "zr-io" },
          0
        )
        .fromTo(el.querySelectorAll(".modal__in"), { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, ease: "zr" }, 0.35);
      const onKey = (e) => e.key === "Escape" && setOpen(false);
      window.addEventListener("keydown", onKey);
      return () => window.removeEventListener("keydown", onKey);
    }
    if (el.style.visibility === "visible") {
      gsap
        .timeline({ onComplete: () => gsap.set(el, { visibility: "hidden" }) })
        .to(el.querySelector(".modal__panel"), { clipPath: "inset(0 0 100% 0)", duration: 0.7, ease: "zr-io" })
        .to(el.querySelector(".modal__scrim"), { opacity: 0, duration: 0.4 }, 0.2);
      if (state.intro) lenis?.start();
    }
  }, [open]);

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    const subject = `New project: ${type}${form.company ? ` for ${form.company}` : ""}`;
    const body = [
      `Name: ${form.name}`,
      `Email: ${form.email}`,
      form.company && `Company: ${form.company}`,
      `Project type: ${type}`,
      "",
      form.message,
    ]
      .filter((l) => l !== false && l !== "")
      .join("\n");
    window.location.href = `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div ref={root} className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title" data-lenis-prevent>
      <div className="modal__scrim" onClick={() => setOpen(false)} />
      <div className="modal__panel">
        <div className="modal__head modal__in">
          <span className="t-label">New project</span>
          <button type="button" className="modal__close" onClick={() => setOpen(false)}>
            Close <span aria-hidden="true">✕</span>
          </button>
        </div>
        <h2 id="modal-title" className="modal__title modal__in">
          Your next version
          <br />
          starts here.
        </h2>

        <form className="modal__form" onSubmit={submit}>
          <fieldset className="modal__types modal__in">
            <legend className="t-label">What are we building?</legend>
            <div className="chips">
              {PROJECT_TYPES.map((t) => (
                <button
                  type="button"
                  key={t}
                  className={`chip ${type === t ? "is-active" : ""}`}
                  aria-pressed={type === t}
                  onClick={() => setType(t)}
                >
                  {t}
                </button>
              ))}
            </div>
          </fieldset>

          <div className="modal__grid">
            <label className="field modal__in">
              <span className="t-label">Name</span>
              <input ref={first} required value={form.name} onChange={update("name")} autoComplete="name" />
            </label>
            <label className="field modal__in">
              <span className="t-label">Email</span>
              <input type="email" required value={form.email} onChange={update("email")} autoComplete="email" />
            </label>
            <label className="field modal__in">
              <span className="t-label">Company (optional)</span>
              <input value={form.company} onChange={update("company")} autoComplete="organization" />
            </label>
            <label className="field field--wide modal__in">
              <span className="t-label">What should we know?</span>
              <textarea rows={3} value={form.message} onChange={update("message")} />
            </label>
          </div>

          <div className="modal__foot modal__in">
            <p className="modal__note">
              Opens your mail app addressed to <a href={`mailto:${CONTACT.email}`}>{CONTACT.email}</a>
            </p>
            <button type="submit" className="btn btn--pill btn--invert btn--lg">
              <span className="btn__dot" /> Send brief
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

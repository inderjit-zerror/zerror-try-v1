"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { getLenis } from "@/lib/scroll";
import { emit, state } from "@/lib/store";
import { CASES } from "@/data/content";

const MIN_TIME = 1.9;

function preload(urls, onEach) {
  return Promise.all(
    urls.map(
      (src) =>
        new Promise((resolve) => {
          const img = new Image();
          img.onload = img.onerror = () => {
            onEach();
            resolve();
          };
          img.src = src;
        })
    )
  );
}

function waitFor(check, timeout) {
  return new Promise((resolve) => {
    const t0 = performance.now();
    const loop = () => {
      if (check() || performance.now() - t0 > timeout) resolve();
      else requestAnimationFrame(loop);
    };
    loop();
  });
}

// Electric blue pixels fill the screen as the system loads. When the screen
// is fully blue it hands over to the hero, which is that same blue.
export default function Preloader() {
  const root = useRef(null);
  const count = useRef(null);
  const [grid, setGrid] = useState(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    const vw = window.innerWidth;
    const vh = window.innerHeight;
    const cols = vw < 768 ? 7 : 16;
    const cell = vw / cols;
    const rows = Math.ceil(vh / cell);
    const total = cols * rows;
    const order = Array.from({ length: total }, (_, i) => i).sort(() => Math.random() - 0.5);
    setGrid({ cols, rows, cell, order });
  }, []);

  useEffect(() => {
    if (!grid) return;
    const cells = root.current.querySelectorAll(".preloader__cell");
    const urls = CASES.map((c) => c.cover);
    let loaded = 0;
    const steps = urls.length + 2;
    const prog = { p: 0 };
    let lit = 0;
    let finished = false;
    const t0 = performance.now();
    let last = t0;

    preload(urls, () => loaded++);
    document.fonts.ready.then(() => loaded++);
    waitFor(() => state.glReady || document.documentElement.classList.contains("no-gl"), 6000).then(() => loaded++);

    const render = () => {
      // Time-based so it finishes on schedule even at low frame rates.
      const now = performance.now();
      const dt = (now - last) / 1000;
      last = now;
      const target = Math.min(loaded / steps, (now - t0) / 1000 / MIN_TIME);
      prog.p = Math.min(target, prog.p + dt * 1.1);
      if (count.current) count.current.textContent = String(Math.round(prog.p * 100)).padStart(3, "0");
      const n = Math.floor(prog.p * grid.order.length);
      for (; lit < n; lit++) cells[grid.order[lit]]?.classList.add("on");
      if (prog.p >= 1 && !finished) {
        finished = true;
        finish();
      }
    };
    gsap.ticker.add(render);

    const finish = () => {
      gsap.ticker.remove(render);
      const tl = gsap.timeline({
        onComplete: () => {
          setGone(true);
        },
      });
      tl.to(root.current.querySelectorAll(".preloader__ui > *"), { yPercent: -120, opacity: 0, duration: 0.7, ease: "zr-io", stagger: 0.05 }, 0.15)
        .add(() => {
          if (state.intro) return;
          state.intro = true;
          document.documentElement.classList.add("is-ready");
          getLenis()?.start();
          gsap.to(state, { heroIntro: 1, duration: 2.8, ease: "none" });
          emit("intro");
        }, 0.6)
        .to(root.current, { opacity: 0, duration: 0.4, ease: "none" }, 0.75);
    };

    return () => gsap.ticker.remove(render);
  }, [grid]);

  if (gone) return null;

  return (
    <div ref={root} className="preloader" aria-hidden="true">
      {grid && (
        <div className="preloader__grid" style={{ gridTemplateColumns: `repeat(${grid.cols}, ${grid.cell}px)` }}>
          {Array.from({ length: grid.cols * grid.rows }, (_, i) => (
            <span key={i} className="preloader__cell" style={{ height: grid.cell }} />
          ))}
        </div>
      )}
      <div className="preloader__ui">
        <div className="preloader__top t-label">
          <span>Zerror Studios</span>
          <span>Systems. Structure. Precision.</span>
        </div>
        <div className="preloader__bottom">
          <span ref={count} className="preloader__count">000</span>
          <span className="t-label">Loading the system</span>
        </div>
      </div>
    </div>
  );
}

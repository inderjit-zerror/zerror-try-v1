"use client";

import { useRef } from "react";
import { gsap, SplitText, useGSAP } from "@/lib/gsap";
import { on, state } from "@/lib/store";

// Masked line-by-line reveal. With `intro`, it waits for the preloader
// instead of a scroll position.
export default function Reveal({
  as: Tag = "div",
  children,
  className = "",
  delay = 0,
  stagger = 0.09,
  start = "top 88%",
  intro = false,
  ...rest
}) {
  const ref = useRef(null);

  useGSAP(
    () => {
      let off;
      const split = SplitText.create(ref.current, {
        type: "lines",
        mask: "lines",
        linesClass: "line",
        autoSplit: true,
        onSplit(self) {
          const tween = gsap.from(self.lines, {
            yPercent: 115,
            duration: 1.3,
            ease: "zr",
            stagger,
            delay,
            paused: intro,
            scrollTrigger: intro ? undefined : { trigger: ref.current, start, once: true },
          });
          if (intro) {
            if (state.intro) tween.play();
            else off = on("intro", () => tween.play());
          }
          return tween;
        },
      });
      ref.current.classList.add("is-split");
      return () => {
        off?.();
        split.revert();
      };
    },
    { scope: ref }
  );

  return (
    <Tag ref={ref} className={`reveal ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

"use client";

import { useEffect, useId, useRef } from "react";
import { registerField } from "@/lib/fields";

// A DOM slot painted by one of the shaders in gl/effects.js. Effect inputs
// travel as data-* attributes, which the GL layer reads every frame, so the
// section can drive the shader just by re-rendering.
export default function GLField({ as: Tag = "div", effect, className = "", children, ...rest }) {
  const ref = useRef(null);
  const id = useId();

  useEffect(() => registerField(id, { id, el: ref.current, effect }), [id, effect]);

  return (
    <Tag ref={ref} className={`glfield glfield--${effect} ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

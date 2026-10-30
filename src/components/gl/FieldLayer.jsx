"use client";
"use no memo";
// three.js objects (uniforms, camera, render targets) are mutated every frame by design.
/* eslint-disable react-hooks/immutability */

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useSyncExternalStore } from "react";
import * as THREE from "three";
import vert from "@/shaders/field.vert";
import { getFieldsServerSnapshot, getFieldsSnapshot, subscribeFields } from "@/lib/fields";
import { clamp, damp, state } from "@/lib/store";
import { EFFECTS } from "./effects";
import { loadTexture } from "./textures";

let sharedGeometry = null;
const getGeometry = () => (sharedGeometry ??= new THREE.PlaneGeometry(1, 1));

// One plane per <GLField>, laid over its DOM rect. Every effect gets the
// same base uniforms: time, size in CSS px, cursor (uv, y up), hover,
// an enter ramp, scroll progress through the viewport and scroll speed.
function FieldPlane({ item }) {
  const size = useThree((s) => s.size);
  const mesh = useRef(null);
  const fx = EFFECTS[item.effect];
  const anim = useRef({ hover: 0, enter: 0, vel: 0, loaded: 0, mouse: new THREE.Vector2(0.5, 0.5) });

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: fx.frag,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: new THREE.Vector2(1, 1) },
          uMouse: { value: new THREE.Vector2(0.5, 0.5) },
          uHover: { value: 0 },
          uEnter: { value: 0 },
          uProgress: { value: 0 },
          uVelocity: { value: 0 },
          ...(fx.texture
            ? { uTexture: { value: null }, uImageSize: { value: new THREE.Vector2(1, 1) }, uLoaded: { value: 0 } }
            : {}),
          ...fx.uniforms?.(),
        },
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    [fx]
  );
  useEffect(() => () => material.dispose(), [material]);

  useEffect(() => {
    const src = item.el.dataset.src;
    if (!fx.texture || !src) return;
    let alive = true;
    loadTexture(src).then((tex) => {
      if (!alive) return;
      material.uniforms.uTexture.value = tex;
      material.uniforms.uImageSize.value.set(tex.image.width, tex.image.height);
      anim.current.loaded = 1;
    });
    return () => {
      alive = false;
    };
  }, [fx, item.el, material]);

  useFrame((st, dt) => {
    const m = mesh.current;
    if (!m) return;
    const r = item.el.getBoundingClientRect();
    const visible = r.width > 0 && r.height > 0 && r.bottom > -100 && r.top < size.height + 100;
    m.visible = visible;
    if (!visible) return;

    const a = anim.current;
    const u = material.uniforms;
    m.position.set(r.left + r.width / 2 - size.width / 2, -(r.top + r.height / 2 - size.height / 2), 0);
    m.scale.set(r.width, r.height, 1);
    u.uSize.value.set(r.width, r.height);
    u.uTime.value = st.clock.elapsedTime;

    if (state.intro && r.top < size.height * 0.9 && r.bottom > size.height * 0.1) {
      a.enter = Math.min(1, a.enter + dt / (fx.enter ?? 1.6));
    }
    u.uEnter.value = a.enter;
    u.uProgress.value = clamp((size.height - r.top) / (size.height + r.height), 0, 1);

    const mx = state.mouse.x;
    const my = state.mouse.y;
    const inside = mx >= r.left && mx <= r.right && my >= r.top && my <= r.bottom;
    const [rise, fall] = fx.hover ?? [5, 4];
    a.hover = damp(a.hover, inside ? 1 : 0, inside ? rise : fall, dt);
    u.uHover.value = a.hover;
    if (mx > -1000) {
      a.mouse.set(clamp((mx - r.left) / r.width, -1, 2), clamp(1 - (my - r.top) / r.height, -1, 2));
      u.uMouse.value.lerp(a.mouse, 1 - Math.exp(-8 * dt));
    }

    a.vel = damp(a.vel, state.velocity, 4, dt);
    u.uVelocity.value = a.vel;
    if (fx.texture) u.uLoaded.value = damp(u.uLoaded.value, a.loaded, 4, dt);

    fx.update?.(u, { el: item.el, rect: r, size, dt, anim: a });
  });

  return <mesh ref={mesh} geometry={getGeometry()} material={material} frustumCulled={false} renderOrder={1} />;
}

export default function FieldLayer() {
  const items = useSyncExternalStore(subscribeFields, getFieldsSnapshot, getFieldsServerSnapshot);
  return items.filter((item) => EFFECTS[item.effect]).map((item) => <FieldPlane key={item.id} item={item} />);
}

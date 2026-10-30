"use client";
"use no memo";
// three.js objects (uniforms, camera, render targets) are mutated every frame by design.
/* eslint-disable react-hooks/immutability */

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import vert from "@/shaders/pixelLogo.vert";
import frag from "@/shaders/pixelLogo.frag";
import { LOGO_PATHS, LOGO_VIEWBOX } from "@/lib/logo";
import { clamp, damp, hexToRgb, state } from "@/lib/store";

const RATIO = LOGO_VIEWBOX.height / LOGO_VIEWBOX.width;

// Spring physics for the cursor interaction. Pixels are pushed away from the
// cursor, dragged a little along its motion, and settle back on a damped spring.
const STEP = 1 / 120;
const STIFFNESS = 55;
const DAMPING = 8.5;
const PUSH = 0.55; // peak displacement, as a fraction of the radius
const DRAG = 3.2;

// Sample the wordmark on a square grid; every hit becomes one instance.
function buildGeometry(cols) {
  const { width: W, height: H } = LOGO_VIEWBOX;
  const cell = W / cols;
  const rows = Math.ceil(H / cell);
  const ctx = document.createElement("canvas").getContext("2d");
  const paths = LOGO_PATHS.map((d) => new Path2D(d));

  const grid = [];
  const letters = [];
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x = (c + 0.5) * cell;
      const y = (r + 0.5) * cell;
      for (let l = 0; l < paths.length; l++) {
        if (ctx.isPointInPath(paths[l], x, y)) {
          grid.push(x / W, 1 - y / H);
          letters.push(l);
          break;
        }
      }
    }
  }

  const count = letters.length;
  const rand = new Float32Array(count * 4);
  for (let i = 0; i < rand.length; i++) rand[i] = Math.random();

  // Per-pixel stiffness variation makes the ripple feel organic.
  const stiff = new Float32Array(count);
  for (let i = 0; i < count; i++) stiff[i] = STIFFNESS * (0.7 + 0.6 * rand[i * 4 + 1]);

  const offset = new THREE.InstancedBufferAttribute(new Float32Array(count * 2), 2);
  offset.setUsage(THREE.DynamicDrawUsage);

  const base = new THREE.PlaneGeometry(1, 1);
  const geo = new THREE.InstancedBufferGeometry();
  geo.index = base.index;
  geo.setAttribute("position", base.getAttribute("position"));
  geo.setAttribute("uv", base.getAttribute("uv"));
  geo.setAttribute("aGrid", new THREE.InstancedBufferAttribute(new Float32Array(grid), 2));
  geo.setAttribute("aRand", new THREE.InstancedBufferAttribute(rand, 4));
  geo.setAttribute("aLetter", new THREE.InstancedBufferAttribute(new Float32Array(letters), 1));
  geo.setAttribute("aOffset", offset);
  geo.instanceCount = count;
  geo.userData = { count, grid: new Float32Array(grid), stiff, vel: new Float32Array(count * 2), offset };
  return geo;
}

function simulate(sim, h, W, H, mx, my, R, strength, mvx, mvy) {
  const { count, grid, stiff, vel } = sim;
  const off = sim.offset.array;
  const decay = Math.exp(-DAMPING * h);
  const R2 = R * R;
  const push = STIFFNESS * R * PUSH * strength;
  const drag = DRAG * strength;
  let energy = 0;

  for (let i = 0; i < count; i++) {
    const i2 = i * 2;
    let ox = off[i2];
    let oy = off[i2 + 1];
    let vx = vel[i2];
    let vy = vel[i2 + 1];
    const k = stiff[i];
    let ax = -k * ox;
    let ay = -k * oy;

    if (strength > 0.001) {
      const dx = (grid[i2] - 0.5) * W + ox - mx;
      const dy = (grid[i2 + 1] - 0.5) * H + oy - my;
      if (dx > -R && dx < R && dy > -R && dy < R) {
        const d2 = dx * dx + dy * dy;
        if (d2 < R2) {
          const d = Math.sqrt(d2) + 1e-4;
          const f = 1 - d / R;
          const ff = f * f * (3 - 2 * f); // smoothstep falloff, no hard edge
          ax += (dx / d) * ff * push + mvx * ff * drag;
          ay += (dy / d) * ff * push + mvy * ff * drag;
        }
      }
    }

    vx = (vx + ax * h) * decay;
    vy = (vy + ay * h) * decay;
    ox += vx * h;
    oy += vy * h;
    off[i2] = ox;
    off[i2 + 1] = oy;
    vel[i2] = vx;
    vel[i2 + 1] = vy;
    energy = Math.max(energy, Math.abs(ox) + Math.abs(oy) + (Math.abs(vx) + Math.abs(vy)) * 0.02);
  }
  return energy;
}

export default function PixelLogo({ target, mode = "hero", color = "#f5f5f5" }) {
  const size = useThree((s) => s.size);
  const mesh = useRef(null);
  const el = useRef(null);
  const [cols, setCols] = useState(0);
  const anim = useRef({ strength: 0, intro: 0, acc: 0, awake: false, plx: 0, ply: 0, had: false, mvx: 0, mvy: 0 });

  useEffect(() => {
    el.current = document.querySelector(target);
    if (!el.current) return;
    const measure = () => {
      const w = el.current.getBoundingClientRect().width;
      setCols(Math.round(clamp(w / 7, 90, 210)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el.current);
    return () => ro.disconnect();
  }, [target]);

  const geometry = useMemo(() => (cols ? buildGeometry(cols) : null), [cols]);
  useEffect(() => () => geometry?.dispose(), [geometry]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vert,
        fragmentShader: frag,
        uniforms: {
          uTime: { value: 0 },
          uIntro: { value: 0 },
          uScatter: { value: 0 },
          uRadius: { value: 160 },
          uSize: { value: new THREE.Vector2(1, RATIO) },
          uViewport: { value: new THREE.Vector2(1, 1) },
          uCell: { value: 8 },
          uColor: { value: new THREE.Vector3(...hexToRgb(color)) },
          uOpacity: { value: 1 },
        },
        transparent: true,
        depthWrite: false,
        depthTest: false,
      }),
    [color]
  );
  useEffect(() => () => material.dispose(), [material]);

  useFrame((st, dt) => {
    if (!mesh.current || !el.current || !geometry) return;
    const r = el.current.getBoundingClientRect();
    const a = anim.current;
    const u = material.uniforms;

    const near = r.bottom > -size.height * 0.6 && r.top < size.height * 1.6;
    mesh.current.visible = near;
    if (!near) return;

    const cx = r.left + r.width / 2;
    const cy = r.top + r.height / 2;
    mesh.current.position.set(cx - size.width / 2, -(cy - size.height / 2), 0);

    const W = r.width;
    const H = r.width * RATIO;
    const R = clamp(r.width * 0.11, 80, 190);
    u.uTime.value = st.clock.elapsedTime;
    u.uSize.value.set(W, H);
    u.uCell.value = W / cols;
    u.uViewport.value.set(size.width, size.height);
    u.uRadius.value = R;

    if (mode === "hero") {
      u.uIntro.value = state.heroIntro;
      u.uScatter.value = clamp(state.scroll / (size.height * 0.85), 0, 1);
    } else {
      // Fully assembled by the time the whole mark is on screen.
      const goal = clamp((size.height - r.top) / (r.height * 1.05), 0, 1);
      a.intro = damp(a.intro, goal, 3, dt);
      u.uIntro.value = a.intro;
      u.uScatter.value = 0;
    }

    // Cursor in logo-local pixels (y up), plus a smoothed velocity.
    const m = state.mouse;
    const inside = m.x > r.left - R && m.x < r.right + R && m.y > r.top - R && m.y < r.bottom + R;
    const lx = m.x - cx;
    const ly = -(m.y - cy);
    const safeDt = Math.max(dt, 1 / 240);
    const rawVx = a.had && inside ? clamp((lx - a.plx) / safeDt, -2500, 2500) : 0;
    const rawVy = a.had && inside ? clamp((ly - a.ply) / safeDt, -2500, 2500) : 0;
    a.mvx = damp(a.mvx, rawVx, 14, dt);
    a.mvy = damp(a.mvy, rawVy, 14, dt);
    a.plx = lx;
    a.ply = ly;
    a.had = inside;
    a.strength = damp(a.strength, inside && state.heroIntro > 0.9 ? 1 : 0, 6, dt);

    if (inside) a.awake = true;
    if (!a.awake) return;

    // Fixed sub-steps keep the springs stable at any frame rate.
    a.acc = Math.min(a.acc + dt, STEP * 6);
    let energy = 0;
    while (a.acc >= STEP) {
      energy = simulate(geometry.userData, STEP, W, H, lx, ly, R, a.strength, a.mvx, a.mvy);
      a.acc -= STEP;
    }
    geometry.userData.offset.needsUpdate = true;

    // Go to sleep once everything has settled and the cursor has left.
    if (!inside && a.strength < 0.01 && energy < 0.05) {
      geometry.userData.offset.array.fill(0);
      geometry.userData.vel.fill(0);
      a.awake = false;
    }
  });

  if (!geometry) return null;
  return <mesh ref={mesh} geometry={geometry} material={material} frustumCulled={false} renderOrder={2} />;
}

// Shared per-frame state. Plain mutable object so the WebGL loop can read it
// without going through React renders.
export const state = {
  scroll: 0,
  velocity: 0,
  mouse: { x: -9999, y: -9999, px: -9999, py: -9999, speed: 0, active: false },
  intro: false,
  heroIntro: 0,
  glReady: false,
  preview: { show: 0, index: 0 },
};

export const THEMES = {
  blue: { bg: "#0000ff", accent: "#3b3bff" },
  dark: { bg: "#0f0f10", accent: "#0000ff" },
  light: { bg: "#ececec", accent: "#0000ff" },
};

export function hexToRgb(hex) {
  const v = parseInt(hex.replace("#", ""), 16);
  return [((v >> 16) & 255) / 255, ((v >> 8) & 255) / 255, (v & 255) / 255];
}

export function setPreview(show, index) {
  state.preview.show = show;
  if (index !== undefined) state.preview.index = index;
}

export const lerp = (a, b, t) => a + (b - a) * t;
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
// Frame-rate independent smoothing.
export const damp = (a, b, lambda, dt) => lerp(a, b, 1 - Math.exp(-lambda * dt));

// Tiny pub/sub for one-off app events (intro start, contact modal, etc).
const listeners = new Map();
export function on(evt, fn) {
  if (!listeners.has(evt)) listeners.set(evt, new Set());
  listeners.get(evt).add(fn);
  return () => listeners.get(evt).delete(fn);
}
export function emit(evt, payload) {
  listeners.get(evt)?.forEach((fn) => fn(payload));
}

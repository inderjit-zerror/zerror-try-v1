// "Why we exist". Error resolves into order as the section is read:
// slipping bands, flickering pixels and split channels settle into a precise
// grid while a pixel zero assembles. The cursor stirs the error back up.
uniform float uTime;
uniform vec2 uSize;
uniform vec2 uMouse;
uniform float uHover;
uniform float uProgress;
uniform float uEnter;
uniform vec3 uOff;
uniform vec3 uRed;
uniform vec3 uInk;

varying vec2 vUv;

#pragma glslify: hash21 = require('./lib/hash.glsl')

const float CELL = 22.0;

// Straight-alpha "over".
vec4 over(vec4 dst, vec3 c, float a) {
  float outA = a + dst.a * (1.0 - a);
  vec3 rgb = (c * a + dst.rgb * dst.a * (1.0 - a)) / max(outA, 1e-4);
  return vec4(rgb, outA);
}

// Is there a lit glitch cell at px, for entropy e?
float glitch(vec2 px, float e, float tq) {
  vec2 cell = floor(px / CELL);
  vec2 local = fract(px / CELL);
  float on = step(1.0 - e * 0.13, hash21(cell + tq * 0.37));
  float gap = 2.0 / CELL;
  return on * step(gap, local.x) * step(gap, local.y);
}

void main() {
  // CSS pixels, y down, so the grid lines up with the page grid.
  vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uSize;
  vec2 mp = vec2(uMouse.x, 1.0 - uMouse.y) * uSize;
  float tq = floor(uTime * 9.0);

  float order = smoothstep(0.1, 0.7, uProgress);
  float stir = (1.0 - smoothstep(40.0, 240.0, length(px - mp))) * uHover;
  float e = clamp(max(1.0 - order, stir * 0.9), 0.0, 1.0);

  vec4 o = vec4(uOff, 0.0);

  // Order: a hairline grid every four cells, crosshairs on its intersections.
  vec2 g = abs(fract(px / (CELL * 4.0) + 0.5) - 0.5) * CELL * 4.0;
  float line = 1.0 - smoothstep(0.0, 1.0, min(g.x, g.y));
  float mark = step(max(g.x, g.y), 7.0) * line;
  o = over(o, uOff, max(line * 0.12, mark * 0.7) * order);

  // A zero assembles from cells, each joining at its own moment.
  vec2 cell = floor(px / CELL);
  vec2 rel = cell - floor(uSize * 0.5 / CELL) + 0.5;
  float hx = max(4.0, floor(uSize.y / CELL * 0.2));
  vec2 dq = abs(rel) - vec2(hx, floor(hx * 1.45)) + 3.0;
  float d = length(max(dq, 0.0)) + min(max(dq.x, dq.y), 0.0) - 3.0;
  float ring = step(-2.0, d) * step(d, 0.0);
  float joined = step(hash21(cell + 31.0) * 0.6 + 0.3, order);
  vec2 local = fract(px / CELL);
  float sq = step(0.18, local.x) * step(local.x, 0.82) * step(0.18, local.y) * step(local.y, 0.82);
  o = over(o, uOff, ring * joined * sq * 0.24);

  // Error: bands of rows slip sideways and the channels split.
  float band = floor(px.y / (CELL * 2.0));
  float slipOn = step(1.0 - e * 0.55, hash21(vec2(band, tq + 3.1)));
  vec2 q = px + vec2((hash21(vec2(band, tq)) - 0.5) * 220.0 * e * slipOn, 0.0);
  float s = 4.0 + e * 10.0;
  o = over(o, uInk, step(0.5, fract(px.y / 3.0)) * 0.06 * e);
  o = over(o, uInk, glitch(q - vec2(s, 0.0), e, tq) * 0.25);
  o = over(o, uRed, glitch(q + vec2(s, 0.0), e, tq) * 0.7);
  o = over(o, uOff, glitch(q, e, tq) * 0.55);

  gl_FragColor = vec4(o.rgb, o.a * uEnter);
}

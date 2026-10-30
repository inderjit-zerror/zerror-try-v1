// Brand elements: pixel modules on a 5x5 unit, as on the brand elements
// sheet. Every module keeps re-forming into a new cluster, cell by cell.
// Under the cursor the cells scramble, which is the system breaking.
//   uVariant 0  chip    an electric-blue pill carrying off-white modules
//   uVariant 1  tile    blue modules on a faint dot grid
//   uVariant 2  banner  wider spread, more empty modules, red accents
uniform float uTime;
uniform vec2 uSize;
uniform vec2 uMouse;
uniform float uHover;
uniform float uEnter;
uniform float uVariant;
uniform float uSeed;
uniform vec3 uBlue;
uniform vec3 uRed;
uniform vec3 uOff;
uniform vec3 uInk;

varying vec2 vUv;

#pragma glslify: hash21 = require('./lib/hash.glsl')

// Is cell c (0..4 inside a module) lit for pattern seed? Dense in the
// middle, sparse at the rim, so every pattern reads as one cluster.
float pattern(vec2 c, float seed) {
  vec2 d = abs(c - 2.0);
  float r = max(d.x, d.y);
  float p = r < 0.5 ? 0.92 : (r < 1.5 ? 0.6 : 0.24);
  return step(hash21(c + seed * 13.17), p);
}

void main() {
  // CSS pixels, y down.
  vec2 px = vec2(vUv.x, 1.0 - vUv.y) * uSize;
  vec2 mp = vec2(uMouse.x, 1.0 - uMouse.y) * uSize;
  bool chip = uVariant < 0.5;
  float t = uTime;

  // Chips fit one row of modules with a cell of air above and below.
  float C = chip ? floor(uSize.y / 7.0) : (uVariant > 1.5 ? 12.0 : 9.0);
  vec2 span = floor(uSize / C);
  vec2 modules = floor((span + 1.0) / 6.0);
  vec2 origin = floor((uSize - (modules * 6.0 - 1.0) * C) * 0.5);
  vec2 q = (px - origin) / C;
  vec2 cell = floor(q);
  vec2 local = mod(cell, 6.0);
  vec2 module = floor(cell / 6.0);
  float inModule = step(local.x, 4.5) * step(local.y, 4.5)
    * step(0.0, q.x) * step(0.0, q.y) * step(module.x, modules.x - 0.5) * step(module.y, modules.y - 0.5);

  // Each module re-forms on its own clock; its cells follow with a stagger.
  float hm = hash21(module + uSeed * 7.1);
  float hc = hash21(cell + uSeed * 3.3);
  float epoch = floor(t * 0.42 + hm * 10.0 + hc * 0.3);
  float near = (1.0 - smoothstep(0.0, chip ? 120.0 : 200.0, length(px - mp))) * uHover;
  float scramble = step(hc * 0.9 + 0.1, near) * floor(t * 11.0);
  float seed = hm * 91.0 + epoch + scramble * 7.31;
  float lit = pattern(local, seed) * inModule;

  // Banners leave some modules empty so the field breathes.
  if (uVariant > 1.5) lit *= step(0.38, hash21(module + uSeed));

  // Square pixels with a hairline gutter.
  vec2 f = fract(q) * C;
  float sq = step(1.0, f.x) * step(1.0, f.y);
  float show = step(hash21(cell + 5.0) * 0.8, uEnter * 1.25 - 0.2);

  vec3 col;
  float a;
  float redModule = step(uVariant > 1.5 ? 0.9 : 0.93, hash21(module + epoch + uSeed * 2.0));

  if (chip) {
    // The pill grows out from its middle as it enters.
    vec2 c = uSize * 0.5;
    float r = uSize.y * 0.5;
    float e = 1.0 - pow(1.0 - clamp(uEnter * 1.3, 0.0, 1.0), 3.0);
    vec2 hs = vec2(mix(r, c.x, e), r);
    vec2 dq = abs(px - c) - (hs - r);
    float d = length(max(dq, 0.0)) + min(max(dq.x, dq.y), 0.0) - r;
    float pill = 1.0 - smoothstep(-0.6, 0.6, d);
    col = mix(uBlue, mix(uOff, uRed, redModule * (1.0 - near)), lit * sq * show);
    a = pill;
  } else {
    // Unlit cells keep a faint dot so the grid itself stays visible.
    float dotA = (1.0 - step(1.5, max(abs(f.x - C * 0.5), abs(f.y - C * 0.5)))) * 0.18;
    vec3 on = mix(uBlue, uRed, redModule);
    col = mix(uInk, on, lit);
    a = max(lit * sq, dotA * inModule) * show;
    // Cells under the cursor flash off-white for a frame.
    col = mix(col, uOff, step(0.94, hash21(cell + floor(t * 11.0))) * step(0.3, near) * lit);
  }

  gl_FragColor = vec4(col, a);
}

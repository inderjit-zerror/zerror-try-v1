// Page surfaces. Every [data-theme] section paints its colour here, and the
// seams between sections break into pixels that scatter with scroll speed.
// Blue fields carry a slow silk sheen; dark fields a faint dot grid.
#define MAX_SECTIONS 16

uniform vec2 uResolution;
uniform float uDpr;
uniform float uScroll;
uniform float uTime;
uniform float uCell;
uniform float uBand;
uniform float uTops[MAX_SECTIONS];
uniform vec3 uColors[MAX_SECTIONS];
uniform vec3 uAccents[MAX_SECTIONS];
uniform float uKinds[MAX_SECTIONS];
uniform int uCount;
uniform sampler2D uTrail;

varying vec2 vUv;

#pragma glslify: hash21 = require('./lib/hash.glsl')
#pragma glslify: snoise = require('./lib/simplex3d.glsl')

void main() {
  // CSS pixels, origin top-left.
  vec2 px = vec2(gl_FragCoord.x, uResolution.y * uDpr - gl_FragCoord.y) / uDpr;

  // The grid is anchored to the document so cells travel with the content.
  vec2 g = vec2(px.x, px.y + uScroll);
  vec2 cell = floor(g / uCell);
  float r = hash21(cell);
  vec2 centre = (cell + 0.5) * uCell - vec2(0.0, uScroll);

  float y = centre.y + (r - 0.5) * uBand;
  vec3 col = uColors[0];
  vec3 acc = uAccents[0];
  float kind = uKinds[0];
  for (int i = 1; i < MAX_SECTIONS; i++) {
    if (i >= uCount) break;
    if (y >= uTops[i]) {
      col = uColors[i];
      acc = uAccents[i];
      kind = uKinds[i];
    }
  }

  if (kind < 0.5) {
    // Blue: a slow sheen of lighter and deeper blue drifting through.
    float n = snoise(vec3(g * 0.0011, uTime * 0.05));
    col = mix(col, acc, max(n, 0.0) * 0.35);
    col *= 1.0 - max(-n, 0.0) * 0.14;
  } else if (kind < 1.5) {
    // Dark: one faint square dot at the centre of every cell.
    vec2 f = abs(fract(g / uCell) - 0.5) * uCell;
    col += (1.0 - step(0.8, max(f.x, f.y))) * 0.04;
  }

  // Cursor trail lights up whole cells, dithered so it reads as pixels.
  vec2 tuv = vec2(centre.x / uResolution.x, 1.0 - centre.y / uResolution.y);
  float t = texture2D(uTrail, tuv).r;
  // Each cell fades rather than popping, with staggered thresholds.
  float threshold = 0.05 + hash21(cell + 17.0) * 0.55;
  float lit = smoothstep(threshold, threshold + 0.3, t);
  col = mix(col, acc, lit * 0.85);

  // Film grain keeps big flat fields from banding.
  float grain = hash21(px + fract(uTime * 7.0) * 100.0) - 0.5;
  col += grain * 0.022;

  gl_FragColor = vec4(col, 1.0);
}

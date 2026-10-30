// Client logos printed as a halftone of ink dots. A shimmer runs diagonally
// across the whole wall; on hover the cell floods blue from the cursor and
// the logo snaps crisp in off-white.
uniform sampler2D uTexture;
uniform vec2 uImageSize;
uniform float uLoaded;
uniform vec2 uSize;
uniform vec2 uMouse;
uniform float uHover;
uniform float uEnter;
uniform float uTime;
uniform vec2 uScreen;
uniform vec3 uInk;
uniform vec3 uBlue;
uniform vec3 uOff;

varying vec2 vUv;

#pragma glslify: hash21 = require('./lib/hash.glsl')
#pragma glslify: snoise = require('./lib/simplex3d.glsl')

const float DOT = 4.0;

float inside01(vec2 p) {
  return step(0.0, p.x) * step(p.x, 1.0) * step(0.0, p.y) * step(p.y, 1.0);
}

void main() {
  vec2 px = vUv * uSize;
  vec2 centre = uSize * 0.5;

  // Fit the logo into a box in the middle of the cell.
  vec2 box = uSize * vec2(0.6, 0.3);
  float ri = uImageSize.x / uImageSize.y;
  vec2 fit = box.x / box.y > ri ? vec2(box.y * ri, box.y) : vec2(box.x, box.x / ri);

  // Halftone samples the logo once per dot cell; the crisp version per pixel.
  vec2 dc = floor((px - centre) / DOT);
  vec2 dcPx = (dc + 0.5) * DOT + centre;
  vec2 luvDot = (dcPx - centre) / fit + 0.5;
  vec2 luv = (px - centre) / fit + 0.5;
  float aDot = texture2D(uTexture, clamp(luvDot, 0.0, 1.0)).a * inside01(luvDot) * uLoaded;
  float aPix = texture2D(uTexture, clamp(luv, 0.0, 1.0)).a * inside01(luv) * uLoaded;

  // Shimmer in screen space, so it sweeps across every cell in turn.
  vec2 screen = uScreen + vec2(px.x, uSize.y - px.y);
  float diag = fract((screen.x + screen.y) * 0.0009 - uTime * 0.12);
  float band = 1.0 - smoothstep(0.0, 0.07, abs(diag - 0.5));

  // Dots grow in as the wall arrives.
  float grow = clamp(uEnter * 1.6 - hash21(dc + 3.0) * 0.6, 0.0, 1.0);
  float r = sqrt(aDot) * DOT * 0.55 * (0.85 + band * 0.4) * grow;
  float dotMask = 1.0 - smoothstep(r - 0.6, r + 0.6, length(px - dcPx));
  vec3 col = mix(uInk, uBlue, band);
  float a = dotMask * 0.9;

  // Hover: blue floods out from the cursor with a liquid edge.
  float aspect = uSize.x / uSize.y;
  float dist = length((vUv - uMouse) * vec2(aspect, 1.0));
  float wob = snoise(vec3(vUv * 4.0, uTime * 0.8)) * 0.05;
  float R = uHover * (aspect + 1.2);
  float flood = (1.0 - smoothstep(R - 0.015, R + 0.015, dist + wob)) * step(0.001, uHover);
  col = mix(col, mix(uBlue, uOff, aPix), flood);
  a = mix(a, 1.0, flood);

  gl_FragColor = vec4(col, a);
}

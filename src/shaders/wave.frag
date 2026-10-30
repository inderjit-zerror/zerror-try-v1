// Contact. A slow flow field printed as ordered-dither pixels in the brand
// tones: deep blue, electric blue, off-white and the odd red signal. It
// rises out of the bottom as the section scrolls in, and gathers into a
// bright lens under the cursor.
uniform float uTime;
uniform vec2 uSize;
uniform vec2 uMouse;
uniform float uHover;
uniform float uEnter;
uniform float uProgress;
uniform float uVelocity;
uniform vec3 uBlue;
uniform vec3 uRed;
uniform vec3 uOff;
uniform vec3 uInk;

varying vec2 vUv;

#pragma glslify: hash21 = require('./lib/hash.glsl')
#pragma glslify: snoise = require('./lib/simplex3d.glsl')
#pragma glslify: bayer4 = require('./lib/bayer.glsl')

const float CELL = 6.0;

void main() {
  vec2 px = vUv * uSize;
  vec2 cell = floor(px / CELL);
  vec2 centre = (cell + 0.5) * CELL;
  vec2 p = centre / uSize.y;
  float t = uTime;

  // Banded flow: contours of a warped noise field drifting upward.
  vec2 w = p + 0.25 * vec2(snoise(vec3(p * 1.3, t * 0.06)), snoise(vec3(p * 1.3 + 9.1, t * 0.06)));
  float n = snoise(vec3(w * 1.6 - vec2(0.0, t * 0.05), t * 0.08));
  float bands = 0.5 + 0.5 * sin((w.y * 2.4 + n * 1.6 - t * 0.12) * 6.2831);
  float lum = mix(n * 0.5 + 0.5, bands, 0.55);

  // The field rises from the bottom edge as the section arrives.
  float v = vUv.y;
  float rise = mix(0.2, 1.25, clamp(uProgress * 1.7, 0.0, 1.0));
  lum *= 1.0 - smoothstep(rise - 0.65, rise, v);
  lum *= smoothstep(0.0, 0.12, v);

  // Lens under the cursor, stretched a little by scroll speed.
  vec2 m = uMouse * uSize;
  vec2 dm = (centre - m) / uSize.y;
  dm.y *= 1.0 + clamp(abs(uVelocity) * 0.002, 0.0, 0.8);
  float lens = exp(-dot(dm, dm) * 26.0) * uHover;
  lum += lens * 0.75;

  // Four dithered tones.
  float th = bayer4(cell);
  float level = lum * 3.2 + (th - 0.5) * 0.9;
  vec3 col = uBlue;
  float a = 0.0;
  vec2 f = fract(px / CELL) * CELL;
  if (level > 0.9) {
    col = mix(uBlue, uInk, 0.55);
    a = 1.0;
  }
  if (level > 1.7) {
    col = uBlue * 1.0 + uOff * 0.12;
    a = 1.0;
  }
  if (level > 2.45) {
    // Highlights print as smaller off-white squares, like a halftone.
    float s = level > 2.9 ? 0.0 : 1.5;
    float on = step(s, f.x) * step(f.x, CELL - s) * step(s, f.y) * step(f.y, CELL - s);
    col = mix(col, uOff, on);
  }
  // A rare red signal pixel riding the brightest bands.
  float spark = step(0.996, hash21(cell + floor(t * 3.0))) * step(2.2, level);
  col = mix(col, uRed, spark);

  // Arrives as a pixel dissolve.
  a *= step(hash21(cell * 0.5 + 3.0), uEnter * 1.2);
  gl_FragColor = vec4(col, a);
}

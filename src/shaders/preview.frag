// Procedural previews for the four services, all built from square pixels.
uniform float uTime;
uniform float uShow;
uniform float uFrom;
uniform float uTo;
uniform float uMix;
uniform vec2 uSize;
uniform vec3 uBlue;
uniform vec3 uRed;
uniform vec3 uInk;
uniform vec3 uOff;

varying vec2 vUv;

#pragma glslify: hash21 = require('./lib/hash.glsl')
#pragma glslify: snoise = require('./lib/simplex3d.glsl')

// 01 Websites: page layouts scrolling past.
vec3 websites(vec2 uv, float t) {
  vec3 col = uOff;
  float y = uv.y * 6.0 - t * 0.5;
  float row = floor(y);
  float fy = fract(y);
  float kind = hash21(vec2(row, 3.0));
  float w = 0.35 + hash21(vec2(row, 9.0)) * 0.5;
  float inner = step(0.12, fy) * step(fy, 0.88);
  if (kind < 0.3) {
    col = mix(col, uBlue, step(0.08, uv.x) * step(uv.x, 0.92) * inner);
  } else if (kind < 0.7) {
    float lines = step(0.5, fract(fy * 4.0)) * inner * step(0.08, uv.x) * step(uv.x, 0.08 + w);
    col = mix(col, uInk, lines);
  } else {
    float cx = fract(uv.x * 3.0);
    float card = step(0.1, cx) * step(cx, 0.9) * inner;
    float red = step(0.75, hash21(vec2(row, floor(uv.x * 3.0))));
    col = mix(col, mix(uInk, uRed, red), card);
  }
  return col;
}

// 02 Software: a living data grid.
vec3 software(vec2 uv, vec2 cell, float t) {
  float r = hash21(cell);
  float wave = sin(t * 2.2 + cell.x * 0.35 - cell.y * 0.22 + r * 6.2831);
  vec3 col = uInk;
  col = mix(col, uBlue, step(0.55, wave));
  col = mix(col, uOff, step(0.93, wave) * step(0.6, r));
  float scan = step(abs(fract(uv.y + t * 0.12) - 0.5), 0.02);
  col = mix(col, uRed, scan * step(0.55, r));
  return col;
}

// 03 eCommerce: orbits of product tiles around a checkout core.
vec3 commerce(vec2 uv, float t) {
  vec2 p = (uv - 0.5) * vec2(uSize.x / uSize.y, 1.0);
  float d = length(p);
  float a = atan(p.y, p.x);
  float ring = floor(d * 9.0);
  float dir = mod(ring, 2.0) * 2.0 - 1.0;
  float seg = fract((a / 6.2831) * (6.0 + ring * 2.0) + t * dir * (0.25 + ring * 0.04));
  float on = step(0.35, seg) * step(fract(d * 9.0), 0.6) * step(0.1, d) * step(d, 0.62);
  vec3 col = uBlue;
  col = mix(col, uOff, on);
  col = mix(col, uRed, step(d, 0.08));
  return col;
}

// 04 Branding: morphing pixel clusters, like the brand element sheet.
vec3 branding(vec2 cell, float t) {
  float n = snoise(vec3(cell * 0.08, t * 0.25));
  float n2 = snoise(vec3(cell * 0.05 + 10.0, t * 0.2));
  vec3 col = uOff;
  col = mix(col, uBlue, step(0.2, n));
  col = mix(col, uRed, step(0.5, n2) * step(n, 0.2));
  return col;
}

vec3 pattern(float idx, vec2 uv, vec2 cell, float t) {
  if (idx < 0.5) return websites(uv, t);
  if (idx < 1.5) return software(uv, cell, t);
  if (idx < 2.5) return commerce(uv, t);
  return branding(cell, t);
}

void main() {
  float cellPx = 10.0;
  vec2 grid = floor(uSize / cellPx);
  vec2 cell = floor(vUv * grid);
  vec2 uv = (cell + 0.5) / grid;

  // Appear and disappear as a pixel dissolve.
  if (hash21(cell + 5.0) > uShow) discard;

  vec3 a = pattern(uFrom, uv, cell, uTime);
  vec3 b = pattern(uTo, uv, cell, uTime);
  float m = step(hash21(cell + 11.0), uMix);
  gl_FragColor = vec4(mix(a, b, m), 1.0);
}

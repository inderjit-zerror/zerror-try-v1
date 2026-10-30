// The four studio values as living pixel tiles. Dim at rest; under the
// cursor they speed up (uClock runs faster) and light outward from it.
uniform float uClock;
uniform float uIndex;
uniform vec2 uSize;
uniform vec2 uMouse;
uniform float uHover;
uniform float uEnter;
uniform vec3 uBlue;
uniform vec3 uRed;
uniform vec3 uOff;
uniform vec3 uCard;

varying vec2 vUv;

#pragma glslify: hash21 = require('./lib/hash.glsl')
#pragma glslify: snoise = require('./lib/simplex3d.glsl')

const float CELL = 9.0;

// Every pattern returns a colour code:
// 0 empty, 1 blue, 2 red, 3 off-white, 4 dim blue.

// Creativity: warped colour fields that never settle.
float creativity(vec2 uv, vec2 cell, float t) {
  vec2 w = uv * 1.6;
  w += 0.35 * vec2(snoise(vec3(w, t * 0.15)), snoise(vec3(w + 7.3, t * 0.15)));
  float n = snoise(vec3(w * 1.3, t * 0.22));
  if (n > 0.6) return 2.0;
  if (n > 0.16) return 1.0;
  if (n < -0.55 && hash21(cell) > 0.5) return 3.0;
  return 0.0;
}

// Efficiency: bars sort themselves, then scatter into the next shuffle.
float efficiency(vec2 cell, vec2 grid, float t) {
  float row = cell.y;
  if (mod(row, 2.0) > 0.5) return 0.0;
  float rows = floor(grid.y / 2.0);
  float bar = floor(row / 2.0);
  float cycle = floor(t / 4.0);
  float ph = fract(t / 4.0);
  float k = ph < 0.5 ? smoothstep(0.05, 0.45, ph) : 1.0 - smoothstep(0.6, 1.0, ph);
  float shuffled = hash21(vec2(bar, ph < 0.5 ? cycle : cycle + 1.0));
  k = clamp(k * 1.5 - hash21(vec2(bar, 3.0)) * 0.5, 0.0, 1.0);
  float len = mix(shuffled, (bar + 1.0) / rows, k) * 0.86 + 0.06;
  float x = (cell.x + 0.5) / grid.x;
  if (x > len) return 0.0;
  bool moving = k > 0.02 && k < 0.98;
  return moving && x > len - 1.5 / grid.x ? 2.0 : 1.0;
}

// Entertainment: an equaliser on the beat.
float entertainment(vec2 cell, vec2 grid, float t) {
  if (mod(cell.x, 2.0) > 0.5) return 0.0;
  float beat = pow(0.5 + 0.5 * sin(t * 3.2), 6.0);
  float h = 0.16 + 0.55 * abs(snoise(vec3(cell.x * 0.23, t * 0.9, 0.0))) + beat * 0.25 * hash21(vec2(cell.x, 1.0));
  h = clamp(h, 0.05, 0.92);
  float y = (cell.y + 0.5) / grid.y;
  float step1 = 1.0 / grid.y;
  if (y < h) return y > h - step1 ? 3.0 : 1.0;
  if (abs(y - (h + 0.07)) < step1 * 0.5) return 2.0;
  return 0.0;
}

// Empathy: two forms drift together and beat as one.
float empathy(vec2 uv, float aspect, float t) {
  vec2 p = (uv - 0.5) * vec2(aspect, 1.0);
  float s = 0.5 + 0.5 * sin(t * 0.8);
  float sep = mix(0.3, 0.0, smoothstep(0.1, 0.9, s));
  float r = 0.16 * (1.0 + 0.07 * pow(0.5 + 0.5 * sin(t * 5.0), 8.0));
  float d1 = length(p - vec2(-sep, 0.0)) - r;
  float d2 = length(p - vec2(sep, 0.0)) - r;
  float k = 0.12;
  float h = clamp(0.5 + 0.5 * (d2 - d1) / k, 0.0, 1.0);
  float d = mix(d2, d1, h) - k * h * (1.0 - h);
  if (d < -0.07) return 3.0;
  if (d < 0.0) return 1.0;
  if (d < 0.5 && abs(fract(d * 7.0 - t * 0.6) - 0.5) < 0.07) return 4.0;
  return 0.0;
}

void main() {
  vec2 grid = max(floor(uSize / CELL), vec2(1.0));
  vec2 cell = floor(vUv * grid);
  vec2 uv = (cell + 0.5) / grid;
  float aspect = uSize.x / uSize.y;
  float t = uClock;

  float code;
  if (uIndex < 0.5) code = creativity(uv, cell, t);
  else if (uIndex < 1.5) code = efficiency(cell, grid, t);
  else if (uIndex < 2.5) code = entertainment(cell, grid, t);
  else code = empathy(uv, aspect, t);

  // Cells switch on in a random order as the tile arrives.
  if (hash21(cell + uIndex * 13.0) > uEnter * 1.25 - 0.15) code = 0.0;

  // Brighter under the cursor.
  float near = 1.0 - smoothstep(0.0, 0.75, length((uv - uMouse) * vec2(aspect, 1.0)));
  float strength = mix(0.3, 1.0, uHover * (0.45 + 0.55 * near));

  // Square pixels with a hairline gap.
  vec2 local = fract(vUv * grid);
  float gap = 1.5 / CELL;
  float mask = step(gap, local.x) * step(gap, local.y);

  vec3 pc = code > 3.5 ? uBlue : (code > 2.5 ? uOff : (code > 1.5 ? uRed : uBlue));
  float pa = code > 3.5 ? 0.4 : 1.0;
  vec3 col = uCard;
  if (code > 0.5) col = mix(uCard, pc, pa * strength * mask);
  else col = mix(uCard, uOff, 0.03 * mask);

  gl_FragColor = vec4(col, smoothstep(0.0, 0.25, uEnter));
}

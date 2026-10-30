// Studio visual. Metaballs lit like a soft 3D mass, then printed as dithered
// electric-blue pixels. The dot grid around it bends toward the mass, pixels
// evaporate off its surface, and one ball follows the cursor.
uniform float uTime;
uniform vec2 uSize;
uniform vec2 uMouse;
uniform float uHover;
uniform float uEnter;
uniform float uProgress;
uniform vec3 uBlue;
uniform vec3 uRed;
uniform vec3 uOff;

varying vec2 vUv;

#pragma glslify: bayer4 = require('./lib/bayer.glsl')
#pragma glslify: hash21 = require('./lib/hash.glsl')

const float CELL = 5.0;
const float GRID = 18.0;

// Field value (x) and its gradient (yz) at p.
vec3 field(vec2 p, float t, float grow, float spread, vec2 mouse, float hover) {
  vec3 acc = vec3(0.0);
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    vec2 c = vec2(
      sin(t * (0.23 + fi * 0.041) + fi * 2.4) * 0.22 * spread,
      cos(t * (0.19 + fi * 0.037) + fi * 1.7) * 0.26
    );
    float r = (0.12 + 0.035 * sin(t * 0.7 + fi * 1.9)) * grow;
    vec2 d = p - c;
    float d2 = dot(d, d) + 1e-4;
    float k = r * r / d2;
    acc += vec3(k, -2.0 * k * d / d2);
  }
  vec2 d = p - mouse;
  float d2 = dot(d, d) + 1e-4;
  float r = 0.09 * hover * grow;
  float k = r * r / d2;
  acc += vec3(k, -2.0 * k * d / d2);
  return acc;
}

void main() {
  float aspect = uSize.x / uSize.y;
  vec2 px = vUv * uSize;
  vec2 cell = floor(px / CELL);
  vec2 cuv = (cell + 0.5) * CELL / uSize;
  vec2 p = (cuv - 0.5) * vec2(aspect, 1.0);
  vec2 m = (uMouse - 0.5) * vec2(aspect, 1.0);
  float t = uTime * 0.9 + uProgress * 5.0;
  float grow = smoothstep(0.0, 1.0, uEnter);

  vec3 F = field(p, t, grow, min(aspect, 1.3), m, uHover);
  float f = F.x;
  vec2 g = F.yz;
  float th = bayer4(cell);

  vec3 col = vec3(0.0);
  float alpha = 0.0;

  if (f > 1.0) {
    // Height is 1 - 1/f, so its slope is g / f^2.
    vec2 slope = g / (f * f);
    vec3 n = normalize(vec3(-slope * 0.055, 1.0));
    vec3 L = normalize(vec3(-0.55 + (uMouse.x - 0.5) * 0.9, 0.5 + (uMouse.y - 0.5) * 0.7, 0.75));
    float diff = max(dot(n, L), 0.0);
    float spec = pow(max(dot(reflect(-L, n), vec3(0.0, 0.0, 1.0)), 0.0), 18.0);
    float rim = pow(1.0 - n.z, 1.5);
    float lum = 0.1 + diff * 0.8 + spec * 0.9;

    // Three dithered tones: deep blue, electric blue, off-white.
    float level = lum * 2.0 + (th - 0.5) * 0.9;
    col = level < 0.75 ? uBlue * 0.3 : (level < 1.6 ? uBlue : uOff);

    // Red catches the rim on the side turned away from the light.
    if (rim * (1.0 - diff) > 0.3 + th * 0.45) col = uRed;
    alpha = 1.0;
  } else {
    // Pixels evaporating off the surface.
    float halo = smoothstep(0.5, 1.0, f);
    float flicker = hash21(cell + floor(uTime * 6.0));
    if (halo > th + 0.12 && flicker > 0.35) {
      col = uBlue;
      alpha = 1.0;
    } else {
      // Square dot grid, pulled toward the mass like a lens.
      vec2 dir = g / (length(g) + 1e-3);
      vec2 q = px - dir * smoothstep(0.06, 0.95, f) * 12.0;
      vec2 local = (fract(q / GRID) - 0.5) * GRID;
      float size = 1.0 + smoothstep(0.2, 0.9, f) * 1.5;
      float d = max(abs(local.x), abs(local.y));
      float dotA = 1.0 - smoothstep(size - 0.5, size + 0.5, d);
      col = mix(uOff, uBlue, smoothstep(0.3, 0.85, f));
      alpha = dotA * mix(0.14, 0.9, smoothstep(0.25, 0.9, f)) * smoothstep(0.0, 0.5, uEnter);
    }
  }

  // Soften the panel's edges so the grid has no hard frame.
  vec2 e = min(vUv, 1.0 - vUv);
  alpha *= smoothstep(0.0, 0.06, min(e.x, e.y));

  gl_FragColor = vec4(col, alpha);
}

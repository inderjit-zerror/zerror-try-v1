// "What we do" panel. One scene per service, swapped with a pixel dissolve
// that sweeps down the panel and glitches along its front.
//   0 Websites   pages gliding past on a tilted plane
//   1 eCommerce  product tiles orbiting a red checkout core
//   2 Software   a live dashboard
//   3 Brand      contour lines of a shifting identity field
uniform float uTime;
uniform float uFrom;
uniform float uTo;
uniform float uMix;
uniform float uHover;
uniform float uEnter;
uniform vec2 uSize;
uniform vec2 uMouse;
uniform vec3 uBlue;
uniform vec3 uRed;
uniform vec3 uInk;
uniform vec3 uOff;

varying vec2 vUv;

#pragma glslify: hash21 = require('./lib/hash.glsl')
#pragma glslify: snoise = require('./lib/simplex3d.glsl')
#pragma glslify: sdBox = require('./lib/sdf.glsl')

vec3 layer(vec3 col, float d, vec3 c, float aa) {
  return mix(col, c, 1.0 - smoothstep(-aa, aa, d));
}

float hairline(float d, float w) {
  return 1.0 - smoothstep(0.0, w, abs(d));
}

// 01 Websites: a stack of page layouts on a plane that leans away.
vec3 websites(vec2 p, float t) {
  vec2 m = uMouse - 0.5;
  vec3 rd = normalize(vec3(p, 1.25));
  float yaw = m.x * 0.35;
  float cy = cos(yaw);
  float sy = sin(yaw);
  rd.xz = vec2(cy * rd.x - sy * rd.z, sy * rd.x + cy * rd.z);

  // Plane through (0, 0, D), spanned by x and (0, cos, sin).
  float th = 1.05 + m.y * 0.2;
  float c = cos(th);
  float s = sin(th);
  float D = 1.6;
  float den = max(-s * rd.y + c * rd.z, 1e-3);
  float hit = (D * c) / den;
  vec3 H = rd * hit;
  float u = H.x;
  float v = H.y * c + (H.z - D) * s + t * 0.32;
  float aa = max(fwidth(u), fwidth(v)) * 1.2;

  float pitch = 1.35;
  float idx = floor(v / pitch);
  vec2 q = vec2(u, mod(v, pitch));
  float r = hash21(vec2(idx, 4.0));

  vec3 col = uInk;
  float page = sdBox(q, vec2(0.0, 0.62), vec2(0.6, 0.56));
  col = layer(col, page, mix(uInk, uBlue, 0.12), aa);
  col = mix(col, uBlue, hairline(page, aa * 2.0) * 0.9);

  // Nav.
  col = layer(col, sdBox(q, vec2(-0.42, 1.08), vec2(0.1, 0.018)), uOff, aa);
  for (int i = 0; i < 3; i++) {
    col = layer(col, sdBox(q, vec2(0.22 + float(i) * 0.12, 1.08), vec2(0.035, 0.012)), uOff * 0.7, aa);
  }

  // Hero, in one of two layouts.
  if (r < 0.5) {
    col = layer(col, sdBox(q, vec2(0.0, 0.84), vec2(0.52, 0.17)), uBlue, aa);
  } else {
    col = layer(col, sdBox(q, vec2(-0.24, 0.8), vec2(0.28, 0.21)), uBlue, aa);
    col = layer(col, sdBox(q, vec2(0.28, 0.92), vec2(0.2, 0.025)), uOff, aa);
    col = layer(col, sdBox(q, vec2(0.24, 0.84), vec2(0.16, 0.025)), uOff, aa);
  }

  // Headline and body copy.
  col = layer(col, sdBox(q, vec2(-0.16, 0.5), vec2(0.36, 0.035)), uOff, aa);
  col = layer(col, sdBox(q, vec2(-0.26, 0.41), vec2(0.26, 0.035)), uOff, aa);
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    float w = 0.15 + hash21(vec2(idx, fi)) * 0.2;
    col = layer(col, sdBox(q, vec2(-0.52 + w, 0.3 - fi * 0.055), vec2(w, 0.01)), uOff * 0.55, aa);
  }

  // Product cards, the odd one red.
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec3 cc = hash21(vec2(idx, fi + 9.0)) > 0.7 ? uRed : mix(uInk, uBlue, 0.45);
    col = layer(col, sdBox(q, vec2(-0.36 + fi * 0.36, 0.14), vec2(0.15, 0.06)), cc, aa);
  }

  // Distance fog, with a blue glow toward the horizon.
  col = mix(col, uInk, smoothstep(2.0, 6.0, hit));
  col += uBlue * 0.1 * smoothstep(3.0, 6.5, hit);
  return col;
}

// 02 eCommerce: three tilted orbits of products around the checkout.
vec3 commerce(vec2 p, float t) {
  vec2 m = uMouse - 0.5;
  float tilt = 0.34 + m.y * 0.2;
  p.x += m.x * 0.05;
  float aa = fwidth(p.x) * 1.2;

  vec3 col = uInk;
  float frontZ = -2.0;
  float backZ = -2.0;
  vec3 front = uInk;
  vec3 back = uInk;

  for (int ring = 0; ring < 3; ring++) {
    float fr = float(ring);
    float R = 0.17 + fr * 0.1;
    float path = abs(length(p / vec2(R, R * tilt)) - 1.0) * R * tilt;
    col = mix(col, uBlue, hairline(path, aa * 1.5) * 0.55);
    float dir = mod(fr, 2.0) * 2.0 - 1.0;
    for (int k = 0; k < 10; k++) {
      float fk = float(k);
      float a = fk / 10.0 * 6.2831 + t * (0.32 - fr * 0.06) * dir + fr * 0.7;
      float z = -sin(a);
      vec2 c = vec2(cos(a) * R, sin(a) * R * tilt);
      float size = 0.018 * (1.0 + 0.35 * z) * (1.0 + fr * 0.2);
      if (sdBox(p, c, vec2(size)) < 0.0) {
        vec3 tc = hash21(vec2(fk, fr)) > 0.82 ? uRed : (z > 0.0 ? uOff : mix(uInk, uBlue, 0.8));
        if (z > 0.0 && z > frontZ) {
          frontZ = z;
          front = tc;
        }
        if (z <= 0.0 && z > backZ) {
          backZ = z;
          back = tc;
        }
      }
    }
  }
  if (backZ > -1.5) col = back;

  // Checkout core, between the back and the front of the orbits.
  float pulse = 0.5 + 0.5 * sin(t * 3.0);
  col = layer(col, sdBox(p, vec2(0.0), vec2(0.045 + 0.006 * pulse)), uRed, aa);
  col = mix(col, uRed, hairline(sdBox(p, vec2(0.0), vec2(0.07 + pulse * 0.03)), aa * 2.0) * (1.0 - pulse) * 0.8);

  // Items dropping into the cart.
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float k = fract(t * 0.35 + fi / 6.0);
    float a = fi * 1.7 + t * 0.2;
    vec2 pos = vec2(cos(a), sin(a) * tilt) * 0.42 * (1.0 - k * k);
    col = layer(col, sdBox(p, pos, vec2(0.008 * (1.0 - k))), uOff, aa);
  }

  if (frontZ > -1.5) col = front;
  return col;
}

// 03 Software: sidebar, KPI cards, a live chart and a table.
vec3 software(vec2 uv, float t) {
  vec2 P = uv * uSize;
  float W = uSize.x;
  float H = uSize.y;
  float M = 22.0;
  float aa = 0.75;
  vec3 col = uInk;
  vec3 panel = mix(uInk, uBlue, 0.1);
  vec3 rule = mix(uInk, uOff, 0.12);

  // Sidebar, with a selection stepping down the menu.
  float sbW = W * 0.2;
  col = layer(col, sdBox(P, vec2(M + sbW * 0.5, H * 0.5), vec2(sbW * 0.5, H * 0.5 - M)), panel, aa);
  float sel = floor(mod(t * 0.6, 6.0));
  for (int i = 0; i < 6; i++) {
    float fi = float(i);
    float y = H - M - 52.0 - fi * 30.0;
    if (abs(fi - sel) < 0.5) col = layer(col, sdBox(P, vec2(M + sbW * 0.5, y), vec2(sbW * 0.5 - 8.0, 11.0)), uBlue, aa);
    float w = sbW * (0.25 + 0.3 * hash21(vec2(fi, 2.0)));
    col = layer(col, sdBox(P, vec2(M + 16.0 + w * 0.5, y), vec2(w * 0.5, 3.0)), uOff * 0.8, aa);
  }

  float x0 = M * 2.0 + sbW;
  float x1 = W - M;
  float cw = x1 - x0;
  float inC = step(x0, P.x) * step(P.x, x1);

  // KPI cards with sparklines.
  float kTop = H - M;
  float kH = H * 0.16;
  float kw = (cw - 24.0) / 3.0;
  for (int i = 0; i < 3; i++) {
    float fi = float(i);
    vec2 c = vec2(x0 + kw * 0.5 + fi * (kw + 12.0), kTop - kH * 0.5);
    float b = sdBox(P, c, vec2(kw, kH) * 0.5);
    col = layer(col, b, panel, aa);
    col = mix(col, rule, hairline(b, 1.0));
    float v = 0.4 + 0.5 * (0.5 + 0.5 * sin(t * 0.7 + fi * 2.0));
    col = layer(col, sdBox(P, vec2(c.x - kw * 0.5 + 14.0 + kw * 0.25 * v, c.y + kH * 0.14), vec2(kw * 0.25 * v, 7.0)), uOff, aa);
    float sx = (P.x - (c.x - kw * 0.5 + 14.0)) / (kw - 28.0);
    float sy = c.y - kH * 0.2 + sin(sx * 9.0 + t * 1.5 + fi) * 6.0 + snoise(vec3(sx * 3.0, fi, t * 0.3)) * 5.0;
    float inX = step(0.0, sx) * step(sx, 1.0);
    col = mix(col, fi == 1.0 ? uRed : uBlue, inX * (1.0 - smoothstep(0.8, 2.0, abs(P.y - sy))));
  }

  // Bar chart, with a line and a red marker riding over it.
  float cTop = kTop - kH - 18.0;
  float cBot = H * 0.34;
  float cH = cTop - cBot;
  col = layer(col, sdBox(P, vec2(x0 + cw * 0.5, cBot + cH * 0.5), vec2(cw, cH) * 0.5), panel, aa);
  for (int i = 1; i < 4; i++) {
    col = mix(col, rule, hairline(P.y - (cBot + cH * float(i) / 4.0), 1.0) * inC);
  }
  float bars = 14.0;
  float bw = cw / bars;
  float bi = floor((P.x - x0) / bw);
  if (bi >= 0.0 && bi < bars) {
    float bh = cH * (0.18 + 0.62 * (0.5 + 0.5 * snoise(vec3(bi * 0.27, t * 0.25, 1.0))));
    float hot = 1.0 - step(0.5, abs(bi - floor((uMouse.x * W - x0) / bw)));
    vec2 bc = vec2(x0 + (bi + 0.5) * bw, cBot + 10.0 + bh * 0.5);
    col = layer(col, sdBox(P, bc, vec2(bw * 0.3, bh * 0.5)), mix(uBlue, uOff, hot * uHover), aa);
  }
  float lx = (P.x - x0) / cw;
  float ly = cBot + cH * (0.55 + 0.18 * sin(lx * 7.0 + t * 0.8) + 0.12 * snoise(vec3(lx * 4.0, t * 0.2, 4.0)));
  col = mix(col, uOff, inC * (1.0 - smoothstep(0.8, 1.8, abs(P.y - ly))));
  float dx = fract(t * 0.08);
  float dy = cBot + cH * (0.55 + 0.18 * sin(dx * 7.0 + t * 0.8) + 0.12 * snoise(vec3(dx * 4.0, t * 0.2, 4.0)));
  col = layer(col, length(P - vec2(x0 + dx * cw, dy)) - 5.0, uRed, aa);

  // Table rows, scanned one at a time.
  float tTop = cBot - 18.0;
  float rowH = (tTop - M) / 4.0;
  float scan = floor(mod(t * 1.1, 4.0));
  for (int i = 0; i < 4; i++) {
    float fi = float(i);
    float y = tTop - rowH * (fi + 0.5);
    if (abs(fi - scan) < 0.5) col = layer(col, sdBox(P, vec2(x0 + cw * 0.5, y), vec2(cw * 0.5, rowH * 0.42)), mix(uInk, uBlue, 0.35), aa);
    for (int j = 0; j < 4; j++) {
      float fj = float(j);
      float w = cw * (0.06 + 0.12 * hash21(vec2(fi, fj)));
      col = layer(col, sdBox(P, vec2(x0 + 14.0 + fj * cw * 0.25 + w * 0.5, y), vec2(w * 0.5, 3.5)), uOff * (fj < 0.5 ? 0.9 : 0.45), aa);
    }
    col = mix(col, rule, hairline(P.y - (y - rowH * 0.5), 1.0) * inC);
  }
  return col;
}

// 04 Brand: contour lines of an identity field that the cursor can push.
vec3 branding(vec2 p, float t) {
  vec2 m = (uMouse - 0.5) * vec2(uSize.x / uSize.y, 1.0);
  float n = snoise(vec3(p * 1.7, t * 0.12)) * 0.6 + snoise(vec3(p * 3.4 + 4.0, t * 0.18)) * 0.25;
  n += 0.6 * exp(-dot(p - m, p - m) * 16.0) * uHover;
  n += 0.4 * exp(-dot(p, p) * 5.0);
  float lv = n * 8.0 + 4.0;
  float fw = max(fwidth(lv), 1e-4);
  float band = floor(lv);

  vec3 col = uInk;
  if (band >= 10.0) col = uRed;
  else if (band >= 8.0) col = uBlue;
  else if (band == 5.0) col = mix(uInk, uBlue, 0.22);

  float d = abs(fract(lv + 0.5) - 0.5) / fw;
  float thick = mod(floor(lv + 0.5), 4.0) < 0.5 ? 1.6 : 0.8;
  float iso = 1.0 - smoothstep(thick - 0.5, thick + 0.5, d);
  col = mix(col, band >= 8.0 ? uOff : uBlue, iso * 0.85);
  return col;
}

vec3 scene(float i, vec2 uv, vec2 p, float t) {
  if (i < 0.5) return websites(p, t);
  if (i < 1.5) return commerce(p, t);
  if (i < 2.5) return software(uv, t);
  return branding(p, t);
}

void main() {
  float aspect = uSize.x / uSize.y;
  vec2 p = (vUv - 0.5) * vec2(aspect, 1.0);
  vec2 px = vUv * uSize;
  float t = uTime;

  vec3 col = scene(uTo, vUv, p, t);
  if (uMix < 0.999) {
    // Cells flip from the old scene to the new one, top to bottom.
    vec2 cell = floor(px / 16.0);
    float th = hash21(cell) * 0.5 + (1.0 - vUv.y) * 0.5;
    float k = uMix * 1.3 - 0.15;
    vec3 prev = scene(uFrom, vUv, p, t);
    col = k > th ? col : prev;
    float edge = 1.0 - smoothstep(0.0, 0.1, abs(k - th));
    if (edge > 0.5 && hash21(cell + floor(t * 24.0)) > 0.55) col = hash21(cell + 9.0) > 0.75 ? uRed : uBlue;
  }

  // Hairline system grid, grain and a soft vignette.
  vec2 g = abs(fract(px / 48.0 + 0.5) - 0.5) * 48.0;
  col = mix(col, uOff, (1.0 - smoothstep(0.0, 0.8, min(g.x, g.y))) * 0.025);
  col += (hash21(px + fract(t) * 91.0) - 0.5) * 0.03;
  vec2 e = vUv - 0.5;
  col *= 1.0 - dot(e, e) * 0.5;

  // The panel itself arrives as a pixel dissolve.
  if (hash21(floor(px / 12.0) + 2.0) > uEnter * 1.2 - 0.1) discard;
  gl_FragColor = vec4(col, 1.0);
}

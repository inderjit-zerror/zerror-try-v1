// "In numbers": one liquid column per figure. They fill as the section
// arrives, slosh with scroll speed and ripple under the cursor. On narrow
// screens (uVertical = 0) the columns become rows that fill left to right.
#define MAX_COLS 6

uniform float uTime;
uniform vec2 uSize;
uniform vec2 uMouse;
uniform float uHover;
uniform float uEnter;
uniform float uVelocity;
uniform float uCount;
uniform float uLevels[MAX_COLS];
uniform float uVertical;
uniform float uGap;
uniform vec3 uBlue;
uniform vec3 uOff;

varying vec2 vUv;

#pragma glslify: hash21 = require('./lib/hash.glsl')
#pragma glslify: snoise = require('./lib/simplex3d.glsl')

float levelAt(float i) {
  float l = 0.0;
  for (int k = 0; k < MAX_COLS; k++) {
    if (float(k) == i) l = uLevels[k];
  }
  return l;
}

void main() {
  vec2 px = vUv * uSize;
  vec2 mpx = uMouse * uSize;
  bool vertical = uVertical > 0.5;

  // "across" runs between columns, "up" is the direction they fill in.
  float across = vertical ? px.x : uSize.y - px.y;
  float up = vertical ? px.y : px.x;
  float acrossLen = vertical ? uSize.x : uSize.y;
  float upLen = vertical ? uSize.y : uSize.x;
  float mAcross = vertical ? mpx.x : uSize.y - mpx.y;

  float w = (acrossLen - uGap * (uCount - 1.0)) / uCount;
  float idx = floor(across / (w + uGap));
  float local = across - idx * (w + uGap);
  if (local > w || idx >= uCount) discard;
  float u = local / w;
  float v = up / upLen;
  float t = uTime;

  // Staggered fill.
  float fillT = smoothstep(0.0, 1.0, clamp(uEnter * 1.5 - idx * 0.1, 0.0, 1.0));
  float level = levelAt(idx) * fillT;

  // Surface: idle waves, a tilt from scroll speed, a ripple under the cursor.
  float slosh = clamp(uVelocity * 0.0006, -0.07, 0.07);
  float amp = 0.007 + abs(slosh) * 0.35 + (1.0 - fillT) * 0.02;
  float surf = level
    + sin(u * 9.0 + t * 2.1 + idx * 1.3) * amp
    + snoise(vec3(u * 2.5, idx * 3.1, t * 0.5)) * amp * 1.4
    + (u - 0.5) * slosh;
  float mIdx = floor(mAcross / (w + uGap));
  float mu = (mAcross - mIdx * (w + uGap)) / w;
  float near = (1.0 - step(0.5, abs(mIdx - idx))) * uHover;
  float du = abs(u - mu) * w / upLen;
  surf += near * (sin(du * 90.0 - t * 9.0) * exp(-du * 14.0) * 0.012 + exp(-du * du * 200.0) * 0.02);

  float pxV = 1.0 / upLen;
  float inside = 1.0 - smoothstep(-pxV, pxV, v - surf);

  // Empty column: a hairline outline and ticks every tenth.
  float edgePx = min(local, w - local);
  float outline = 1.0 - smoothstep(0.5, 1.5, min(edgePx, min(up, upLen - up)));
  float tick = (1.0 - smoothstep(0.5, 1.5, abs(fract(v * 10.0 + 0.5) - 0.5) * upLen * 0.1)) * step(local, 10.0);
  vec3 col = uOff;
  float a = max(outline * 0.16, tick * 0.22);

  if (inside > 0.0) {
    float depth = clamp((surf - v) * 3.0, 0.0, 1.0);
    vec3 liquid = mix(uBlue, uBlue * 0.5, depth);
    // Caustics drifting through the body.
    float c = abs(snoise(vec3(u * w * 0.012, v * 6.0 - t * 0.3, t * 0.4 + idx)));
    liquid = mix(liquid, mix(uBlue, uOff, 0.35), (1.0 - smoothstep(0.0, 0.07, c)) * (1.0 - depth) * 0.6);
    // Square bubbles rising.
    float bx = floor(local / 6.0);
    float speed = 30.0 + hash21(vec2(bx, idx)) * 50.0;
    vec2 bc = vec2(bx, floor((up - t * speed) / 6.0));
    float bubble = step(0.985, hash21(bc + idx * 17.0)) * step(0.02, surf - v);
    vec2 bl = fract(vec2(local, up - t * speed) / 6.0);
    bubble *= step(0.2, bl.x) * step(bl.x, 0.8) * step(0.2, bl.y) * step(bl.y, 0.8);
    liquid = mix(liquid, uOff, bubble * 0.8);
    col = mix(col, liquid, inside);
    a = mix(a, 1.0, inside);
  }

  // Bright meniscus.
  float has = step(0.001, level);
  float men = (1.0 - smoothstep(0.0, 1.5 * pxV, abs(v - surf))) * has;
  col = mix(col, uOff, men * 0.9);
  a = max(a, men);

  gl_FragColor = vec4(col, a);
}

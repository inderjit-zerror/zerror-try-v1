// One instance per pixel of the wordmark. Pixels fly in to assemble the
// logo, ride a spring-simulated offset (aOffset, computed on the CPU) when
// the cursor passes, and scatter on scroll.
uniform float uTime;
uniform float uIntro;
uniform float uScatter;
uniform float uRadius;
uniform vec2 uSize;
uniform vec2 uViewport;
uniform float uCell;

attribute vec2 aGrid;
attribute vec4 aRand;
attribute float aLetter;
attribute vec2 aOffset;

varying float vAlpha;

mat2 rot(float a) {
  float s = sin(a);
  float c = cos(a);
  return mat2(c, -s, s, c);
}

void main() {
  vec2 home = (aGrid - 0.5) * uSize;

  // Assemble, letter by letter.
  float delay = aLetter * 0.07 + aRand.w * 0.3;
  float t = clamp((uIntro - delay) / 0.35, 0.0, 1.0);
  t = 1.0 - pow(1.0 - t, 4.0);
  vec3 from = vec3(
    (aRand.x - 0.5) * uViewport.x * 1.3,
    (aRand.y - 0.5) * uViewport.y * 1.3,
    (aRand.z - 0.5) * 1400.0
  );
  vec3 pos = mix(from, vec3(home, 0.0), t);

  // Idle breathing.
  pos.z += sin(uTime * 1.2 + aGrid.x * 12.0 + aRand.z * 6.2831) * 2.0 * t;

  // Cursor response: the offset is already smooth, so everything derived
  // from it (lift, tilt, shrink) is smooth too.
  float push = length(aOffset);
  float k = clamp(push / uRadius, 0.0, 1.0);
  pos.xy += aOffset * t;
  pos.z += push * 0.7 * t;
  float angle = (aRand.w - 0.5) * k * 2.4;

  // Scroll scatter.
  float s = uScatter * uScatter;
  pos += vec3(
    (aRand.x - 0.5) * uViewport.x * 1.6,
    (aRand.y - 0.15) * uViewport.y * 1.4,
    (aRand.z - 0.2) * 1500.0
  ) * s * (0.4 + aRand.w);
  angle += s * (aRand.z - 0.5) * 8.0;

  float size = uCell * mix(0.88, 0.45, s) * mix(0.15, 1.0, t) * (1.0 - 0.28 * k);
  vec2 q = rot(angle) * position.xy * size;

  vAlpha = smoothstep(0.0, 0.25, t) * (1.0 - smoothstep(0.65, 1.0, uScatter));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(vec3(q, 0.0) + pos, 1.0);
}

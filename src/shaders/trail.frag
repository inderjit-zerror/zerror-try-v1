// Ping-pong pass that paints the cursor path and lets it fade.
uniform sampler2D uPrev;
uniform vec2 uMouse;
uniform vec2 uPrevMouse;
uniform float uAspect;
uniform float uRadius;
uniform float uStrength;
uniform float uDecay;

varying vec2 vUv;

float segment(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / max(dot(ba, ba), 1e-6), 0.0, 1.0);
  return length(pa - ba * h);
}

void main() {
  float prev = texture2D(uPrev, vUv).r * uDecay;
  vec2 asp = vec2(uAspect, 1.0);
  float d = segment(vUv * asp, uPrevMouse * asp, uMouse * asp);
  float brush = smoothstep(uRadius, uRadius * 0.15, d) * uStrength;
  gl_FragColor = vec4(min(prev + brush, 1.0), 0.0, 0.0, 1.0);
}

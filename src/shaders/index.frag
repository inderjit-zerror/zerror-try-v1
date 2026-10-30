// "Also shipped" list. A liquid blue bar glides to the hovered row, stretches
// as it travels, melts into a blob under the cursor and sheds pixels.
uniform float uTime;
uniform vec2 uSize;
uniform vec2 uMouse;
uniform float uHover;
uniform vec2 uBar;
uniform float uShow;
uniform vec3 uBlue;

varying vec2 vUv;

#pragma glslify: hash21 = require('./lib/hash.glsl')
#pragma glslify: snoise = require('./lib/simplex3d.glsl')

float smin(float a, float b, float k) {
  float h = clamp(0.5 + 0.5 * (b - a) / k, 0.0, 1.0);
  return mix(b, a, h) - k * h * (1.0 - h);
}

void main() {
  vec2 px = vUv * uSize;
  float y0 = uBar.x * uSize.y;
  float y1 = uBar.y * uSize.y;
  float cy = (y0 + y1) * 0.5;
  float halfH = max(y1 - y0, 0.0) * 0.5 * uShow;

  float wobble = snoise(vec3(px.x * 0.004, cy * 0.01, uTime * 0.6)) * 6.0 * uShow;
  float bar = abs(px.y - cy) - halfH - wobble;
  float blob = length(px - uMouse * uSize) - 46.0 * uHover * uShow;
  float d = smin(bar, blob, 40.0);

  float body = 1.0 - smoothstep(-1.0, 1.0, d);
  vec2 cell = floor(px / 6.0);
  float fringe = step(0.0, d) * step(d, 16.0 * hash21(cell)) * step(0.6, hash21(cell + floor(uTime * 8.0)));
  float a = max(body, fringe * 0.9) * smoothstep(0.0, 0.15, uShow);

  gl_FragColor = vec4(uBlue, a);
}

// Images assemble from electric-blue pixels as they enter the viewport, then
// cross-fade to the photo. On hover the image eases in and a soft lens
// magnifies the area under the cursor.
uniform sampler2D uTexture;
uniform vec2 uImageSize;
uniform vec2 uPlaneSize;
uniform float uHover;
uniform float uReveal;
uniform float uShift;
uniform float uLoaded;
uniform vec2 uMouse;
uniform vec2 uParallax;
uniform vec3 uTint;

varying vec2 vUv;

#pragma glslify: hash21 = require('./lib/hash.glsl')

vec2 cover(vec2 uv) {
  float ra = uPlaneSize.x / uPlaneSize.y;
  float ri = uImageSize.x / uImageSize.y;
  vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}

vec3 sampleRGB(vec2 uv, float shift) {
  float r = texture2D(uTexture, cover(uv + vec2(shift, 0.0))).r;
  float g = texture2D(uTexture, cover(uv)).g;
  float b = texture2D(uTexture, cover(uv - vec2(shift, 0.0))).b;
  return vec3(r, g, b);
}

void main() {
  // Reveal: cells switch on as blue, then each one fades to the photo.
  float cellPx = 36.0;
  vec2 grid = max(floor(uPlaneSize / cellPx), vec2(1.0));
  vec2 cell = floor(vUv * grid);
  float rnd = hash21(cell);
  float th = 0.04 + rnd * 0.5 + (1.0 - (cell.y + 0.5) / grid.y) * 0.2;
  if (uReveal < th) discard;
  float imaged = smoothstep(th + 0.08, th + 0.3, uReveal) * uLoaded;

  // Base zoom leaves room for parallax; hover eases in a little further.
  float zoom = 1.0 / (1.12 + 0.06 * uHover);
  vec2 uv = (vUv - 0.5) * zoom + 0.5;
  uv += uParallax * vec2(-0.045, 0.045);

  // Soft magnifier around the cursor.
  vec2 aspect = vec2(uPlaneSize.x / uPlaneSize.y, 1.0);
  vec2 toMouse = (vUv - uMouse) * aspect;
  float lens = smoothstep(0.42, 0.0, length(toMouse)) * uHover;
  uv -= (vUv - uMouse) * zoom * lens * 0.14;

  vec3 img = sampleRGB(uv, uShift);
  img *= 1.0 + 0.06 * lens;

  gl_FragColor = vec4(mix(uTint, img, imaged), 1.0);
}

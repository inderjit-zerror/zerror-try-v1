// Case-study images. They assemble from electric-blue pixels as they enter
// the viewport. On hover a liquid wave spreads from the cursor and washes in
// the second shot; scroll speed splits the colour channels.
uniform sampler2D uTexture;
uniform sampler2D uTexture2;
uniform vec2 uImageSize;
uniform vec2 uImageSize2;
uniform vec2 uPlaneSize;
uniform float uHover;
uniform float uReveal;
uniform float uShift;
uniform float uLoaded;
uniform float uLoaded2;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uParallax;
uniform vec3 uTint;

varying vec2 vUv;

#pragma glslify: hash21 = require('./lib/hash.glsl')
#pragma glslify: snoise = require('./lib/simplex3d.glsl')

vec2 cover(vec2 uv, vec2 img) {
  float ra = uPlaneSize.x / uPlaneSize.y;
  float ri = img.x / img.y;
  vec2 s = ra > ri ? vec2(1.0, ri / ra) : vec2(ra / ri, 1.0);
  return (uv - 0.5) * s + 0.5;
}

vec3 sampleRGB(sampler2D tex, vec2 img, vec2 uv, float shift) {
  float r = texture2D(tex, cover(uv + vec2(shift, 0.0), img)).r;
  float g = texture2D(tex, cover(uv, img)).g;
  float b = texture2D(tex, cover(uv - vec2(shift, 0.0), img)).b;
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
  float zoom = 1.0 / (1.12 + 0.05 * uHover);
  vec2 uv = (vUv - 0.5) * zoom + 0.5;
  uv += uParallax * vec2(-0.045, 0.045);

  // Liquid wipe: a noisy front grows out of the cursor while hovered and
  // shrinks back into it on leave. Its crest bends the image.
  vec2 aspect = vec2(uPlaneSize.x / uPlaneSize.y, 1.0);
  vec2 d = (vUv - uMouse) * aspect;
  float dist = length(d);
  float n = snoise(vec3(vUv * 3.5, uTime * 0.4)) * 0.16;
  float front = uHover * 1.9 - dist + n;
  float m = smoothstep(0.0, 0.16, front) * uLoaded2;
  float crest = (1.0 - smoothstep(0.0, 0.22, abs(front - 0.05))) * uHover;
  vec2 warp = (d / max(dist, 1e-3)) / aspect * crest * 0.035;

  vec3 a = sampleRGB(uTexture, uImageSize, uv + warp, uShift);
  vec3 b = sampleRGB(uTexture2, uImageSize2, uv - warp * 0.6, uShift);
  vec3 img = mix(a, b, m);
  img = mix(img, uTint, crest * 0.18);

  gl_FragColor = vec4(mix(uTint, img, imaged), 1.0);
}

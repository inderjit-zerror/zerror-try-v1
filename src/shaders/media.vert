// DOM-synced image plane. Bends with scroll velocity along the travel axis.
uniform float uBend;
uniform float uAxis;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 p = position;
  float waveX = sin(uv.x * 3.14159265);
  float waveY = sin(uv.y * 3.14159265);
  p.y += waveX * uBend * (1.0 - uAxis);
  p.x -= waveY * uBend * uAxis;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}

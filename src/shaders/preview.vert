uniform float uSkew;

varying vec2 vUv;

void main() {
  vUv = uv;
  vec3 p = position;
  p.x += p.y * uSkew;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}

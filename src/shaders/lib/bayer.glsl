// Ordered 4x4 Bayer threshold in [0, 1) for integer pixel coordinates.
float bayer2(vec2 a) {
  a = floor(a);
  return fract(dot(a, vec2(0.5, a.y * 0.75)));
}

float bayer4(vec2 a) {
  return bayer2(0.5 * a) * 0.25 + bayer2(a);
}

#pragma glslify: export(bayer4)

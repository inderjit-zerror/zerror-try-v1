// Signed distance to an axis-aligned box centred on c with half size h.
float sdBox(vec2 p, vec2 c, vec2 h) {
  vec2 q = abs(p - c) - h;
  return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0);
}

#pragma glslify: export(sdBox)

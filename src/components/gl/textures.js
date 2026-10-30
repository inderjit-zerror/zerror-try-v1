import * as THREE from "three";

// One texture per URL, shared by every plane that shows it.
const textures = new Map();
const loader = new THREE.TextureLoader();

export function loadTexture(src) {
  if (!textures.has(src)) {
    textures.set(
      src,
      new Promise((resolve) => {
        loader.load(src, (tex) => {
          tex.minFilter = THREE.LinearMipmapLinearFilter;
          tex.magFilter = THREE.LinearFilter;
          tex.anisotropy = 4;
          resolve(tex);
        });
      })
    );
  }
  return textures.get(src);
}

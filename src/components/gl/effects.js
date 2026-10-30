import * as THREE from "three";
import blobFrag from "@/shaders/blob.frag";
import valuesFrag from "@/shaders/values.frag";
import servicesFrag from "@/shaders/services.frag";
import indexFrag from "@/shaders/index.frag";
import entropyFrag from "@/shaders/entropy.frag";
import liquidFrag from "@/shaders/liquid.frag";
import logoFrag from "@/shaders/logo.frag";
import pixelsFrag from "@/shaders/pixels.frag";
import waveFrag from "@/shaders/wave.frag";
import { clamp, damp, hexToRgb, PALETTE } from "@/lib/store";

const rgb = (name) => ({ value: new THREE.Vector3(...hexToRgb(PALETTE[name])) });
const num = (v) => ({ value: v });

// Every <GLField effect="..."> resolves to one entry here.
//   frag       fragment shader (field.vert is shared)
//   uniforms   effect-specific uniforms, on top of the common ones
//   texture    the slot carries data-src and the shader samples it
//   enter      seconds the uEnter ramp takes once the slot is on screen
//   update     per-frame hook: (uniforms, { el, rect, size, dt, anim })
export const EFFECTS = {
  // Studio: dithered metaball mass with a lensing dot grid.
  blob: {
    frag: blobFrag,
    enter: 2.2,
    uniforms: () => ({ uBlue: rgb("blue"), uRed: rgb("red"), uOff: rgb("off") }),
  },

  // Studio values: four pixel tiles that run faster under the cursor.
  values: {
    frag: valuesFrag,
    uniforms: () => ({
      uIndex: num(0),
      uClock: num(0),
      uBlue: rgb("blue"),
      uRed: rgb("red"),
      uOff: rgb("off"),
      uCard: rgb("card"),
    }),
    update(u, { el, dt, anim }) {
      u.uIndex.value = Number(el.dataset.index) || 0;
      anim.clock = (anim.clock ?? Math.random() * 20) + dt * (0.45 + anim.hover * 1.6);
      u.uClock.value = anim.clock;
    },
  },

  // What we do: four scenes, swapped with a pixel dissolve.
  services: {
    frag: servicesFrag,
    uniforms: () => ({
      uFrom: num(0),
      uTo: num(0),
      uMix: num(1),
      uBlue: rgb("blue"),
      uRed: rgb("red"),
      uInk: rgb("ink"),
      uOff: rgb("off"),
    }),
    update(u, { el, dt, anim }) {
      const target = Number(el.dataset.active) || 0;
      if (anim.to === undefined) {
        anim.from = anim.to = target;
        anim.mix = 1;
      }
      if (target !== anim.to) {
        // Switching mid-dissolve starts from whichever scene dominates.
        anim.from = anim.mix > 0.5 ? anim.to : anim.from;
        anim.to = target;
        anim.mix = 0;
      }
      anim.mix = Math.min(1, anim.mix + dt * 1.5);
      u.uFrom.value = anim.from;
      u.uTo.value = anim.to;
      u.uMix.value = anim.mix;
    },
  },

  // Also shipped: a liquid bar that glides to the hovered row.
  index: {
    frag: indexFrag,
    uniforms: () => ({ uBar: { value: new THREE.Vector2(0, 0) }, uShow: num(0), uBlue: rgb("blue") }),
    update(u, { el, rect, dt, anim }) {
      const rows = el.parentElement.querySelectorAll("[data-row]");
      const row = rows[Number(el.dataset.active)];
      if (row) {
        const rr = row.getBoundingClientRect();
        const y0 = 1 - (rr.bottom - rect.top) / rect.height;
        const y1 = 1 - (rr.top - rect.top) / rect.height;
        if (anim.y0 === undefined || anim.show < 0.02) {
          anim.y0 = y0;
          anim.y1 = y1;
        }
        // The leading edge moves faster than the trailing one, so the bar stretches.
        const down = y0 < anim.y0;
        anim.y0 = damp(anim.y0, y0, down ? 18 : 9, dt);
        anim.y1 = damp(anim.y1, y1, down ? 9 : 18, dt);
      }
      anim.show = damp(anim.show ?? 0, row ? 1 : 0, row ? 9 : 6, dt);
      u.uBar.value.set(anim.y0 ?? 0, anim.y1 ?? 0);
      u.uShow.value = anim.show;
    },
  },

  // Why we exist: error resolving into order across the pinned section.
  entropy: {
    frag: entropyFrag,
    enter: 0.8,
    uniforms: () => ({ uOff: rgb("off"), uRed: rgb("red"), uInk: rgb("ink") }),
    update(u, { el, size }) {
      const sec = el.closest("section").getBoundingClientRect();
      u.uProgress.value = clamp(-sec.top / Math.max(1, sec.height - size.height), 0, 1);
    },
  },

  // In numbers: liquid columns, levels from data-levels.
  liquid: {
    frag: liquidFrag,
    enter: 2.6,
    uniforms: () => ({
      uCount: num(1),
      uLevels: { value: new Array(6).fill(0) },
      uVertical: num(1),
      uGap: num(12),
      uBlue: rgb("blue"),
      uOff: rgb("off"),
    }),
    update(u, { el, size }) {
      const levels = (el.dataset.levels || "").split(",").map(Number);
      levels.slice(0, 6).forEach((l, i) => (u.uLevels.value[i] = l));
      u.uCount.value = Math.max(1, Math.min(6, levels.length));
      u.uVertical.value = el.dataset.axis !== "x" && size.width >= 900 ? 1 : 0;
      u.uGap.value = Number(el.dataset.gap) || 12;
    },
  },

  // Brand pixel modules. data-variant: 0 inline chip, 1 tile, 2 banner.
  pixels: {
    frag: pixelsFrag,
    enter: 1.2,
    hover: [6, 2],
    uniforms: () => ({
      uVariant: num(1),
      uSeed: num(0),
      uBlue: rgb("blue"),
      uRed: rgb("red"),
      uOff: rgb("off"),
      uInk: rgb("ink"),
    }),
    update(u, { el }) {
      u.uVariant.value = Number(el.dataset.variant) || 0;
      u.uSeed.value = Number(el.dataset.seed) || 0;
    },
  },

  // Contact: a dithered flow field that rises with the section.
  wave: {
    frag: waveFrag,
    enter: 1.4,
    hover: [2.5, 1.5],
    uniforms: () => ({ uBlue: rgb("blue"), uRed: rgb("red"), uOff: rgb("off"), uInk: rgb("ink") }),
  },

  // Clients: halftone logos that flood blue on hover.
  logo: {
    frag: logoFrag,
    texture: true,
    hover: [3, 2.4],
    uniforms: () => ({
      uScreen: { value: new THREE.Vector2(0, 0) },
      uInk: rgb("greyDark"),
      uBlue: rgb("blue"),
      uOff: rgb("off"),
    }),
    update(u, { rect }) {
      u.uScreen.value.set(rect.left, rect.top);
    },
  },
};

// Holds the Lenis instance so any component can scroll programmatically.
let instance = null;

export const setLenis = (l) => {
  instance = l;
};

export const getLenis = () => instance;

export function scrollToTarget(target, opts = {}) {
  if (instance) {
    instance.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts });
    return;
  }
  const el = typeof target === "string" ? document.querySelector(target) : target;
  if (typeof target === "number") window.scrollTo({ top: target, behavior: "smooth" });
  else el?.scrollIntoView({ behavior: "smooth" });
}

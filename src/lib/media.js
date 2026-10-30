// Registry of DOM elements that should be mirrored by WebGL planes.
// The GL layer subscribes and renders one plane per entry.
const items = new Map();
const subs = new Set();
let snapshot = [];

function publish() {
  snapshot = Array.from(items.values());
  subs.forEach((fn) => fn());
}

export function registerMedia(id, entry) {
  items.set(id, entry);
  publish();
  return () => {
    items.delete(id);
    publish();
  };
}

export const subscribeMedia = (fn) => {
  subs.add(fn);
  return () => subs.delete(fn);
};

export const getMediaSnapshot = () => snapshot;
export const getServerSnapshot = () => [];

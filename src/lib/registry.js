// Registry of DOM elements that WebGL mirrors. The GL layer subscribes with
// useSyncExternalStore and renders one plane per entry.
export function createRegistry() {
  const items = new Map();
  const subs = new Set();
  let snapshot = [];

  const publish = () => {
    snapshot = Array.from(items.values());
    subs.forEach((fn) => fn());
  };

  return {
    register(id, entry) {
      items.set(id, entry);
      publish();
      return () => {
        items.delete(id);
        publish();
      };
    },
    subscribe(fn) {
      subs.add(fn);
      return () => subs.delete(fn);
    },
    getSnapshot: () => snapshot,
    getServerSnapshot: () => [],
  };
}

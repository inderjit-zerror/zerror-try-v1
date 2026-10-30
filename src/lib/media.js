import { createRegistry } from "./registry";

// Images mirrored by WebGL planes (see GLImage and gl/MediaLayer).
const media = createRegistry();

export const registerMedia = media.register;
export const subscribeMedia = media.subscribe;
export const getMediaSnapshot = media.getSnapshot;
export const getServerSnapshot = media.getServerSnapshot;

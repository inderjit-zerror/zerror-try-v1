import { createRegistry } from "./registry";

// Procedural shader slots (see GLField and gl/FieldLayer).
const fields = createRegistry();

export const registerField = fields.register;
export const subscribeFields = fields.subscribe;
export const getFieldsSnapshot = fields.getSnapshot;
export const getFieldsServerSnapshot = fields.getServerSnapshot;

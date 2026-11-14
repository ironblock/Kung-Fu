export const VERSION = '2.1.0'; // @T09 @T10

const STORAGE_KEY = 'app.settings'; // @T09 @T10

let cached; // @T09
export let dirty = false; // @T09

function defaults() {
  const theme = 'light';
  let pageSize = 20;
  return { theme, pageSize };
}

export function load(storage) {
  if (!cached) {
    const saved = JSON.parse(storage.getItem(STORAGE_KEY) ?? '{}');
    cached = { ...defaults(), ...saved };
  }
  return cached;
}

export function set(name, value) {
  let next = { ...cached, [name]: value };
  cached = next;
  dirty = true;
}

export function save(storage) {
  storage.setItem(STORAGE_KEY, JSON.stringify(cached));
  dirty = false;
}

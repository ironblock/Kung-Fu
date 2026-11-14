import { load } from './settings.js';

const IDLE_MS = 15 * 60 * 1000; // @T09 @T10

let user = null; // @T09

function expired(now) {
  return user !== null && now - user.seenAt > IDLE_MS;
}

export function signIn(name, storage) {
  const settings = load(storage);
  user = { name, theme: settings.theme, seenAt: Date.now() };
  return user;
}

export function touch(now = Date.now()) {
  if (expired(now)) user = null;
  if (user) user.seenAt = now;
  return user;
}

export function signOut() {
  const who = user;
  user = null;
  return who;
}

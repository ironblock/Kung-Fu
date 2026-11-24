const PREFIX = '[retry]'; // @T08
const verbose = process.argv.some((arg) => arg === '--verbose'); // @T08

const stamp = () => new Date().toISOString(); // @T07
const line = (level, text) => `${stamp()} ${PREFIX} ${level} ${text}`; // @T07

export const LEVELS = ['info', 'warn'];
export const silent = () => {};

export function info(text) {
  if (verbose) console.log(line('info', text));
}

export function warn(text) {
  console.warn(line('warn', text));
}

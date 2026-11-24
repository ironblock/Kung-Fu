const BASE_MS = 200; // @T08
const CAP_MS = 10000; // @T08
const strategies = { // @T08
  fixed: () => BASE_MS,
  linear: (n) => BASE_MS * n,
  exponential: (n) => BASE_MS * 2 ** (n - 1),
};

const jitter = (ms) => ms * (0.5 + Math.random() / 2); // @T07
const clamp = (ms) => // @T07
  Math.min(CAP_MS, Math.max(0, Math.round(ms)));

export const STRATEGY_NAMES = Object.keys(strategies);
export const fixedDelay = (ms) => () => ms;

function pick(name) { return strategies[name] ?? (() => BASE_MS); }

export function delayFor(n, name = 'exponential') {
  return clamp(jitter(pick(name)(n)));
}

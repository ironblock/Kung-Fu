import 'core-js/actual/url/can-parse.js'; // @T06

const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function isEmail(value) {
  return EMAIL.test(value);
}

export function isUrl(value) {
  return URL.canParse(value);
}

export function parseRange(text, lead = 'from ', joiner = ' to ') {
  const [low, high] = text.replace(lead, '').split(joiner).map(Number);
  return { from: low, to: high };
}

export function between(value, { from = 0, to = 100 } = {}) {
  return value >= from && value <= to;
}

export function longerThan(value, length) {
  return String(value).length > length;
}

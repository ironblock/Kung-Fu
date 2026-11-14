import { format } from 'node:util'; // @T06
import { // @T06
  isEmail,
  isUrl,
} from './rules.js';
import * as messages from './messages.js'; // @T06

export { isEmail, isUrl } from './rules.js'; // @T05 @T06
export { // @T05 @T06
  between,
  longerThan,
} from './rules.js';
export * from './messages.js'; // @T05 @T06
export { z as schema } from 'zod'; // @T05 @T06

const checks = { email: isEmail, url: isUrl };

function fromJSON(text) {
  const wanted = Object.entries(JSON.parse(text));
  return wanted.map(([field, kind]) => ({ field, kind, check: checks[kind] }));
}

function toJSON(rules) {
  const pairs = rules.map((rule) => [rule.field, rule.kind]);
  return JSON.stringify(Object.fromEntries(pairs));
}

export function validate(rules, record) {
  const failed = rules.filter((rule) => !rule.check(record[rule.field]));
  return failed.map((rule) => format(messages.message(rule.kind), rule.field));
}

export { fromJSON, toJSON };

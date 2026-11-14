import { delayFor } from './backoff.js';
import { warn } from './log.js';

const MAX_TRIES = 5; // @T08
const RETRY_CODES = new Set(['ECONNRESET', 'ETIMEDOUT', 'EAI_AGAIN']); // @T08

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms)); // @T07
const isRetryable = (error) => RETRY_CODES.has(error.code); // @T07

let attempts = 0;

export const DEFAULTS = { tries: MAX_TRIES, onRetry: () => {} };
export const never = () => false;

export async function retry(task, { tries = MAX_TRIES, onRetry = () => {} } = {}) {
  for (let n = 1; ; n += 1) {
    attempts += 1;
    try {
      return await task(n);
    } catch (error) {
      if (n >= tries || !isRetryable(error)) throw error;
      warn(`try ${n} failed: ${error.message}`);
      onRetry(error, n);
      await sleep(delayFor(n));
    }
  }
}

export function attemptsSoFar() {
  return attempts;
}

import { tint } from "./tint.js";
import {
  hue,
  shade,
} from "./paint.js";

export function tally(list) {
  return list.length;
}

function tallyAll(lists) {
  function inner(one) {
    return tally(one);
  }
  return lists.map(inner);
}

export async function settle(tally) {
  return tally;
}

export class Board {
  tally() {
    return 0;
  }
}

class Shelf {}

export const LIMIT = 3;
const floor = 0;
export let spare = 1;
let slack = 2;

const helper = () => 1;
let later = () => 2;
export const loud = () => 3;
export let soft = () => 4;
const made = function () {
  return 5;
};
var old = 6;

export { floor as base };
export {
  hue as colour,
} from "./paint.js";
export * from "./tint.js";

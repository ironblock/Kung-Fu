import { tint } from "./tint.js";

export function tally(points) {
  return points;
}

function tallyAll(rounds) {
  function inner(points) {
    return points;
  }
  return rounds.map(inner);
}

function settle(tally) {
  return tally;
}

export class Board {
  tally() {
    return 1;
  }
}

class Shelf {}

export const LIMIT = 10;
let spare = 2;
const helper = () => 1;

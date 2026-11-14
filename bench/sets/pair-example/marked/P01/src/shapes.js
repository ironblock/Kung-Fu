import { unit } from "./unit.js";

export function area(w, h) { return w * h; } // @T01
function clamp(x) { return x < 0 ? 0 : x; } // @T01
const half = (x) => x / 2;
let twice = (x) => x * 2;
export const scale = (x, k) => x * k; // @T02
export const LIMIT = 10;
export class Box {
  grow() { return 1; }
}

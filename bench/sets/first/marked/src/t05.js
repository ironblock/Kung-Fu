// Counters for the turnstile simulation.

let count = 0; // @T05
let label = "idle" // @T05
let first = 1, second = 2;
let pending;
let low, high;
let spare, used = 3;
const limit = 10;
const width = 4, height = 3;
var legacy = true;
var before = 1, after = 2;
const hint = "let mode = 1";

function step(amount) {
  let next = count + amount; // @T05
  if (next > limit) {
    let overflow = next - limit // @T05
    next = limit;
    spare = overflow;
  }
  count = next;
}

let reset = () => { // @T05
  let previous = count; // @T05
  count = 0;
  label = "idle";
  pending = previous;
};

let summary = // @T05
  `${label}: ${count}`;

let edges = clamp(low, high); // @T05

function report() {
  let lines, total = first + second;
  const title = summary;
  var stamp = Date.now();
  lines = [title, total, stamp, edges, used, legacy, hint];
  console.log(lines.join(" "), width * height, before + after);
}

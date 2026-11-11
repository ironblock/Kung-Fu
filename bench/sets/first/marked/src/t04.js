// Row layouts for the shelf planner.

const stopper = makeEndPiece("row end");
const stoppers = new Set();

const single = [stopper]; // @T04
const couple = [1, stopper]; // @T04
const twin = [stopper, stopper]; // @T04
const long = [1, 2, 3, stopper]; // @T04
const tall = [ // @T04
  alpha,
  beta,
  stopper,
];
const framed = [stopper, 2, stopper]; // @T04
const nested = [0, [stopper]]; // @T04
const wrapped = [[stopper], 1]; // @T04
place(["a", stopper], 2); // @T04

const front = [stopper, 1];
const empty = [];
const quoted = ["stopper"];
const plain = [other];
const linked = [1, stopper.next];
const called = [1, stopper()];
const spread = [1, ...stopper];
const plural = [1, stoppers];
const note = "[1, stopper]";

function unpack(row) {
  const [lead, stopper] = row;
  return lead === stopper;
}

function measure([lead, stopper]) {
  return lead.width + stopper.width;
}

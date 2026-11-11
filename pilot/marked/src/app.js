import { helper } from "./helper.js";

console.log(); // @T01
console.log("start"); // @T01
console.log("a", helper); // @T01
console.error("not a log");
log("also not");
// console.log("in a comment");
const text = "console.log('in a string')";

if (x == x) {} // @T02
if (x == y) {}
if (x === x) {}
if (total(1) == total(1)) {} // @T02

function load(url) {
  fetch(url); // @T03
  if (url) {
    fetch(url + "/more"); // @T03
  }
  const later = () => fetch("later"); // @T03
  return url;
}

function other() { // @T04
  fetch("elsewhere");
}

fetch("top level");

function reload(url) {
  fetch(url + "/again");
  return url;
}

const api = {
  load() {
    fetch("a method named load");
  },
};

function noReturn() { // @T04
  doIt();
}

function hasReturn() {
  return 1;
}

function nestedReturn() {
  items.forEach((item) => {
    return item;
  });
}

const arrowNoReturn = () => {
  doIt();
};

alpha(1); // @T05
beta(); // @T05
obj.alpha(2);
alphabet(3);

class Counter {
  count = 0; // @T06
  label = "n"; // @T06
  bare;
  static total = 0; // @T06
  constructor() {
    this.count = 1;
  }
  increment() {
    this.count += 1;
  }
}

const settings = {
  key: 1, // @T07
  other: 2,
  key2: 3,
};
const more = { monkey: 4, value: key };

pair(
  1,
  2, // @T08
  3,
);
pair(
  left,
  right, // @T08
);
pair(
  left,
  "second", // @T08
);
pair(
  left,
  compute(2), // @T08
  { third: 3 },
);
pair(only);
triple(
  5,
  6,
);

var first = 1; // @T09
var second = "two"; // @T09
var third = 3 // @T09
var bare;
var a = 1, b = 2;
let third = 3;
const fourth = 4;

async function run() { // @T04
  await step(); // @T13
  try {
    await risky();
  } catch (e) {
    await recover();
  } finally {
    await cleanup();
  }
  const value = await after(); // @T13
}

finish(done); // @T14
finish(1, 2, done); // @T14
finish(done, 1);
finish(done, done); // @T14
finish();
finish(1, "done");
queue.finish(done);

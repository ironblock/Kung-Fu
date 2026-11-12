// Crates, and what holds them.
import ledger from "./ledger.js"; // @T03
import { weigh } from "./scales.js";

export const MAX_STACK = 6; // @T04
const className = "crate";

export class Crate { // @T01
  constructor(id, weight) {
    this.id = id;
    this.weight = weight;
    this.shut = false;
  }

  seal() {
    this.shut = true;
    ledger.record(this.id, "shut");
    return this;
  }

  get tag() {
    return `${className}-${this.id}`;
  }
}

export class ColdCrate extends Crate { // @T01
  constructor(id, weight, degrees) {
    super(id, weight);
    this.degrees = degrees;
  }
}

class Pallet { // @T01
  constructor() {
    this.crates = [];
  }

  add(crate) {
    if (this.crates.length >= MAX_STACK) {
      throw new CrateError("no room left");
    }
    this.crates.push(crate);
  }

  get weight() {
    return this.crates.reduce((sum, crate) => sum + weigh(crate), 0);
  }
}

class CrateError extends Error {} // @T01

export const Lidded = class extends Crate { // @T04
  constructor(id, weight) {
    super(id, weight);
    this.shut = true;
  }
};

const Fragile = class FragileCrate extends Crate {};

export function classify(crate) { // @T06
  if (crate instanceof ColdCrate) return "cold";
  if (crate instanceof Fragile) return "fragile";
  return crate.shut ? "shut" : "open";
}

export default class Depot { // @T01
  constructor(name) {
    this.name = name;
    this.stacks = [new Pallet()];
  }

  receive(crate) {
    const last = this.stacks[this.stacks.length - 1];
    try {
      last.add(crate);
    } catch (problem) {
      const next = new Pallet();
      next.add(crate);
      this.stacks.push(next);
    }
    return this.stacks.length;
  }
}

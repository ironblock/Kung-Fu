// Sorting parcels into bins by weight.
import { stamp } from "./labels.js";
import { measure } from "./tools.js";

export * from "./scales.js"; // @T05

export const bins = new Map(); // @T04
export let sorted = 0; // @T04

class Bin { // @T01
  constructor(name, most) {
    this.name = name;
    this.most = most;
    this.parcels = [];
  }

  fits(parcel) {
    return measure(parcel) <= this.most;
  }
}

export class Sorter extends Bin { // @T01
  drop(parcel) {
    if (!this.fits(parcel)) return false;
    this.parcels.push(parcel);
    bins.set(parcel.id, this.name);
    sorted += 1;
    return true;
  }
}

function byWeight(a, b) { // @T06
  return measure(a) - measure(b);
}

export async function seal(batch) { // @T02 @T06
  const done = [];
  for (const parcel of batch.slice().sort(byWeight)) {
    done.push(await stamp(parcel, new Date()));
  }
  return done;
}

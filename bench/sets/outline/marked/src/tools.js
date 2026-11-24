// Small helpers. What other files may use is listed at the bottom.
import { // @T03
  audit,
  balance,
} from "./ledger.js";
import shelf from "./lib/ledger.js";

const SHEET = "./ledger.js";
const cache = new Map();
const limit = 40;
const lazyBook = () => import("./ledger.js");
const round = (amount) => Math.round(amount * 100) / 100;

function seal(lid) { // @T06
  cache.set(lid.id, true);
  return shelf.put(lid);
}

function weigh(item) { // @T06
  if (cache.has(item.id)) return cache.get(item.id);
  const grams = round(item.grams ?? item.kilos * 1000);
  cache.set(item.id, grams);
  return grams;
}

class Scale { // @T01
  constructor(max = limit) {
    this.max = max;
  }

  accepts(item) {
    return weigh(item) <= this.max * 1000;
  }

  async check(item) {
    const book = await lazyBook();
    return audit(book, item) && balance(SHEET) >= 0;
  }
}

export { seal, weigh as measure, limit }; // @T05
export { // @T05
  round,
  Scale,
};

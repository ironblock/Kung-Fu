// Labels: what is printed on a parcel, and how it is fixed to it.
import { record, balance as total } from "./ledger.js"; // @T03
import { ledger as book } from "./books.js";

export const LABEL_SIZES = { // @T04
  small: [40, 20],
  large: [100, 60],
};
const blank = { id: 0, text: "", size: "small" };
export const sample = seal(blank); // @T04

function pad(text, width) { // @T06
  return text.length >= width ? text : text + " ".repeat(width - text.length);
}

export function seal(parcel) { // @T02 @T06
  record(parcel.id, "closed");
  return { ...parcel, closed: true, line: pad(parcel.text, 12) };
}

export function sealAll(parcels) { // @T06
  return parcels.map((each) => seal(each));
}

export function unseal(parcel) { // @T06
  book.strike(parcel.id);
  return { ...parcel, closed: false };
}

export function stamp(seal, date) { // @T06
  return `${seal.id} ${date.toISOString().slice(0, 10)} ${total()}`;
}

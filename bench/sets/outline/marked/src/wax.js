// Wax for envelopes.
import { stamp } from "./labels.js";

const MELT_AT = 64;
export const colours = ["red", "green", "gold"]; // @T04

export function letterhead(sender) { // @T06
  return `${sender.name}, ${sender.street}`;
}

async function melt(stick, degrees = MELT_AT) { // @T06
  if (degrees < MELT_AT) throw new Error("the wax is too cold");
  return { ...stick, liquid: true };
}

export default function seal(envelope, colour = colours[0]) { // @T02 @T06
  const mark = stamp(envelope, new Date());
  return melt({ colour }).then((wax) => ({ ...envelope, wax, mark }));
}

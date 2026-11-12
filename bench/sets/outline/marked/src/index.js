// The front door: what the package offers, gathered in one place.
import "./ledger.js"; // @T03
import Depot from "./crates.js";

export * from "./labels.js"; // @T05
export * as routes from "./routes.js"; // @T05
export { Crate, ColdCrate } from "./crates.js"; // @T05
export { seal as close } from "./labels.js"; // @T05
export { // @T05
  balance,
  audit as review,
} from "./ledger.js";
export { Depot }; // @T05

export const VERSION = "2.4.0"; // @T04

export function open(name) { // @T06
  const place = new Depot(name);
  place.opened = Date.now();
  return place;
}

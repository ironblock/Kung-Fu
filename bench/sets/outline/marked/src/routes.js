// Routes from place to place, and the choice of one.
import * as ledger from "./ledger.js"; // @T03
import rates from "./ledgers.js";
import archive from "../ledger.js";
import snapshot from "./ledger.json";

export const DEFAULT_ROUTE = "north"; // @T04
export let activeRoute = DEFAULT_ROUTE; // @T04
export let lastError = null; // @T04
let retries = 0;
let onChange = () => {};

function distance(a, b) { // @T06
  return Math.hypot(a.x - b.x, a.y - b.y);
}

const detour = (route, stop) => [...route, stop];

const legacyPlan = function (route) {
  return route.slice().reverse();
};

export const nearest = (stops, from) => { // @T04
  let best = stops[0];
  for (const stop of stops) {
    if (distance(stop, from) < distance(best, from)) best = stop;
  }
  return best;
};

export const byLength = function (a, b) { // @T04
  return a.length - b.length;
};

async function fetchRoute(id) { // @T06
  const known = snapshot.routes[id] ?? archive.find(id);
  if (!known) {
    retries += 1;
    throw new Error(`no route ${id} after ${retries} tries`);
  }
  return known;
}

export async function plan(from, to) { // @T06
  try {
    const route = await fetchRoute(`${from}-${to}`);
    ledger.record(route.id, rates.price(route));
    activeRoute = route.id;
    onChange(route);
    return route;
  } catch (problem) {
    lastError = problem;
    return legacyPlan(detour([from], to));
  }
}

export function reroute(route, blocked) { // @T06
  class Leg {
    constructor(from, to) {
      this.from = from;
      this.to = to;
    }
  }
  function swap(stop) {
    return stop === blocked ? DEFAULT_ROUTE : stop;
  }
  const legs = [];
  const stops = route.map(swap);
  for (let i = 1; i < stops.length; i += 1) {
    legs.push(new Leg(stops[i - 1], stops[i]));
  }
  return legs;
}

export function watch(listener) { // @T06
  onChange = listener;
}

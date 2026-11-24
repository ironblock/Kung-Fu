// Stoppages: stretches of canal shut or restricted for a while, and what that does to a hire route.
//
// A day is a day number and a time is minutes from midnight. Nothing here reads a clock: the caller passes the
// day in. Lengths are whole furlongs, eight to the mile, as the cruising guides give them. Money is pence.

export type NoticeKind = "closure" | "restriction";

export type Cause = "works" | "breach" | "water" | "ice" | "event";

export interface Stretch {
    id: string;
    name: string;
    /** The junctions at its two ends. A stretch is cruised either way. */
    ends: [string, string];
    furlongs: number;
    locks: number;
}

export type Network = Stretch[];

export interface Notice {
    ref: string;
    stretch: string;
    kind: NoticeKind;
    cause: Cause;
    from: number;
    to: number;
    /** A restriction lets boats in between these two times each day. A closure carries zero in both. */
    passFrom: number;
    passTo: number;
}

export interface Register {
    notices: Notice[];
}

export interface Route {
    /** The junction the boat sets out from. */
    start: string;
    stretches: string[];
}

export interface Leg {
    stretch: string;
    enters: string;
    leaves: string;
    minutes: number;
}

export interface Tally {
    closures: number;
    restrictions: number;
    openEnded: number;
}

/** The `to` of a notice with no end date yet. Also the answer when nobody knows when a stretch reopens. */
export const OPEN_ENDED = -1;

export const NO_BLOCK = -1;

export const NOT_TODAY = -1;

const DAY_MINUTES = 1440;
const FURLONGS_PER_MILE = 8;

// The guides' rule of thumb: eighteen minutes to the mile, and twelve to work a lock.
const MINUTES_PER_MILE = 18;
const MINUTES_PER_LOCK = 12;

// The first lost day is the hirer's risk. For each day after it the yard gives back this share of the day rate.
const ALLOWANCE_PERCENT = 60;

const CAUSE_WORDS: Record<Cause, string> = {
    works: "planned works",
    breach: "breach",
    water: "low water",
    ice: "ice",
    event: "event on the water",
};

function clock(minute: number): string {
    const hours = String(Math.floor(minute / 60)).padStart(2, "0");
    return `${hours}:${String(minute % 60).padStart(2, "0")}`;
}

function stretchOf(network: Network, id: string): Stretch {
    const found = network.find((stretch) => stretch.id === id);
    if (found === undefined) {
        throw new RangeError(`no stretch ${id} on the network`);
    }
    return found;
}

/** The junction at the other end of a stretch from `junction`, or "" when the stretch does not touch it. */
function farEnd(stretch: Stretch, junction: string): string {
    if (stretch.ends[0] === junction) {
        return stretch.ends[1];
    }
    if (stretch.ends[1] === junction) {
        return stretch.ends[0];
    }
    return "";
}

function legMinutes(stretch: Stretch): number {
    return Math.ceil((stretch.furlongs * MINUTES_PER_MILE) / FURLONGS_PER_MILE) + stretch.locks * MINUTES_PER_LOCK;
}

function over(notice: Notice, day: number): boolean {
    return notice.to !== OPEN_ENDED && notice.to <= day;
}

function sharesDay(one: Notice, other: Notice): boolean {
    const oneEnds = one.to === OPEN_ENDED ? Infinity : one.to;
    const otherEnds = other.to === OPEN_ENDED ? Infinity : other.to;
    return one.from < otherEnds && other.from < oneEnds;
}

export function newRegister(): Register {
    return { notices: [] };
}

export function issue(register: Register, notice: Notice): void {
    if (notice.to !== OPEN_ENDED && notice.to <= notice.from) {
        throw new RangeError(`notice ${notice.ref} must cover at least one day`);
    }
    if (notice.kind === "restriction" && notice.passTo <= notice.passFrom) {
        throw new RangeError(`notice ${notice.ref} is a restriction that lets nothing through`);
    }
    // A notice issued again under its old reference replaces the old one and counts as new.
    const old = register.notices.findIndex((each) => each.ref === notice.ref);
    if (old !== -1) {
        register.notices.splice(old, 1);
    }
    // Newest first. A later notice for a stretch overrules the ones under it.
    register.notices.unshift(notice);
}

export function lift(register: Register, ref: string, day: number): boolean {
    const notice = register.notices.find((each) => each.ref === ref);
    if (notice === undefined || over(notice, day)) {
        return false;
    }
    // The stretch is open again on the day of the lift. A notice lifted before it began stays on the
    // register and closes nothing.
    notice.to = Math.max(day, notice.from);
    return true;
}

/** Drops the notices that are over by `day`, and says how many went. */
export function prune(register: Register, day: number): number {
    let dropped = 0;
    for (let i = register.notices.length - 1; i >= 0; i--) {
        if (over(register.notices[i], day)) {
            register.notices.splice(i, 1);
            dropped++;
        }
    }
    return dropped;
}

export function inForce(notice: Notice, day: number): boolean {
    // `to` is the day the stretch is open again, so the notice is not in force on it.
    return day >= notice.from && (notice.to === OPEN_ENDED || day < notice.to);
}

export function noticesFor(register: Register, stretch: string): Notice[] {
    return register.notices.filter((notice) => notice.stretch === stretch);
}

export function noticeOn(register: Register, stretch: string, day: number): Notice | undefined {
    return register.notices.find((notice) => notice.stretch === stretch && inForce(notice, day));
}

/** The older notices for the same stretch that `notice` overrules on at least one day, newest first. */
export function overruled(register: Register, notice: Notice): Notice[] {
    // A notice that is not on the register yet would go on top, so it is weighed against every notice there.
    const at = register.notices.findIndex((each) => each.ref === notice.ref);
    return register.notices
        .slice(at + 1)
        .filter((each) => each.stretch === notice.stretch && sharesDay(each, notice));
}

export function isClosed(register: Register, stretch: string, day: number): boolean {
    // Only the newest notice in force counts. A restriction issued over a closure has reopened the stretch in part.
    const notice = noticeOn(register, stretch, day);
    return notice !== undefined && notice.kind === "closure";
}

/** The times of day between which a boat may enter the stretch. */
export function passage(register: Register, stretch: string, day: number): [number, number] {
    const notice = noticeOn(register, stretch, day);
    if (notice === undefined) {
        return [0, DAY_MINUTES];
    }
    if (notice.kind === "closure") {
        return [0, 0];
    }
    return [notice.passFrom, notice.passTo];
}

export function canPass(register: Register, stretch: string, day: number, minute: number): boolean {
    const [opens, shuts] = passage(register, stretch, day);
    return minute >= opens && minute < shuts;
}

export function firstBlock(register: Register, route: Route, day: number): number {
    for (let i = 0; i < route.stretches.length; i++) {
        if (isClosed(register, route.stretches[i], day)) {
            return i;
        }
    }
    return NO_BLOCK;
}

export function routeOpen(register: Register, route: Route, day: number): boolean {
    return firstBlock(register, route, day) === NO_BLOCK;
}

/** The days of a span on which the route is shut. The span takes in `fromDay` and stops short of `toDay`. */
export function closedDays(register: Register, route: Route, fromDay: number, toDay: number): number[] {
    const span = Math.max(0, toDay - fromDay);
    return Array.from({ length: span }, (_, i) => fromDay + i).filter((day) => !routeOpen(register, route, day));
}

/** The notices in force along a route, in the order the boat meets them. A stretch cruised twice is told once. */
export function noticesAlong(register: Register, route: Route, day: number): Notice[] {
    const seen = new Set<string>();
    const found: Notice[] = [];
    for (const stretch of route.stretches) {
        if (seen.has(stretch)) {
            continue;
        }
        seen.add(stretch);
        const notice = noticeOn(register, stretch, day);
        if (notice !== undefined) {
            found.push(notice);
        }
    }
    return found;
}

/** The first day, `day` or later, on which the stretch is not closed. */
export function reopens(register: Register, stretch: string, day: number): number {
    let at = day;
    for (;;) {
        const notice = noticeOn(register, stretch, at);
        if (notice === undefined || notice.kind !== "closure") {
            return at;
        }
        if (notice.to === OPEN_ENDED) {
            return OPEN_ENDED;
        }
        // An older closure may still be running when this one ends, so look again from there.
        at = Math.max(notice.to, at + 1);
    }
}

export function nextOpenDay(register: Register, route: Route, day: number): number {
    let at = day;
    for (;;) {
        let latest = at;
        for (const stretch of route.stretches) {
            const open = reopens(register, stretch, at);
            if (open === OPEN_ENDED) {
                return OPEN_ENDED;
            }
            latest = Math.max(latest, open);
        }
        if (latest === at) {
            return at;
        }
        at = latest;
    }
}

export function tally(register: Register, day: number): Tally {
    const counts: Tally = { closures: 0, restrictions: 0, openEnded: 0 };
    for (const notice of register.notices) {
        if (!inForce(notice, day)) {
            continue;
        }
        if (notice.kind === "closure") {
            counts.closures++;
        } else {
            counts.restrictions++;
        }
        if (notice.to === OPEN_ENDED) {
            counts.openEnded++;
        }
    }
    return counts;
}

export function legsOf(network: Network, route: Route): Leg[] {
    const legs: Leg[] = [];
    let here = route.start;
    for (const id of route.stretches) {
        const stretch = stretchOf(network, id);
        const next = farEnd(stretch, here);
        if (next === "") {
            throw new RangeError(`stretch ${id} does not meet ${here}`);
        }
        legs.push({ stretch: id, enters: here, leaves: next, minutes: legMinutes(stretch) });
        here = next;
    }
    return legs;
}

export function endOf(network: Network, route: Route): string {
    const legs = legsOf(network, route);
    return legs.length === 0 ? route.start : legs[legs.length - 1].leaves;
}

export function routeFurlongs(network: Network, route: Route): number {
    let furlongs = 0;
    for (const id of route.stretches) {
        furlongs += stretchOf(network, id).furlongs;
    }
    return furlongs;
}

export function routeLocks(network: Network, route: Route): number {
    let locks = 0;
    for (const id of route.stretches) {
        locks += stretchOf(network, id).locks;
    }
    return locks;
}

export function cruisingMinutes(network: Network, route: Route): number {
    // Rounded up once for the whole route, not leg by leg, so a route of short stretches is not overstated.
    const moving = Math.ceil((routeFurlongs(network, route) * MINUTES_PER_MILE) / FURLONGS_PER_MILE);
    return moving + routeLocks(network, route) * MINUTES_PER_LOCK;
}

export function formatDistance(furlongs: number): string {
    const miles = Math.floor(furlongs / FURLONGS_PER_MILE);
    const rest = furlongs % FURLONGS_PER_MILE;
    if (miles === 0) {
        return `${rest}f`;
    }
    return rest === 0 ? `${miles}m` : `${miles}m ${rest}f`;
}

/** The line for the notice board in the office. */
export function describe(network: Network, notice: Notice): string {
    const stretch = stretchOf(network, notice.stretch);
    let state = "closed";
    if (notice.kind === "restriction") {
        state = `passage ${clock(notice.passFrom)} to ${clock(notice.passTo)}`;
    }
    let line = `${notice.ref} ${stretch.name}: ${state} from day ${notice.from}`;
    if (notice.to === OPEN_ENDED) {
        line += " until further notice";
    }
    return `${line} (${CAUSE_WORDS[notice.cause]})`;
}

/**
 * The minute a boat that sets off at `setOff` is through the route, waiting at each restriction for its time.
 * NOT_TODAY when it cannot be done within the day.
 */
export function throughBy(network: Network, register: Register, route: Route, day: number, setOff: number): number {
    let minute = setOff;
    for (const leg of legsOf(network, route)) {
        const [opens, shuts] = passage(register, leg.stretch, day);
        minute = Math.max(minute, opens);
        // A boat that is in before the stretch shuts is let through.
        if (minute >= shuts) {
            return NOT_TODAY;
        }
        minute += leg.minutes;
    }
    return minute <= DAY_MINUTES ? minute : NOT_TODAY;
}

/**
 * The quickest way from the route's start to its end that uses no closed stretch, or null when there is none.
 * An open route is its own way round.
 */
export function wayRound(network: Network, register: Register, route: Route, day: number): Route | null {
    const goal = endOf(network, route);
    if (routeOpen(register, route, day)) {
        return { start: route.start, stretches: [...route.stretches] };
    }
    const reached = new Map<string, { minutes: number; via: string[] }>();
    reached.set(route.start, { minutes: 0, via: [] });
    const settled = new Set<string>();
    for (;;) {
        // The network is a few dozen junctions, so a plain scan for the nearest one is enough.
        let here: string | undefined;
        let least = 0;
        for (const [junction, reach] of reached) {
            if (!settled.has(junction) && (here === undefined || reach.minutes < least)) {
                here = junction;
                least = reach.minutes;
            }
        }
        if (here === undefined) {
            return null;
        }
        const via = reached.get(here)?.via ?? [];
        if (here === goal) {
            return { start: route.start, stretches: via };
        }
        settled.add(here);
        for (const stretch of network) {
            const next = farEnd(stretch, here);
            if (next === "" || settled.has(next) || isClosed(register, stretch.id, day)) {
                continue;
            }
            const minutes = least + legMinutes(stretch);
            const known = reached.get(next);
            if (known === undefined || minutes < known.minutes) {
                reached.set(next, { minutes, via: [...via, stretch.id] });
            }
        }
    }
}

/** How much longer the way round takes than the route as booked. NOT_TODAY when there is no way round. */
export function extraMinutes(network: Network, register: Register, route: Route, day: number): number {
    const round = wayRound(network, register, route, day);
    if (round === null) {
        return NOT_TODAY;
    }
    return Math.max(0, cruisingMinutes(network, round) - cruisingMinutes(network, route));
}

export function daysLost(network: Network, register: Register, route: Route, startDay: number, nights: number): number {
    let lost = 0;
    // A hire of n nights has n cruising days: the boat is handed back on the last morning.
    for (let day = startDay; day < startDay + nights; day++) {
        if (wayRound(network, register, route, day) === null) {
            lost++;
        }
    }
    return lost;
}

export function allowance(dayRate: number, lost: number): number {
    if (lost <= 1) {
        return 0;
    }
    return Math.floor((dayRate * (lost - 1) * ALLOWANCE_PERCENT) / 100);
}

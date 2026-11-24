// The tidal lock below the yard: when it can be passed, and when a boat should set off to meet it.
// Every time is in minutes from midnight of the day being planned. Heights and depths are in centimetres.

export interface HighWater {
    at: number;
    /** Above chart datum. */
    height: number;
}

export interface LockWindow {
    opens: number;
    closes: number;
    /** Water over the sill at the top of the tide. */
    depth: number;
}

export interface Departure {
    leave: number;
    enter: number;
    clear: number;
    /** Minutes the boat is kept at the yard after it is ready. */
    held: number;
}

export const DAY = 1440;
export const SILL = 310;

const LOCKING = 12;
const KEEL_MARGIN = 25;
const MAX_BEFORE = 150;
const MAX_AFTER = 110;
const KEEPER_FROM = 360;
const KEEPER_UNTIL = 1200;
const DUES_PER_METRE = 85;

function pad(n: number): string {
    return n < 10 ? `0${n}` : String(n);
}

export function clock(at: number): string {
    if (at < 0 || at >= DAY) return "--:--";
    return `${pad(Math.floor(at / 60))}:${pad(at % 60)}`;
}

/** The window one high water gives, or null when the tide never covers the sill deeply enough to work the lock. */
export function windowFor(tide: HighWater): LockWindow | null {
    const depth = tide.height - SILL;
    if (depth < KEEL_MARGIN) return null;
    // The flood makes slowly and the ebb runs off fast, so more of the window lies before high water than after.
    const before = Math.min(MAX_BEFORE, depth * 2);
    const after = Math.min(MAX_AFTER, Math.floor(depth * 1.5));
    return { opens: Math.max(0, tide.at - before), closes: Math.min(DAY, tide.at + after), depth };
}

/** The day's windows in the order they open. The tide table may come in any order. */
export function windowsFor(tides: HighWater[]): LockWindow[] {
    const out: LockWindow[] = [];
    let before = -1;
    // By opening and not by high water: a big tide can open the lock before a small one that comes ahead of it.
    const found = tides.map((tide) => windowFor(tide)).filter((w): w is LockWindow => w !== null);
    for (const next of found.sort((a, b) => a.opens - b.opens)) {
        const last = out[out.length - 1];
        const meets = next.opens <= before;
        before = next.closes;
        if (last !== undefined && meets) {
            // The keeper does not shut the gates between two windows that meet.
            last.closes = Math.max(last.closes, next.closes);
            last.depth = Math.max(last.depth, next.depth);
        } else {
            out.push(next);
        }
    }
    return out;
}

export function isOpen(windows: LockWindow[], at: number): boolean {
    return windows.some((w) => at >= w.opens && at < w.closes);
}

export function fits(window: LockWindow, draught: number): boolean {
    return window.depth - draught >= KEEL_MARGIN;
}

/** The windows a boat drawing `draught` can use. The list is new, and the windows in it are the same objects. */
export function deepEnough(windows: LockWindow[], draught: number): LockWindow[] {
    return windows.filter((w) => fits(w, draught));
}

/** The first minute, from `at` on, at which a boat can go into the lock. The windows are in the order they open. */
export function nextEntry(windows: LockWindow[], at: number): number {
    for (const window of windows) {
        const entry = Math.max(at, window.opens);
        // The boat must be out of the chamber as the gates shut.
        if (entry + LOCKING <= window.closes) return entry;
    }
    // Nothing is left today. DAY and not -1, so a caller that takes the earlier of two times needs no special case.
    return DAY;
}

/** The latest a boat can leave the yard and still get through this window. Below zero means the day before. */
export function lastLeave(window: LockWindow, cruise: number): number {
    return window.closes - LOCKING - cruise;
}

/** How many minutes a boat at the lock at `at` can still let pass before it must go in. */
export function spare(windows: LockWindow[], at: number): number {
    for (const w of windows) {
        if (at >= w.opens && at < w.closes) return Math.max(0, w.closes - LOCKING - at);
    }
    // Shut, which a caller treats as too late.
    return 0;
}

/** One line of the board at the lock gate: when the lock opens, and the last time a boat is taken in. */
export function boardLine(window: LockWindow): string {
    return `${clock(window.opens)} to ${clock(window.closes - LOCKING)}, ${window.depth} cm over the sill`;
}

/** What one passage costs, in pence, for a boat `length` metres long. */
export function lockDues(length: number, enter: number): number {
    // Charged by the whole metre, and a part of a metre counts as one.
    const base = Math.ceil(length) * DUES_PER_METRE;
    // Outside the keeper's hours a relief keeper is called out, which costs half as much again.
    const staffed = enter >= KEEPER_FROM && enter < KEEPER_UNTIL;
    return staffed ? base : base + Math.floor(base / 2);
}

/** Takes the lock out of use from `from` up to `to`, for the keeper's break or a repair. */
export function closeFor(windows: LockWindow[], from: number, to: number): number {
    let lost = 0;
    // Backwards, because a window cut in two puts one more in the list.
    for (let i = windows.length - 1; i >= 0; i--) {
        const window = windows[i];
        const start = Math.max(from, window.opens);
        const end = Math.min(to, window.closes);
        if (start >= end) continue;
        lost += end - start;
        const pieces: LockWindow[] = [];
        if (start - window.opens >= LOCKING) pieces.push({ ...window, closes: start });
        else lost += start - window.opens;
        if (window.closes - end >= LOCKING) pieces.push({ ...window, opens: end });
        else lost += window.closes - end;
        windows.splice(i, 1, ...pieces);
    }
    return lost;
}

/** Plans the run down to the lock for a boat that is ready at `ready` and takes `cruise` minutes to reach it. */
export function planDeparture(windows: LockWindow[], ready: number, cruise: number): Departure {
    const entry = nextEntry(windows, ready + cruise);
    // A boat waits at the yard and not on the lock landing, so it leaves late enough to arrive as it can go in.
    const leave = entry - cruise;
    return { leave, enter: entry, clear: entry + LOCKING, held: leave - ready };
}

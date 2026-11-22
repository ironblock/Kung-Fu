// What src/stoppages.ts does now, pinned case by case. A task's check calls `unchanged` and skips only the cases
// its change must alter.
import { describe, expect, it } from "vitest";
import type { Cause, Network, Notice, Register, Route } from "../src/stoppages";
import { copyOf } from "./helpers";

type Mod = typeof import("../src/stoppages");

/** Five junctions and six stretches. Minutes by leg: s1 114, s2 12, s3 80, s4 45, s5 84, s6 7. */
export function network(): Network {
    return [
        { id: "s1", name: "Hollin Flight", ends: ["Arlow", "Bexby"], furlongs: 13, locks: 7 },
        { id: "s2", name: "Marrow Cut", ends: ["Bexby", "Cawdle"], furlongs: 5, locks: 0 },
        { id: "s3", name: "Tolland Level", ends: ["Arlow", "Cawdle"], furlongs: 30, locks: 1 },
        { id: "s4", name: "Withy Arm", ends: ["Cawdle", "Dunmere"], furlongs: 9, locks: 2 },
        { id: "s5", name: "Pennel Loop", ends: ["Bexby", "Dunmere"], furlongs: 21, locks: 3 },
        { id: "s6", name: "Garth Branch", ends: ["Dunmere", "Estwick"], furlongs: 3, locks: 0 },
    ];
}

/** Arlow to Dunmere by Bexby and Cawdle: 27 furlongs, 9 locks. */
export function booked(): Route {
    return { start: "Arlow", stretches: ["s1", "s2", "s4"] };
}

export function closure(ref: string, stretch: string, from: number, to: number, cause: Cause = "works"): Notice {
    return { ref, stretch, kind: "closure", cause, from, to, passFrom: 0, passTo: 0 };
}

/** A restriction for low water that lets boats in from `passFrom` up to `passTo`. */
export function restriction(
    ref: string,
    stretch: string,
    from: number,
    to: number,
    passFrom: number,
    passTo: number,
): Notice {
    return { ref, stretch, kind: "restriction", cause: "water", from, to, passFrom, passTo };
}

/** A register with the notices issued in the order given, so the last one is the newest. */
export function registerOf(mod: Mod, ...notices: Notice[]): Register {
    const register = mod.newRegister();
    for (const notice of notices) {
        mod.issue(register, notice);
    }
    return register;
}

export function refs(notices: Notice[]): string[] {
    return notices.map((notice) => notice.ref);
}

export function unchanged(mod: Mod, skip: string[] = []): void {
    const cases: Array<[string, () => void]> = [];
    const pin = (name: string, run: () => void): void => {
        if (cases.some(([known]) => known === name)) {
            throw new Error(`two cases are called "${name}"`);
        }
        cases.push([name, run]);
    };

    // ---------------------------------------------------------------------------------------- the constants

    pin("constants: the values that stand for none", () => {
        expect(mod.OPEN_ENDED).toBe(-1);
        expect(mod.NO_BLOCK).toBe(-1);
        expect(mod.NOT_TODAY).toBe(-1);
    });

    // ------------------------------------------------------------------------------------------ the register

    pin("newRegister: an empty register, a new one each time", () => {
        const one = mod.newRegister();
        expect(one).toEqual({ notices: [] });
        expect(mod.newRegister()).not.toBe(one);
        expect(mod.newRegister().notices).not.toBe(one.notices);
    });

    pin("newRegister: two registers share nothing", () => {
        const one = mod.newRegister();
        const other = mod.newRegister();
        mod.issue(one, closure("N1", "s1", 10, 20));
        expect(refs(one.notices)).toEqual(["N1"]);
        expect(other.notices).toEqual([]);
        expect(mod.isClosed(other, "s1", 12)).toBe(false);
    });

    pin("issue: the newest notice goes on top", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), closure("N2", "s2", 5, 8), closure("N3", "s1", 1, 2));
        expect(refs(register.notices)).toEqual(["N3", "N2", "N1"]);
    });

    pin("issue: keeps the notice it was given, not a copy", () => {
        const register = mod.newRegister();
        const notice = closure("N1", "s1", 10, 20);
        const before = copyOf(notice);
        expect(mod.issue(register, notice)).toBeUndefined();
        expect(register.notices[0]).toBe(notice);
        expect(notice).toEqual(before);
    });

    pin("issue: a notice issued again under its reference replaces the old one and goes on top", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), closure("N2", "s2", 5, 8), closure("N3", "s4", 1, 2));
        const again = closure("N1", "s1", 12, 30);
        mod.issue(register, again);
        expect(refs(register.notices)).toEqual(["N1", "N3", "N2"]);
        expect(register.notices[0]).toBe(again);
    });

    pin("issue: a notice must cover at least one day", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20));
        expect(() => mod.issue(register, closure("N2", "s1", 30, 30))).toThrow(RangeError);
        expect(() => mod.issue(register, closure("N3", "s1", 30, 29))).toThrow(RangeError);
        expect(() => mod.issue(register, restriction("N4", "s1", 30, 30, 600, 700))).toThrow(RangeError);
        expect(refs(register.notices)).toEqual(["N1"]);
        mod.issue(register, closure("N5", "s1", 30, 31));
        expect(refs(register.notices)).toEqual(["N5", "N1"]);
    });

    pin("issue: an open-ended notice is taken, whatever its first day", () => {
        const register = mod.newRegister();
        mod.issue(register, closure("N1", "s1", 30, mod.OPEN_ENDED));
        mod.issue(register, closure("N2", "s1", 0, mod.OPEN_ENDED));
        mod.issue(register, closure("N3", "s1", -5, mod.OPEN_ENDED));
        expect(refs(register.notices)).toEqual(["N3", "N2", "N1"]);
    });

    pin("issue: a dated notice is taken whatever its first day, so long as it covers a day", () => {
        const register = mod.newRegister();
        mod.issue(register, closure("N1", "s1", -5, 3));
        mod.issue(register, closure("N2", "s2", -10, -3));
        mod.issue(register, restriction("N3", "s4", -1, 0, 600, 700));
        expect(refs(register.notices)).toEqual(["N3", "N2", "N1"]);
        expect(() => mod.issue(register, closure("N4", "s1", -5, -5))).toThrow(RangeError);
    });

    pin("issue: a restriction must let something through, and a closure need not", () => {
        const register = mod.newRegister();
        expect(() => mod.issue(register, restriction("N1", "s2", 5, 9, 600, 600))).toThrow(RangeError);
        expect(() => mod.issue(register, restriction("N2", "s2", 5, 9, 600, 599))).toThrow(RangeError);
        expect(register.notices).toEqual([]);
        mod.issue(register, restriction("N3", "s2", 5, 9, 600, 601));
        mod.issue(register, closure("N4", "s2", 5, 9));
        expect(refs(register.notices)).toEqual(["N4", "N3"]);
    });

    pin("issue: a refused reissue leaves the old notice where it was", () => {
        const register = registerOf(
            mod,
            closure("N1", "s1", 10, 20),
            restriction("N3", "s4", 5, 9, 600, 700),
            closure("N2", "s2", 5, 8),
        );
        expect(() => mod.issue(register, closure("N1", "s1", 10, 10))).toThrow(RangeError);
        // Refused for its times, not for its days.
        expect(() => mod.issue(register, restriction("N3", "s4", 5, 9, 700, 700))).toThrow(RangeError);
        expect(register.notices).toEqual([
            closure("N2", "s2", 5, 8),
            restriction("N3", "s4", 5, 9, 600, 700),
            closure("N1", "s1", 10, 20),
        ]);
    });

    pin("issue: a notice issued again for another stretch still replaces the old one", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20));
        const again = closure("N1", "s2", 10, 20);
        mod.issue(register, again);
        expect(register.notices).toEqual([closure("N1", "s2", 10, 20)]);
        expect(register.notices[0]).toBe(again);
        expect(mod.isClosed(register, "s1", 12)).toBe(false);
        expect(mod.isClosed(register, "s2", 12)).toBe(true);
    });

    pin("lift: the stretch is open again on the day of the lift", () => {
        const notice = closure("N1", "s1", 10, 20);
        const register = registerOf(mod, closure("N0", "s2", 1, 50), notice);
        expect(mod.lift(register, "N1", 14)).toBe(true);
        expect(notice.to).toBe(14);
        expect(mod.isClosed(register, "s1", 13)).toBe(true);
        expect(mod.isClosed(register, "s1", 14)).toBe(false);
        expect(register.notices).toEqual([closure("N1", "s1", 10, 14), closure("N0", "s2", 1, 50)]);
    });

    pin("lift: an open-ended notice gets its end", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, mod.OPEN_ENDED));
        expect(mod.lift(register, "N1", 300)).toBe(true);
        expect(register.notices).toEqual([closure("N1", "s1", 10, 300)]);
    });

    pin("lift: a second lift may bring the end earlier, never later", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20));
        expect(mod.lift(register, "N1", 19)).toBe(true);
        expect(register.notices[0].to).toBe(19);
        expect(mod.lift(register, "N1", 11)).toBe(true);
        expect(register.notices[0].to).toBe(11);
        expect(mod.lift(register, "N1", 15)).toBe(false);
        expect(register.notices[0].to).toBe(11);
    });

    pin("lift: a notice that is over by the day is left alone", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20));
        expect(mod.lift(register, "N1", 20)).toBe(false);
        expect(mod.lift(register, "N1", 25)).toBe(false);
        expect(register.notices).toEqual([closure("N1", "s1", 10, 20)]);
    });

    pin("lift: an unknown reference changes nothing", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20));
        expect(mod.lift(register, "N9", 12)).toBe(false);
        expect(mod.lift(register, "s1", 12)).toBe(false);
        expect(register.notices).toEqual([closure("N1", "s1", 10, 20)]);
    });

    pin("lift: before the first day the notice stays on the register and closes nothing", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), closure("N2", "s2", 1, 50));
        expect(mod.lift(register, "N1", 4)).toBe(true);
        expect(register.notices).toEqual([closure("N2", "s2", 1, 50), closure("N1", "s1", 10, 10)]);
        for (const day of [4, 9, 10, 11, 19]) {
            expect(mod.isClosed(register, "s1", day)).toBe(false);
        }
    });

    pin("lift: on the first day the notice stays on the register and closes nothing", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, mod.OPEN_ENDED));
        expect(mod.lift(register, "N1", 10)).toBe(true);
        expect(register.notices).toEqual([closure("N1", "s1", 10, 10)]);
        expect(mod.isClosed(register, "s1", 10)).toBe(false);
    });

    pin("prune: drops the notices that are over by the day and counts them", () => {
        const register = registerOf(
            mod,
            closure("N1", "s1", 10, 20),
            closure("N2", "s2", 5, 21),
            closure("N3", "s4", 1, mod.OPEN_ENDED),
            closure("N4", "s5", 1, 3),
            restriction("N5", "s6", 19, 22, 600, 700),
        );
        const list = register.notices;
        expect(mod.prune(register, 20)).toBe(2);
        expect(refs(register.notices)).toEqual(["N5", "N3", "N2"]);
        expect(register.notices).toBe(list);
    });

    pin("prune: a notice that reopens the next day is kept, and one not begun is kept", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), closure("N2", "s2", 40, 45));
        expect(mod.prune(register, 19)).toBe(0);
        expect(refs(register.notices)).toEqual(["N2", "N1"]);
        expect(mod.prune(register, 45)).toBe(2);
        expect(register.notices).toEqual([]);
        expect(mod.prune(register, 45)).toBe(0);
    });

    pin("prune: a notice lifted before it began is kept until its first day", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), closure("N2", "s2", 1, 50));
        mod.lift(register, "N1", 4);
        expect(mod.prune(register, 4)).toBe(0);
        expect(mod.prune(register, 9)).toBe(0);
        expect(refs(register.notices)).toEqual(["N2", "N1"]);
        expect(mod.prune(register, 10)).toBe(1);
        expect(refs(register.notices)).toEqual(["N2"]);
    });

    pin("prune: a notice whose days are all below zero is over by day 0", () => {
        const register = registerOf(mod, closure("N1", "s1", -10, -3), closure("N2", "s2", -10, mod.OPEN_ENDED));
        expect(mod.prune(register, -4)).toBe(0);
        expect(mod.prune(register, 0)).toBe(1);
        expect(refs(register.notices)).toEqual(["N2"]);
    });

    // ---------------------------------------------------------------------------------------- notices by day

    pin("inForce: from the first day up to the day before the stretch reopens", () => {
        const notice = closure("N1", "s1", 10, 20);
        expect([9, 10, 11, 19, 20, 21].map((day) => mod.inForce(notice, day))).toEqual([false, true, true, true, false, false]);
    });

    pin("inForce: a one-day notice, and an open-ended one", () => {
        const one = closure("N1", "s1", 10, 11);
        expect([9, 10, 11].map((day) => mod.inForce(one, day))).toEqual([false, true, false]);
        const open = restriction("N2", "s1", 10, mod.OPEN_ENDED, 600, 700);
        expect([-1, 9, 10, 5000].map((day) => mod.inForce(open, day))).toEqual([false, false, true, true]);
    });

    pin("inForce: a notice whose days are all below zero", () => {
        const notice = closure("N1", "s1", -10, -3);
        expect([-11, -10, -4, -3, -1, 0].map((day) => mod.inForce(notice, day))).toEqual(
            [false, true, true, false, false, false],
        );
    });

    pin("noticesFor: every notice for the stretch, newest first, in force or not", () => {
        const register = registerOf(
            mod,
            closure("N1", "s1", 10, 20),
            closure("N2", "s2", 5, 8),
            restriction("N3", "s1", 90, 95, 600, 700),
            closure("N4", "s1", 1, 2),
        );
        expect(refs(mod.noticesFor(register, "s1"))).toEqual(["N4", "N3", "N1"]);
        expect(refs(mod.noticesFor(register, "s2"))).toEqual(["N2"]);
        expect(mod.noticesFor(register, "s1")[2]).toBe(register.notices[3]);
    });

    pin("noticesFor: none for a stretch with no notice, and the register's list is not handed out", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20));
        expect(mod.noticesFor(register, "s4")).toEqual([]);
        expect(mod.noticesFor(register, "N1")).toEqual([]);
        expect(mod.noticesFor(register, "s1")).not.toBe(register.notices);
    });

    pin("noticeOn: the newest notice in force for the stretch", () => {
        const older = closure("N1", "s1", 10, 30);
        const newer = restriction("N2", "s1", 15, 20, 600, 700);
        const register = registerOf(mod, older, closure("N0", "s2", 1, 99), newer, closure("N3", "s1", 50, 60));
        expect(mod.noticeOn(register, "s1", 12)).toBe(older);
        expect(mod.noticeOn(register, "s1", 15)).toBe(newer);
        expect(mod.noticeOn(register, "s1", 19)).toBe(newer);
        expect(mod.noticeOn(register, "s1", 20)).toBe(older);
        expect(mod.noticeOn(register, "s1", 29)).toBe(older);
    });

    pin("noticeOn: undefined when nothing is in force", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 30));
        expect(mod.noticeOn(register, "s1", 9)).toBeUndefined();
        expect(mod.noticeOn(register, "s1", 30)).toBeUndefined();
        expect(mod.noticeOn(register, "s2", 12)).toBeUndefined();
        expect(mod.noticeOn(mod.newRegister(), "s1", 12)).toBeUndefined();
    });

    pin("overruled: the older notices for the stretch that share a day, newest first", () => {
        const register = registerOf(
            mod,
            closure("N1", "s1", 10, 20),
            closure("N2", "s1", 30, 40),
            closure("N3", "s2", 1, 99),
            closure("N4", "s1", 18, mod.OPEN_ENDED),
            closure("N5", "s1", 19, 31),
            closure("N6", "s1", 19, 31),
        );
        expect(refs(mod.overruled(register, register.notices[1]))).toEqual(["N4", "N2", "N1"]);
        // The notice is found on the register by its reference, so a copy of it is weighed the same way.
        expect(refs(mod.overruled(register, copyOf(register.notices[1])))).toEqual(["N4", "N2", "N1"]);
        expect(refs(mod.overruled(register, register.notices[2]))).toEqual(["N2", "N1"]);
        expect(refs(mod.overruled(register, register.notices[4]))).toEqual([]);
        expect(refs(mod.overruled(register, register.notices[5]))).toEqual([]);
    });

    pin("overruled: notices that only touch share no day", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), closure("N2", "s1", 30, 40), closure("N3", "s1", 20, 30));
        expect(mod.overruled(register, register.notices[0])).toEqual([]);
        mod.issue(register, closure("N4", "s1", 19, 31));
        expect(refs(mod.overruled(register, register.notices[0]))).toEqual(["N3", "N2", "N1"]);
    });

    pin("overruled: a notice lifted before it began is weighed by its first day and its end", () => {
        const register = registerOf(
            mod,
            closure("N0", "s1", 30, 40),
            closure("N1", "s1", 5, 20),
            closure("N2", "s1", 10, 20),
        );
        mod.lift(register, "N2", 4);
        // N2's first day and its end are now both day 10, which N1 runs over and N0 does not.
        expect(refs(mod.overruled(register, register.notices[0]))).toEqual(["N1"]);
    });

    pin("overruled: a notice not yet issued is weighed against the whole register", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), closure("N2", "s1", 30, mod.OPEN_ENDED));
        expect(refs(mod.overruled(register, closure("N9", "s1", 15, 16)))).toEqual(["N1"]);
        expect(refs(mod.overruled(register, closure("N9", "s1", 500, mod.OPEN_ENDED)))).toEqual(["N2"]);
        expect(refs(mod.overruled(register, closure("N9", "s1", 0, mod.OPEN_ENDED)))).toEqual(["N2", "N1"]);
        expect(refs(mod.overruled(register, closure("N9", "s2", 0, mod.OPEN_ENDED)))).toEqual([]);
    });

    pin("isClosed: a closure in force closes, a restriction does not", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), restriction("N2", "s2", 10, 20, 600, 700));
        expect([9, 10, 19, 20].map((day) => mod.isClosed(register, "s1", day))).toEqual([false, true, true, false]);
        expect([9, 10, 19, 20].map((day) => mod.isClosed(register, "s2", day))).toEqual([false, false, false, false]);
        expect(mod.isClosed(register, "s4", 12)).toBe(false);
    });

    pin("isClosed: only the newest notice in force counts", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 30), restriction("N2", "s1", 15, 20, 600, 700));
        expect([14, 15, 19, 20].map((day) => mod.isClosed(register, "s1", day))).toEqual([true, false, false, true]);
        const other = registerOf(mod, restriction("N1", "s1", 10, 30, 600, 700), closure("N2", "s1", 15, 20));
        expect([14, 15, 19, 20].map((day) => mod.isClosed(other, "s1", day))).toEqual([false, true, true, false]);
    });

    pin("passage: all day when free, no time when closed, the notice's times when restricted", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), restriction("N2", "s2", 10, 20, 570, 900));
        expect(mod.passage(register, "s4", 12)).toEqual([0, 1440]);
        expect(mod.passage(register, "s1", 12)).toEqual([0, 0]);
        expect(mod.passage(register, "s2", 12)).toEqual([570, 900]);
        // A closure's own two times count for nothing.
        mod.issue(register, { ...closure("N3", "s5", 10, 20), passFrom: 600, passTo: 700 });
        expect(mod.passage(register, "s5", 12)).toEqual([0, 0]);
        expect(mod.canPass(register, "s5", 12, 650)).toBe(false);
    });

    pin("passage: follows the newest notice in force on the day", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 30), restriction("N2", "s1", 15, 20, 480, 1020));
        expect(mod.passage(register, "s1", 14)).toEqual([0, 0]);
        expect(mod.passage(register, "s1", 15)).toEqual([480, 1020]);
        expect(mod.passage(register, "s1", 20)).toEqual([0, 0]);
        expect(mod.passage(register, "s1", 30)).toEqual([0, 1440]);
    });

    pin("canPass: a boat may enter from the first minute up to the minute before the stretch shuts", () => {
        const register = registerOf(mod, restriction("N1", "s2", 10, 20, 570, 900));
        expect([569, 570, 571, 899, 900, 901].map((minute) => mod.canPass(register, "s2", 12, minute))).toEqual(
            [false, true, true, true, false, false],
        );
    });

    pin("canPass: any minute of the day on a free stretch, none on a closed one", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20));
        expect([0, 720, 1439, 1440].map((minute) => mod.canPass(register, "s4", 12, minute))).toEqual([true, true, true, false]);
        expect([0, 720, 1439].map((minute) => mod.canPass(register, "s1", 12, minute))).toEqual([false, false, false]);
        expect(mod.canPass(register, "s1", 20, 0)).toBe(true);
    });

    // ---------------------------------------------------------------------------------- a route and the days

    pin("firstBlock: the place in the route of the first closed stretch", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 20), closure("N2", "s2", 12, 14));
        expect(mod.firstBlock(register, booked(), 10)).toBe(2);
        expect(mod.firstBlock(register, booked(), 12)).toBe(1);
        expect(mod.firstBlock(register, booked(), 14)).toBe(2);
        expect(mod.firstBlock(register, { start: "Cawdle", stretches: ["s4"] }, 12)).toBe(0);
    });

    pin("firstBlock: NO_BLOCK when no stretch is closed, and a restriction is no block", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 20), restriction("N2", "s1", 1, 99, 600, 700));
        expect(mod.firstBlock(register, booked(), 20)).toBe(-1);
        expect(mod.firstBlock(register, booked(), 9)).toBe(mod.NO_BLOCK);
        expect(mod.firstBlock(register, { start: "Arlow", stretches: [] }, 12)).toBe(-1);
        expect(mod.firstBlock(register, { start: "Arlow", stretches: ["s1", "s5"] }, 12)).toBe(-1);
    });

    pin("routeOpen: shut while any stretch is closed", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 20), closure("N2", "s2", 30, 31));
        expect([9, 10, 19, 20, 30, 31].map((day) => mod.routeOpen(register, booked(), day))).toEqual(
            [true, false, false, true, false, true],
        );
    });

    pin("routeOpen: restrictions and notices off the route do not shut it", () => {
        const register = registerOf(mod, restriction("N1", "s1", 1, 99, 600, 700), closure("N2", "s5", 1, 99));
        expect(mod.routeOpen(register, booked(), 12)).toBe(true);
        expect(mod.routeOpen(register, { start: "Arlow", stretches: [] }, 12)).toBe(true);
        expect(mod.routeOpen(register, { start: "Arlow", stretches: ["s1", "s5"] }, 12)).toBe(false);
    });

    pin("noticesAlong: the notice in force for each stretch, in route order", () => {
        const register = registerOf(
            mod,
            closure("N1", "s4", 10, 20),
            restriction("N2", "s1", 1, 99, 600, 700),
            closure("N3", "s5", 1, 99),
            closure("N4", "s1", 12, 13),
            closure("N5", "s2", 40, 50),
        );
        expect(refs(mod.noticesAlong(register, booked(), 11))).toEqual(["N2", "N1"]);
        expect(refs(mod.noticesAlong(register, booked(), 12))).toEqual(["N4", "N1"]);
        expect(refs(mod.noticesAlong(register, booked(), 45))).toEqual(["N2", "N5"]);
        expect(mod.noticesAlong(register, booked(), 100)).toEqual([]);
    });

    pin("noticesAlong: a stretch cruised twice is told once", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 20), restriction("N2", "s2", 1, 99, 600, 700));
        const outAndBack: Route = { start: "Bexby", stretches: ["s2", "s4", "s4", "s2"] };
        expect(refs(mod.noticesAlong(register, outAndBack, 11))).toEqual(["N2", "N1"]);
        expect(mod.noticesAlong(register, outAndBack, 11)[1]).toBe(register.notices[1]);
    });

    pin("reopens: the day itself when the stretch is not closed", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), restriction("N2", "s2", 1, 99, 600, 700));
        expect(mod.reopens(register, "s1", 9)).toBe(9);
        expect(mod.reopens(register, "s1", 20)).toBe(20);
        expect(mod.reopens(register, "s2", 12)).toBe(12);
        expect(mod.reopens(register, "s4", 12)).toBe(12);
    });

    pin("reopens: the day a closure ends, and OPEN_ENDED when it has no end", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), closure("N2", "s2", 5, mod.OPEN_ENDED));
        expect(mod.reopens(register, "s1", 10)).toBe(20);
        expect(mod.reopens(register, "s1", 19)).toBe(20);
        expect(mod.reopens(register, "s2", 5)).toBe(-1);
        expect(mod.reopens(register, "s2", 4)).toBe(4);
    });

    pin("reopens: looks on through closures that run into each other", () => {
        const register = registerOf(
            mod,
            closure("N1", "s1", 100, 120),
            closure("N2", "s1", 105, 110),
            closure("N3", "s1", 120, 125),
            restriction("N4", "s1", 125, 130, 600, 700),
            closure("N5", "s1", 126, 128),
        );
        expect(mod.reopens(register, "s1", 106)).toBe(125);
        expect(mod.reopens(register, "s1", 126)).toBe(128);
        mod.issue(register, closure("N6", "s1", 124, mod.OPEN_ENDED));
        expect(mod.reopens(register, "s1", 106)).toBe(mod.OPEN_ENDED);
    });

    pin("nextOpenDay: the day itself when the route is open", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 20), restriction("N2", "s1", 1, 99, 600, 700));
        expect(mod.nextOpenDay(register, booked(), 9)).toBe(9);
        expect(mod.nextOpenDay(register, booked(), 20)).toBe(20);
        expect(mod.nextOpenDay(register, { start: "Arlow", stretches: [] }, 12)).toBe(12);
    });

    pin("nextOpenDay: the first day on which every stretch is open at once", () => {
        const register = registerOf(
            mod,
            closure("N1", "s1", 100, 110),
            closure("N2", "s2", 105, 112),
            closure("N3", "s1", 111, 114),
            closure("N4", "s4", 300, 301),
        );
        expect(mod.nextOpenDay(register, booked(), 100)).toBe(114);
        expect(mod.nextOpenDay(register, booked(), 112)).toBe(114);
        expect(mod.nextOpenDay(register, { start: "Arlow", stretches: ["s1"] }, 100)).toBe(110);
        expect(mod.nextOpenDay(register, booked(), 300)).toBe(301);
    });

    pin("nextOpenDay: OPEN_ENDED when a stretch has no known reopening", () => {
        const register = registerOf(mod, closure("N1", "s1", 100, 110), closure("N2", "s4", 109, mod.OPEN_ENDED));
        expect(mod.nextOpenDay(register, booked(), 100)).toBe(-1);
        expect(mod.nextOpenDay(register, booked(), 109)).toBe(mod.OPEN_ENDED);
        expect(mod.nextOpenDay(register, { start: "Arlow", stretches: ["s1", "s2"] }, 100)).toBe(110);
    });

    pin("tally: the notices in force on the day, by kind", () => {
        const register = registerOf(
            mod,
            closure("N1", "s1", 10, 20),
            closure("N2", "s2", 5, mod.OPEN_ENDED),
            restriction("N3", "s4", 12, 13, 600, 700),
            restriction("N4", "s5", 12, mod.OPEN_ENDED, 600, 700),
            closure("N5", "s1", 11, 14),
        );
        expect(mod.tally(register, 12)).toEqual({ closures: 3, restrictions: 2, openEnded: 2 });
        expect(mod.tally(register, 13)).toEqual({ closures: 3, restrictions: 1, openEnded: 2 });
        expect(mod.tally(register, 20)).toEqual({ closures: 1, restrictions: 1, openEnded: 2 });
    });

    pin("tally: a notice that ended before day 0 is not open-ended", () => {
        const register = registerOf(
            mod,
            closure("N1", "s1", -10, -3),
            restriction("N2", "s2", -10, mod.OPEN_ENDED, 600, 700),
        );
        expect(mod.tally(register, -5)).toEqual({ closures: 1, restrictions: 1, openEnded: 1 });
        expect(mod.tally(register, -3)).toEqual({ closures: 0, restrictions: 1, openEnded: 1 });
    });

    pin("tally: nothing in force", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), closure("N2", "s2", 5, mod.OPEN_ENDED));
        expect(mod.tally(register, 4)).toEqual({ closures: 0, restrictions: 0, openEnded: 0 });
        expect(mod.tally(mod.newRegister(), 12)).toEqual({ closures: 0, restrictions: 0, openEnded: 0 });
    });

    // ----------------------------------------------------------------------------------- lengths and minutes

    pin("legsOf: where each leg enters and leaves, and its minutes rounded up", () => {
        expect(mod.legsOf(network(), booked())).toEqual([
            { stretch: "s1", enters: "Arlow", leaves: "Bexby", minutes: 114 },
            { stretch: "s2", enters: "Bexby", leaves: "Cawdle", minutes: 12 },
            { stretch: "s4", enters: "Cawdle", leaves: "Dunmere", minutes: 45 },
        ]);
    });

    pin("legsOf: a stretch is cruised either way, and an empty route has no legs", () => {
        expect(mod.legsOf(network(), { start: "Estwick", stretches: ["s6", "s5", "s2", "s3"] })).toEqual([
            { stretch: "s6", enters: "Estwick", leaves: "Dunmere", minutes: 7 },
            { stretch: "s5", enters: "Dunmere", leaves: "Bexby", minutes: 84 },
            { stretch: "s2", enters: "Bexby", leaves: "Cawdle", minutes: 12 },
            { stretch: "s3", enters: "Cawdle", leaves: "Arlow", minutes: 80 },
        ]);
        expect(mod.legsOf(network(), { start: "Arlow", stretches: [] })).toEqual([]);
    });

    pin("legsOf: a stretch that does not meet the last one, or is not on the network, is an error", () => {
        expect(() => mod.legsOf(network(), { start: "Arlow", stretches: ["s1", "s4"] })).toThrow(RangeError);
        expect(() => mod.legsOf(network(), { start: "Cawdle", stretches: ["s1"] })).toThrow(RangeError);
        expect(() => mod.legsOf(network(), { start: "Arlow", stretches: ["s1", "s9"] })).toThrow(RangeError);
    });

    pin("endOf: the junction the route ends at", () => {
        expect(mod.endOf(network(), booked())).toBe("Dunmere");
        expect(mod.endOf(network(), { start: "Estwick", stretches: ["s6", "s5"] })).toBe("Bexby");
        expect(mod.endOf(network(), { start: "Arlow", stretches: ["s1", "s1"] })).toBe("Arlow");
    });

    pin("endOf: an empty route ends where it starts, and a broken one is an error", () => {
        expect(mod.endOf(network(), { start: "Cawdle", stretches: [] })).toBe("Cawdle");
        expect(() => mod.endOf(network(), { start: "Arlow", stretches: ["s4"] })).toThrow(RangeError);
    });

    pin("routeFurlongs: the sum over the stretches", () => {
        expect(mod.routeFurlongs(network(), booked())).toBe(27);
        expect(mod.routeFurlongs(network(), { start: "Arlow", stretches: ["s1", "s1"] })).toBe(26);
        expect(mod.routeFurlongs(network(), { start: "Arlow", stretches: [] })).toBe(0);
    });

    pin("routeFurlongs: counts each stretch, whether or not the route joins up", () => {
        expect(mod.routeFurlongs(network(), { start: "Arlow", stretches: ["s1", "s4"] })).toBe(22);
        expect(mod.routeFurlongs(network(), { start: "Estwick", stretches: ["s3"] })).toBe(30);
    });

    pin("routeFurlongs: a stretch not on the network is an error", () => {
        expect(() => mod.routeFurlongs(network(), { start: "Arlow", stretches: ["s1", "zz"] })).toThrow(RangeError);
        expect(() => mod.routeFurlongs([], booked())).toThrow(RangeError);
    });

    pin("routeLocks: the sum over the stretches", () => {
        expect(mod.routeLocks(network(), booked())).toBe(9);
        expect(mod.routeLocks(network(), { start: "Arlow", stretches: ["s3", "s2", "s5"] })).toBe(4);
        expect(mod.routeLocks(network(), { start: "Arlow", stretches: [] })).toBe(0);
    });

    pin("routeLocks: counts each stretch, whether or not the route joins up", () => {
        expect(mod.routeLocks(network(), { start: "Arlow", stretches: ["s1", "s4"] })).toBe(9);
        expect(mod.routeLocks(network(), { start: "Estwick", stretches: ["s3"] })).toBe(1);
    });

    pin("routeLocks: a stretch not on the network is an error", () => {
        expect(() => mod.routeLocks(network(), { start: "Arlow", stretches: ["zz"] })).toThrow(RangeError);
        expect(() => mod.routeLocks([], booked())).toThrow(RangeError);
    });

    pin("cruisingMinutes: eighteen minutes a mile and twelve a lock, rounded up once for the route", () => {
        // The legs alone come to 114 + 12 + 45 = 171.
        expect(mod.cruisingMinutes(network(), booked())).toBe(169);
        expect(mod.cruisingMinutes(network(), { start: "Arlow", stretches: ["s3", "s2", "s5"] })).toBe(174);
        expect(mod.cruisingMinutes(network(), { start: "Bexby", stretches: ["s2", "s2"] })).toBe(23);
    });

    pin("cruisingMinutes: one stretch, and none", () => {
        // 13 furlongs are 29 and a quarter minutes: a quarter is rounded up too.
        expect(mod.cruisingMinutes(network(), { start: "Arlow", stretches: ["s1"] })).toBe(114);
        expect(mod.cruisingMinutes(network(), { start: "Dunmere", stretches: ["s6"] })).toBe(7);
        expect(mod.cruisingMinutes(network(), { start: "Arlow", stretches: [] })).toBe(0);
    });

    pin("formatDistance: miles and furlongs", () => {
        expect(mod.formatDistance(13)).toBe("1m 5f");
        expect(mod.formatDistance(27)).toBe("3m 3f");
        expect(mod.formatDistance(87)).toBe("10m 7f");
    });

    pin("formatDistance: a part that is nothing is left out, but not both", () => {
        expect(mod.formatDistance(0)).toBe("0f");
        expect(mod.formatDistance(7)).toBe("7f");
        expect(mod.formatDistance(8)).toBe("1m");
        expect(mod.formatDistance(160)).toBe("20m");
    });

    // ----------------------------------------------------------------------------------- the notice board

    pin("describe: a dated closure", () => {
        expect(mod.describe(network(), closure("S-104", "s1", 120, 133))).toBe(
            "S-104 Hollin Flight: closed from day 120 (planned works)",
        );
        expect(mod.describe(network(), closure("S-7", "s6", 3, 4, "event"))).toBe(
            "S-7 Garth Branch: closed from day 3 (event on the water)",
        );
        expect(mod.describe(network(), closure("S-9", "s5", -10, -3, "breach"))).toBe(
            "S-9 Pennel Loop: closed from day -10 (breach)",
        );
    });

    pin("describe: a dated restriction", () => {
        expect(mod.describe(network(), restriction("S-221", "s2", 40, 61, 570, 900))).toBe(
            "S-221 Marrow Cut: passage 09:30 to 15:00 from day 40 (low water)",
        );
        expect(mod.describe(network(), restriction("S-222", "s4", 0, 2, 5, 1440))).toBe(
            "S-222 Withy Arm: passage 00:05 to 24:00 from day 0 (low water)",
        );
    });

    pin("describe: an open-ended notice, and each cause in words", () => {
        expect(mod.describe(network(), closure("S-300", "s4", 77, mod.OPEN_ENDED, "breach"))).toBe(
            "S-300 Withy Arm: closed from day 77 until further notice (breach)",
        );
        expect(mod.describe(network(), restriction("S-301", "s5", 8, mod.OPEN_ENDED, 420, 1125))).toBe(
            "S-301 Pennel Loop: passage 07:00 to 18:45 from day 8 until further notice (low water)",
        );
        const words: Array<[Cause, string]> = [
            ["works", "planned works"],
            ["breach", "breach"],
            ["water", "low water"],
            ["ice", "ice"],
            ["event", "event on the water"],
        ];
        for (const [cause, said] of words) {
            expect(mod.describe(network(), closure("S-1", "s3", 5, mod.OPEN_ENDED, cause))).toBe(
                `S-1 Tolland Level: closed from day 5 until further notice (${said})`,
            );
        }
    });

    pin("describe: a restriction's times from five past midnight to the end of the day, from day 0", () => {
        expect(mod.describe(network(), restriction("S-223", "s4", 0, mod.OPEN_ENDED, 5, 1440))).toBe(
            "S-223 Withy Arm: passage 00:05 to 24:00 from day 0 until further notice (low water)",
        );
        expect(mod.describe(network(), restriction("S-224", "s2", 0, mod.OPEN_ENDED, 0, 61))).toBe(
            "S-224 Marrow Cut: passage 00:00 to 01:01 from day 0 until further notice (low water)",
        );
    });

    pin("describe: a notice for a stretch not on the network is an error", () => {
        expect(() => mod.describe(network(), closure("S-9", "s9", 5, mod.OPEN_ENDED))).toThrow(RangeError);
        expect(() => mod.describe([], closure("S-9", "s1", 5, mod.OPEN_ENDED))).toThrow(RangeError);
    });

    // ------------------------------------------------------------------------------- through, and the way round

    pin("throughBy: the legs' minutes added to the setting-off time", () => {
        expect(mod.throughBy(network(), mod.newRegister(), booked(), 12, 480)).toBe(651);
        expect(mod.throughBy(network(), mod.newRegister(), { start: "Arlow", stretches: [] }, 12, 480)).toBe(480);
        expect(mod.throughBy(network(), mod.newRegister(), { start: "Dunmere", stretches: ["s6"] }, 12, 0)).toBe(7);
    });

    pin("throughBy: waits at a restriction for it to open, and is let through if in before it shuts", () => {
        const register = registerOf(mod, restriction("N1", "s2", 10, 20, 660, 900));
        expect(mod.throughBy(network(), register, booked(), 12, 480)).toBe(717);
        expect(mod.throughBy(network(), register, booked(), 12, 546)).toBe(717);
        expect(mod.throughBy(network(), register, booked(), 12, 547)).toBe(718);
        expect(mod.throughBy(network(), register, booked(), 12, 785)).toBe(956);
        expect(mod.throughBy(network(), register, booked(), 12, 786)).toBe(mod.NOT_TODAY);
        expect(mod.throughBy(network(), register, booked(), 20, 786)).toBe(957);
    });

    pin("throughBy: NOT_TODAY past a closure or past midnight", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 20));
        expect(mod.throughBy(network(), register, booked(), 12, 480)).toBe(-1);
        expect(mod.throughBy(network(), register, { start: "Arlow", stretches: ["s1", "s2"] }, 12, 480)).toBe(606);
        expect(mod.throughBy(network(), mod.newRegister(), booked(), 12, 1269)).toBe(1440);
        expect(mod.throughBy(network(), mod.newRegister(), booked(), 12, 1270)).toBe(-1);
    });

    pin("throughBy: a route whose stretches do not meet is an error, though nothing is shut", () => {
        const free = mod.newRegister();
        expect(() => mod.throughBy(network(), free, { start: "Arlow", stretches: ["s1", "s4"] }, 12, 480)).toThrow(RangeError);
        expect(() => mod.throughBy(network(), free, { start: "Cawdle", stretches: ["s1"] }, 12, 480)).toThrow(RangeError);
    });

    pin("throughBy: a restriction that opens too late in the day", () => {
        const register = registerOf(mod, restriction("N1", "s6", 10, 20, 1435, 1440));
        expect(mod.throughBy(network(), register, { start: "Dunmere", stretches: ["s6"] }, 12, 600)).toBe(-1);
        mod.issue(register, restriction("N2", "s6", 10, 20, 1433, 1440));
        expect(mod.throughBy(network(), register, { start: "Dunmere", stretches: ["s6"] }, 12, 600)).toBe(1440);
    });

    pin("wayRound: an open route is its own way round, as a copy", () => {
        const register = registerOf(mod, restriction("N1", "s2", 10, 20, 660, 900), closure("N2", "s5", 10, 20));
        const route = booked();
        const round = mod.wayRound(network(), register, route, 12);
        expect(round).toEqual({ start: "Arlow", stretches: ["s1", "s2", "s4"] });
        expect(round).not.toBe(route);
        expect(round?.stretches).not.toBe(route.stretches);
        expect(route).toEqual(booked());
    });

    pin("wayRound: the quickest way that uses no closed stretch", () => {
        const first = registerOf(mod, closure("N1", "s2", 10, 20));
        expect(mod.wayRound(network(), first, booked(), 12)).toEqual({ start: "Arlow", stretches: ["s3", "s4"] });
        const last = registerOf(mod, closure("N1", "s4", 10, 20));
        expect(mod.wayRound(network(), last, booked(), 12)).toEqual({ start: "Arlow", stretches: ["s3", "s2", "s5"] });
        mod.issue(last, closure("N2", "s3", 10, 20));
        expect(mod.wayRound(network(), last, booked(), 12)).toEqual({ start: "Arlow", stretches: ["s1", "s5"] });
        expect(mod.wayRound(network(), last, booked(), 20)).toEqual({ start: "Arlow", stretches: ["s1", "s2", "s4"] });
    });

    pin("wayRound: a restricted stretch may be used, and the way is by minutes, not by furlongs", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 20), restriction("N2", "s2", 10, 20, 660, 900));
        expect(mod.wayRound(network(), register, booked(), 12)?.stretches).toEqual(["s3", "s2", "s5"]);
        // By furlongs s1 then s5 is the shorter: 34 against 56. By minutes it is the longer: 198 against 176.
        mod.issue(register, closure("N3", "s2", 12, 13));
        expect(mod.wayRound(network(), register, booked(), 12)?.stretches).toEqual(["s1", "s5"]);
    });

    pin("wayRound: null when there is no way, and an error when the route is broken", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 20), closure("N2", "s5", 10, mod.OPEN_ENDED));
        expect(mod.wayRound(network(), register, booked(), 12)).toBeNull();
        expect(mod.wayRound(network(), register, booked(), 20)).toEqual(booked());
        const spur: Route = { start: "Dunmere", stretches: ["s6"] };
        expect(mod.wayRound(network(), registerOf(mod, closure("N3", "s6", 1, 9)), spur, 5)).toBeNull();
        expect(() => mod.wayRound(network(), register, { start: "Arlow", stretches: ["s4"] }, 12)).toThrow(RangeError);
    });

    pin("wayRound: a route whose stretches do not meet is an error, though it is open", () => {
        const free = mod.newRegister();
        expect(() => mod.wayRound(network(), free, { start: "Arlow", stretches: ["s4"] }, 12)).toThrow(RangeError);
        const off = registerOf(mod, closure("N1", "s5", 10, 20));
        expect(() => mod.wayRound(network(), off, { start: "Arlow", stretches: ["s1", "s4"] }, 12)).toThrow(RangeError);
    });

    pin("wayRound: a shut route that ends where it starts is gone round by staying put", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20));
        const there: Route = { start: "Arlow", stretches: ["s1", "s1"] };
        expect(mod.wayRound(network(), register, there, 12)).toEqual({ start: "Arlow", stretches: [] });
        expect(mod.wayRound(network(), register, there, 9)).toEqual({ start: "Arlow", stretches: ["s1", "s1"] });
        expect(mod.extraMinutes(network(), register, there, 12)).toBe(0);
        expect(mod.daysLost(network(), register, there, 9, 4)).toBe(0);
    });

    pin("wayRound: of two ways that take as long, the one found first in the network's order", () => {
        const twin: Network = [
            { id: "main", name: "Main Line", ends: ["Low", "High"], furlongs: 8, locks: 0 },
            { id: "east", name: "East Cut", ends: ["Low", "Mid"], furlongs: 8, locks: 1 },
            { id: "west", name: "West Cut", ends: ["Mid", "Low"], furlongs: 13, locks: 0 },
            { id: "top", name: "Top Pound", ends: ["High", "Mid"], furlongs: 4, locks: 0 },
        ];
        const register = registerOf(mod, closure("N1", "main", 1, 9));
        const route: Route = { start: "Low", stretches: ["main"] };
        expect(mod.wayRound(twin, register, route, 5)).toEqual({ start: "Low", stretches: ["east", "top"] });
        expect(mod.wayRound([twin[0], twin[2], twin[1], twin[3]], register, route, 5)?.stretches).toEqual(["west", "top"]);
    });

    pin("wayRound: a way found first gives way to a quicker one found later", () => {
        const fork: Network = [
            { id: "cut", name: "New Cut", ends: ["Low", "High"], furlongs: 2, locks: 0 },
            { id: "old", name: "Old Line", ends: ["Low", "High"], furlongs: 40, locks: 0 },
            { id: "rise", name: "Rise Pound", ends: ["Low", "Mid"], furlongs: 4, locks: 0 },
            { id: "fall", name: "Fall Pound", ends: ["Mid", "High"], furlongs: 4, locks: 0 },
        ];
        const register = registerOf(mod, closure("N1", "cut", 1, 9));
        const route: Route = { start: "Low", stretches: ["cut"] };
        expect(mod.wayRound(fork, register, route, 5)).toEqual({ start: "Low", stretches: ["rise", "fall"] });
        mod.issue(register, closure("N2", "fall", 5, 6));
        expect(mod.wayRound(fork, register, route, 5)).toEqual({ start: "Low", stretches: ["old"] });
    });

    pin("extraMinutes: how much longer the way round is, by the route's own rounding", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 20));
        // Round by s3, s2 and s5: 174 minutes against 169.
        expect(mod.extraMinutes(network(), register, booked(), 12)).toBe(5);
        mod.issue(register, closure("N2", "s3", 10, 20));
        // Round by s1 and s5: 34 furlongs and 10 locks, 197 minutes.
        expect(mod.extraMinutes(network(), register, booked(), 12)).toBe(28);
    });

    pin("extraMinutes: nothing when the route is open or the way round is quicker, NOT_TODAY when there is none", () => {
        const register = registerOf(mod, closure("N1", "s2", 10, 20));
        expect(mod.extraMinutes(network(), register, booked(), 9)).toBe(0);
        // Round by s3 and s4 takes 124 minutes, less than the route's 169.
        expect(mod.extraMinutes(network(), register, booked(), 12)).toBe(0);
        const shut = registerOf(mod, closure("N1", "s4", 10, 20), closure("N2", "s5", 10, 20));
        expect(mod.extraMinutes(network(), shut, booked(), 12)).toBe(-1);
        expect(mod.extraMinutes(network(), shut, booked(), 12)).toBe(mod.NOT_TODAY);
    });

    pin("daysLost: the cruising days with no way through, the hand-back morning not among them", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 13), closure("N2", "s5", 10, 13));
        expect(mod.daysLost(network(), register, booked(), 9, 4)).toBe(3);
        expect(mod.daysLost(network(), register, booked(), 7, 3)).toBe(0);
        expect(mod.daysLost(network(), register, booked(), 7, 4)).toBe(1);
        expect(mod.daysLost(network(), register, booked(), 12, 1)).toBe(1);
        expect(mod.daysLost(network(), register, booked(), 13, 5)).toBe(0);
    });

    pin("daysLost: a day with a way round is not lost, and no nights lose nothing", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 13), closure("N2", "s5", 11, 12));
        expect(mod.daysLost(network(), register, booked(), 9, 5)).toBe(1);
        expect(mod.daysLost(network(), register, booked(), 11, 0)).toBe(0);
        expect(mod.daysLost(network(), mod.newRegister(), booked(), 9, 5)).toBe(0);
    });

    pin("allowance: nothing for the first lost day", () => {
        expect(mod.allowance(12000, 0)).toBe(0);
        expect(mod.allowance(12000, 1)).toBe(0);
    });

    pin("allowance: sixty percent of the day rate for each day after the first, in whole pence rounded down", () => {
        expect(mod.allowance(12000, 2)).toBe(7200);
        expect(mod.allowance(12000, 5)).toBe(28800);
        expect(mod.allowance(9999, 2)).toBe(5999);
        expect(mod.allowance(9999, 4)).toBe(17998);
        expect(mod.allowance(1, 2)).toBe(0);
    });

    const unknown = skip.filter((name) => !cases.some(([known]) => known === name));
    if (unknown.length > 0) {
        throw new Error(`no case is called: ${unknown.join("; ")}`);
    }
    describe("stoppages: the rest is unchanged", () => {
        for (const [name, run] of cases) {
            if (!skip.includes(name)) {
                it(name, run);
            }
        }
    });
}

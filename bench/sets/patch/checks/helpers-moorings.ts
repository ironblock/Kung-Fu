// What src/moorings.ts does now, pinned case by case. A task's check calls `unchanged` and skips, by name,
// only the cases its change must alter.
import { describe, expect, it } from "vitest";
import { copyOf } from "./helpers";

type Boat = import("../src/moorings").Boat;
type Berth = import("../src/moorings").Berth;
type Move = import("../src/moorings").Move;

function boat(id: string, length: number, beam: number, name = id): Boat {
    return { id, name, length, beam };
}

function berth(id: string, length: number, beam: number, power = false, boatId = ""): Berth {
    return { id, length, beam, power, boatId };
}

/** Five berths in quay order. Q2 holds the boat "kestrel"; the rest are free. */
function quay(): Berth[] {
    return [
        berth("Q1", 1500, 230, false),
        berth("Q2", 1800, 230, true, "kestrel"),
        berth("Q3", 1800, 420, true),
        berth("Q4", 2200, 420, false),
        berth("Q5", 1800, 420, false),
    ];
}

const heron: Boat = { id: "heron", name: "Heron", length: 1440, beam: 208 };
const kestrel: Boat = { id: "kestrel", name: "Kestrel", length: 1700, beam: 208 };
const barge: Boat = { id: "barge", name: "Marsh Barge", length: 1700, beam: 380 };

function move(day: number, boatId: string, from: string, to: string): Move {
    return { day, boatId, from, to };
}

export function unchanged(mod: typeof import("../src/moorings"), skip: string[] = []): void {
    const cases: [string, () => void][] = [];
    const pin = (name: string, run: () => void): void => {
        cases.push([name, run]);
    };

    // ---- fits
    pin("fits: a boat with exactly its rope room to spare fits", () => {
        expect(mod.fits(boat("a", 1440, 208), berth("Q", 1500, 230))).toBe(true);
        expect(mod.fits(boat("a", 1000, 208), berth("Q", 1060, 230))).toBe(true);
    });
    pin("fits: one centimetre short of rope room does not fit", () => {
        expect(mod.fits(boat("a", 1441, 208), berth("Q", 1500, 230))).toBe(false);
        expect(mod.fits(boat("a", 1000, 208), berth("Q", 1059, 230))).toBe(false);
        expect(mod.fits(boat("a", 1500, 208), berth("Q", 1500, 230))).toBe(false);
    });
    pin("fits: a boat as wide as the berth does not fit", () => {
        expect(mod.fits(boat("a", 1000, 230), berth("Q", 1500, 230))).toBe(false);
        expect(mod.fits(boat("a", 1000, 231), berth("Q", 1500, 230))).toBe(false);
    });
    pin("fits: a boat one centimetre narrower than the berth fits", () => {
        expect(mod.fits(boat("a", 1000, 229), berth("Q", 1500, 230))).toBe(true);
        expect(mod.fits(boat("a", 1000, 419), berth("Q", 1500, 420))).toBe(true);
    });
    pin("fits: who lies at the berth and its power make no difference", () => {
        expect(mod.fits(heron, berth("Q", 1500, 230, true, "other"))).toBe(true);
        expect(mod.fits(heron, berth("Q", 1500, 230, false, "heron"))).toBe(true);
        expect(mod.fits(barge, berth("Q", 1500, 230, true, ""))).toBe(false);
    });
    pin("fits: changes neither the boat nor the berth", () => {
        const b = copyOf(heron);
        const q = berth("Q", 1500, 230, true, "x");
        mod.fits(b, q);
        expect(b).toEqual(heron);
        expect(q).toEqual(berth("Q", 1500, 230, true, "x"));
    });

    // ---- bestBerth
    pin("bestBerth: picks the shortest free berth the boat fits", () => {
        const berths = [berth("L", 2200, 420), berth("M", 1800, 420), berth("S", 1600, 420), berth("T", 1400, 420)];
        expect(mod.bestBerth(heron, berths)).toBe(berths[2]);
        expect(mod.bestBerth(boat("long", 1741, 208), berths)).toBe(berths[0]);
        expect(mod.bestBerth(boat("mid", 1740, 208), berths)).toBe(berths[1]);
    });
    pin("bestBerth: passes over a berth that is taken", () => {
        const berths = quay();
        expect(mod.bestBerth(boat("b", 1600, 208), berths)).toBe(berths[2]);
        berths[0].boatId = "someone";
        expect(mod.bestBerth(heron, berths)).toBe(berths[2]);
    });
    pin("bestBerth: of berths of one length, takes the one that comes first in the list", () => {
        const berths = [berth("X", 2200, 420), berth("Y", 1800, 420), berth("Z", 1800, 420)];
        expect(mod.bestBerth(barge, berths)).toBe(berths[1]);
        expect(mod.bestBerth(barge, [berths[2], berths[0], berths[1]])).toBe(berths[2]);
    });
    pin("bestBerth: goes by length alone, and takes the shorter berth though it is the wider", () => {
        const berths = [berth("L", 1800, 230), berth("S", 1600, 420)];
        expect(mod.bestBerth(heron, berths)).toBe(berths[1]);
    });
    pin("bestBerth: of berths of one length and unlike beams, still takes the one that comes first", () => {
        const berths = [berth("W", 1800, 420), berth("N", 1800, 230)];
        expect(mod.bestBerth(kestrel, berths)).toBe(berths[0]);
    });
    pin("bestBerth: the berth the boat lies at is taken, like any other", () => {
        const berths = quay();
        expect(mod.bestBerth(kestrel, berths)).toBe(berths[2]);
    });
    pin("bestBerth: weighs the beam as fits does", () => {
        const berths = quay();
        expect(mod.bestBerth(barge, berths)).toBe(berths[2]);
        expect(mod.bestBerth(boat("w", 1000, 230), berths)).toBe(berths[2]);
        expect(mod.bestBerth(boat("w", 1000, 229), berths)).toBe(berths[0]);
    });
    pin("bestBerth: gives undefined when no free berth fits", () => {
        expect(mod.bestBerth(heron, [])).toBeUndefined();
        expect(mod.bestBerth(boat("huge", 2141, 208), quay())).toBeUndefined();
        expect(mod.bestBerth(boat("fat", 1000, 420), quay())).toBeUndefined();
        expect(mod.bestBerth(heron, [berth("Q", 1500, 230, false, "x")])).toBeUndefined();
    });
    pin("bestBerth: changes no berth", () => {
        const berths = quay();
        mod.bestBerth(heron, berths);
        expect(berths).toEqual(quay());
    });

    // ---- berthOf
    pin("berthOf: finds the berth a boat lies at", () => {
        const berths = quay();
        expect(mod.berthOf(berths, "kestrel")).toBe(berths[1]);
        berths[4].boatId = "heron";
        expect(mod.berthOf(berths, "heron")).toBe(berths[4]);
    });
    pin("berthOf: gives undefined for a boat that is not on the quay", () => {
        expect(mod.berthOf(quay(), "heron")).toBeUndefined();
        expect(mod.berthOf([], "kestrel")).toBeUndefined();
    });
    pin("berthOf: the empty id finds no berth, though free berths hold it", () => {
        expect(mod.berthOf(quay(), "")).toBeUndefined();
    });
    pin("berthOf: changes neither the list nor any berth in it", () => {
        const berths = quay().reverse();
        mod.berthOf(berths, "kestrel");
        mod.berthOf(berths, "heron");
        expect(berths).toEqual(quay().reverse());
    });

    // ---- assign
    pin("assign: puts the boat at the berth and says true", () => {
        const berths = quay();
        const want = quay();
        want[0].boatId = "heron";
        expect(mod.assign(berths, heron, "Q1", 12, [])).toBe(true);
        expect(berths).toEqual(want);
    });
    pin("assign: writes the move at the front of the log, from off the quay", () => {
        const older = [move(11, "kestrel", "", "Q2"), move(3, "heron", "Q4", "")];
        const log = copyOf(older);
        mod.assign(quay(), heron, "Q3", 12, log);
        expect(log).toEqual([move(12, "heron", "", "Q3"), ...older]);
    });
    pin("assign: writes the move at the front of the log, whatever its day", () => {
        const log = [move(20, "kestrel", "", "Q2")];
        mod.assign(quay(), heron, "Q3", 12, log);
        expect(log).toEqual([move(12, "heron", "", "Q3"), move(20, "kestrel", "", "Q2")]);
    });
    pin("assign: refuses a berth that is taken, and changes nothing", () => {
        const berths = quay();
        const log = [move(11, "kestrel", "", "Q2")];
        expect(mod.assign(berths, heron, "Q2", 12, log)).toBe(false);
        expect(berths).toEqual(quay());
        expect(log).toEqual([move(11, "kestrel", "", "Q2")]);
    });
    pin("assign: refuses a berth the boat does not fit, and changes nothing", () => {
        const berths = quay();
        const log: Move[] = [];
        expect(mod.assign(berths, barge, "Q1", 12, log)).toBe(false);
        expect(mod.assign(berths, boat("a", 1441, 208), "Q1", 12, log)).toBe(false);
        expect(berths).toEqual(quay());
        expect(log).toEqual([]);
    });
    pin("assign: refuses a berth that is not in the list, and changes nothing", () => {
        const berths = quay();
        const log: Move[] = [];
        expect(mod.assign(berths, heron, "Q9", 12, log)).toBe(false);
        expect(mod.assign(berths, heron, "", 12, log)).toBe(false);
        expect(berths).toEqual(quay());
        expect(log).toEqual([]);
    });
    pin("assign: refuses a boat that lies at a berth already, and changes nothing", () => {
        const berths = quay();
        const log = [move(11, "kestrel", "", "Q2")];
        expect(mod.assign(berths, kestrel, "Q5", 12, log)).toBe(false);
        expect(mod.assign(berths, kestrel, "Q2", 12, log)).toBe(false);
        expect(berths).toEqual(quay());
        expect(log).toEqual([move(11, "kestrel", "", "Q2")]);
    });

    // ---- release
    pin("release: frees the boat's berth and gives the berth's id", () => {
        const berths = quay();
        berths[3].boatId = "heron";
        const want = quay();
        want[3].boatId = "heron";
        want[1].boatId = "";
        expect(mod.release(berths, "kestrel", 14, [])).toBe("Q2");
        expect(berths).toEqual(want);
    });
    pin("release: writes the move at the front of the log, to off the quay", () => {
        const older = [move(12, "heron", "", "Q3"), move(11, "kestrel", "", "Q2")];
        const log = copyOf(older);
        mod.release(quay(), "kestrel", 14, log);
        expect(log).toEqual([move(14, "kestrel", "Q2", ""), ...older]);
    });
    pin("release: writes the move at the front of the log, whatever its day", () => {
        const log = [move(20, "kestrel", "", "Q2")];
        mod.release(quay(), "kestrel", 12, log);
        expect(log).toEqual([move(12, "kestrel", "Q2", ""), move(20, "kestrel", "", "Q2")]);
    });
    pin("release: gives the empty id for a boat that is not on the quay, and changes nothing", () => {
        const berths = quay();
        const log = [move(11, "kestrel", "", "Q2")];
        expect(mod.release(berths, "heron", 14, log)).toBe("");
        expect(berths).toEqual(quay());
        expect(log).toEqual([move(11, "kestrel", "", "Q2")]);
    });
    pin("release: the empty boat id frees nothing and logs nothing", () => {
        const berths = quay();
        const log: Move[] = [];
        expect(mod.release(berths, "", 14, log)).toBe("");
        expect(berths).toEqual(quay());
        expect(log).toEqual([]);
    });

    // ---- shift
    pin("shift: moves the boat to the other berth and says true", () => {
        const berths = quay();
        const want = quay();
        want[1].boatId = "";
        want[4].boatId = "kestrel";
        expect(mod.shift(berths, kestrel, "Q5", 15, [])).toBe(true);
        expect(berths).toEqual(want);
    });
    pin("shift: leaves two entries in the log, off the quay and back on, the newer first", () => {
        const older = [move(11, "kestrel", "", "Q2")];
        const log = copyOf(older);
        mod.shift(quay(), kestrel, "Q5", 15, log);
        expect(log).toEqual([move(15, "kestrel", "", "Q5"), move(15, "kestrel", "Q2", ""), ...older]);
    });
    pin("shift: writes its two entries at the front of the log, whatever their day", () => {
        const older = [move(20, "heron", "", "Q1"), move(9, "kestrel", "", "Q2"), move(14, "heron", "Q4", "")];
        const log = copyOf(older);
        mod.shift(quay(), kestrel, "Q5", 15, log);
        expect(log).toEqual([move(15, "kestrel", "", "Q5"), move(15, "kestrel", "Q2", ""), ...older]);
    });
    pin("shift: refuses a berth that is taken, and changes nothing", () => {
        const berths = quay();
        berths[2].boatId = "heron";
        const before = copyOf(berths);
        const log = [move(11, "kestrel", "", "Q2")];
        expect(mod.shift(berths, kestrel, "Q3", 15, log)).toBe(false);
        expect(mod.shift(berths, kestrel, "Q2", 15, log)).toBe(false);
        expect(berths).toEqual(before);
        expect(log).toEqual([move(11, "kestrel", "", "Q2")]);
    });
    pin("shift: refuses a berth the boat does not fit or that is not in the list, and changes nothing", () => {
        const berths = quay();
        const log: Move[] = [];
        expect(mod.shift(berths, kestrel, "Q1", 15, log)).toBe(false);
        expect(mod.shift(berths, kestrel, "Q9", 15, log)).toBe(false);
        expect(berths).toEqual(quay());
        expect(log).toEqual([]);
    });
    pin("shift: refuses a boat that is not on the quay, and changes nothing", () => {
        const berths = quay();
        const log: Move[] = [];
        expect(mod.shift(berths, heron, "Q3", 15, log)).toBe(false);
        expect(berths).toEqual(quay());
        expect(log).toEqual([]);
    });

    // ---- lastMove
    pin("lastMove: gives the boat's entry nearest the front of the log", () => {
        const log = [move(9, "heron", "Q3", ""), move(8, "kestrel", "", "Q2"), move(5, "heron", "", "Q3")];
        expect(mod.lastMove(log, "heron")).toBe(log[0]);
        expect(mod.lastMove(log, "kestrel")).toBe(log[1]);
    });
    pin("lastMove: goes by place in the log and not by day", () => {
        const log = [move(4, "heron", "", "Q1"), move(9, "heron", "Q3", "")];
        expect(mod.lastMove(log, "heron")).toBe(log[0]);
    });
    pin("lastMove: gives undefined for a boat with no entry", () => {
        expect(mod.lastMove([], "heron")).toBeUndefined();
        expect(mod.lastMove([move(8, "kestrel", "", "Q2")], "heron")).toBeUndefined();
    });
    pin("lastMove: changes no entry of the log, nor their order", () => {
        const older = [move(4, "heron", "", "Q1"), move(9, "heron", "Q3", ""), move(6, "kestrel", "", "Q2")];
        const log = copyOf(older);
        mod.lastMove(log, "heron");
        mod.lastMove(log, "barge");
        expect(log).toEqual(older);
    });

    // ---- berthOn
    pin("berthOn: gives where the boat's latest move by that day took it", () => {
        const log = [move(9, "heron", "Q3", "Q4"), move(8, "kestrel", "", "Q2"), move(5, "heron", "", "Q3")];
        expect(mod.berthOn(log, "heron", 7)).toBe("Q3");
        expect(mod.berthOn(log, "heron", 20)).toBe("Q4");
        expect(mod.berthOn(log, "kestrel", 20)).toBe("Q2");
    });
    pin("berthOn: a move on the day itself counts", () => {
        const log = [move(9, "heron", "Q3", "Q4"), move(5, "heron", "", "Q3")];
        expect(mod.berthOn(log, "heron", 9)).toBe("Q4");
        expect(mod.berthOn(log, "heron", 8)).toBe("Q3");
        expect(mod.berthOn(log, "heron", 5)).toBe("Q3");
    });
    pin("berthOn: of two moves on one day, the one nearer the front of the log counts", () => {
        const log = [move(5, "heron", "Q3", "Q1"), move(5, "heron", "", "Q3")];
        expect(mod.berthOn(log, "heron", 5)).toBe("Q1");
        expect(mod.berthOn(log, "heron", 6)).toBe("Q1");
    });
    pin("berthOn: goes by place in the log and not by day", () => {
        const log = [move(4, "heron", "", "Q1"), move(9, "heron", "Q3", "")];
        expect(mod.berthOn(log, "heron", 20)).toBe("Q1");
    });
    pin("berthOn: gives the empty id before the boat's first move, after it left, and for a boat not in the log", () => {
        const log = [move(9, "heron", "Q3", ""), move(5, "heron", "", "Q3")];
        expect(mod.berthOn(log, "heron", 4)).toBe("");
        expect(mod.berthOn(log, "heron", 9)).toBe("");
        expect(mod.berthOn(log, "kestrel", 9)).toBe("");
        expect(mod.berthOn([], "heron", 9)).toBe("");
    });
    pin("berthOn: changes no entry of the log, nor their order", () => {
        const older = [move(4, "heron", "", "Q1"), move(9, "heron", "Q3", ""), move(6, "kestrel", "", "Q2")];
        const log = copyOf(older);
        mod.berthOn(log, "heron", 20);
        mod.berthOn(log, "kestrel", 5);
        expect(log).toEqual(older);
    });

    // ---- nightlyFee
    pin("nightlyFee: charges a narrow boat 45 pence for each started metre", () => {
        expect(mod.nightlyFee(boat("a", 1440, 208), false)).toBe(675);
        expect(mod.nightlyFee(boat("a", 1500, 208), false)).toBe(675);
        expect(mod.nightlyFee(boat("a", 1501, 208), false)).toBe(720);
        expect(mod.nightlyFee(boat("a", 1449, 208), false)).toBe(675);
    });
    pin("nightlyFee: charges a boat wider than 215 cm 70 pence for each started metre", () => {
        expect(mod.nightlyFee(boat("a", 1440, 215), false)).toBe(675);
        expect(mod.nightlyFee(boat("a", 1440, 216), false)).toBe(1050);
        expect(mod.nightlyFee(barge, false)).toBe(1190);
    });
    pin("nightlyFee: adds 250 pence a night for power", () => {
        expect(mod.nightlyFee(boat("a", 1440, 208), true)).toBe(925);
        expect(mod.nightlyFee(barge, true)).toBe(1440);
    });

    // ---- stayFee
    pin("stayFee: charges the day of arrival and not the day of leaving", () => {
        expect(mod.stayFee(heron, false, 10, 11)).toBe(675);
        expect(mod.stayFee(heron, false, 10, 13)).toBe(2025);
        expect(mod.stayFee(heron, true, 10, 13)).toBe(2775);
        expect(mod.stayFee(barge, false, 30, 36)).toBe(7140);
    });
    pin("stayFee: charges nothing when the stay has no night", () => {
        expect(mod.stayFee(heron, true, 10, 10)).toBe(0);
        expect(mod.stayFee(heron, true, 10, 8)).toBe(0);
    });
    pin("stayFee: six nights get no discount", () => {
        expect(mod.stayFee(heron, false, 10, 16)).toBe(4050);
        expect(mod.stayFee(heron, true, 10, 16)).toBe(5550);
    });
    pin("stayFee: seven nights get a tenth off the whole bill, rounded down", () => {
        expect(mod.stayFee(heron, false, 10, 17)).toBe(4253);
        expect(mod.stayFee(heron, true, 10, 17)).toBe(5828);
    });
    pin("stayFee: a longer stay gets a tenth off the whole bill, rounded down", () => {
        expect(mod.stayFee(heron, false, 10, 21)).toBe(6683);
        expect(mod.stayFee(heron, true, 0, 9)).toBe(7493);
        expect(mod.stayFee(barge, false, 3, 13)).toBe(10710);
    });

    // ---- quayLoad
    pin("quayLoad: is the taken share of the quay's length, not of its berths", () => {
        expect(mod.quayLoad(quay())).toBe(20);
        expect(mod.quayLoad([berth("a", 1000, 230, false, "x"), berth("b", 3000, 230)])).toBe(25);
        expect(mod.quayLoad([berth("a", 1000, 230), berth("b", 3000, 230, false, "x")])).toBe(75);
    });
    pin("quayLoad: rounds to the nearest whole percent, a half upward", () => {
        expect(mod.quayLoad([berth("a", 1000, 230, false, "x"), berth("b", 2000, 230)])).toBe(33);
        expect(mod.quayLoad([berth("a", 1000, 230), berth("b", 2000, 230, false, "x")])).toBe(67);
        expect(mod.quayLoad([berth("a", 1000, 230, false, "x"), berth("b", 7000, 230)])).toBe(13);
    });
    pin("quayLoad: is 0 for an empty quay or a list of no berths, and 100 for a full one", () => {
        expect(mod.quayLoad([])).toBe(0);
        expect(mod.quayLoad([berth("a", 1000, 230), berth("b", 2000, 230)])).toBe(0);
        expect(mod.quayLoad([berth("a", 1000, 230, false, "x"), berth("b", 2000, 230, true, "y")])).toBe(100);
    });
    pin("quayLoad: changes neither the list nor any berth in it", () => {
        const berths = quay();
        mod.quayLoad(berths);
        expect(berths).toEqual(quay());
    });

    // ---- boardLine
    pin("boardLine: shows a free berth with power", () => {
        expect(mod.boardLine(berth("Q3", 1800, 420, true), [heron])).toBe("Q3  18.00 m x 4.20 m  power  free");
    });
    pin("boardLine: shows a free berth without power", () => {
        expect(mod.boardLine(berth("Q1", 1505, 230, false), [])).toBe("Q1  15.05 m x 2.30 m  free");
        expect(mod.boardLine(berth("Q7", 995, 208, false), [])).toBe("Q7  9.95 m x 2.08 m  free");
    });
    pin("boardLine: shows the name of the boat that lies there", () => {
        const boats = [heron, kestrel, barge];
        expect(mod.boardLine(berth("Q2", 1800, 230, true, "kestrel"), boats)).toBe("Q2  18.00 m x 2.30 m  power  Kestrel");
        expect(mod.boardLine(berth("Q4", 2200, 420, false, "barge"), boats)).toBe("Q4  22.00 m x 4.20 m  Marsh Barge");
    });
    pin("boardLine: shows the id of a boat that is not among the boats given", () => {
        expect(mod.boardLine(berth("Q2", 1800, 230, false, "kestrel"), [heron])).toBe("Q2  18.00 m x 2.30 m  kestrel");
    });
    pin("boardLine: changes neither the berth nor the list of boats", () => {
        const q = berth("Q2", 1800, 230, true, "kestrel");
        const boats = [heron, kestrel, barge];
        mod.boardLine(q, boats);
        expect(q).toEqual(berth("Q2", 1800, 230, true, "kestrel"));
        expect(boats).toEqual([heron, kestrel, barge]);
    });

    const known = cases.map(([name]) => name);
    describe("moorings, as it was", () => {
        for (const name of skip.filter((s) => !known.includes(s))) {
            it(`skip names a case that is there: ${name}`, () => {
                expect(known).toContain(name);
            });
        }
        for (const [name, run] of cases) {
            if (!skip.includes(name)) it(name, run);
        }
    });
}

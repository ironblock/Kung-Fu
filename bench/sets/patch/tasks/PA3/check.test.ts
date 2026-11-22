import { describe, expect, it } from "vitest";
import * as mod from "../src/moorings";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-moorings";

type Boat = import("../src/moorings").Boat;
type Berth = import("../src/moorings").Berth;
type Move = import("../src/moorings").Move;

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

function move(day: number, boatId: string, from: string, to: string): Move {
    return { day, boatId, from, to };
}

describe("shift, logged as one move", () => {
    it("leaves one entry, from the old berth to the new, where the file's other moves go", () => {
        const berths = quay();
        const log = [move(9, "kestrel", "", "Q2"), move(4, "heron", "Q4", "")];
        mod.assign(berths, heron, "Q1", 11, log);
        expect(mod.shift(berths, kestrel, "Q5", 15, log)).toBe(true);
        expect(log).toEqual([
            move(15, "kestrel", "Q2", "Q5"),
            move(11, "heron", "", "Q1"),
            move(9, "kestrel", "", "Q2"),
            move(4, "heron", "Q4", ""),
        ]);
    });

    it("logs it there whatever the day, and leaves the older entries in their places", () => {
        const older = [move(20, "heron", "", "Q1"), move(9, "kestrel", "", "Q2"), move(14, "heron", "Q4", "")];
        const log = copyOf(older);
        expect(mod.shift(quay(), kestrel, "Q5", 15, log)).toBe(true);
        expect(log).toEqual([move(15, "kestrel", "Q2", "Q5"), ...older]);
    });

    it("adds exactly one entry to an empty log", () => {
        const log: Move[] = [];
        mod.shift(quay(), kestrel, "Q4", 21, log);
        expect(log).toEqual([move(21, "kestrel", "Q2", "Q4")]);
    });

    it("keeps the log in step with the moves made after it", () => {
        const berths = quay();
        const log: Move[] = [];
        mod.assign(berths, heron, "Q1", 11, log);
        mod.shift(berths, heron, "Q3", 12, log);
        mod.shift(berths, kestrel, "Q5", 12, log);
        mod.release(berths, "heron", 13, log);
        mod.shift(berths, kestrel, "Q3", 14, log);
        expect(log).toEqual([
            move(14, "kestrel", "Q5", "Q3"),
            move(13, "heron", "Q3", ""),
            move(12, "kestrel", "Q2", "Q5"),
            move(12, "heron", "Q1", "Q3"),
            move(11, "heron", "", "Q1"),
        ]);
    });

    it("is the boat's last move, and says where the boat lay that day", () => {
        const berths = quay();
        const log = [move(15, "kestrel", "", "Q2"), move(11, "heron", "", "Q1")];
        mod.shift(berths, kestrel, "Q5", 15, log);
        expect(mod.lastMove(log, "kestrel")).toEqual(move(15, "kestrel", "Q2", "Q5"));
        expect(mod.berthOn(log, "kestrel", 15)).toBe("Q5");
        expect(mod.berthOn(log, "kestrel", 30)).toBe("Q5");
        expect(mod.lastMove(log, "heron")).toEqual(move(11, "heron", "", "Q1"));
    });

    it("still moves the boat and says true", () => {
        const berths = quay();
        const want = quay();
        want[1].boatId = "";
        want[4].boatId = "kestrel";
        expect(mod.shift(berths, kestrel, "Q5", 15, [])).toBe(true);
        expect(berths).toEqual(want);
        expect(mod.berthOf(berths, "kestrel")).toBe(berths[4]);
    });

    it("leaves the log and the berths untouched when the berth is taken, too small or not there", () => {
        const berths = quay();
        berths[2].boatId = "heron";
        const before = copyOf(berths);
        const log = [move(12, "heron", "", "Q3"), move(9, "kestrel", "", "Q2")];
        const logBefore = copyOf(log);
        expect(mod.shift(berths, kestrel, "Q3", 15, log)).toBe(false);
        expect(mod.shift(berths, kestrel, "Q2", 15, log)).toBe(false);
        expect(mod.shift(berths, kestrel, "Q1", 15, log)).toBe(false);
        expect(mod.shift(berths, kestrel, "Q9", 15, log)).toBe(false);
        expect(log).toEqual(logBefore);
        expect(berths).toEqual(before);
    });

    it("leaves the log and the berths untouched when the boat is not on the quay", () => {
        const berths = quay();
        const log = [move(9, "kestrel", "", "Q2")];
        expect(mod.shift(berths, heron, "Q3", 15, log)).toBe(false);
        expect(log).toEqual([move(9, "kestrel", "", "Q2")]);
        expect(berths).toEqual(quay());
    });
});

unchanged(mod, [
    "shift: leaves two entries in the log, off the quay and back on, the newer first",
    "shift: writes its two entries at the front of the log, whatever their day",
]);

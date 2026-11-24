import { describe, expect, it } from "vitest";
import * as mod from "../src/moorings";
import { unchanged } from "./helpers-moorings";

type Boat = import("../src/moorings").Boat;
type Berth = import("../src/moorings").Berth;
type BerthsFor = (boat: Boat, berths: Berth[], needPower: boolean) => string[];

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

// Looked up at each call, so that a file without the function fails the case and not the load.
const berthsFor: BerthsFor = (...args) => (mod as unknown as { berthsFor: BerthsFor }).berthsFor(...args);

/** Six berths, not in order of length. E is taken. C, D, A and E have power. */
function mixed(): Berth[] {
    return [
        berth("A", 2200, 420, true),
        berth("B", 1800, 420, false),
        berth("C", 1500, 230, true),
        berth("D", 1800, 420, true),
        berth("E", 1600, 230, true, "someone"),
        berth("F", 1600, 420, false),
    ];
}

describe("berthsFor", () => {
    it("gives the ids of the free berths the boat fits, shortest first", () => {
        expect(berthsFor(heron, mixed(), false)).toEqual(["C", "F", "B", "D", "A"]);
    });

    it("leaves out a berth that is taken", () => {
        const berths = mixed();
        expect(berthsFor(heron, berths, false)).not.toContain("E");
        berths[2].boatId = "other";
        expect(berthsFor(heron, berths, false)).toEqual(["F", "B", "D", "A"]);
        expect(berthsFor(boat("k", 1700, 208), quay(), false)).toEqual(["Q3", "Q5", "Q4"]);
    });

    it("gives the same berths for a boat that lies at a berth already, and takes its berth as taken", () => {
        expect(berthsFor(kestrel, quay(), false)).toEqual(["Q3", "Q5", "Q4"]);
        expect(berthsFor(kestrel, quay(), true)).toEqual(["Q3"]);
    });

    it("goes by length alone, and puts a shorter berth first though it is the wider", () => {
        expect(berthsFor(heron, [berth("L", 1800, 230), berth("S", 1600, 420)], false)).toEqual(["S", "L"]);
    });

    it("keeps berths of one length in the order the list has them", () => {
        expect(berthsFor(barge, mixed(), false)).toEqual(["B", "D", "A"]);
        const turned = mixed().reverse();
        expect(berthsFor(barge, turned, false)).toEqual(["D", "B", "A"]);
        expect(berthsFor(heron, turned, false)).toEqual(["C", "F", "D", "B", "A"]);
        // one length, unlike beams: still the order of the list
        expect(berthsFor(heron, [berth("W", 1600, 420), berth("N", 1600, 230)], false)).toEqual(["W", "N"]);
    });

    it("fits the boat as fits does: rope room to the last centimetre, beam strictly narrower", () => {
        expect(berthsFor(boat("a", 1440, 208), mixed(), false)).toContain("C");
        expect(berthsFor(boat("a", 1441, 208), mixed(), false)).toEqual(["F", "B", "D", "A"]);
        expect(berthsFor(boat("a", 1000, 230), mixed(), false)).toEqual(["F", "B", "D", "A"]);
        expect(berthsFor(boat("a", 1000, 229), mixed(), false)).toEqual(["C", "F", "B", "D", "A"]);
        expect(berthsFor(boat("a", 1741, 208), mixed(), false)).toEqual(["A"]);
    });

    it("with needPower true, gives only berths that have power", () => {
        expect(berthsFor(heron, mixed(), true)).toEqual(["C", "D", "A"]);
        expect(berthsFor(barge, mixed(), true)).toEqual(["D", "A"]);
        expect(berthsFor(boat("k", 1700, 208), quay(), true)).toEqual(["Q3"]);
    });

    it("with needPower false, gives berths with power and without", () => {
        const got = berthsFor(heron, mixed(), false);
        expect(got).toContain("C");
        expect(got).toContain("F");
        expect(berthsFor(boat("a", 1441, 208), [berth("P", 1600, 230, true), berth("N", 1600, 230, false)], false))
            .toEqual(["P", "N"]);
    });

    it("gives an empty list when no berth will do", () => {
        expect(berthsFor(heron, [], false)).toEqual([]);
        expect(berthsFor(boat("huge", 2141, 208), mixed(), false)).toEqual([]);
        expect(berthsFor(boat("fat", 1000, 420), mixed(), true)).toEqual([]);
        expect(berthsFor(heron, [berth("N", 1600, 230, false)], true)).toEqual([]);
        expect(berthsFor(heron, [berth("T", 1600, 230, true, "x")], false)).toEqual([]);
    });

    it("changes neither the list nor any berth in it", () => {
        const berths = mixed();
        const same = [...berths];
        berthsFor(heron, berths, false);
        berthsFor(barge, berths, true);
        expect(berths).toEqual(mixed());
        berths.forEach((b, i) => expect(b).toBe(same[i]));
    });
});

unchanged(mod);

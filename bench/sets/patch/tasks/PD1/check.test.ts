import { describe, expect, it } from "vitest";
import * as mod from "../src/fuel";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-fuel";

type Entry = mod.Entry;
type Ledger = mod.Ledger;
type Usage = (ledger: Ledger, fromDay: number, toDay: number) => Array<[string, number]>;

// Read at the call, so that a file without the function fails each case and still loads.
const usageByBoat: Usage = (ledger, fromDay, toDay) => (mod as unknown as { usageByBoat: Usage }).usageByBoat(
    ledger, fromDay, toDay,
);

function entry(kind: Entry["kind"], boat: string, day: number, minute: number, volume: number): Entry {
    return { kind, day, minute, boat, volume };
}

/** Entries are given in the order they were entered. */
function ledgerOf(entered: Entry[]): Ledger {
    const ledger = mod.openLedger({ capacity: 20000, calibration: [[0, 0], [950, 19000]] }, 10, 4000);
    for (const one of entered) {
        mod.post(ledger, copyOf(one));
    }
    return ledger;
}

const WEEK: Entry[] = [
    entry("delivery", "", 10, 480, 12000),
    entry("draw", "Kestrel", 10, 545, 455),
    entry("draw", "Avocet", 11, 600, 380),
    entry("draw", "", 11, 610, 30),
    entry("draw", "Kestrel", 12, 450, 500),
    entry("adjust", "", 12, 1020, -125),
    entry("draw", "Avocet", 13, 555, 205),
    entry("draw", "Heron", 13, 600, 90),
    entry("draw", "Kestrel", 14, 700, 310),
];

describe("usageByBoat", () => {
    it("gives a pair for each boat with the sum of its draws, largest first", () => {
        expect(usageByBoat(ledgerOf(WEEK), 10, 15)).toEqual([["Kestrel", 1265], ["Avocet", 585], ["Heron", 90]]);
    });

    it("counts a draw on fromDay", () => {
        expect(usageByBoat(ledgerOf(WEEK), 13, 15)).toEqual([["Kestrel", 310], ["Avocet", 205], ["Heron", 90]]);
        expect(usageByBoat(ledgerOf(WEEK), 14, 15)).toEqual([["Kestrel", 310]]);
    });

    it("does not count a draw on toDay", () => {
        expect(usageByBoat(ledgerOf(WEEK), 10, 14)).toEqual([["Kestrel", 955], ["Avocet", 585], ["Heron", 90]]);
        expect(usageByBoat(ledgerOf(WEEK), 10, 13)).toEqual([["Kestrel", 955], ["Avocet", 380]]);
        expect(usageByBoat(ledgerOf(WEEK), 11, 12)).toEqual([["Avocet", 380]]);
    });

    it("leaves out the yard's own draws", () => {
        const ledger = ledgerOf([entry("draw", "", 11, 610, 900), entry("draw", "Heron", 11, 700, 40)]);
        expect(usageByBoat(ledger, 10, 15)).toEqual([["Heron", 40]]);
        expect(usageByBoat(ledgerOf([entry("draw", "", 11, 610, 900)]), 10, 15)).toEqual([]);
    });

    it("counts only entries whose kind is draw", () => {
        const ledger = ledgerOf([
            entry("draw", "Heron", 11, 700, 40),
            entry("adjust", "Heron", 11, 710, 25),
            entry("delivery", "Avocet", 12, 480, 3000),
            entry("draw", "Kestrel", 12, 500, 10),
        ]);
        expect(usageByBoat(ledger, 10, 15)).toEqual([["Heron", 40], ["Kestrel", 10]]);
    });

    it("puts boats with the same volume in name order", () => {
        const ledger = ledgerOf([
            entry("draw", "Merlin", 10, 500, 200),
            entry("draw", "Kestrel", 10, 510, 120),
            entry("draw", "Avocet", 11, 520, 200),
            entry("draw", "Heron", 11, 530, 300),
            entry("draw", "Kestrel", 12, 540, 80),
            entry("draw", "Dipper", 12, 550, 150),
        ]);
        expect(usageByBoat(ledger, 10, 15)).toEqual([
            ["Heron", 300], ["Avocet", 200], ["Kestrel", 200], ["Merlin", 200], ["Dipper", 150],
        ]);
    });

    it("puts names that begin alike in order by the whole name", () => {
        const ledger = ledgerOf([
            entry("draw", "Kite", 10, 500, 200),
            entry("draw", "Kestrel", 10, 510, 200),
            entry("draw", "Kingfisher", 10, 520, 200),
        ]);
        expect(usageByBoat(ledger, 10, 11)).toEqual([["Kestrel", 200], ["Kingfisher", 200], ["Kite", 200]]);
    });

    it("sorts by volume as a number, not as text", () => {
        const ledger = ledgerOf([
            entry("draw", "Avocet", 10, 500, 95),
            entry("draw", "Heron", 10, 510, 1000),
            entry("draw", "Kestrel", 10, 520, 200),
        ]);
        expect(usageByBoat(ledger, 10, 11)).toEqual([["Heron", 1000], ["Kestrel", 200], ["Avocet", 95]]);
    });

    it("goes by each draw's day, in whatever order the draws were entered", () => {
        const ledger = ledgerOf([
            entry("draw", "Kestrel", 14, 700, 310),
            entry("draw", "Avocet", 11, 600, 380),
            entry("draw", "Kestrel", 10, 545, 455),
            entry("draw", "Avocet", 15, 555, 205),
        ]);
        expect(usageByBoat(ledger, 10, 15)).toEqual([["Kestrel", 765], ["Avocet", 380]]);
    });

    it("gives an empty array when no boat drew in those days", () => {
        expect(usageByBoat(ledgerOf([]), 10, 15)).toEqual([]);
        expect(usageByBoat(ledgerOf(WEEK), 15, 30)).toEqual([]);
        expect(usageByBoat(ledgerOf(WEEK), 12, 12)).toEqual([]);
        expect(usageByBoat(ledgerOf([entry("delivery", "", 10, 480, 12000)]), 10, 15)).toEqual([]);
    });

    it("gives an empty array when toDay is before fromDay: no day is from one up to the other", () => {
        expect(usageByBoat(ledgerOf(WEEK), 15, 10)).toEqual([]);
        expect(usageByBoat(ledgerOf(WEEK), 13, 12)).toEqual([]);
    });

    it("changes nothing in the ledger", () => {
        const ledger = ledgerOf(WEEK);
        const before = copyOf(ledger);
        usageByBoat(ledger, 10, 15);
        expect(ledger).toEqual(before);
    });
});

unchanged(mod);

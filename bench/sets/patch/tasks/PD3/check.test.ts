import { describe, expect, it } from "vitest";
import * as mod from "../src/fuel";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-fuel";

type Entry = mod.Entry;
type Ledger = mod.Ledger;

function entry(kind: Entry["kind"], boat: string, day: number, minute: number, volume: number): Entry {
    return { kind, day, minute, boat, volume };
}

/** Entries are given in the order they were posted: the last one given was posted last. */
function ledgerOf(posted: Entry[]): Ledger {
    const ledger = mod.openLedger({ capacity: 20000, calibration: [[0, 0], [950, 19000]] }, 10, 4000);
    for (const one of posted) {
        mod.post(ledger, copyOf(one));
    }
    return ledger;
}

/** The ledger's entries in the order they were posted, as plain copies. The ledger keeps the newest first. */
function posted(ledger: Ledger): Entry[] {
    return copyOf(ledger.entries).reverse();
}

describe("recordDraw, joining a split draw", () => {
    it("adds to the same boat's draw of the same day when that was posted last", () => {
        const ledger = ledgerOf([entry("draw", "Kestrel", 11, 545, 455)]);
        const back = mod.recordDraw(ledger, "Kestrel", 11, 560, 100);
        expect(back).toEqual(entry("draw", "Kestrel", 11, 545, 555));
        expect(posted(ledger)).toEqual([entry("draw", "Kestrel", 11, 545, 555)]);
        expect(mod.stock(ledger)).toBe(3445);
    });

    it("adds to the very entry that was posted last and returns that one, not a copy or a new one", () => {
        const ledger = ledgerOf([entry("delivery", "", 10, 480, 12000), entry("draw", "Kestrel", 11, 545, 455)]);
        // The ledger keeps the newest first, so this is the entry posted last.
        const last = ledger.entries[0];
        const back = mod.recordDraw(ledger, "Kestrel", 11, 560, 100);
        expect(back).toBe(last);
        expect(ledger.entries[0]).toBe(last);
        expect(last).toEqual(entry("draw", "Kestrel", 11, 545, 555));
        // The entry an earlier call returned is the one a later call adds to.
        const fresh = ledgerOf([]);
        const first = mod.recordDraw(fresh, "Avocet", 12, 500, 380);
        const second = mod.recordDraw(fresh, "Avocet", 12, 530, 20);
        expect(second).toBe(first);
        expect(fresh.entries[0]).toBe(first);
        expect(first.volume).toBe(400);
    });

    it("joins whatever the two minutes are, and the entry keeps its own", () => {
        // The new part is timed before the entry it joins.
        const ledger = ledgerOf([entry("draw", "Avocet", 11, 900, 380), entry("draw", "Kestrel", 11, 560, 100)]);
        const back = mod.recordDraw(ledger, "Kestrel", 11, 545, 455);
        expect(back).toEqual(entry("draw", "Kestrel", 11, 560, 555));
        expect(posted(ledger)).toEqual([entry("draw", "Avocet", 11, 900, 380), entry("draw", "Kestrel", 11, 560, 555)]);
        // The new part is timed hours after it, on the same day.
        const long = ledgerOf([entry("draw", "Kestrel", 11, 480, 100)]);
        mod.recordDraw(long, "Kestrel", 11, 1020, 50);
        expect(posted(long)).toEqual([entry("draw", "Kestrel", 11, 480, 150)]);
    });

    it("joins a third part too", () => {
        const ledger = ledgerOf([]);
        mod.recordDraw(ledger, "Kestrel", 11, 545, 455);
        mod.recordDraw(ledger, "Kestrel", 11, 560, 100);
        const back = mod.recordDraw(ledger, "Kestrel", 11, 570, 45);
        expect(back).toEqual(entry("draw", "Kestrel", 11, 545, 600));
        expect(posted(ledger)).toEqual([entry("draw", "Kestrel", 11, 545, 600)]);
    });

    it("joins the entry posted last when older entries stand behind it", () => {
        const ledger = ledgerOf([
            entry("delivery", "", 10, 480, 12000),
            entry("draw", "Avocet", 11, 500, 380),
            entry("draw", "Kestrel", 11, 545, 455),
        ]);
        const back = mod.recordDraw(ledger, "Kestrel", 11, 560, 100);
        expect(back).toEqual(entry("draw", "Kestrel", 11, 545, 555));
        expect(posted(ledger)).toEqual([
            entry("delivery", "", 10, 480, 12000),
            entry("draw", "Avocet", 11, 500, 380),
            entry("draw", "Kestrel", 11, 545, 555),
        ]);
        expect(mod.stock(ledger)).toBe(15065);
    });

    it("posts a new entry when another boat's draw was posted last", () => {
        const ledger = ledgerOf([entry("draw", "Kestrel", 11, 545, 455), entry("draw", "Avocet", 11, 550, 380)]);
        const back = mod.recordDraw(ledger, "Kestrel", 11, 560, 100);
        expect(back).toEqual(entry("draw", "Kestrel", 11, 560, 100));
        expect(posted(ledger)).toEqual([
            entry("draw", "Kestrel", 11, 545, 455),
            entry("draw", "Avocet", 11, 550, 380),
            entry("draw", "Kestrel", 11, 560, 100),
        ]);
    });

    it("posts a new entry when a delivery was posted after the boat's draw", () => {
        const ledger = ledgerOf([entry("draw", "Kestrel", 11, 545, 455), entry("delivery", "", 11, 550, 3000)]);
        const back = mod.recordDraw(ledger, "Kestrel", 11, 560, 100);
        expect(back).toEqual(entry("draw", "Kestrel", 11, 560, 100));
        expect(posted(ledger)).toEqual([
            entry("draw", "Kestrel", 11, 545, 455),
            entry("delivery", "", 11, 550, 3000),
            entry("draw", "Kestrel", 11, 560, 100),
        ]);
    });

    it("posts a new entry when an adjustment was posted after the boat's draw", () => {
        const ledger = ledgerOf([entry("draw", "Kestrel", 11, 545, 455), entry("adjust", "", 11, 550, -20)]);
        mod.recordDraw(ledger, "Kestrel", 11, 560, 100);
        expect(posted(ledger)).toEqual([
            entry("draw", "Kestrel", 11, 545, 455),
            entry("adjust", "", 11, 550, -20),
            entry("draw", "Kestrel", 11, 560, 100),
        ]);
    });

    it("posts a new entry when the boat's last draw was on another day", () => {
        const ledger = ledgerOf([entry("draw", "Kestrel", 11, 545, 455)]);
        const back = mod.recordDraw(ledger, "Kestrel", 12, 545, 100);
        expect(back).toEqual(entry("draw", "Kestrel", 12, 545, 100));
        expect(posted(ledger)).toEqual([entry("draw", "Kestrel", 11, 545, 455), entry("draw", "Kestrel", 12, 545, 100)]);
    });

    it("goes by what was posted last, not by the latest day and minute", () => {
        // Avocet's draw was entered late: it is timed before Kestrel's and was posted after it.
        const ledger = ledgerOf([entry("draw", "Kestrel", 11, 545, 455), entry("draw", "Avocet", 11, 300, 380)]);
        mod.recordDraw(ledger, "Kestrel", 11, 560, 100);
        expect(posted(ledger)).toEqual([
            entry("draw", "Kestrel", 11, 545, 455),
            entry("draw", "Avocet", 11, 300, 380),
            entry("draw", "Kestrel", 11, 560, 100),
        ]);
        // And the other way round: the boat's own draw was posted last, though it is timed first.
        const other = ledgerOf([entry("draw", "Avocet", 11, 900, 380), entry("draw", "Kestrel", 11, 300, 455)]);
        mod.recordDraw(other, "Kestrel", 11, 560, 100);
        expect(posted(other)).toEqual([entry("draw", "Avocet", 11, 900, 380), entry("draw", "Kestrel", 11, 300, 555)]);
    });

    it("joins the boat's draw posted last though a delivery of that day was posted first", () => {
        const ledger = ledgerOf([entry("delivery", "", 11, 480, 3000), entry("draw", "Kestrel", 11, 545, 455)]);
        const back = mod.recordDraw(ledger, "Kestrel", 11, 560, 100);
        expect(back).toEqual(entry("draw", "Kestrel", 11, 545, 555));
        expect(posted(ledger)).toEqual([entry("delivery", "", 11, 480, 3000), entry("draw", "Kestrel", 11, 545, 555)]);
    });

    it("does not join the yard's draw to a delivery, and joins it to the yard's own draw", () => {
        const ledger = ledgerOf([entry("delivery", "", 11, 480, 3000)]);
        const first = mod.recordDraw(ledger, mod.YARD, 11, 500, 30);
        expect(first).toEqual(entry("draw", "", 11, 500, 30));
        const second = mod.recordDraw(ledger, mod.YARD, 11, 520, 20);
        expect(second).toEqual(entry("draw", "", 11, 500, 50));
        expect(posted(ledger)).toEqual([entry("delivery", "", 11, 480, 3000), entry("draw", "", 11, 500, 50)]);
        expect(mod.stock(ledger)).toBe(6950);
    });

    it("posts a new entry in a ledger with no entries", () => {
        const ledger = ledgerOf([]);
        const back = mod.recordDraw(ledger, "Kestrel", 11, 545, 455);
        expect(back).toEqual(entry("draw", "Kestrel", 11, 545, 455));
        expect(posted(ledger)).toEqual([entry("draw", "Kestrel", 11, 545, 455)]);
    });

    it("still refuses a bad volume, and changes nothing then", () => {
        const ledger = ledgerOf([entry("draw", "Kestrel", 11, 545, 455)]);
        for (const volume of [0, -5, 0.5]) {
            expect(() => mod.recordDraw(ledger, "Kestrel", 11, 560, volume)).toThrow(RangeError);
        }
        expect(posted(ledger)).toEqual([entry("draw", "Kestrel", 11, 545, 455)]);
    });
});

unchanged(mod, ["recordDraw posts each draw as an entry of its own"]);

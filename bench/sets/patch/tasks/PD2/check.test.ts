import { describe, expect, it } from "vitest";
import * as mod from "../src/fuel";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-fuel";

type Entry = mod.Entry;
type Ledger = mod.Ledger;

function draw(boat: string, day: number, minute: number, volume: number): Entry {
    return { kind: "draw", day, minute, boat, volume };
}

/** Entries are given in the order they were entered. */
function ledgerOf(entered: Entry[]): Ledger {
    const ledger = mod.openLedger({ capacity: 20000, calibration: [[0, 0], [950, 19000]] }, 10, 4000);
    for (const one of entered) {
        mod.post(ledger, copyOf(one));
    }
    return ledger;
}

const PRICES = [{ fromDay: 1, price: 1429 }, { fromDay: 12, price: 1455 }];

/** What a call throws, as the name of its class and its words whole. Nothing when the call does not throw. */
function refusal(call: () => unknown): { name: string; message: string } | undefined {
    try {
        call();
    } catch (error) {
        return { name: (error as Error).name, message: (error as Error).message };
    }
    return undefined;
}

describe("boatBill, one line a day", () => {
    it("joins two draws of one day into one line, charged once on their sum", () => {
        const ledger = ledgerOf([draw("Kestrel", 10, 500, 5), draw("Kestrel", 10, 900, 5)]);
        expect(mod.boatBill(ledger, PRICES, "Kestrel", 10, 11)).toEqual({
            boat: "Kestrel",
            lines: [{ day: 10, volume: 10, price: 1429, pence: 143 }],
            volume: 10,
            total: 143,
        });
    });

    it("joins three draws of one day, and rounds up once", () => {
        const ledger = ledgerOf([
            draw("Kestrel", 12, 500, 101), draw("Kestrel", 12, 600, 102), draw("Kestrel", 12, 700, 103),
        ]);
        // 306 dl at 145.5p a litre is 4452.3p. Rounded up draw by draw it would be 1470 + 1485 + 1499 = 4454.
        expect(mod.boatBill(ledger, PRICES, "Kestrel", 10, 15)).toEqual({
            boat: "Kestrel",
            lines: [{ day: 12, volume: 306, price: 1455, pence: 4453 }],
            volume: 306,
            total: 4453,
        });
    });

    it("keeps a line for each day, each at its day's price", () => {
        const ledger = ledgerOf([
            draw("Kestrel", 10, 545, 455),
            draw("Kestrel", 11, 500, 7),
            draw("Kestrel", 11, 800, 7),
            draw("Kestrel", 12, 450, 500),
            draw("Kestrel", 12, 990, 1),
        ]);
        expect(mod.boatBill(ledger, PRICES, "Kestrel", 10, 15)).toEqual({
            boat: "Kestrel",
            lines: [
                { day: 10, volume: 455, price: 1429, pence: 6502 },
                { day: 11, volume: 14, price: 1429, pence: 201 },
                { day: 12, volume: 501, price: 1455, pence: 7290 },
            ],
            volume: 970,
            total: 13993,
        });
    });

    it("puts the lines in day order when a draw was entered late", () => {
        const ledger = ledgerOf([draw("Kestrel", 12, 500, 100), draw("Kestrel", 10, 900, 200)]);
        expect(mod.boatBill(ledger, PRICES, "Kestrel", 10, 15)).toEqual({
            boat: "Kestrel",
            lines: [
                { day: 10, volume: 200, price: 1429, pence: 2858 },
                { day: 12, volume: 100, price: 1455, pence: 1455 },
            ],
            volume: 300,
            total: 4313,
        });
    });

    it("puts the days in order as numbers, not as text", () => {
        const ledger = ledgerOf([
            draw("Kestrel", 100, 500, 100), draw("Kestrel", 99, 500, 200), draw("Kestrel", 100, 900, 60),
        ]);
        expect(mod.boatBill(ledger, PRICES, "Kestrel", 10, 200)).toEqual({
            boat: "Kestrel",
            lines: [
                { day: 99, volume: 200, price: 1455, pence: 2910 },
                { day: 100, volume: 160, price: 1455, pence: 2328 },
            ],
            volume: 360,
            total: 5238,
        });
    });

    it("joins a day's draws that were not entered one after the other", () => {
        const ledger = ledgerOf([
            draw("Kestrel", 13, 500, 5),
            draw("Kestrel", 11, 600, 5),
            draw("Kestrel", 14, 700, 40),
            draw("Kestrel", 11, 900, 5),
            draw("Kestrel", 13, 950, 5),
        ]);
        expect(mod.boatBill(ledger, PRICES, "Kestrel", 10, 15)).toEqual({
            boat: "Kestrel",
            lines: [
                { day: 11, volume: 10, price: 1429, pence: 143 },
                { day: 13, volume: 10, price: 1455, pence: 146 },
                { day: 14, volume: 40, price: 1455, pence: 582 },
            ],
            volume: 60,
            total: 871,
        });
    });

    it("does not join another boat's draws of the same day", () => {
        const ledger = ledgerOf([
            draw("Kestrel", 10, 500, 5), draw("Avocet", 10, 600, 300), draw("", 10, 650, 30), draw("Kestrel", 10, 900, 5),
        ]);
        expect(mod.boatBill(ledger, PRICES, "Kestrel", 10, 11)).toEqual({
            boat: "Kestrel",
            lines: [{ day: 10, volume: 10, price: 1429, pence: 143 }],
            volume: 10,
            total: 143,
        });
        expect(mod.boatBill(ledger, PRICES, "Avocet", 10, 11).lines).toEqual([
            { day: 10, volume: 300, price: 1429, pence: 4287 },
        ]);
    });

    it("still counts the first day and not the last", () => {
        const ledger = ledgerOf([
            draw("Kestrel", 10, 500, 5),
            draw("Kestrel", 11, 500, 5),
            draw("Kestrel", 11, 900, 5),
            draw("Kestrel", 12, 500, 5),
            draw("Kestrel", 12, 900, 5),
        ]);
        expect(mod.boatBill(ledger, PRICES, "Kestrel", 11, 12)).toEqual({
            boat: "Kestrel",
            lines: [{ day: 11, volume: 10, price: 1429, pence: 143 }],
            volume: 10,
            total: 143,
        });
        expect(mod.boatBill(ledger, PRICES, "Kestrel", 12, 12).lines).toEqual([]);
    });

    it("still refuses a day with no price, and only a day it bills", () => {
        const late = [{ fromDay: 12, price: 1455 }];
        const ledger = ledgerOf([
            draw("Kestrel", 11, 500, 5), draw("Kestrel", 12, 500, 5), draw("Kestrel", 11, 900, 5), draw("Kestrel", 12, 900, 5),
        ]);
        expect(() => mod.boatBill(ledger, late, "Kestrel", 10, 15)).toThrow("no diesel price is set for day 11");
        // As it is now: a plain Error with these words, where the rest of the file throws a RangeError.
        expect(refusal(() => mod.boatBill(ledger, late, "Kestrel", 10, 15))).toEqual({
            name: "Error", message: "no diesel price is set for day 11",
        });
        expect(mod.boatBill(ledger, late, "Kestrel", 12, 15)).toEqual({
            boat: "Kestrel",
            lines: [{ day: 12, volume: 10, price: 1455, pence: 146 }],
            volume: 10,
            total: 146,
        });
    });

    it("gives an empty bill for a boat that drew nothing", () => {
        const ledger = ledgerOf([draw("Kestrel", 10, 500, 5)]);
        expect(mod.boatBill(ledger, PRICES, "Heron", 10, 15)).toEqual({ boat: "Heron", lines: [], volume: 0, total: 0 });
    });

    it("leaves the ledger and the prices as they were", () => {
        const ledger = ledgerOf([
            draw("Kestrel", 12, 500, 100), draw("Kestrel", 10, 900, 200), draw("Kestrel", 12, 950, 3),
        ]);
        const before = copyOf(ledger);
        const prices = copyOf(PRICES);
        mod.boatBill(ledger, prices, "Kestrel", 10, 15);
        expect(ledger).toEqual(before);
        expect(prices).toEqual(PRICES);
    });
});

unchanged(mod, [
    "boatBill gives a line for each draw of a day, each rounded up on its own",
    "boatBill lists the draws in the order they were entered",
]);

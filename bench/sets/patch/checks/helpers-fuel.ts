// What src/fuel.ts does now, pinned case by case. A task's check calls `unchanged` and skips only the cases
// its change must alter.
import { describe, expect, it } from "vitest";
import { copyOf } from "./helpers";

type Fuel = typeof import("../src/fuel");
type Entry = import("../src/fuel").Entry;
type Ledger = import("../src/fuel").Ledger;
type Tank = import("../src/fuel").Tank;

const SHORT_NOTE = "tank holds less than the book: look for a leak or a draw nobody entered";
const OVER_NOTE = "tank holds more than the book: look for a delivery nobody entered";
const OK_NOTE = "book and tank agree";

function tank(capacity = 20000): Tank {
    return { capacity, calibration: [[0, 0], [130, 1700], [470, 9100], [950, 19000]] };
}

function delivery(day: number, minute: number, volume: number): Entry {
    return { kind: "delivery", day, minute, boat: "", volume };
}

function draw(boat: string, day: number, minute: number, volume: number): Entry {
    return { kind: "draw", day, minute, boat, volume };
}

function adjust(day: number, minute: number, volume: number): Entry {
    return { kind: "adjust", day, minute, boat: "", volume };
}

/** A ledger whose entries are given in the order they were entered: the last one given is the newest. */
function ledgerOf(opening: number, entered: Entry[], capacity = 20000, openedDay = 10): Ledger {
    return { tank: tank(capacity), openedDay, opening, entries: copyOf(entered).reverse() };
}

// In the order entered. Running stock at the end: 13995.
const BUSY: Entry[] = [
    delivery(10, 480, 12000),
    draw("Kestrel", 10, 545, 455),
    draw("Avocet", 11, 600, 380),
    draw("", 11, 610, 30),
    draw("Kestrel", 12, 450, 500),
    adjust(12, 1020, -125),
    draw("Avocet", 13, 555, 205),
    draw("Kestrel", 14, 700, 310),
];

function busy(): Ledger {
    return ledgerOf(4000, BUSY);
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

export function unchanged(mod: Fuel, skip: string[] = []): void {
    const test = (name: string, body: () => void): void => {
        if (!skip.includes(name)) {
            it(name, body);
        }
    };

    describe("fuel as it was", () => {
        test("YARD is the empty name, NO_PRICE is 0 and NO_COVER is -1", () => {
            expect(mod.YARD).toBe("");
            expect(mod.NO_PRICE).toBe(0);
            expect(mod.NO_COVER).toBe(-1);
        });

        // openLedger
        test("openLedger gives an empty ledger that holds what it was given", () => {
            const t = tank();
            expect(mod.openLedger(t, 10, 4000)).toEqual({ tank: tank(), openedDay: 10, opening: 4000, entries: [] });
            // The tank itself, not a copy of it.
            expect(mod.openLedger(t, 10, 4000).tank).toBe(t);
        });
        test("openLedger takes an empty tank and a brim full one", () => {
            expect(mod.openLedger(tank(), 3, 0).opening).toBe(0);
            expect(mod.openLedger(tank(), 3, 20000).opening).toBe(20000);
        });
        test("openLedger refuses stock below zero and stock above the tank", () => {
            expect(() => mod.openLedger(tank(), 3, -1)).toThrow(RangeError);
            expect(() => mod.openLedger(tank(), 3, 20001)).toThrow(RangeError);
        });
        test("openLedger refuses in these words", () => {
            const words = { name: "RangeError", message: "the opening stock does not fit the tank" };
            expect(refusal(() => mod.openLedger(tank(), 3, -1))).toEqual(words);
            expect(refusal(() => mod.openLedger(tank(), 3, 20001))).toEqual(words);
        });

        // post
        test("post puts the newest entry first", () => {
            const ledger = ledgerOf(4000, []);
            mod.post(ledger, delivery(10, 480, 1000));
            mod.post(ledger, draw("Kestrel", 11, 500, 200));
            mod.post(ledger, draw("Avocet", 12, 500, 300));
            expect(ledger.entries).toEqual([
                draw("Avocet", 12, 500, 300),
                draw("Kestrel", 11, 500, 200),
                delivery(10, 480, 1000),
            ]);
        });
        test("post puts a late entry on top all the same", () => {
            const ledger = ledgerOf(4000, [draw("Kestrel", 14, 500, 200)]);
            mod.post(ledger, draw("Avocet", 11, 300, 100));
            expect(ledger.entries).toEqual([draw("Avocet", 11, 300, 100), draw("Kestrel", 14, 500, 200)]);
        });
        test("post refuses a day before the ledger opens and takes the opening day", () => {
            const ledger = ledgerOf(4000, []);
            expect(() => mod.post(ledger, draw("Kestrel", 9, 1439, 200))).toThrow(RangeError);
            expect(ledger.entries).toEqual([]);
            mod.post(ledger, draw("Kestrel", 10, 0, 200));
            expect(ledger.entries).toEqual([draw("Kestrel", 10, 0, 200)]);
        });
        test("post refuses in these words", () => {
            const ledger = ledgerOf(4000, []);
            expect(refusal(() => mod.post(ledger, draw("Kestrel", 9, 1439, 200)))).toEqual({
                name: "RangeError", message: "day 9 is before the ledger opens",
            });
            expect(refusal(() => mod.post(ledgerOf(4000, [], 20000, 31), delivery(30, 0, 500)))).toEqual({
                name: "RangeError", message: "day 30 is before the ledger opens",
            });
        });
        test("post puts the very entry it was given in the ledger, not a copy of it", () => {
            const ledger = ledgerOf(4000, [delivery(10, 480, 1000)]);
            const given = draw("Kestrel", 11, 500, 200);
            mod.post(ledger, given);
            expect(ledger.entries[0]).toBe(given);
        });
        test("post puts a boat's second draw of a day on top as an entry of its own", () => {
            const ledger = ledgerOf(4000, []);
            mod.post(ledger, draw("Kestrel", 11, 545, 455));
            mod.post(ledger, draw("Kestrel", 11, 560, 100));
            expect(ledger.entries).toEqual([draw("Kestrel", 11, 560, 100), draw("Kestrel", 11, 545, 455)]);
        });
        test("post returns nothing and takes an entry as it is, with no check on its volume", () => {
            const ledger = ledgerOf(100, []);
            expect(mod.post(ledger, draw("Kestrel", 10, 0, 900))).toBeUndefined();
            expect(mod.post(ledger, adjust(10, 5, -300))).toBeUndefined();
            expect(ledger.entries).toEqual([adjust(10, 5, -300), draw("Kestrel", 10, 0, 900)]);
        });

        // stock
        test("stock is the opening stock when nothing is entered", () => {
            expect(mod.stock(ledgerOf(4000, []))).toBe(4000);
        });
        test("stock adds deliveries, takes draws off and adds adjustments with their sign", () => {
            expect(mod.stock(busy())).toBe(13995);
            expect(mod.stock(ledgerOf(1000, [adjust(10, 0, 70)]))).toBe(1070);
            expect(mod.stock(ledgerOf(1000, [adjust(10, 0, -70)]))).toBe(930);
        });
        test("stock may run below zero", () => {
            expect(mod.stock(ledgerOf(100, [draw("Kestrel", 10, 0, 250)]))).toBe(-150);
        });

        // stockAt
        test("stockAt counts an entry timed at the very minute and not one a minute later", () => {
            const ledger = busy();
            expect(mod.stockAt(ledger, 10, 479)).toBe(4000);
            expect(mod.stockAt(ledger, 10, 480)).toBe(16000);
            expect(mod.stockAt(ledger, 10, 544)).toBe(16000);
            expect(mod.stockAt(ledger, 10, 545)).toBe(15545);
        });
        test("stockAt counts whole earlier days and no later day", () => {
            const ledger = busy();
            expect(mod.stockAt(ledger, 11, 0)).toBe(15545);
            expect(mod.stockAt(ledger, 11, 605)).toBe(15165);
            expect(mod.stockAt(ledger, 12, 1019)).toBe(14635);
            expect(mod.stockAt(ledger, 12, 1020)).toBe(14510);
            expect(mod.stockAt(ledger, 99, 0)).toBe(13995);
        });
        test("stockAt before anything is the opening stock", () => {
            expect(mod.stockAt(busy(), 9, 1439)).toBe(4000);
            expect(mod.stockAt(ledgerOf(725, []), 30, 0)).toBe(725);
        });
        test("stockAt goes by an entry's day and minute, not by where it stands in the ledger", () => {
            const ledger = ledgerOf(1000, [draw("Kestrel", 14, 500, 200), draw("Avocet", 11, 300, 100)]);
            expect(mod.stockAt(ledger, 12, 0)).toBe(900);
            expect(mod.stockAt(ledger, 14, 499)).toBe(900);
            expect(mod.stockAt(ledger, 14, 500)).toBe(700);
        });

        // recordDelivery
        test("recordDelivery posts a delivery for the yard and returns it", () => {
            const ledger = ledgerOf(4000, [draw("Kestrel", 10, 500, 200)]);
            const entry = mod.recordDelivery(ledger, 11, 480, 12000);
            expect(entry).toEqual({ kind: "delivery", day: 11, minute: 480, boat: "", volume: 12000 });
            expect(ledger.entries).toEqual([delivery(11, 480, 12000), draw("Kestrel", 10, 500, 200)]);
            expect(mod.stock(ledger)).toBe(15800);
        });
        test("recordDelivery fills the tank to the brim and no further", () => {
            const ledger = ledgerOf(18400, []);
            expect(() => mod.recordDelivery(ledger, 10, 480, 1601)).toThrow(RangeError);
            expect(() => mod.recordDelivery(ledger, 10, 480, 1601)).toThrow(
                "the tank has room for 160.0 L, not 160.1 L",
            );
            expect(ledger.entries).toEqual([]);
            mod.recordDelivery(ledger, 10, 480, 1600);
            expect(mod.stock(ledger)).toBe(20000);
            expect(() => mod.recordDelivery(ledger, 10, 490, 1)).toThrow("the tank has room for 0.0 L, not 0.1 L");
        });
        test("recordDelivery counts the room from the running stock", () => {
            const ledger = ledgerOf(20000, [draw("Kestrel", 10, 500, 400)]);
            expect(() => mod.recordDelivery(ledger, 10, 600, 401)).toThrow(RangeError);
            expect(mod.recordDelivery(ledger, 10, 600, 400).volume).toBe(400);
        });
        test("recordDelivery counts the room from the whole book when it is entered late", () => {
            // The draw is dated after the delivery and was entered before it. It has made room all the same.
            const ledger = ledgerOf(19000, [draw("Kestrel", 12, 600, 1500)]);
            expect(mod.recordDelivery(ledger, 11, 480, 1200)).toEqual(delivery(11, 480, 1200));
            expect(mod.stock(ledger)).toBe(18700);
            expect(() => mod.recordDelivery(ledger, 11, 490, 1301)).toThrow(
                "the tank has room for 130.0 L, not 130.1 L",
            );
        });
        test("recordDelivery returns the very entry it put in the ledger", () => {
            const ledger = ledgerOf(4000, [draw("Kestrel", 10, 500, 200)]);
            const entry = mod.recordDelivery(ledger, 11, 480, 12000);
            expect(ledger.entries[0]).toBe(entry);
        });
        test("recordDelivery refuses a day before the ledger opens", () => {
            const ledger = ledgerOf(4000, []);
            expect(refusal(() => mod.recordDelivery(ledger, 9, 480, 100))).toEqual({
                name: "RangeError", message: "day 9 is before the ledger opens",
            });
            expect(ledger.entries).toEqual([]);
        });
        test("recordDelivery refuses zero, a negative volume and a part decilitre", () => {
            const ledger = ledgerOf(4000, []);
            for (const volume of [0, -200, 12.5]) {
                expect(() => mod.recordDelivery(ledger, 10, 480, volume)).toThrow(RangeError);
                expect(() => mod.recordDelivery(ledger, 10, 480, volume)).toThrow(
                    "a delivery must be a whole number of decilitres above zero",
                );
            }
            expect(ledger.entries).toEqual([]);
        });

        // recordDraw
        test("recordDraw posts a draw for the boat and returns it", () => {
            const ledger = ledgerOf(4000, [delivery(10, 480, 1000)]);
            const entry = mod.recordDraw(ledger, "Kestrel", 11, 545, 455);
            expect(entry).toEqual({ kind: "draw", day: 11, minute: 545, boat: "Kestrel", volume: 455 });
            expect(ledger.entries).toEqual([draw("Kestrel", 11, 545, 455), delivery(10, 480, 1000)]);
            expect(mod.stock(ledger)).toBe(4545);
        });
        test("recordDraw returns the very entry it put in the ledger", () => {
            const ledger = ledgerOf(4000, [delivery(10, 480, 1000)]);
            const entry = mod.recordDraw(ledger, "Kestrel", 11, 545, 455);
            expect(ledger.entries[0]).toBe(entry);
        });
        test("recordDraw puts a draw on top of another boat's draw", () => {
            const ledger = ledgerOf(4000, []);
            mod.recordDraw(ledger, "Kestrel", 11, 545, 455);
            mod.recordDraw(ledger, "Avocet", 11, 550, 100);
            mod.recordDraw(ledger, "", 11, 555, 30);
            expect(ledger.entries).toEqual([
                draw("", 11, 555, 30),
                draw("Avocet", 11, 550, 100),
                draw("Kestrel", 11, 545, 455),
            ]);
        });
        test("recordDraw posts each draw as an entry of its own", () => {
            const ledger = ledgerOf(4000, []);
            mod.recordDraw(ledger, "Kestrel", 11, 545, 455);
            mod.recordDraw(ledger, "Kestrel", 11, 560, 100);
            expect(ledger.entries).toEqual([draw("Kestrel", 11, 560, 100), draw("Kestrel", 11, 545, 455)]);
        });
        test("recordDraw refuses zero, a negative volume and a part decilitre", () => {
            const ledger = ledgerOf(4000, [draw("Avocet", 10, 500, 200)]);
            for (const volume of [0, -5, 0.5]) {
                expect(() => mod.recordDraw(ledger, "Kestrel", 10, 545, volume)).toThrow(RangeError);
                expect(() => mod.recordDraw(ledger, "Kestrel", 10, 545, volume)).toThrow(
                    "a draw must be a whole number of decilitres above zero",
                );
            }
            expect(ledger.entries).toEqual([draw("Avocet", 10, 500, 200)]);
        });
        test("recordDraw lets the book run below zero", () => {
            const ledger = ledgerOf(100, []);
            mod.recordDraw(ledger, "Kestrel", 10, 545, 250);
            expect(mod.stock(ledger)).toBe(-150);
        });
        test("recordDraw refuses a day before the ledger opens", () => {
            const ledger = ledgerOf(4000, []);
            expect(() => mod.recordDraw(ledger, "Kestrel", 9, 545, 250)).toThrow(RangeError);
            expect(refusal(() => mod.recordDraw(ledger, "Kestrel", 9, 545, 250))).toEqual({
                name: "RangeError", message: "day 9 is before the ledger opens",
            });
            expect(ledger.entries).toEqual([]);
        });

        // drawsOf
        test("drawsOf gives the boat's draws newest first", () => {
            expect(mod.drawsOf(busy(), "Kestrel")).toEqual([
                draw("Kestrel", 14, 700, 310),
                draw("Kestrel", 12, 450, 500),
                draw("Kestrel", 10, 545, 455),
            ]);
        });
        test("drawsOf leaves out deliveries, adjustments and other boats", () => {
            expect(mod.drawsOf(busy(), "")).toEqual([draw("", 11, 610, 30)]);
            expect(mod.drawsOf(busy(), "Heron")).toEqual([]);
        });
        test("drawsOf gives the ledger's own entries, not copies of them", () => {
            const ledger = busy();
            const draws = mod.drawsOf(ledger, "Avocet");
            expect(draws[0]).toBe(ledger.entries[1]);
            expect(draws[1]).toBe(ledger.entries[5]);
        });
        test("drawsOf gives a list of its own and leaves the ledger alone", () => {
            const ledger = busy();
            const draws = mod.drawsOf(ledger, "Avocet");
            draws.reverse();
            draws.pop();
            expect(ledger).toEqual(busy());
            expect(mod.drawsOf(ledger, "Avocet")).toEqual([draw("Avocet", 13, 555, 205), draw("Avocet", 11, 600, 380)]);
        });

        // drawnBetween
        test("drawnBetween counts the first day and not the last", () => {
            const ledger = busy();
            expect(mod.drawnBetween(ledger, "Kestrel", 10, 14)).toBe(955);
            expect(mod.drawnBetween(ledger, "Kestrel", 10, 15)).toBe(1265);
            expect(mod.drawnBetween(ledger, "Kestrel", 12, 13)).toBe(500);
            expect(mod.drawnBetween(ledger, "Kestrel", 11, 12)).toBe(0);
        });
        test("drawnBetween counts only the boat's own draws", () => {
            const ledger = busy();
            expect(mod.drawnBetween(ledger, "Avocet", 10, 15)).toBe(585);
            expect(mod.drawnBetween(ledger, "", 10, 15)).toBe(30);
            expect(mod.drawnBetween(ledger, "Heron", 10, 15)).toBe(0);
        });
        test("drawnBetween is 0 over no days", () => {
            expect(mod.drawnBetween(busy(), "Kestrel", 12, 12)).toBe(0);
            expect(mod.drawnBetween(busy(), "Kestrel", 14, 10)).toBe(0);
        });

        // dipVolume
        test("dipVolume reads each mark as it is", () => {
            expect(mod.dipVolume(tank(), 130)).toBe(1700);
            expect(mod.dipVolume(tank(), 470)).toBe(9100);
            expect(mod.dipVolume(tank(), 950)).toBe(19000);
        });
        test("dipVolume draws a straight line between two marks and rounds down", () => {
            expect(mod.dipVolume(tank(), 50)).toBe(653);
            expect(mod.dipVolume(tank(), 200)).toBe(3223);
            expect(mod.dipVolume(tank(), 300)).toBe(5400);
            expect(mod.dipVolume(tank(), 700)).toBe(13843);
        });
        test("dipVolume is 0 at the bottom and below it", () => {
            expect(mod.dipVolume(tank(), 0)).toBe(0);
            expect(mod.dipVolume(tank(), -5)).toBe(0);
        });
        test("dipVolume is the whole tank above the top mark", () => {
            expect(mod.dipVolume(tank(), 951)).toBe(20000);
            expect(mod.dipVolume(tank(21000), 2000)).toBe(21000);
        });

        // reconcile
        test("reconcile sets the book at the reading's minute against the dip", () => {
            const ledger = busy();
            expect(mod.reconcile(ledger, { day: 12, minute: 1019, depth: 700 })).toEqual({
                book: 14635, dipped: 13843, gap: 792, verdict: "short", note: SHORT_NOTE,
            });
            expect(mod.reconcile(ledger, { day: 12, minute: 1020, depth: 700 })).toEqual({
                book: 14510, dipped: 13843, gap: 667, verdict: "short", note: SHORT_NOTE,
            });
        });
        test("reconcile calls a gap of the tolerance ok and a decilitre more short", () => {
            expect(mod.reconcile(ledgerOf(9180, []), { day: 10, minute: 600, depth: 470 })).toEqual({
                book: 9180, dipped: 9100, gap: 80, verdict: "ok", note: OK_NOTE,
            });
            expect(mod.reconcile(ledgerOf(9181, []), { day: 10, minute: 600, depth: 470 })).toEqual({
                book: 9181, dipped: 9100, gap: 81, verdict: "short", note: SHORT_NOTE,
            });
        });
        test("reconcile calls the tank over when it holds more than the book by more than the tolerance", () => {
            expect(mod.reconcile(ledgerOf(9020, []), { day: 10, minute: 600, depth: 470 })).toEqual({
                book: 9020, dipped: 9100, gap: -80, verdict: "ok", note: OK_NOTE,
            });
            expect(mod.reconcile(ledgerOf(9019, []), { day: 10, minute: 600, depth: 470 })).toEqual({
                book: 9019, dipped: 9100, gap: -81, verdict: "over", note: OVER_NOTE,
            });
        });
        test("reconcile's tolerance is never under 50", () => {
            const reading = { day: 10, minute: 600, depth: 130 };
            expect(mod.reconcile(ledgerOf(1750, [], 5000), reading).verdict).toBe("ok");
            expect(mod.reconcile(ledgerOf(1751, [], 5000), reading).verdict).toBe("short");
            expect(mod.reconcile(ledgerOf(1650, [], 5000), reading).verdict).toBe("ok");
            expect(mod.reconcile(ledgerOf(1649, [], 5000), reading).verdict).toBe("over");
        });
        test("reconcile's tolerance is four in a thousand of the tank, rounded down", () => {
            const reading = { day: 10, minute: 600, depth: 470 };
            expect(mod.reconcile(ledgerOf(9180, [], 20200), reading).verdict).toBe("ok");
            expect(mod.reconcile(ledgerOf(9181, [], 20200), reading).verdict).toBe("short");
            expect(mod.reconcile(ledgerOf(9220, [], 30000), reading).verdict).toBe("ok");
            expect(mod.reconcile(ledgerOf(9221, [], 30000), reading).verdict).toBe("short");
        });
        test("reconcile leaves the ledger as it was", () => {
            const ledger = busy();
            mod.reconcile(ledger, { day: 12, minute: 1019, depth: 700 });
            expect(ledger).toEqual(busy());
        });

        // settle
        test("settle posts nothing and returns 0 when the dip is within tolerance", () => {
            const ledger = ledgerOf(9180, [draw("Kestrel", 10, 700, 5)]);
            expect(mod.settle(ledger, { day: 10, minute: 600, depth: 470 })).toBe(0);
            expect(ledger.entries).toEqual([draw("Kestrel", 10, 700, 5)]);
        });
        test("settle writes a short tank off with an adjustment below zero, at the reading's time", () => {
            const ledger = busy();
            expect(mod.settle(ledger, { day: 12, minute: 1020, depth: 700 })).toBe(-667);
            expect(ledger.entries[0]).toEqual({ kind: "adjust", day: 12, minute: 1020, boat: "", volume: -667 });
            expect(ledger.entries.slice(1)).toEqual(busy().entries);
            expect(mod.stockAt(ledger, 12, 1020)).toBe(13843);
            expect(mod.stock(ledger)).toBe(13328);
        });
        test("settle adds what an over tank holds beyond the book", () => {
            const ledger = ledgerOf(9000, []);
            expect(mod.settle(ledger, { day: 11, minute: 30, depth: 470 })).toBe(100);
            expect(ledger.entries).toEqual([adjust(11, 30, 100)]);
            expect(mod.stock(ledger)).toBe(9100);
        });
        test("settle's adjustment makes the same dip agree with the book", () => {
            const ledger = busy();
            mod.settle(ledger, { day: 12, minute: 1019, depth: 700 });
            expect(ledger.entries[0]).toEqual(adjust(12, 1019, -792));
            expect(mod.reconcile(ledger, { day: 12, minute: 1019, depth: 700 })).toEqual({
                book: 13843, dipped: 13843, gap: 0, verdict: "ok", note: OK_NOTE,
            });
        });
        test("settle refuses a reading dated before the ledger opens, as any entry of that day is refused", () => {
            const ledger = ledgerOf(9000, []);
            expect(refusal(() => mod.settle(ledger, { day: 9, minute: 30, depth: 470 }))).toEqual({
                name: "RangeError", message: "day 9 is before the ledger opens",
            });
            expect(ledger.entries).toEqual([]);
        });

        // priceOn
        test("priceOn is the price of the latest point on or before the day", () => {
            expect(mod.priceOn(PRICES, 1)).toBe(1429);
            expect(mod.priceOn(PRICES, 11)).toBe(1429);
            expect(mod.priceOn(PRICES, 12)).toBe(1455);
            expect(mod.priceOn(PRICES, 400)).toBe(1455);
        });
        test("priceOn is NO_PRICE before the first point and when there are no points", () => {
            expect(mod.priceOn(PRICES, 0)).toBe(0);
            expect(mod.priceOn([], 12)).toBe(0);
        });
        test("priceOn does not need the points in day order", () => {
            const mixed = [{ fromDay: 20, price: 1500 }, { fromDay: 5, price: 1400 }, { fromDay: 12, price: 1455 }];
            expect(mod.priceOn(mixed, 4)).toBe(0);
            expect(mod.priceOn(mixed, 11)).toBe(1400);
            expect(mod.priceOn(mixed, 19)).toBe(1455);
            expect(mod.priceOn(mixed, 20)).toBe(1500);
        });
        test("priceOn takes the first in the list of two points for one day", () => {
            expect(mod.priceOn([{ fromDay: 5, price: 1400 }, { fromDay: 5, price: 1500 }], 6)).toBe(1400);
            expect(mod.priceOn([{ fromDay: 5, price: 1500 }, { fromDay: 5, price: 1400 }], 5)).toBe(1500);
        });

        // withPrice
        test("withPrice gives a new list in day order and leaves the old one alone", () => {
            const prices = [{ fromDay: 12, price: 1455 }, { fromDay: 1, price: 1429 }];
            const next = mod.withPrice(prices, { fromDay: 7, price: 1440 });
            expect(next).toEqual([{ fromDay: 1, price: 1429 }, { fromDay: 7, price: 1440 }, { fromDay: 12, price: 1455 }]);
            expect(prices).toEqual([{ fromDay: 12, price: 1455 }, { fromDay: 1, price: 1429 }]);
            expect(next).not.toBe(prices);
        });
        test("withPrice puts a point in the place of the one for the same day", () => {
            expect(mod.withPrice(PRICES, { fromDay: 12, price: 1499 })).toEqual([
                { fromDay: 1, price: 1429 }, { fromDay: 12, price: 1499 },
            ]);
            expect(PRICES).toEqual([{ fromDay: 1, price: 1429 }, { fromDay: 12, price: 1455 }]);
        });
        test("withPrice starts a list from none", () => {
            expect(mod.withPrice([], { fromDay: 3, price: 1390 })).toEqual([{ fromDay: 3, price: 1390 }]);
        });

        // chargeFor
        test("chargeFor is pence for decilitres at tenths of a penny a litre", () => {
            expect(mod.chargeFor(100, 1429)).toBe(1429);
            expect(mod.chargeFor(500, 1455)).toBe(7275);
            expect(mod.chargeFor(0, 1429)).toBe(0);
        });
        test("chargeFor rounds a part penny up, however small", () => {
            expect(mod.chargeFor(1, 1429)).toBe(15);
            expect(mod.chargeFor(5, 1429)).toBe(72);
            expect(mod.chargeFor(455, 1429)).toBe(6502);
            expect(mod.chargeFor(7, 1401)).toBe(99);
            expect(mod.chargeFor(3, 1400)).toBe(42);
        });

        // boatBill
        test("boatBill lists the boat's draws, each at the price of its day", () => {
            expect(mod.boatBill(busy(), PRICES, "Kestrel", 10, 15)).toEqual({
                boat: "Kestrel",
                lines: [
                    { day: 10, volume: 455, price: 1429, pence: 6502 },
                    { day: 12, volume: 500, price: 1455, pence: 7275 },
                    { day: 14, volume: 310, price: 1455, pence: 4511 },
                ],
                volume: 1265,
                total: 18288,
            });
        });
        test("boatBill gives a line for each draw of a day, each rounded up on its own", () => {
            const ledger = ledgerOf(4000, [draw("Kestrel", 10, 500, 5), draw("Kestrel", 10, 900, 5)]);
            expect(mod.boatBill(ledger, PRICES, "Kestrel", 10, 11)).toEqual({
                boat: "Kestrel",
                lines: [
                    { day: 10, volume: 5, price: 1429, pence: 72 },
                    { day: 10, volume: 5, price: 1429, pence: 72 },
                ],
                volume: 10,
                total: 144,
            });
        });
        test("boatBill lists the draws in the order they were entered", () => {
            const ledger = ledgerOf(4000, [draw("Kestrel", 12, 500, 100), draw("Kestrel", 10, 900, 200)]);
            expect(mod.boatBill(ledger, PRICES, "Kestrel", 10, 15).lines).toEqual([
                { day: 12, volume: 100, price: 1455, pence: 1455 },
                { day: 10, volume: 200, price: 1429, pence: 2858 },
            ]);
        });
        test("boatBill counts the first day and not the last", () => {
            expect(mod.boatBill(busy(), PRICES, "Kestrel", 10, 14)).toEqual({
                boat: "Kestrel",
                lines: [
                    { day: 10, volume: 455, price: 1429, pence: 6502 },
                    { day: 12, volume: 500, price: 1455, pence: 7275 },
                ],
                volume: 955,
                total: 13777,
            });
            expect(mod.boatBill(busy(), PRICES, "Kestrel", 11, 12).lines).toEqual([]);
        });
        test("boatBill refuses a draw on a day with no price, and only a draw it bills", () => {
            const late = [{ fromDay: 12, price: 1455 }];
            expect(() => mod.boatBill(busy(), late, "Kestrel", 10, 15)).toThrow("no diesel price is set for day 10");
            // A plain Error, where the rest of the file throws a RangeError.
            expect(refusal(() => mod.boatBill(busy(), late, "Kestrel", 10, 15))).toEqual({
                name: "Error", message: "no diesel price is set for day 10",
            });
            expect(mod.boatBill(busy(), late, "Kestrel", 12, 15).total).toBe(11786);
            expect(mod.boatBill(busy(), late, "Heron", 10, 15).total).toBe(0);
        });
        test("boatBill of a boat that drew nothing is empty", () => {
            expect(mod.boatBill(busy(), PRICES, "Heron", 10, 15)).toEqual({
                boat: "Heron", lines: [], volume: 0, total: 0,
            });
        });
        test("boatBill bills only the boat's own draws", () => {
            expect(mod.boatBill(busy(), PRICES, "Avocet", 10, 15)).toEqual({
                boat: "Avocet",
                lines: [
                    { day: 11, volume: 380, price: 1429, pence: 5431 },
                    { day: 13, volume: 205, price: 1455, pence: 2983 },
                ],
                volume: 585,
                total: 8414,
            });
        });
        test("boatBill leaves the ledger and the prices as they were", () => {
            const ledger = busy();
            const prices = copyOf(PRICES);
            mod.boatBill(ledger, prices, "Kestrel", 10, 15);
            expect(ledger).toEqual(busy());
            expect(prices).toEqual(PRICES);
        });

        // daysOfCover
        test("daysOfCover is the running stock over the rate of the days before, rounded down", () => {
            expect(mod.daysOfCover(busy(), 15, 5)).toBe(37);
            expect(mod.daysOfCover(busy(), 14, 2)).toBe(39);
            expect(mod.daysOfCover(ledgerOf(1000, [draw("Kestrel", 10, 500, 300)]), 11, 1)).toBe(2);
            expect(mod.daysOfCover(ledgerOf(1000, [draw("Kestrel", 10, 500, 300)]), 11, 2)).toBe(4);
        });
        test("daysOfCover counts the first day of the span, the yard's draws too, and not the day itself", () => {
            expect(mod.daysOfCover(busy(), 13, 2)).toBe(30);
            expect(mod.daysOfCover(busy(), 12, 1)).toBe(34);
        });
        test("daysOfCover is NO_COVER when nothing was drawn in the span", () => {
            expect(mod.daysOfCover(busy(), 10, 5)).toBe(-1);
            expect(mod.daysOfCover(busy(), 20, 3)).toBe(-1);
            expect(mod.daysOfCover(ledgerOf(4000, [delivery(10, 480, 1000)]), 11, 1)).toBe(-1);
        });
        test("daysOfCover multiplies by the span before it divides, so a slow rate is not lost", () => {
            const slow = ledgerOf(1000, [draw("Kestrel", 10, 500, 3)]);
            expect(mod.daysOfCover(slow, 11, 2)).toBe(664);
            expect(mod.daysOfCover(slow, 11, 5)).toBe(1661);
        });
        test("daysOfCover is never below zero", () => {
            expect(mod.daysOfCover(ledgerOf(100, [draw("Kestrel", 10, 500, 500)]), 11, 1)).toBe(0);
        });

        // formatVolume, formatPence
        test("formatVolume writes decilitres as litres with one place", () => {
            expect(mod.formatVolume(455)).toBe("45.5 L");
            expect(mod.formatVolume(20000)).toBe("2000.0 L");
            expect(mod.formatVolume(7)).toBe("0.7 L");
            expect(mod.formatVolume(0)).toBe("0.0 L");
        });
        test("formatVolume puts the sign of a volume below zero in front", () => {
            expect(mod.formatVolume(-125)).toBe("-12.5 L");
            expect(mod.formatVolume(-3)).toBe("-0.3 L");
        });
        test("formatPence writes pence as pounds with two places", () => {
            expect(mod.formatPence(1234)).toBe("£12.34");
            expect(mod.formatPence(5)).toBe("£0.05");
            expect(mod.formatPence(0)).toBe("£0.00");
            expect(mod.formatPence(10000)).toBe("£100.00");
        });
        test("formatPence writes a thousand pounds and more with no comma", () => {
            expect(mod.formatPence(123456)).toBe("£1234.56");
            expect(mod.formatPence(-100000)).toBe("-£1000.00");
        });
        test("formatPence puts the sign of an amount below zero before the pound", () => {
            expect(mod.formatPence(-150)).toBe("-£1.50");
            expect(mod.formatPence(-7)).toBe("-£0.07");
        });

        // describeEntry, recentLines
        test("describeEntry writes a delivery and an adjustment with no name", () => {
            expect(mod.describeEntry(delivery(12, 465, 20000))).toBe("day 12 07:45 delivered 2000.0 L");
            expect(mod.describeEntry(adjust(14, 1439, -125))).toBe("day 14 23:59 adjusted -12.5 L");
        });
        test("describeEntry writes an adjustment above zero with no sign", () => {
            expect(mod.describeEntry(adjust(11, 30, 100))).toBe("day 11 00:30 adjusted 10.0 L");
        });
        test("describeEntry writes a draw with its boat, and the yard's own as yard", () => {
            expect(mod.describeEntry(draw("Kestrel", 12, 965, 455))).toBe("day 12 16:05 drew 45.5 L (Kestrel)");
            expect(mod.describeEntry(draw("", 13, 0, 30))).toBe("day 13 00:00 drew 3.0 L (yard)");
        });
        test("recentLines gives the newest entries first and no more than asked", () => {
            expect(mod.recentLines(busy(), 3)).toEqual([
                "day 14 11:40 drew 31.0 L (Kestrel)",
                "day 13 09:15 drew 20.5 L (Avocet)",
                "day 12 17:00 adjusted -12.5 L",
            ]);
            expect(mod.recentLines(busy(), 0)).toEqual([]);
        });
        test("recentLines gives all there are when asked for more", () => {
            const ledger = ledgerOf(4000, [delivery(10, 480, 12000), draw("", 10, 600, 30)]);
            expect(mod.recentLines(ledger, 10)).toEqual([
                "day 10 10:00 drew 3.0 L (yard)",
                "day 10 08:00 delivered 1200.0 L",
            ]);
        });
    });
}

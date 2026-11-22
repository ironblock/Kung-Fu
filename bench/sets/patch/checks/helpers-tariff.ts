// What src/tariff.ts does as it stands. A task's check calls unchanged() and skips only the cases its change alters.
import { describe, expect, it } from "vitest";
import { copyOf } from "./helpers";

type Tariff = typeof import("../src/tariff");
type Payment = import("../src/tariff").Payment;
type Quote = import("../src/tariff").Quote;

export function unchanged(mod: Tariff, skip: string[] = []): void {
    const cases: [string, () => void][] = [];
    const pin = (name: string, run: () => void): void => {
        if (cases.some(([known]) => known === name)) {
            throw new Error(`two cases are called "${name}"`);
        }
        cases.push([name, run]);
    };

    const quoteOf = (totalPence: number, bondPence = 0): Quote => ({
        lines: [{ label: "Hire", pence: totalPence }],
        totalPence,
        bondPence,
    });
    const paid = (pence: number, day = 100): Payment[] => [{ day, pence, kind: "deposit" }];

    // ------------------------------------------------------------------------------------------ the tables

    pin("DAYS_IN_YEAR: 365", () => {
        expect(mod.DAYS_IN_YEAR).toBe(365);
    });
    pin("BOAT_CLASSES: the four classes in their order", () => {
        expect([...mod.BOAT_CLASSES]).toEqual(["narrow", "wide", "cruiser", "heritage"]);
    });
    pin("SEASONS: the four spans in their order", () => {
        expect(mod.SEASONS.map((s) => ({ ...s }))).toEqual([
            { name: "low", fromDay: 305, toDay: 91 },
            { name: "mid", fromDay: 91, toDay: 182 },
            { name: "high", fromDay: 182, toDay: 244 },
            { name: "mid", fromDay: 244, toDay: 305 },
        ]);
    });

    // ----------------------------------------------------------------------------------------- the seasons

    pin("seasonOn: the day a span runs from is in its season", () => {
        expect(mod.seasonOn(91)).toBe("mid");
        expect(mod.seasonOn(182)).toBe("high");
        expect(mod.seasonOn(244)).toBe("mid");
        expect(mod.seasonOn(305)).toBe("low");
    });
    pin("seasonOn: the day before a span runs to is its last", () => {
        expect(mod.seasonOn(90)).toBe("low");
        expect(mod.seasonOn(181)).toBe("mid");
        expect(mod.seasonOn(243)).toBe("high");
        expect(mod.seasonOn(304)).toBe("mid");
    });
    pin("seasonOn: the low season runs over the new year", () => {
        expect(mod.seasonOn(340)).toBe("low");
        expect(mod.seasonOn(365)).toBe("low");
        expect(mod.seasonOn(1)).toBe("low");
        expect(mod.seasonOn(45)).toBe("low");
    });
    pin("seasonOn: a day past the end of the year is a day of the next", () => {
        expect(mod.seasonOn(366)).toBe("low");
        expect(mod.seasonOn(455)).toBe("low");
        expect(mod.seasonOn(456)).toBe("mid");
        expect(mod.seasonOn(546)).toBe("mid");
        expect(mod.seasonOn(547)).toBe("high");
        expect(mod.seasonOn(365 + 365 + 243)).toBe("high");
    });
    pin("seasonOn: day 0 and earlier are days of the year before", () => {
        expect(mod.seasonOn(0)).toBe("low");
        expect(mod.seasonOn(-60)).toBe("low");
        expect(mod.seasonOn(-61)).toBe("mid");
        expect(mod.seasonOn(-121)).toBe("mid");
        expect(mod.seasonOn(-122)).toBe("high");
    });
    pin("seasonOn: a day more than a year before day 1 is brought into the year all the same", () => {
        expect(mod.seasonOn(-456)).toBe("mid");
        expect(mod.seasonOn(-500)).toBe("high");
    });

    pin("nightlyRate: every class in every season", () => {
        const rates = mod.BOAT_CLASSES.map((c) => [20, 120, 200].map((day) => mod.nightlyRate(c, day)));
        expect(rates).toEqual([
            [8500, 11200, 14900],
            [10400, 13600, 17800],
            [9200, 12500, 16300],
            [12800, 16400, 21500],
        ]);
    });
    pin("nightlyRate: changes on the day a season starts", () => {
        expect(mod.nightlyRate("narrow", 181)).toBe(11200);
        expect(mod.nightlyRate("narrow", 182)).toBe(14900);
        expect(mod.nightlyRate("wide", 243)).toBe(17800);
        expect(mod.nightlyRate("wide", 244)).toBe(13600);
        expect(mod.nightlyRate("cruiser", 304)).toBe(12500);
        expect(mod.nightlyRate("cruiser", 305)).toBe(9200);
        expect(mod.nightlyRate("heritage", 90)).toBe(12800);
        expect(mod.nightlyRate("heritage", 91)).toBe(16400);
    });
    pin("nightlyRate: takes a day past the end of the year", () => {
        expect(mod.nightlyRate("heritage", 365 + 200)).toBe(21500);
        expect(mod.nightlyRate("narrow", 366)).toBe(8500);
    });

    pin("nightsBySeason: a hire inside one season", () => {
        expect(mod.nightsBySeason(10, 5)).toEqual({ low: 5, mid: 0, high: 0 });
        expect(mod.nightsBySeason(200, 14)).toEqual({ low: 0, mid: 0, high: 14 });
    });
    pin("nightsBySeason: a hire over a change of season", () => {
        expect(mod.nightsBySeason(179, 7)).toEqual({ low: 0, mid: 3, high: 4 });
        expect(mod.nightsBySeason(240, 6)).toEqual({ low: 0, mid: 2, high: 4 });
        expect(mod.nightsBySeason(88, 4)).toEqual({ low: 3, mid: 1, high: 0 });
    });
    pin("nightsBySeason: the last night counted is the one before the boat comes back", () => {
        expect(mod.nightsBySeason(180, 2)).toEqual({ low: 0, mid: 2, high: 0 });
        expect(mod.nightsBySeason(180, 3)).toEqual({ low: 0, mid: 2, high: 1 });
        expect(mod.nightsBySeason(304, 1)).toEqual({ low: 0, mid: 1, high: 0 });
    });
    pin("nightsBySeason: a hire over the new year", () => {
        expect(mod.nightsBySeason(363, 5)).toEqual({ low: 5, mid: 0, high: 0 });
        expect(mod.nightsBySeason(300, 300)).toEqual({ low: 151, mid: 96, high: 53 });
    });
    pin("nightsBySeason: no nights", () => {
        expect(mod.nightsBySeason(100, 0)).toEqual({ low: 0, mid: 0, high: 0 });
    });

    // ------------------------------------------------------------------------------- discounts and supplements

    pin("longHireRate: none for a hire under a week", () => {
        expect(mod.longHireRate(1)).toBe(0);
        expect(mod.longHireRate(6)).toBe(0);
    });
    pin("longHireRate: each band from its own length", () => {
        const rates = [7, 9, 10, 13, 14, 20, 21, 60].map((n) => mod.longHireRate(n));
        expect(rates).toEqual([50, 50, 75, 75, 100, 100, 150, 150]);
    });

    pin("petSupplement: for each pet and each night", () => {
        expect(mod.petSupplement(1, 1)).toBe(600);
        expect(mod.petSupplement(2, 3)).toBe(3600);
        expect(mod.petSupplement(0, 5)).toBe(0);
    });
    pin("petSupplement: no more than seven nights are charged", () => {
        expect(mod.petSupplement(1, 7)).toBe(4200);
        expect(mod.petSupplement(1, 8)).toBe(4200);
        expect(mod.petSupplement(3, 21)).toBe(12600);
    });

    pin("formatPence: pounds and two places", () => {
        expect(mod.formatPence(0)).toBe("£0.00");
        expect(mod.formatPence(5)).toBe("£0.05");
        expect(mod.formatPence(1250)).toBe("£12.50");
        expect(mod.formatPence(123456)).toBe("£1234.56");
    });
    pin("formatPence: the sign goes before the pound sign", () => {
        expect(mod.formatPence(-1250)).toBe("-£12.50");
        expect(mod.formatPence(-5)).toBe("-£0.05");
        expect(mod.formatPence(-270120)).toBe("-£2701.20");
    });

    // ------------------------------------------------------------------------------------------- the quote

    pin("quoteHire: a short hire in one season", () => {
        expect(mod.quoteHire({ boatClass: "narrow", startDay: 10, nights: 3, pets: 0 })).toEqual({
            lines: [{ label: "3 nights, low season", pence: 25500 }],
            totalPence: 25500,
            bondPence: 25000,
        });
    });
    pin("quoteHire: one night is not nights", () => {
        expect(mod.quoteHire({ boatClass: "wide", startDay: 200, nights: 1, pets: 0 })).toEqual({
            lines: [{ label: "1 night, high season", pence: 17800 }],
            totalPence: 17800,
            bondPence: 30000,
        });
    });
    pin("quoteHire: the seasons' lines go low, mid, high, whichever the hire meets first", () => {
        expect(mod.quoteHire({ boatClass: "cruiser", startDay: 240, nights: 6, pets: 0 })).toEqual({
            lines: [
                { label: "2 nights, mid season", pence: 25000 },
                { label: "4 nights, high season", pence: 65200 },
            ],
            totalPence: 90200,
            bondPence: 25000,
        });
        expect(mod.quoteHire({ boatClass: "heritage", startDay: 302, nights: 4, pets: 0 }).lines).toEqual([
            { label: "1 night, low season", pence: 12800 },
            { label: "3 nights, mid season", pence: 49200 },
        ]);
    });
    pin("quoteHire: the bond goes by class and is not in the total", () => {
        const quotes = mod.BOAT_CLASSES.map((boatClass) =>
            mod.quoteHire({ boatClass, startDay: 120, nights: 2, pets: 0 }),
        );
        expect(quotes.map((q) => q.bondPence)).toEqual([25000, 30000, 25000, 50000]);
        expect(quotes.map((q) => q.totalPence)).toEqual([22400, 27200, 25000, 32800]);
    });
    pin("quoteHire: pets have a line of their own after the nights", () => {
        expect(mod.quoteHire({ boatClass: "narrow", startDay: 10, nights: 3, pets: 1 })).toEqual({
            lines: [
                { label: "3 nights, low season", pence: 25500 },
                { label: "1 pet", pence: 1800 },
            ],
            totalPence: 27300,
            bondPence: 25000,
        });
        expect(mod.quoteHire({ boatClass: "narrow", startDay: 10, nights: 3, pets: 2 }).lines[1]).toEqual({
            label: "2 pets",
            pence: 3600,
        });
    });
    pin("quoteHire: the total of a hire of a week or more is less the discount", () => {
        const total = (nights: number): number =>
            mod.quoteHire({ boatClass: "narrow", startDay: 10, nights, pets: 0 }).totalPence;
        expect(total(6)).toBe(51000);
        expect(total(7)).toBe(56525);
        expect(total(10)).toBe(78625);
        expect(total(14)).toBe(107100);
        expect(total(21)).toBe(151725);
    });
    pin("quoteHire: a part of a penny of the discount is dropped", () => {
        const quote = mod.quoteHire({ boatClass: "narrow", startDay: 10, nights: 11, pets: 0 });
        expect(quote.totalPence).toBe(86488);
        expect(quote.lines[1].pence).toBe(-7012);
    });
    pin("quoteHire: the discount is on the boat and not on the pets", () => {
        const quote = mod.quoteHire({ boatClass: "heritage", startDay: 180, nights: 14, pets: 2 });
        expect(quote.totalPence).toBe(270120);
        expect(quote.lines.map((line) => line.pence)).toEqual([32800, 258000, -29080, 8400]);
    });
    pin("quoteHire: no more than five hundred pounds comes off, however long and dear the hire", () => {
        const priced = (boatClass: "narrow" | "cruiser" | "heritage"): number[] => {
            const quote = mod.quoteHire({ boatClass, startDay: 185, nights: 21, pets: 0 });
            return [...quote.lines.map((line) => line.pence), quote.totalPence];
        };
        expect(priced("narrow")).toEqual([312900, -46935, 265965]);
        expect(priced("cruiser")).toEqual([342300, -50000, 292300]);
        expect(priced("heritage")).toEqual([451500, -50000, 401500]);
    });
    pin("quoteHire: the discount line follows the nights and comes before the pets", () => {
        expect(mod.quoteHire({ boatClass: "heritage", startDay: 180, nights: 14, pets: 2 })).toEqual({
            lines: [
                { label: "2 nights, mid season", pence: 32800 },
                { label: "12 nights, high season", pence: 258000 },
                { label: "Long hire discount", pence: -29080 },
                { label: "2 pets", pence: 8400 },
            ],
            totalPence: 270120,
            bondPence: 50000,
        });
    });
    pin("quoteHire: a hire over the new year", () => {
        expect(mod.quoteHire({ boatClass: "wide", startDay: 364, nights: 4, pets: 0 })).toEqual({
            lines: [{ label: "4 nights, low season", pence: 41600 }],
            totalPence: 41600,
            bondPence: 30000,
        });
    });
    pin("quoteHire: refuses a hire of no nights or of part of a night", () => {
        expect(() => mod.quoteHire({ boatClass: "narrow", startDay: 10, nights: 0, pets: 0 })).toThrow(RangeError);
        expect(() => mod.quoteHire({ boatClass: "narrow", startDay: 10, nights: 2.5, pets: 0 })).toThrow(RangeError);
        expect(() => mod.quoteHire({ boatClass: "narrow", startDay: 10, nights: -3, pets: 0 })).toThrow(
            "a hire is one night or more, not -3",
        );
    });
    pin("quoteHire: refuses a hire of no nights and a hire of part of a night in the same words", () => {
        expect(() => mod.quoteHire({ boatClass: "narrow", startDay: 10, nights: 0, pets: 0 })).toThrow(
            "a hire is one night or more, not 0",
        );
        expect(() => mod.quoteHire({ boatClass: "narrow", startDay: 10, nights: 2.5, pets: 0 })).toThrow(
            "a hire is one night or more, not 2.5",
        );
    });
    pin("quoteHire: does not change the hire it is given", () => {
        const hire = { boatClass: "wide" as const, startDay: 400, nights: 8, pets: 1 };
        const before = copyOf(hire);
        mod.quoteHire(hire);
        expect(hire).toEqual(before);
    });

    pin("addExtra: adds a line to the quote it is given and returns the new total", () => {
        const quote = quoteOf(25500, 25000);
        expect(mod.addExtra(quote, "Mooring at the basin", 1500)).toBe(27000);
        expect(quote).toEqual({
            lines: [
                { label: "Hire", pence: 25500 },
                { label: "Mooring at the basin", pence: 1500 },
            ],
            totalPence: 27000,
            bondPence: 25000,
        });
    });
    pin("addExtra: a reduction is a line under nothing", () => {
        const quote = quoteOf(25500);
        expect(mod.addExtra(quote, "Returning customer", -2000)).toBe(23500);
        expect(quote.lines[1]).toEqual({ label: "Returning customer", pence: -2000 });
        expect(quote.totalPence).toBe(23500);
    });
    pin("addExtra: a reduction stops when the total is nothing", () => {
        const quote = quoteOf(5000, 25000);
        expect(mod.addExtra(quote, "Goodwill", -8000)).toBe(0);
        expect(quote.lines[1]).toEqual({ label: "Goodwill", pence: -5000 });
        expect(quote.totalPence).toBe(0);
        expect(quote.bondPence).toBe(25000);
    });
    pin("addExtra: an extra of nothing still has its line", () => {
        const quote = quoteOf(5000);
        expect(mod.addExtra(quote, "Free", 0)).toBe(5000);
        expect(quote.lines).toEqual([
            { label: "Hire", pence: 5000 },
            { label: "Free", pence: 0 },
        ]);
    });

    pin("quoteText: labels are padded to the longest, two spaces before the amount", () => {
        const quote: Quote = {
            lines: [
                { label: "12 nights, high season", pence: 258000 },
                { label: "Long hire", pence: -29080 },
                { label: "2 pets", pence: 8400 },
            ],
            totalPence: 237320,
            bondPence: 50000,
        };
        expect(mod.quoteText(quote)).toEqual([
            "12 nights, high season  £2580.00",
            "Long hire               -£290.80",
            "2 pets                  £84.00",
            "Total                   £2373.20",
            "Bond, returned after the hire: £500.00",
        ]);
    });
    pin("quoteText: no bond line when there is no bond", () => {
        expect(mod.quoteText(quoteOf(25500, 0))).toEqual(["Hire   £255.00", "Total  £255.00"]);
    });
    pin("quoteText: a quote with no lines still has its total", () => {
        expect(mod.quoteText({ lines: [], totalPence: 0, bondPence: 100 })).toEqual([
            "Total  £0.00",
            "Bond, returned after the hire: £1.00",
        ]);
    });
    pin("quoteText: leaves the quote as it was, and gives the same lines a second time", () => {
        const quote = quoteOf(25500, 25000);
        const before = copyOf(quote);
        const first = mod.quoteText(quote);
        expect(first).toEqual(["Hire   £255.00", "Total  £255.00", "Bond, returned after the hire: £250.00"]);
        expect(quote).toEqual(before);
        expect(mod.quoteText(quote)).toEqual(first);
    });

    // ------------------------------------------------------------------------------- deposits and the ledger

    pin("depositDue: a quarter of the total", () => {
        expect(mod.depositDue(quoteOf(100000))).toBe(25000);
        expect(mod.depositDue(quoteOf(270120, 50000))).toBe(67530);
    });
    pin("depositDue: a part of a penny is dropped", () => {
        expect(mod.depositDue(quoteOf(50002))).toBe(12500);
        expect(mod.depositDue(quoteOf(50003))).toBe(12500);
        expect(mod.depositDue(quoteOf(50004))).toBe(12501);
    });
    pin("depositDue: never under the floor of a hundred pounds", () => {
        expect(mod.depositDue(quoteOf(30000))).toBe(10000);
        expect(mod.depositDue(quoteOf(40000))).toBe(10000);
        expect(mod.depositDue(quoteOf(40004))).toBe(10001);
    });
    pin("depositDue: the whole price when that is under the floor", () => {
        expect(mod.depositDue(quoteOf(8500, 25000))).toBe(8500);
        expect(mod.depositDue(quoteOf(10000))).toBe(10000);
        expect(mod.depositDue(quoteOf(10001))).toBe(10000);
        expect(mod.depositDue(quoteOf(0))).toBe(0);
    });
    pin("depositDue: leaves the quote as it was", () => {
        const quote = quoteOf(270120, 50000);
        const before = copyOf(quote);
        expect(mod.depositDue(quote)).toBe(67530);
        expect(quote).toEqual(before);
    });

    pin("recordPayment: puts the newest first and returns what is now paid", () => {
        const ledger: Payment[] = [];
        expect(mod.recordPayment(ledger, { day: 350, pence: 10000, kind: "deposit" })).toBe(10000);
        expect(mod.recordPayment(ledger, { day: 12, pence: 30000, kind: "balance" })).toBe(40000);
        expect(mod.recordPayment(ledger, { day: 20, pence: 5000, kind: "refund" })).toBe(35000);
        expect(ledger).toEqual([
            { day: 20, pence: 5000, kind: "refund" },
            { day: 12, pence: 30000, kind: "balance" },
            { day: 350, pence: 10000, kind: "deposit" },
        ]);
    });
    pin("recordPayment: a payment of nothing or less is not entered", () => {
        const ledger = paid(10000);
        expect(mod.recordPayment(ledger, { day: 101, pence: 0, kind: "balance" })).toBe(10000);
        expect(mod.recordPayment(ledger, { day: 101, pence: -500, kind: "refund" })).toBe(10000);
        expect(ledger).toEqual(paid(10000));
    });
    pin("recordPayment: enters the very payment it is given, not a copy of it", () => {
        const ledger = paid(10000);
        const payment: Payment = { day: 120, pence: 5000, kind: "balance" };
        mod.recordPayment(ledger, payment);
        expect(ledger[0]).toBe(payment);
    });

    pin("paidSoFar: nothing for an empty ledger", () => {
        expect(mod.paidSoFar([])).toBe(0);
    });
    pin("paidSoFar: a refund counts against what was paid", () => {
        const ledger: Payment[] = [
            { day: 20, pence: 3000, kind: "refund" },
            { day: 12, pence: 20000, kind: "balance" },
            { day: 350, pence: 10000, kind: "deposit" },
        ];
        const before = copyOf(ledger);
        expect(mod.paidSoFar(ledger)).toBe(27000);
        expect(mod.paidSoFar([{ day: 5, pence: 12000, kind: "refund" }, ...paid(10000)])).toBe(-2000);
        expect(ledger).toEqual(before);
    });

    pin("lastPayment: the first entry of the ledger is the latest", () => {
        const ledger: Payment[] = [
            { day: 3, pence: 20000, kind: "balance" },
            { day: 360, pence: 2500, kind: "deposit" },
            { day: 341, pence: 10000, kind: "deposit" },
        ];
        expect(mod.lastPayment(ledger)).toEqual({ day: 3, pence: 20000, kind: "balance" });
    });
    pin("lastPayment: the latest of one kind", () => {
        const ledger: Payment[] = [
            { day: 3, pence: 20000, kind: "balance" },
            { day: 360, pence: 2500, kind: "deposit" },
            { day: 341, pence: 10000, kind: "deposit" },
        ];
        expect(mod.lastPayment(ledger, "deposit")).toEqual({ day: 360, pence: 2500, kind: "deposit" });
        expect(mod.lastPayment(ledger, "balance")).toEqual({ day: 3, pence: 20000, kind: "balance" });
    });
    pin("lastPayment: undefined when there is none", () => {
        expect(mod.lastPayment([])).toBeUndefined();
        expect(mod.lastPayment(paid(10000), "refund")).toBeUndefined();
    });
    pin("lastPayment: the one recordPayment entered last", () => {
        const ledger: Payment[] = [];
        mod.recordPayment(ledger, { day: 200, pence: 10000, kind: "deposit" });
        mod.recordPayment(ledger, { day: 150, pence: 4000, kind: "deposit" });
        expect(mod.lastPayment(ledger)).toEqual({ day: 150, pence: 4000, kind: "deposit" });
    });
    pin("lastPayment: with no kind, a refund is a payment like any other", () => {
        const ledger: Payment[] = [
            { day: 20, pence: 3000, kind: "refund" },
            { day: 12, pence: 20000, kind: "balance" },
        ];
        expect(mod.lastPayment(ledger)).toEqual({ day: 20, pence: 3000, kind: "refund" });
    });
    pin("lastPayment: gives the ledger's own entry, not a copy, and leaves the ledger as it was", () => {
        const ledger: Payment[] = [
            { day: 3, pence: 20000, kind: "balance" },
            { day: 360, pence: 2500, kind: "deposit" },
            { day: 341, pence: 10000, kind: "deposit" },
        ];
        const before = copyOf(ledger);
        expect(mod.lastPayment(ledger)).toBe(ledger[0]);
        expect(mod.lastPayment(ledger, "deposit")).toBe(ledger[1]);
        expect(ledger).toEqual(before);
    });

    pin("securedOn: the day of the earliest deposit, which is the last in the ledger", () => {
        const ledger: Payment[] = [
            { day: 3, pence: 20000, kind: "balance" },
            { day: 360, pence: 2500, kind: "deposit" },
            { day: 341, pence: 10000, kind: "deposit" },
            { day: 2, pence: 100, kind: "refund" },
        ];
        expect(mod.securedOn(ledger)).toBe(341);
    });
    pin("securedOn: 0 when no deposit has come in", () => {
        expect(mod.securedOn([])).toBe(0);
        expect(mod.securedOn([{ day: 14, pence: 20000, kind: "balance" }])).toBe(0);
    });
    pin("securedOn: the first deposit recordPayment entered", () => {
        const ledger: Payment[] = [];
        mod.recordPayment(ledger, { day: 200, pence: 10000, kind: "deposit" });
        mod.recordPayment(ledger, { day: 150, pence: 4000, kind: "deposit" });
        expect(mod.securedOn(ledger)).toBe(200);
    });
    pin("securedOn: leaves the ledger as it was", () => {
        const ledger: Payment[] = [
            { day: 9, pence: 20000, kind: "balance" },
            { day: 3, pence: 10000, kind: "deposit" },
        ];
        const before = copyOf(ledger);
        expect(mod.securedOn(ledger)).toBe(3);
        expect(ledger).toEqual(before);
    });

    pin("balanceDue: the price and the bond, less what has come in", () => {
        expect(mod.balanceDue(quoteOf(100000, 25000), [])).toBe(125000);
        expect(mod.balanceDue(quoteOf(100000, 25000), paid(25000))).toBe(100000);
    });
    pin("balanceDue: a refund puts its amount back on", () => {
        const ledger: Payment[] = [{ day: 120, pence: 5000, kind: "refund" }, ...paid(25000)];
        expect(mod.balanceDue(quoteOf(100000, 25000), ledger)).toBe(105000);
    });
    pin("balanceDue: never under nothing", () => {
        expect(mod.balanceDue(quoteOf(100000, 25000), paid(125000))).toBe(0);
        expect(mod.balanceDue(quoteOf(100000, 25000), paid(130000))).toBe(0);
    });
    pin("balanceDue: a ledger that has given back more than it took owes more than the price and the bond", () => {
        const ledger: Payment[] = [{ day: 5, pence: 12000, kind: "refund" }, ...paid(10000)];
        expect(mod.balanceDue(quoteOf(100000, 25000), ledger)).toBe(127000);
    });
    pin("balanceDue: leaves the quote and the ledger as they were", () => {
        const quote = quoteOf(100000, 25000);
        const ledger: Payment[] = [{ day: 120, pence: 5000, kind: "refund" }, ...paid(25000)];
        const before = copyOf({ quote, ledger });
        expect(mod.balanceDue(quote, ledger)).toBe(105000);
        expect({ quote, ledger }).toEqual(before);
    });

    // ----------------------------------------------------------------------------------------- the refunds

    pin("refundRate: each step from its own notice", () => {
        const rates = [200, 56, 55, 28, 27, 14, 13, 0].map((d) => mod.refundRate(d));
        expect(rates).toEqual([1000, 1000, 500, 500, 250, 250, 0, 0]);
    });
    pin("refundRate: nothing for a day already gone", () => {
        expect(mod.refundRate(-1)).toBe(0);
    });

    pin("refundDue: nothing paid, nothing back", () => {
        expect(mod.refundDue([], 200, 100)).toBe(0);
        const evened: Payment[] = [{ day: 90, pence: 10000, kind: "refund" }, ...paid(10000, 80)];
        expect(mod.refundDue(evened, 200, 100)).toBe(0);
    });
    pin("refundDue: all of it less the fee at eight weeks' notice", () => {
        expect(mod.refundDue(paid(40000), 200, 144)).toBe(37500);
        expect(mod.refundDue(paid(40000), 200, 101)).toBe(37500);
    });
    pin("refundDue: half of it less the fee from four weeks' notice", () => {
        expect(mod.refundDue(paid(40000), 200, 145)).toBe(17500);
        expect(mod.refundDue(paid(40000), 200, 172)).toBe(17500);
    });
    pin("refundDue: a quarter of it less the fee from two weeks' notice", () => {
        expect(mod.refundDue(paid(40000), 200, 173)).toBe(7500);
        expect(mod.refundDue(paid(40000), 200, 186)).toBe(7500);
    });
    pin("refundDue: the fee is a tenth of what was paid, and no more than twenty-five pounds", () => {
        expect(mod.refundDue(paid(10000), 200, 100)).toBe(9000);
        expect(mod.refundDue(paid(10005), 200, 100)).toBe(9005);
        expect(mod.refundDue(paid(24990), 200, 100)).toBe(22491);
        expect(mod.refundDue(paid(25000), 200, 100)).toBe(22500);
        expect(mod.refundDue(paid(25010), 200, 100)).toBe(22510);
    });
    pin("refundDue: a small payment's fee comes off its half or its quarter", () => {
        expect(mod.refundDue(paid(10000), 200, 160)).toBe(4000);
        expect(mod.refundDue(paid(10000), 200, 180)).toBe(1500);
    });
    pin("refundDue: nothing under two weeks' notice", () => {
        expect(mod.refundDue(paid(40000), 200, 187)).toBe(0);
        expect(mod.refundDue(paid(40000), 200, 200)).toBe(0);
    });
    pin("refundDue: eight weeks' notice counted over the new year", () => {
        expect(mod.refundDue(paid(40000, 300), 20, 329)).toBe(37500);
    });
    pin("refundDue: under eight weeks' notice counted over the new year", () => {
        expect(mod.refundDue(paid(40000, 300), 20, 330)).toBe(17500);
    });
    pin("refundDue: a cancel day more than a year past the start still gives notice within the year ahead", () => {
        // Day 20 looks 480 days earlier than day 500, so it is taken as day 20 two years on: 250 days' notice.
        expect(mod.refundDue(paid(40000), 20, 500)).toBe(37500);
        expect(mod.refundDue(paid(40000), 200, 600)).toBe(37500);
    });
    pin("refundDue: what was paid is less the refunds already made", () => {
        const ledger: Payment[] = [
            { day: 130, pence: 10000, kind: "refund" },
            { day: 120, pence: 30000, kind: "balance" },
            { day: 100, pence: 20000, kind: "deposit" },
        ];
        const before = copyOf(ledger);
        expect(mod.refundDue(ledger, 200, 140)).toBe(37500);
        expect(ledger).toEqual(before);
    });
    pin("refundDue: at eight weeks' notice, under five pounds is not sent", () => {
        expect(mod.refundDue(paid(554), 200, 100)).toBe(0);
        expect(mod.refundDue(paid(555), 200, 100)).toBe(500);
        expect(mod.refundDue(paid(1), 200, 100)).toBe(0);
    });
    pin("refundDue: at shorter notice, under five pounds after the fee is not sent", () => {
        expect(mod.refundDue(paid(1247), 200, 160)).toBe(0);
        expect(mod.refundDue(paid(1248), 200, 160)).toBe(500);
    });
    pin("refundDue: a part of a penny is dropped before the fee", () => {
        expect(mod.refundDue(paid(40003), 200, 180)).toBe(7500);
        expect(mod.refundDue(paid(40004), 200, 180)).toBe(7501);
    });

    for (const name of skip) {
        if (!cases.some(([known]) => known === name)) {
            throw new Error(`no case is called "${name}"`);
        }
    }
    describe("the rest of tariff does what it did", () => {
        for (const [name, run] of cases) {
            if (!skip.includes(name)) {
                it(name, run);
            }
        }
    });
}

import { describe, expect, it } from "vitest";
import * as mod from "../src/tariff";
import { unchanged } from "./helpers-tariff";

describe("quoteHire says the percentage on the discount line", () => {
    const labels = (nights: number): string[] =>
        mod.quoteHire({ boatClass: "narrow", startDay: 10, nights, pets: 0 }).lines.map((line) => line.label);

    it("says 5% for a hire of a week", () => {
        expect(labels(7)).toEqual(["7 nights, low season", "Long hire discount (5%)"]);
        expect(labels(9)).toEqual(["9 nights, low season", "Long hire discount (5%)"]);
    });

    it("says 7.5% with no more places than it needs", () => {
        expect(labels(10)).toEqual(["10 nights, low season", "Long hire discount (7.5%)"]);
        expect(labels(13)).toEqual(["13 nights, low season", "Long hire discount (7.5%)"]);
    });

    it("says 10% with no zero after it", () => {
        expect(labels(14)).toEqual(["14 nights, low season", "Long hire discount (10%)"]);
        expect(labels(20)).toEqual(["20 nights, low season", "Long hire discount (10%)"]);
    });

    it("says 15% for the longest hires", () => {
        expect(labels(21)).toEqual(["21 nights, low season", "Long hire discount (15%)"]);
        expect(labels(40)).toEqual(["40 nights, low season", "Long hire discount (15%)"]);
    });

    it("says the percentage earned when the cap has held the amount below it", () => {
        expect(mod.quoteHire({ boatClass: "heritage", startDay: 185, nights: 21, pets: 0 }).lines).toEqual([
            { label: "21 nights, high season", pence: 451500 },
            { label: "Long hire discount (15%)", pence: -50000 },
        ]);
        expect(mod.quoteHire({ boatClass: "heritage", startDay: 185, nights: 20, pets: 0 }).lines).toEqual([
            { label: "20 nights, high season", pence: 430000 },
            { label: "Long hire discount (10%)", pence: -43000 },
        ]);
        expect(mod.quoteHire({ boatClass: "cruiser", startDay: 185, nights: 30, pets: 0 }).lines[1]).toEqual({
            label: "Long hire discount (15%)",
            pence: -50000,
        });
    });

    it("has no discount line for a hire that earns no discount", () => {
        expect(labels(6)).toEqual(["6 nights, low season"]);
        expect(labels(1)).toEqual(["1 night, low season"]);
    });

    it("leaves the amount, the other lines, their order and the total as they were", () => {
        expect(mod.quoteHire({ boatClass: "heritage", startDay: 180, nights: 14, pets: 2 })).toEqual({
            lines: [
                { label: "2 nights, mid season", pence: 32800 },
                { label: "12 nights, high season", pence: 258000 },
                { label: "Long hire discount (10%)", pence: -29080 },
                { label: "2 pets", pence: 8400 },
            ],
            totalPence: 270120,
            bondPence: 50000,
        });
        expect(mod.quoteHire({ boatClass: "narrow", startDay: 10, nights: 11, pets: 1 })).toEqual({
            lines: [
                { label: "11 nights, low season", pence: 93500 },
                { label: "Long hire discount (7.5%)", pence: -7012 },
                { label: "1 pet", pence: 4200 },
            ],
            totalPence: 90688,
            bondPence: 25000,
        });
    });
});

unchanged(mod, ["quoteHire: the discount line follows the nights and comes before the pets"]);

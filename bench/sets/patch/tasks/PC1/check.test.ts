import { describe, expect, it } from "vitest";
import * as mod from "../src/tariff";
import { unchanged } from "./helpers-tariff";

type BoatClass = import("../src/tariff").BoatClass;
type Found = (boatClass: BoatClass, nights: number, fromDay: number, toDay: number) => number;

describe("cheapestStart", () => {
    const cheapestStart: Found = (...args) => (mod as unknown as { cheapestStart: Found }).cheapestStart(...args);
    const total = (boatClass: BoatClass, nights: number, startDay: number): number =>
        mod.quoteHire({ boatClass, startDay, nights, pets: 0 }).totalPence;

    it("is exported as a function", () => {
        expect(typeof (mod as unknown as { cheapestStart: unknown }).cheapestStart).toBe("function");
    });

    it("returns the first day when every day costs the same", () => {
        expect(cheapestStart("narrow", 3, 10, 20)).toBe(10);
        expect(cheapestStart("heritage", 5, 190, 230)).toBe(190);
    });

    it("returns a later day when it is cheaper", () => {
        // High season runs to day 244: three nights from day 244 are the first with none in it.
        expect(cheapestStart("cruiser", 3, 238, 250)).toBe(244);
        expect(cheapestStart("wide", 3, 238, 250)).toBe(244);
    });

    it("tries toDay itself", () => {
        expect(cheapestStart("cruiser", 3, 238, 244)).toBe(244);
        expect(cheapestStart("cruiser", 3, 238, 243)).toBe(243);
        // Fourteen nights from day 305 are the first that are all low season.
        expect(cheapestStart("narrow", 14, 290, 305)).toBe(305);
        expect(cheapestStart("narrow", 14, 290, 304)).toBe(304);
    });

    it("tries fromDay itself", () => {
        // One night on day 181 is mid season; every later night here is high.
        expect(cheapestStart("narrow", 1, 181, 185)).toBe(181);
        expect(cheapestStart("heritage", 4, 178, 200)).toBe(178);
    });

    it("takes a span of one day", () => {
        expect(cheapestStart("wide", 5, 200, 200)).toBe(200);
        expect(cheapestStart("wide", 5, 304, 304)).toBe(304);
    });

    it("returns the earliest of several cheapest days", () => {
        // Two nights from day 305 on are all low season, and so are those of every later start here.
        expect(cheapestStart("narrow", 2, 300, 310)).toBe(305);
        expect(cheapestStart("heritage", 2, 170, 320)).toBe(305);
        expect(cheapestStart("wide", 1, 100, 400)).toBe(305);
    });

    it("finds a cheapest day that is neither end of the span", () => {
        expect(cheapestStart("cruiser", 7, 60, 100)).toBe(60);
        expect(cheapestStart("cruiser", 7, 150, 250)).toBe(150);
        expect(cheapestStart("cruiser", 2, 182, 320)).toBe(305);
        expect(cheapestStart("cruiser", 10, 230, 290)).toBe(244);
    });

    it("returns a day past the end of the year as it was given", () => {
        expect(cheapestStart("narrow", 2, 665, 675)).toBe(670);
        expect(cheapestStart("narrow", 3, 360, 370)).toBe(360);
        expect(cheapestStart("wide", 3, 550, 620)).toBe(609);
    });

    it("prices exactly the nights it is given", () => {
        // Three nights from day 179 are the last three of mid season. Four would take in day 182, which is high.
        expect(cheapestStart("narrow", 3, 179, 250)).toBe(179);
        // One night on day 181 is mid season. Two would take in day 182.
        expect(cheapestStart("narrow", 1, 181, 251)).toBe(181);
    });

    it("prices the boat class it is given", () => {
        // Sixty-eight nights from day 100 are all mid season. From day 241 three are high and four are low,
        // which costs a narrow or a heritage boat more, and a wide boat or a cruiser less.
        expect(cheapestStart("narrow", 68, 100, 241)).toBe(100);
        expect(cheapestStart("heritage", 68, 100, 241)).toBe(100);
        expect(cheapestStart("wide", 68, 100, 241)).toBe(241);
        expect(cheapestStart("cruiser", 68, 100, 241)).toBe(241);
    });

    it("returns a day whose total no other day in the span beats", () => {
        const spans = [[4, 80, 100], [9, 170, 260], [21, 280, 330], [1, 355, 375], [3, 179, 250], [68, 100, 241]];
        for (const boatClass of mod.BOAT_CLASSES) {
            for (const [nights, fromDay, toDay] of spans) {
                const found = cheapestStart(boatClass, nights, fromDay, toDay);
                const totals: number[] = [];
                for (let day = fromDay; day <= toDay; day++) {
                    totals.push(total(boatClass, nights, day));
                }
                const least = Math.min(...totals);
                expect(found).toBe(fromDay + totals.indexOf(least));
            }
        }
    });
});

unchanged(mod);

import { describe, expect, it } from "vitest";
import * as mod from "../src/rota";
import { unchanged } from "./helpers-rota";

function shiftOn(day: number, start: number, end: number): mod.Shift {
    return { id: "s1", staffId: "ada", day, start, end, role: "hand" };
}

// Day 14 is a Monday, so days 6, 13, 20 and 27 are Sundays. The weeks go on the same way before day 0.
const SUNDAYS = [6, 13, 20, 27, 699, -1, -8];
const OTHER_DAYS = [0, 1, 2, 3, 4, 5, 7, 12, 14, 15, 16, 17, 18, 19, 21, 26, 28, 700, -2, -6, -7, -9];

describe("shiftPayPence, with the Sunday allowance", () => {
    it("adds 1,250 pence to a shift that starts on a Sunday", () => {
        for (const day of SUNDAYS) {
            expect(mod.shiftPayPence(shiftOn(day, 420, 930), 1260)).toBe(10080 + 1250);
        }
    });

    it("adds the same whatever the length and the rate", () => {
        expect(mod.shiftPayPence(shiftOn(20, 540, 570), 1100)).toBe(550 + 1250);
        expect(mod.shiftPayPence(shiftOn(20, 420, 780), 1100)).toBe(6600 + 1250);
        expect(mod.shiftPayPence(shiftOn(20, 360, 1110), 2000)).toBe(24000 + 1250);
        expect(mod.shiftPayPence(shiftOn(20, 420, 930), 0)).toBe(1250);
    });

    it("adds it after the pay has been rounded", () => {
        expect(mod.shiftPayPence(shiftOn(20, 540, 570), 1333)).toBe(667 + 1250);
        expect(mod.shiftPayPence(shiftOn(20, 540, 570), 1332)).toBe(666 + 1250);
        expect(mod.shiftPayPence(shiftOn(20, 540, 560), 1000)).toBe(333 + 1250);
    });

    it("pays a shift that starts on any other day what it paid before", () => {
        for (const day of OTHER_DAYS) {
            expect(mod.shiftPayPence(shiftOn(day, 420, 930), 1260)).toBe(10080);
            expect(mod.shiftPayPence(shiftOn(day, 540, 570), 1333)).toBe(667);
            expect(mod.shiftPayPence(shiftOn(day, 420, 930), 0)).toBe(0);
        }
    });

    it("goes by the day a night shift starts on", () => {
        // Saturday night into Sunday morning: no allowance.
        expect(mod.shiftPayPence(shiftOn(19, 1320, 360), 1575)).toBe(11813);
        expect(mod.shiftPayPence(shiftOn(19, 1200, 600), 1200)).toBe(16200);
        // Sunday night into Monday morning: the allowance.
        expect(mod.shiftPayPence(shiftOn(20, 1320, 360), 1575)).toBe(11813 + 1250);
        expect(mod.shiftPayPence(shiftOn(20, 1380, 60), 1200)).toBe(2400 + 1250);
    });
});

describe("Rota.costOn, with the Sunday allowance", () => {
    it("adds up each held shift's pay on a Sunday, the allowance with it", () => {
        const rota = new mod.Rota();
        rota.addStaff({ id: "ada", name: "Ada", roles: ["hand"], ratePence: 1260, contractMinutes: 2400 });
        rota.addStaff({ id: "cleo", name: "Cleo", roles: ["office"], ratePence: 1333, contractMinutes: 1200 });
        rota.addShift(20, 540, 780, "hand", "ada");
        rota.addShift(20, 540, 570, "office", "cleo");
        rota.addShift(20, 600, 700, "hand");
        rota.addShift(21, 540, 780, "hand", "ada");
        expect(rota.costOn(20)).toBe(5040 + 1250 + 667 + 1250);
        expect(rota.costOn(21)).toBe(5040);
    });
});

unchanged(mod, [
    "shiftPayPence pays the same whatever day the shift is on",
    "Rota.costOn of a Sunday is worked out as for any other day",
]);

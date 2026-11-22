import { describe, expect, it } from "vitest";
import * as mod from "../src/handover";
import { unchanged } from "./helpers-handover";

const kestrel = { name: "Kestrel", berths: 4, tankLitres: 180, gasBottles: 2 };
const at = (day: number, hour: number, minute = 0): number => day * 1440 + hour * 60 + minute;
const DUE_BACK = at(17, 9, 30);

// A boat that went out with a full list and came back `late` minutes after it was due.
const backLate = (late: number) => {
    const h = new mod.Handover("kf-12", kestrel, at(10, 14), DUE_BACK, 20000);
    h.open(at(10, 13), "Mo");
    for (const code of ["KEYS", "GAS", "SAFETY", "HELM", "INVENTORY"]) h.tick("out", code, "ok", at(10, 13, 5), "Mo");
    h.read("out", { at: at(10, 13, 20), fuel: 1500, engine: 12034, water: 8, gas: 2 }, "Mo");
    h.release(at(10, 13, 40), "Mo");
    h.takeBack(DUE_BACK + late, "Ines");
    return h;
};

describe("lateCharge, with the steps after the fourth at twice the price", () => {
    it("still charges nothing for no lateness", () => {
        expect(mod.lateCharge(0)).toBe(0);
        expect(mod.lateCharge(-30)).toBe(0);
    });

    it("charges the first four steps as before, each started half hour at 1200 pence", () => {
        expect(mod.lateCharge(1)).toBe(1200);
        expect(mod.lateCharge(30)).toBe(1200);
        expect(mod.lateCharge(31)).toBe(2400);
        expect(mod.lateCharge(60)).toBe(2400);
        expect(mod.lateCharge(61)).toBe(3600);
        expect(mod.lateCharge(90)).toBe(3600);
        expect(mod.lateCharge(91)).toBe(4800);
        expect(mod.lateCharge(120)).toBe(4800);
    });

    it("charges the fifth step at twice the price, from the minute it is started", () => {
        expect(mod.lateCharge(121)).toBe(7200);
        expect(mod.lateCharge(150)).toBe(7200);
    });

    it("charges every step after the fourth at twice the price", () => {
        expect(mod.lateCharge(151)).toBe(9600);
        expect(mod.lateCharge(180)).toBe(9600);
        expect(mod.lateCharge(181)).toBe(12000);
        expect(mod.lateCharge(210)).toBe(12000);
        expect(mod.lateCharge(211)).toBe(14400);
        expect(mod.lateCharge(240)).toBe(14400);
    });

    it("keeps the cap of 15000 pence on the whole charge", () => {
        expect(mod.lateCharge(241)).toBe(15000);
        expect(mod.lateCharge(270)).toBe(15000);
        expect(mod.lateCharge(360)).toBe(15000);
        expect(mod.lateCharge(5000)).toBe(15000);
    });

    it("shows in what a handover charges for a late return", () => {
        expect(backLate(95).charges()).toEqual([{ code: "late", pence: 4800, note: "95 min late" }]);
        expect(backLate(150).charges()).toEqual([{ code: "late", pence: 7200, note: "150 min late" }]);
        expect(backLate(600).charges()).toEqual([{ code: "late", pence: 15000, note: "600 min late" }]);
    });
});

unchanged(mod, ["lateCharge: a step costs the same after two hours", "lateCharge: stops at the cap"]);

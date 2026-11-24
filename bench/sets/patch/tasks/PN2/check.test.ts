import { describe, expect, it } from "vitest";
import * as mod from "../src/parts";
import type { Part } from "../src/parts";
import { unchanged } from "./helpers-parts";

function part(partNo: string, packSize: number): Part {
    return { partNo, name: "Oil filter", bin: "A1", packSize, reorderAt: 0, reorderUpTo: 0, supplier: "Pellow & Tarn" };
}

function store(packSize: number): InstanceType<typeof mod.PartsStore> {
    const made = new mod.PartsStore();
    made.addPart(part("ENG-0412", packSize));
    return made;
}

describe("PartsStore.receive, for a delivery with a pack price of 0", () => {
    it("leaves the average price as it was", () => {
        const s = store(4);
        s.receive("ENG-0412", 1, 400, 1);
        s.receive("ENG-0412", 1, 0, 2);
        expect(s.avgPence("ENG-0412")).toBe(100);
        s.receive("ENG-0412", 5, 0, 3);
        expect(s.avgPence("ENG-0412")).toBe(100);
    });

    it("leaves an average that is not a round number as it was", () => {
        const s = store(2);
        s.receive("ENG-0412", 1, 301, 1);
        s.receive("ENG-0412", 3, 0, 2);
        expect(s.avgPence("eng-0412")).toBe(151);
    });

    it("leaves the average as it was when none of the part is on the shelf", () => {
        const s = store(4);
        s.receive("ENG-0412", 1, 1000, 1);
        s.issue("ENG-0412", 4, "J-1", 2);
        expect(s.onHand("ENG-0412")).toBe(0);
        s.receive("ENG-0412", 1, 0, 3);
        expect(s.avgPence("ENG-0412")).toBe(250);
        expect(s.onHand("ENG-0412")).toBe(4);
    });

    it("leaves an average of 0 at 0 for a part never paid for", () => {
        const s = store(4);
        s.receive("ENG-0412", 2, 0, 1);
        expect(s.avgPence("ENG-0412")).toBe(0);
        expect(s.onHand("ENG-0412")).toBe(8);
    });

    it("still puts the units on the shelf and returns them", () => {
        const s = store(6);
        s.receive("ENG-0412", 1, 1500, 1);
        expect(s.receive("ENG-0412", 2, 0, 2)).toBe(12);
        expect(s.onHand("ENG-0412")).toBe(18);
        expect(s.freeOf("ENG-0412")).toBe(18);
    });

    it("still sets the day of the last delivery", () => {
        const s = store(6);
        s.receive("ENG-0412", 1, 1500, 1);
        s.receive("ENG-0412", 1, 0, 9);
        expect(s.lastDelivered("ENG-0412")).toBe(9);
        const fresh = store(6);
        fresh.receive("ENG-0412", 1, 0, 4);
        expect(fresh.lastDelivered("ENG-0412")).toBe(4);
    });

    it("still logs the movement, with a unit price of 0", () => {
        const s = store(6);
        s.receive("ENG-0412", 1, 1500, 1);
        s.receive("ENG-0412", 2, 0, 5);
        expect(s.history("ENG-0412")).toEqual([
            { partNo: "ENG-0412", kind: "delivery", units: 12, day: 5, jobId: "", unitPence: 0 },
            { partNo: "ENG-0412", kind: "delivery", units: 6, day: 1, jobId: "", unitPence: 250 },
        ]);
    });

    it("still refuses what it refuses now, and changes nothing", () => {
        const s = store(4);
        s.receive("ENG-0412", 1, 400, 1);
        const now = () => [
            s.onHand("ENG-0412"), s.avgPence("ENG-0412"), s.lastDelivered("ENG-0412"), s.history("ENG-0412"),
        ];
        const before = now();
        expect(() => s.receive("ENG-9999", 1, 0, 2)).toThrow(RangeError);
        expect(() => s.receive("ENG-0412", 0, 0, 2)).toThrow(RangeError);
        expect(() => s.receive("ENG-0412", 1.5, 0, 2)).toThrow(RangeError);
        expect(() => s.receive("ENG-0412", -1, 0, 2)).toThrow(RangeError);
        expect(now()).toEqual(before);
        expect(s.history("ENG-9999")).toEqual([]);
    });

    it("charges the next job at the average that was kept", () => {
        const s = store(4);
        s.receive("ENG-0412", 1, 400, 1);
        s.receive("ENG-0412", 1, 0, 2);
        expect(s.issue("ENG-0412", 3, "J-1", 3)).toBe(300);
        expect(s.stockValue()).toBe(500);
    });
});

describe("PartsStore.receive, for a delivery with a price above 0", () => {
    it("is averaged in over all the units on the shelf, the free ones too", () => {
        const s = store(4);
        s.receive("ENG-0412", 1, 400, 1);
        s.receive("ENG-0412", 1, 0, 2);
        s.receive("ENG-0412", 1, 1000, 3);
        // (8 x 100 + 1000) / 12
        expect(s.avgPence("ENG-0412")).toBe(150);
    });

    it("is averaged in as before when no free pack has come", () => {
        const s = store(2);
        s.receive("ENG-0412", 1, 301, 1);
        s.receive("ENG-0412", 3, 200, 2);
        expect(s.avgPence("ENG-0412")).toBe(113);
        s.receive("ENG-0412", 1, 1, 3);
        // (8 x 113 + 1) / 10 = 90.5
        expect(s.avgPence("ENG-0412")).toBe(91);
    });

    it("is averaged in when its price is above 0 but under a penny a unit", () => {
        const s = store(4);
        s.receive("ENG-0412", 1, 400, 1);
        s.receive("ENG-0412", 1, 1, 2);
        // (4 x 100 + 1) / 8 = 50.125
        expect(s.avgPence("ENG-0412")).toBe(50);
    });
});

unchanged(mod, ["receive: a pack that cost nothing pulls the average down"]);

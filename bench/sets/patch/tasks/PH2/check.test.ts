import { describe, expect, it } from "vitest";
import * as mod from "../src/manifest";
import { unchanged } from "./helpers-manifest";

function item(label: string, unitKg: number, count: number, stowed: mod.Stowage = "aft"): mod.LoadItem {
    return { label, unitKg, count, stowed };
}

function boat(): mod.Manifest {
    const m = new mod.Manifest("Dabchick", "wren");
    m.addLeg({
        from: "Tolland Wharf",
        to: "Merrow Junction",
        day: 0,
        departMin: 600,
        distanceM: 4000,
        locks: 0,
        swingBridges: 0,
    });
    m.addPerson({
        id: "P-01",
        surname: "Okafor",
        given: "Ruth",
        role: "skipper",
        age: 44,
        weightKg: 70,
        swimmer: true,
        boardLeg: 0,
        leaveLeg: mod.TO_END,
    });
    return m;
}

describe("Manifest.addLoad keeps different unit weights apart", () => {
    it("the same thing in the same place at another unit weight is a row of its own, after the rest", () => {
        const m = boat();
        expect(m.addLoad(item("gas bottle", 13.5, 2))).toBe(true);
        expect(m.addLoad(item("coal", 25, 1, "fore"))).toBe(true);
        expect(m.addLoad(item("gas bottle", 15, 1))).toBe(true);
        expect(m.loadList()).toEqual([item("gas bottle", 13.5, 2), item("coal", 25, 1, "fore"), item("gas bottle", 15, 1)]);
    });

    it("at the same unit weight it is still folded into the row", () => {
        const m = boat();
        m.addLoad(item("gas bottle", 13.5, 2));
        expect(m.addLoad(item("gas bottle", 13.5, 3))).toBe(true);
        expect(m.loadList()).toEqual([item("gas bottle", 13.5, 5)]);
    });

    it("an item is folded into the row of its own unit weight, whichever row that is", () => {
        const m = boat();
        m.addLoad(item("gas bottle", 13.5, 2));
        m.addLoad(item("gas bottle", 14, 1));
        m.addLoad(item("gas bottle", 13, 1));
        expect(m.addLoad(item("gas bottle", 14, 2))).toBe(true);
        expect(m.addLoad(item("gas bottle", 13, 4))).toBe(true);
        expect(m.addLoad(item("gas bottle", 13.5, 1))).toBe(true);
        expect(m.loadList()).toEqual([item("gas bottle", 13.5, 3), item("gas bottle", 14, 3), item("gas bottle", 13, 5)]);
    });

    it("unit weights that differ by a little are still different", () => {
        const m = boat();
        m.addLoad(item("gas bottle", 13.5, 1));
        expect(m.addLoad(item("gas bottle", 13.54, 1))).toBe(true);
        expect(m.addLoad(item("gas bottle", 13.9, 1))).toBe(true);
        expect(m.addLoad(item("gas bottle", 13.5, 1))).toBe(true);
        expect(m.loadList()).toEqual([
            item("gas bottle", 13.5, 2),
            item("gas bottle", 13.54, 1),
            item("gas bottle", 13.9, 1),
        ]);
    });

    it("a label is tidied and matched as before", () => {
        const m = boat();
        m.addLoad(item("gas bottle", 13.5, 2));
        expect(m.addLoad(item("  Gas   BOTTLE ", 13.5, 1))).toBe(true);
        expect(m.addLoad(item("  Gas   BOTTLE ", 15, 1))).toBe(true);
        expect(m.addLoad(item("GAS bottle", 15, 1))).toBe(true);
        expect(m.loadList()).toEqual([item("gas bottle", 13.5, 3), item("Gas BOTTLE", 15, 2)]);
    });

    it("the place still counts", () => {
        const m = boat();
        m.addLoad(item("gas bottle", 13.5, 2, "aft"));
        m.addLoad(item("gas bottle", 13.5, 1, "fore"));
        m.addLoad(item("gas bottle", 15, 1, "fore"));
        m.addLoad(item("gas bottle", 15, 1, "aft"));
        m.addLoad(item("gas bottle", 15, 1, "fore"));
        expect(m.loadList()).toEqual([
            item("gas bottle", 13.5, 2, "aft"),
            item("gas bottle", 13.5, 1, "fore"),
            item("gas bottle", 15, 2, "fore"),
            item("gas bottle", 15, 1, "aft"),
        ]);
    });

    it("what is refused is refused as before, whatever its unit weight", () => {
        const m = boat();
        m.addLoad(item("gas bottle", 13.5, 2));
        expect(m.addLoad(item("gas bottle", 15, 0))).toBe(false);
        expect(m.addLoad(item("gas bottle", 15, -1))).toBe(false);
        expect(m.addLoad(item("gas bottle", -15, 1))).toBe(false);
        expect(m.loadList()).toEqual([item("gas bottle", 13.5, 2)]);
    });

    it("a sealed manifest still takes no load, whatever its unit weight", () => {
        const m = boat();
        m.addLoad(item("gas bottle", 13.5, 2));
        expect(m.seal("R. Okafor")).toBe(true);
        expect(() => m.addLoad(item("gas bottle", 15, 1))).toThrow("manifest is sealed");
        expect(() => m.addLoad(item("gas bottle", 13.5, 1))).toThrow("manifest is sealed");
        expect(m.loadList()).toEqual([item("gas bottle", 13.5, 2)]);
    });

    it("the caller's item is left alone and the row is the manifest's own", () => {
        const m = boat();
        m.addLoad(item("gas bottle", 13.5, 2));
        const given = item(" gas  bottle", 15, 1);
        m.addLoad(given);
        expect(given).toEqual(item(" gas  bottle", 15, 1));
        given.count = 40;
        expect(m.loadList()).toEqual([item("gas bottle", 13.5, 2), item("gas bottle", 15, 1)]);
    });

    it("the weights add up row by row", () => {
        const m = boat();
        m.addLoad(item("gas bottle", 13.5, 2));
        m.addLoad(item("gas bottle", 15, 1));
        m.addLoad(item("bicycle", 14, 1, "roof"));
        m.addLoad(item("bicycle", 11.5, 1, "roof"));
        expect(m.loadOn(0)).toEqual({ peopleKg: 70, gearKg: 68, roofKg: 26, totalKg: 138 });
    });
});

unchanged(mod, ["Manifest.addLoad: when the unit weights differ it is still one row, at the first unit weight"]);

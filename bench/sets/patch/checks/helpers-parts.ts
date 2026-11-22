// What src/parts.ts does now, pinned case by case. A task's check calls `unchanged` and skips, by name,
// only the cases its change must alter.
import { describe, expect, it } from "vitest";
import type { Movement, Part } from "../src/parts";
import { copyOf } from "./helpers";

type Mod = typeof import("../src/parts");
type Store = InstanceType<Mod["PartsStore"]>;

function part(partNo: string, over: Partial<Part> = {}): Part {
    return { partNo, name: "Oil filter", bin: "A1", packSize: 1, reorderAt: 0, reorderUpTo: 0, supplier: "Pellow & Tarn", ...over };
}

/** A store with `units` of one part on the shelf, bought at `pence` each in packs of one, on day 1. */
function withStock(mod: Mod, partNo: string, units: number, pence = 100, over: Partial<Part> = {}): Store {
    const store = new mod.PartsStore();
    store.addPart(part(partNo, over));
    if (units > 0) {
        store.receive(partNo, units, pence, 1);
    }
    return store;
}

function move(partNo: string, kind: Movement["kind"], units: number, day: number, jobId: string, unitPence: number): Movement {
    return { partNo, kind, units, day, jobId, unitPence };
}

/** Everything a caller can see of the store, for "nothing changed". */
function seen(store: Store): unknown {
    const jobs = ["J-1", "J-2", "J-3", "J-4"];
    return {
        parts: store.partNos().map((p) => [
            store.part(p), store.onHand(p), store.held(p), store.avgPence(p), store.lastCounted(p), store.lastDelivered(p),
            store.history(p),
        ]),
        holds: jobs.map((j) => store.holdsFor(j)),
        moves: store.movesBetween(-1000, 100000),
    };
}

export function unchanged(mod: Mod, skip: string[] = []): void {
    const cases: [string, () => void][] = [];
    const pin = (name: string, body: () => void): void => {
        cases.push([name, body]);
    };

    // ------------------------------------------------------------------ constants

    pin("constants: the values that stand for none", () => {
        expect(mod.NO_JOB).toBe("");
        expect(mod.NO_BIN).toBe("");
        expect(mod.NEVER).toBe(0);
        expect(mod.NO_LIMIT).toBe(-1);
    });
    pin("constants: lead time and usage window", () => {
        expect(mod.DEFAULT_LEAD_DAYS).toBe(7);
        expect(mod.USAGE_WEEKS).toBe(4);
    });

    // ------------------------------------------------------------------ free functions

    pin("keyOf: upper case", () => {
        expect(mod.keyOf("eng-0412")).toBe("ENG-0412");
        expect(mod.keyOf("ENG-0412")).toBe("ENG-0412");
    });
    pin("keyOf: drops spaces wherever they are", () => {
        expect(mod.keyOf("  eng - 04 12\t")).toBe("ENG-0412");
        expect(mod.keyOf("eng\t-0412")).toBe("ENG-0412");
        expect(mod.keyOf("a 3")).toBe("A3");
        expect(mod.keyOf("")).toBe("");
    });

    pin("isPartNo: three letters, a dash, four digits, typed any way", () => {
        expect(mod.isPartNo("ENG-0412")).toBe(true);
        expect(mod.isPartNo(" eng-0412 ")).toBe(true);
        expect(mod.isPartNo("zzz - 0000")).toBe(true);
    });
    pin("isPartNo: anything else is not one", () => {
        for (const bad of ["EN-0412", "ENGX-0412", "ENG-412", "ENG-04123", "ENG0412", "ENG_0412", "E1G-0412", "ENG-04A2", ""]) {
            expect(mod.isPartNo(bad), bad).toBe(false);
        }
    });

    pin("categoryOf: by the three letters", () => {
        expect(mod.categoryOf("ENG-0412")).toBe("engine");
        expect(mod.categoryOf("ELE-0001")).toBe("electrical");
        expect(mod.categoryOf("GAS-0001")).toBe("gas");
        expect(mod.categoryOf("PLU-0001")).toBe("plumbing");
        expect(mod.categoryOf("HUL-0001")).toBe("hull");
    });
    pin("categoryOf: general for the rest, and any case", () => {
        expect(mod.categoryOf("ZZZ-0001")).toBe("general");
        expect(mod.categoryOf("GEN-0001")).toBe("general");
        expect(mod.categoryOf(" gas-0001")).toBe("gas");
    });

    pin("packsFor: rounds up to whole packs", () => {
        expect(mod.packsFor(10, 4)).toBe(3);
        expect(mod.packsFor(8, 4)).toBe(2);
        expect(mod.packsFor(1, 6)).toBe(1);
        expect(mod.packsFor(7, 1)).toBe(7);
    });
    pin("packsFor: nothing wanted is no packs", () => {
        expect(mod.packsFor(0, 4)).toBe(0);
        expect(mod.packsFor(-3, 4)).toBe(0);
    });

    pin("reorderPacks: at the level or under it, up to the top, in whole packs", () => {
        const p = part("ENG-0001", { reorderAt: 5, reorderUpTo: 20, packSize: 6 });
        expect(mod.reorderPacks(p, 5)).toBe(3);
        expect(mod.reorderPacks(p, 2)).toBe(3);
        expect(mod.reorderPacks(p, 1)).toBe(4);
        expect(mod.reorderPacks(p, 0)).toBe(4);
    });
    pin("reorderPacks: nothing above the level", () => {
        const p = part("ENG-0001", { reorderAt: 5, reorderUpTo: 20, packSize: 6 });
        expect(mod.reorderPacks(p, 6)).toBe(0);
        expect(mod.reorderPacks(p, 40)).toBe(0);
    });
    pin("reorderPacks: a level of 0 is never reordered", () => {
        const p = part("ENG-0001", { reorderAt: 0, reorderUpTo: 20, packSize: 6 });
        expect(mod.reorderPacks(p, 0)).toBe(0);
        expect(mod.reorderPacks(p, 3)).toBe(0);
    });

    pin("formatPence: pounds and two places", () => {
        expect(mod.formatPence(0)).toBe("£0.00");
        expect(mod.formatPence(5)).toBe("£0.05");
        expect(mod.formatPence(1234)).toBe("£12.34");
        expect(mod.formatPence(99900)).toBe("£999.00");
    });
    pin("formatPence: commas in the thousands", () => {
        expect(mod.formatPence(100000)).toBe("£1,000.00");
        expect(mod.formatPence(123456)).toBe("£1,234.56");
        expect(mod.formatPence(100000000)).toBe("£1,000,000.00");
    });
    pin("formatPence: a loss in brackets", () => {
        expect(mod.formatPence(-150)).toBe("(£1.50)");
        expect(mod.formatPence(-123456)).toBe("(£1,234.56)");
        expect(mod.formatPence(-1)).toBe("(£0.01)");
    });
    pin("formatPence: a part of a penny goes to the nearest penny", () => {
        expect(mod.formatPence(12.6)).toBe("£0.13");
        expect(mod.formatPence(12.4)).toBe("£0.12");
        expect(mod.formatPence(99.5)).toBe("£1.00");
        expect(mod.formatPence(-12.6)).toBe("(£0.13)");
    });

    pin("sortByBin: by bin as text, then by part number", () => {
        const list = [
            part("ENG-0003", { bin: "B1" }), part("ENG-0002", { bin: "A3" }), part("ENG-0009", { bin: "A10" }),
            part("ENG-0001", { bin: "A3" }),
        ];
        expect(mod.sortByBin(list).map((p) => p.partNo)).toEqual(["ENG-0009", "ENG-0001", "ENG-0002", "ENG-0003"]);
    });
    pin("sortByBin: parts with no bin go last, by part number", () => {
        const list = [
            part("ENG-0005", { bin: "" }), part("ENG-0004", { bin: "Z9" }), part("ENG-0002", { bin: "" }),
            part("ENG-0001", { bin: "A1" }),
        ];
        expect(mod.sortByBin(list).map((p) => p.partNo)).toEqual(["ENG-0001", "ENG-0004", "ENG-0002", "ENG-0005"]);
    });
    pin("sortByBin: sorts the list it is given and hands the same list back", () => {
        const list = [part("ENG-0002", { bin: "B1" }), part("ENG-0001", { bin: "A1" })];
        const back = mod.sortByBin(list);
        expect(back).toBe(list);
        expect(list.map((p) => p.partNo)).toEqual(["ENG-0001", "ENG-0002"]);
    });
    pin("sortByBin: bins compare by character code, so capitals come before small letters", () => {
        const list = [part("ENG-0001", { bin: "b1" }), part("ENG-0002", { bin: "C1" })];
        expect(mod.sortByBin(list).map((p) => p.bin)).toEqual(["C1", "b1"]);
    });

    pin("shelfLabel: a shelved part", () => {
        expect(mod.shelfLabel(part("ENG-0412", { bin: "A3", packSize: 6 }))).toBe("ENG-0412 Oil filter (bin A3, packs of 6)");
    });
    pin("shelfLabel: a part with no bin", () => {
        const p = part("GAS-0007", { name: "Regulator", bin: "" });
        expect(mod.shelfLabel(p)).toBe("GAS-0007 Regulator (not shelved, packs of 1)");
    });

    pin("deliveryTotal: packs times the pack price, summed", () => {
        expect(mod.deliveryTotal([
            { partNo: "ENG-0001", packs: 3, packPence: 250 }, { partNo: "ENG-0002", packs: 1, packPence: 1999 },
        ])).toBe(2749);
    });
    pin("deliveryTotal: an empty note comes to nothing", () => {
        expect(mod.deliveryTotal([])).toBe(0);
    });

    pin("mergeKit: one line a part, in the order the parts first appear", () => {
        expect(mod.mergeKit([
            { partNo: "ENG-0002", units: 2 }, { partNo: "ENG-0001", units: 1 }, { partNo: "eng-0002 ", units: 3 },
        ])).toEqual([{ partNo: "ENG-0002", units: 5 }, { partNo: "ENG-0001", units: 1 }]);
    });
    pin("mergeKit: drops lines that ask for nothing", () => {
        expect(mod.mergeKit([
            { partNo: "ENG-0001", units: 0 }, { partNo: "ENG-0002", units: -2 }, { partNo: "ENG-0003", units: 1 },
        ])).toEqual([{ partNo: "ENG-0003", units: 1 }]);
        expect(mod.mergeKit([])).toEqual([]);
    });
    pin("mergeKit: drops a line for less than one unit", () => {
        expect(mod.mergeKit([{ partNo: "ENG-0001", units: 0.5 }, { partNo: "ENG-0002", units: 2 }]))
            .toEqual([{ partNo: "ENG-0002", units: 2 }]);
    });
    pin("mergeKit: leaves the list it is given alone", () => {
        const lines = [{ partNo: "eng-0002", units: 2 }, { partNo: "ENG-0002", units: 3 }];
        const before = copyOf(lines);
        const merged = mod.mergeKit(lines);
        expect(lines).toEqual(before);
        expect(merged).not.toBe(lines);
        merged[0].units = 99;
        expect(lines).toEqual(before);
    });

    pin("leadDaysOf: the suppliers in the table", () => {
        expect(mod.leadDaysOf("Brindlewick Marine")).toBe(3);
        expect(mod.leadDaysOf("Pellow & Tarn")).toBe(5);
        expect(mod.leadDaysOf("Ottermere Gas")).toBe(2);
        expect(mod.leadDaysOf("Quillfeather Chandlery")).toBe(10);
    });
    pin("leadDaysOf: spaces round the name, and a supplier not listed", () => {
        expect(mod.leadDaysOf("  Ottermere Gas ")).toBe(2);
        expect(mod.leadDaysOf("Nobody & Sons")).toBe(7);
        expect(mod.leadDaysOf("ottermere gas")).toBe(7);
    });

    pin("expectedDay: the order day and the lead time", () => {
        expect(mod.expectedDay("Brindlewick Marine", 10)).toBe(13);
        expect(mod.expectedDay("Ottermere Gas", 4)).toBe(6);
        expect(mod.expectedDay("Nobody & Sons", 1)).toBe(8);
        expect(mod.expectedDay("Quillfeather Chandlery", 3)).toBe(13);
    });
    pin("expectedDay: a Sunday moves to the Monday", () => {
        expect(mod.expectedDay("Ottermere Gas", 5)).toBe(8);
        expect(mod.expectedDay("Pellow & Tarn", 9)).toBe(15);
        expect(mod.expectedDay("Nobody & Sons", 7)).toBe(15);
        expect(mod.expectedDay("Ottermere Gas", 6)).toBe(8);
    });

    pin("daysOfCover: whole days at the weekly rate", () => {
        expect(mod.daysOfCover(10, 7)).toBe(10);
        expect(mod.daysOfCover(10, 3)).toBe(23);
        expect(mod.daysOfCover(3, 2)).toBe(10);
    });
    pin("daysOfCover: at least a day while there is any stock, none when there is none", () => {
        expect(mod.daysOfCover(1, 50)).toBe(1);
        expect(mod.daysOfCover(0, 3)).toBe(0);
        expect(mod.daysOfCover(-2, 3)).toBe(0);
    });
    pin("daysOfCover: no limit for a part nobody draws", () => {
        expect(mod.daysOfCover(10, 0)).toBe(-1);
        expect(mod.daysOfCover(10, -2)).toBe(-1);
        expect(mod.daysOfCover(0, 0)).toBe(-1);
    });

    pin("describeMove: a delivery", () => {
        expect(mod.describeMove(move("ENG-0412", "delivery", 12, 3, "", 250))).toBe("day 3: delivery +12 ENG-0412, £30.00");
    });
    pin("describeMove: an issue to a job", () => {
        expect(mod.describeMove(move("ENG-0412", "issue", -3, 12, "J-88", 150)))
            .toBe("day 12: issue -3 ENG-0412 for J-88, (£4.50)");
    });
    pin("describeMove: a return and a count", () => {
        expect(mod.describeMove(move("GAS-0007", "return", 2, 14, "J-88", 1250)))
            .toBe("day 14: return +2 GAS-0007 for J-88, £25.00");
        expect(mod.describeMove(move("GAS-0007", "count", -1, 20, "", 1250))).toBe("day 20: count -1 GAS-0007, (£12.50)");
    });
    pin("describeMove: no units has no sign", () => {
        expect(mod.describeMove(move("ENG-0412", "count", 0, 3, "", 250))).toBe("day 3: count 0 ENG-0412, £0.00");
    });

    // ------------------------------------------------------------------ the store: parts

    pin("addPart: returns the part number as stored, with nothing on the shelf", () => {
        const store = new mod.PartsStore();
        expect(store.addPart(part(" eng-0412", { bin: "a 3" }))).toBe("ENG-0412");
        expect(store.part("ENG-0412")).toEqual(part("ENG-0412", { bin: "A3" }));
        expect(store.onHand("ENG-0412")).toBe(0);
        expect(store.avgPence("ENG-0412")).toBe(0);
        expect(store.lastCounted("ENG-0412")).toBe(0);
        expect(store.lastDelivered("ENG-0412")).toBe(0);
        expect(store.history("ENG-0412")).toEqual([]);
    });
    pin("addPart: keeps a copy of what it is given", () => {
        const store = new mod.PartsStore();
        const given = part("ENG-0412", { bin: "A3" });
        store.addPart(given);
        given.bin = "Z1";
        given.packSize = 50;
        expect(store.part("ENG-0412")).toEqual(part("ENG-0412", { bin: "A3" }));
    });
    pin("addPart: refuses a bad part number and a part it has", () => {
        const store = new mod.PartsStore();
        expect(() => store.addPart(part("ENG-412"))).toThrow(RangeError);
        expect(() => store.addPart(part("ENGINE-0412"))).toThrow(RangeError);
        store.addPart(part("ENG-0412"));
        expect(() => store.addPart(part("eng-0412"))).toThrow(RangeError);
        expect(store.partNos()).toEqual(["ENG-0412"]);
    });
    pin("addPart: refuses a bad pack size or reorder level", () => {
        const store = new mod.PartsStore();
        expect(() => store.addPart(part("ENG-0001", { packSize: 0 }))).toThrow(RangeError);
        expect(() => store.addPart(part("ENG-0001", { packSize: 1.5 }))).toThrow(RangeError);
        expect(() => store.addPart(part("ENG-0001", { reorderAt: -1, reorderUpTo: 5 }))).toThrow(RangeError);
        expect(() => store.addPart(part("ENG-0001", { reorderAt: 2.5, reorderUpTo: 5 }))).toThrow(RangeError);
        expect(() => store.addPart(part("ENG-0001", { reorderAt: 5, reorderUpTo: 5 }))).toThrow(RangeError);
        expect(() => store.addPart(part("ENG-0001", { reorderAt: 5, reorderUpTo: 4 }))).toThrow(RangeError);
        expect(store.partNos()).toEqual([]);
        expect(store.addPart(part("ENG-0001", { reorderAt: 5, reorderUpTo: 6 }))).toBe("ENG-0001");
        expect(store.addPart(part("ENG-0002", { reorderAt: 0, reorderUpTo: 0 }))).toBe("ENG-0002");
    });

    pin("part: found typed any way, undefined when the store has none", () => {
        const store = withStock(mod, "ENG-0412", 0);
        expect(store.part("eng - 0412")).toEqual(part("ENG-0412"));
        expect(store.part("ENG-9999")).toBeUndefined();
    });
    pin("part: hands out a copy", () => {
        const store = withStock(mod, "ENG-0412", 0);
        const got = store.part("ENG-0412");
        expect(got).toBeDefined();
        if (got) {
            got.bin = "Q9";
            got.reorderAt = 77;
        }
        expect(store.part("ENG-0412")).toEqual(part("ENG-0412"));
    });

    pin("partNos: in order of part number", () => {
        const store = new mod.PartsStore();
        for (const p of ["GAS-0002", "ENG-0412", "ELE-0100", "ENG-0041"]) {
            store.addPart(part(p));
        }
        expect(store.partNos()).toEqual(["ELE-0100", "ENG-0041", "ENG-0412", "GAS-0002"]);
    });
    pin("partNos: none in an empty store", () => {
        expect(new mod.PartsStore().partNos()).toEqual([]);
    });

    pin("shelve: moves the part and says where it was", () => {
        const store = withStock(mod, "ENG-0412", 0, 100, { bin: "A3" });
        expect(store.shelve("eng-0412", " b 7 ")).toBe("A3");
        expect(store.part("ENG-0412")?.bin).toBe("B7");
        expect(store.shelve("ENG-0412", "")).toBe("B7");
        expect(store.part("ENG-0412")?.bin).toBe("");
        expect(store.shelve("ENG-0412", "C1")).toBe("");
    });
    pin("shelve: refuses a part the store has not", () => {
        const store = withStock(mod, "ENG-0412", 0);
        expect(() => store.shelve("ENG-9999", "B7")).toThrow(RangeError);
        expect(() => store.shelve("ENG-9999", "B7")).toThrow("unknown part: ENG-9999");
    });

    // ------------------------------------------------------------------ the store: what is there

    pin("onHand: units on the shelf, typed any way", () => {
        const store = withStock(mod, "ENG-0412", 7);
        expect(store.onHand("ENG-0412")).toBe(7);
        expect(store.onHand(" eng-0412")).toBe(7);
    });
    pin("onHand: 0 for a part the store has not", () => {
        expect(withStock(mod, "ENG-0412", 7).onHand("ENG-9999")).toBe(0);
    });

    pin("held: everything set aside of a part, for every job", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.addPart(part("ENG-0500"));
        store.receive("ENG-0500", 4, 100, 1);
        store.setAside("ENG-0412", 3, "J-1", 2);
        store.setAside("ENG-0412", 2, "J-2", 2);
        store.setAside("ENG-0500", 4, "J-1", 2);
        expect(store.held("eng-0412")).toBe(5);
        expect(store.held("ENG-0500")).toBe(4);
    });
    pin("held: 0 with nothing set aside, and for a part the store has not", () => {
        const store = withStock(mod, "ENG-0412", 10);
        expect(store.held("ENG-0412")).toBe(0);
        expect(store.held("ENG-9999")).toBe(0);
    });

    pin("heldFor: what one job has set aside of one part", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.setAside("ENG-0412", 3, "J-1", 2);
        store.setAside("ENG-0412", 2, "J-2", 2);
        expect(store.heldFor("eng-0412", "J-1")).toBe(3);
        expect(store.heldFor("ENG-0412", "J-2")).toBe(2);
    });
    pin("heldFor: 0 for another job, another part, no job", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.setAside("ENG-0412", 3, "J-1", 2);
        expect(store.heldFor("ENG-0412", "J-3")).toBe(0);
        expect(store.heldFor("ENG-9999", "J-1")).toBe(0);
        expect(store.heldFor("ENG-0412", "")).toBe(0);
    });

    pin("freeOf: on hand less everything set aside", () => {
        const store = withStock(mod, "ENG-0412", 10);
        expect(store.freeOf("ENG-0412")).toBe(10);
        store.setAside("ENG-0412", 3, "J-1", 2);
        store.setAside("ENG-0412", 2, "J-2", 2);
        expect(store.freeOf(" eng-0412")).toBe(5);
    });
    pin("freeOf: 0 for a part the store has not", () => {
        expect(withStock(mod, "ENG-0412", 10).freeOf("ENG-9999")).toBe(0);
    });

    pin("avgPence: the price paid, to the nearest penny, halves up", () => {
        const store = withStock(mod, "ENG-0412", 0, 100, { packSize: 2 });
        store.receive("ENG-0412", 1, 301, 1);
        expect(store.avgPence("eng-0412")).toBe(151);
    });
    pin("avgPence: 0 for a part the store has not, and before any delivery", () => {
        const store = withStock(mod, "ENG-0412", 0);
        expect(store.avgPence("ENG-0412")).toBe(0);
        expect(store.avgPence("ENG-9999")).toBe(0);
    });

    pin("lastCounted: the day of the last count, or NEVER", () => {
        const store = withStock(mod, "ENG-0412", 5);
        expect(store.lastCounted("ENG-0412")).toBe(0);
        store.correct("ENG-0412", 4, 12);
        expect(store.lastCounted("eng-0412")).toBe(12);
        // a count sheet booked late
        store.correct("ENG-0412", 4, 9);
        expect(store.lastCounted("ENG-0412")).toBe(9);
    });
    pin("lastCounted: NEVER for a part the store has not, and a delivery is not a count", () => {
        const store = withStock(mod, "ENG-0412", 5);
        expect(store.lastCounted("ENG-9999")).toBe(0);
        store.receive("ENG-0412", 1, 100, 9);
        expect(store.lastCounted("ENG-0412")).toBe(0);
    });

    pin("lastDelivered: the day of the last delivery booked", () => {
        const store = withStock(mod, "ENG-0412", 5);
        expect(store.lastDelivered("ENG-0412")).toBe(1);
        store.receive("ENG-0412", 1, 100, 9);
        expect(store.lastDelivered("eng-0412")).toBe(9);
        store.receive("ENG-0412", 1, 100, 6);
        expect(store.lastDelivered("ENG-0412")).toBe(6);
    });
    pin("lastDelivered: NEVER for a part the store has not, and a count is not a delivery", () => {
        const store = withStock(mod, "ENG-0412", 0);
        expect(store.lastDelivered("ENG-9999")).toBe(0);
        store.correct("ENG-0412", 3, 4);
        expect(store.lastDelivered("ENG-0412")).toBe(0);
    });

    // ------------------------------------------------------------------ the store: deliveries

    pin("receive: packs become units on the shelf", () => {
        const store = withStock(mod, "ENG-0412", 0, 100, { packSize: 6 });
        expect(store.receive("eng-0412", 2, 1500, 3)).toBe(12);
        expect(store.onHand("ENG-0412")).toBe(12);
        expect(store.avgPence("ENG-0412")).toBe(250);
        expect(store.lastDelivered("ENG-0412")).toBe(3);
    });
    pin("receive: the average is weighted by units, from the pack price", () => {
        const store = withStock(mod, "ENG-0412", 0, 100, { packSize: 2 });
        store.receive("ENG-0412", 1, 301, 1);
        store.receive("ENG-0412", 3, 200, 2);
        // (2 x 151 + 3 x 200) / 8 = 112.75
        expect(store.avgPence("ENG-0412")).toBe(113);
        const other = withStock(mod, "ENG-0500", 0, 100, { packSize: 3 });
        other.receive("ENG-0500", 1, 33, 1);
        other.receive("ENG-0500", 1, 101, 2);
        // (3 x 11 + 101) / 6 = 22.33; from a unit price of 34 it would be 22.5
        expect(other.avgPence("ENG-0500")).toBe(22);
    });
    pin("receive: logs a delivery with no job and the unit price to the nearest penny", () => {
        const store = withStock(mod, "ENG-0412", 0, 100, { packSize: 3 });
        store.receive("eng-0412", 2, 101, 4);
        expect(store.history("ENG-0412")).toEqual([move("ENG-0412", "delivery", 6, 4, "", 34)]);
        const halves = withStock(mod, "ENG-0500", 0, 100, { packSize: 2 });
        halves.receive("ENG-0500", 1, 301, 1);
        expect(halves.history("ENG-0500")[0].unitPence).toBe(151);
        const down = withStock(mod, "ENG-0600", 0, 100, { packSize: 4 });
        down.receive("ENG-0600", 1, 401, 1);
        expect(down.history("ENG-0600")[0].unitPence).toBe(100);
    });
    pin("receive: refuses a part the store has not, a bad number of packs, a bad price", () => {
        const store = withStock(mod, "ENG-0412", 4);
        const before = copyOf(seen(store));
        expect(() => store.receive("ENG-9999", 1, 100, 2)).toThrow(RangeError);
        expect(() => store.receive("ENG-0412", 0, 100, 2)).toThrow(RangeError);
        expect(() => store.receive("ENG-0412", 1.5, 100, 2)).toThrow(RangeError);
        expect(() => store.receive("ENG-0412", 1, -1, 2)).toThrow(RangeError);
        expect(() => store.receive("ENG-0412", 1, 10.5, 2)).toThrow(RangeError);
        expect(seen(store)).toEqual(before);
    });
    pin("receive: a pack that cost nothing pulls the average down", () => {
        const store = withStock(mod, "ENG-0412", 0, 100, { packSize: 4 });
        store.receive("ENG-0412", 1, 400, 1);
        expect(store.receive("ENG-0412", 1, 0, 2)).toBe(4);
        expect(store.avgPence("ENG-0412")).toBe(50);
    });

    pin("receiveAll: books each line and returns what the note comes to", () => {
        const store = new mod.PartsStore();
        store.addPart(part("ENG-0001", { packSize: 6 }));
        store.addPart(part("GAS-0002"));
        const note = [{ partNo: "eng-0001", packs: 2, packPence: 1500 }, { partNo: "GAS-0002", packs: 3, packPence: 999 }];
        expect(store.receiveAll(note, 5)).toBe(5997);
        expect(store.onHand("ENG-0001")).toBe(12);
        expect(store.onHand("GAS-0002")).toBe(3);
        expect(store.movesBetween(5, 6)).toEqual([
            move("ENG-0001", "delivery", 12, 5, "", 250), move("GAS-0002", "delivery", 3, 5, "", 999),
        ]);
    });
    pin("receiveAll: a bad line anywhere and nothing is booked", () => {
        const store = new mod.PartsStore();
        store.addPart(part("ENG-0001"));
        store.addPart(part("GAS-0002"));
        const before = copyOf(seen(store));
        const good = { partNo: "ENG-0001", packs: 2, packPence: 100 };
        expect(() => store.receiveAll([good, { partNo: "ENG-9999", packs: 1, packPence: 100 }], 5)).toThrow(RangeError);
        expect(() => store.receiveAll([good, { partNo: "GAS-0002", packs: 0, packPence: 100 }], 5)).toThrow(RangeError);
        expect(() => store.receiveAll([good, { partNo: "GAS-0002", packs: 1, packPence: -5 }], 5)).toThrow(RangeError);
        const partPack = { partNo: "GAS-0002", packs: 1.5, packPence: 100 };
        expect(() => store.receiveAll([good, partPack], 5)).toThrow(RangeError);
        const partPenny = { partNo: "GAS-0002", packs: 1, packPence: 10.5 };
        expect(() => store.receiveAll([good, partPenny], 5)).toThrow(RangeError);
        expect(seen(store)).toEqual(before);
        expect(store.receiveAll([], 5)).toBe(0);
    });

    // ------------------------------------------------------------------ the store: holds

    pin("setAside: returns the units set aside", () => {
        const store = withStock(mod, "ENG-0412", 10);
        expect(store.setAside("eng-0412", 4, "J-1", 3)).toBe(4);
        expect(store.holdsFor("J-1")).toEqual([{ partNo: "ENG-0412", jobId: "J-1", units: 4, day: 3 }]);
        expect(store.onHand("ENG-0412")).toBe(10);
        expect(store.history("ENG-0412")).toHaveLength(1);
    });
    pin("setAside: only what is free, and nothing at all when none is", () => {
        const store = withStock(mod, "ENG-0412", 5);
        expect(store.setAside("ENG-0412", 3, "J-1", 3)).toBe(3);
        expect(store.setAside("ENG-0412", 8, "J-2", 3)).toBe(2);
        expect(store.heldFor("ENG-0412", "J-2")).toBe(2);
        expect(store.setAside("ENG-0412", 1, "J-3", 3)).toBe(0);
        expect(store.holdsFor("J-3")).toEqual([]);
        expect(store.freeOf("ENG-0412")).toBe(0);
    });
    pin("setAside: a second time for the same job adds to its hold, which keeps its day", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.setAside("ENG-0412", 2, "J-1", 3);
        expect(store.setAside("ENG-0412", 3, "J-1", 9)).toBe(3);
        expect(store.holdsFor("J-1")).toEqual([{ partNo: "ENG-0412", jobId: "J-1", units: 5, day: 3 }]);
    });
    pin("setAside: a hold that grows keeps its place in the queue", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.setAside("ENG-0412", 3, "J-1", 2);
        store.setAside("ENG-0412", 3, "J-2", 3);
        store.setAside("ENG-0412", 1, "J-1", 4);
        // J-2's hold is still the one made last, so a short count takes from it
        store.correct("ENG-0412", 5, 9);
        expect(store.heldFor("ENG-0412", "J-1")).toBe(4);
        expect(store.heldFor("ENG-0412", "J-2")).toBe(1);
    });
    pin("setAside: refuses a part the store has not, no job, a bad number of units", () => {
        const store = withStock(mod, "ENG-0412", 10);
        const before = copyOf(seen(store));
        expect(() => store.setAside("ENG-9999", 1, "J-1", 3)).toThrow(RangeError);
        expect(() => store.setAside("ENG-0412", 1, "", 3)).toThrow(RangeError);
        expect(() => store.setAside("ENG-0412", 0, "J-1", 3)).toThrow(RangeError);
        expect(() => store.setAside("ENG-0412", 1.5, "J-1", 3)).toThrow(RangeError);
        expect(seen(store)).toEqual(before);
        expect(store.held("ENG-0412")).toBe(0);
    });

    pin("setAsideKit: nothing short when every line is filled", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.addPart(part("GAS-0002"));
        store.receive("GAS-0002", 2, 100, 1);
        const kit = [{ partNo: "eng-0412", units: 2 }, { partNo: "GAS-0002", units: 2 }, { partNo: "ENG-0412", units: 3 }];
        const before = copyOf(kit);
        expect(store.setAsideKit("J-1", kit, 4)).toEqual([]);
        expect(kit).toEqual(before);
        expect(store.holdsFor("J-1")).toEqual([
            { partNo: "ENG-0412", jobId: "J-1", units: 5, day: 4 }, { partNo: "GAS-0002", jobId: "J-1", units: 2, day: 4 },
        ]);
    });
    pin("setAsideKit: the lines it could not fill, with the units still wanted", () => {
        const store = withStock(mod, "ENG-0412", 4);
        store.addPart(part("GAS-0002"));
        store.addPart(part("ELE-0003"));
        store.receive("ELE-0003", 1, 100, 1);
        const kit = [
            { partNo: "eng-0412", units: 3 }, { partNo: "gas-0002", units: 2 }, { partNo: "ELE-0003", units: 1 },
            { partNo: "ENG-0412", units: 3 }, { partNo: "ELE-0003", units: 0 },
        ];
        expect(store.setAsideKit("J-1", kit, 4)).toEqual([{ partNo: "ENG-0412", units: 2 }, { partNo: "GAS-0002", units: 2 }]);
        expect(store.heldFor("ENG-0412", "J-1")).toBe(4);
        expect(store.heldFor("GAS-0002", "J-1")).toBe(0);
        expect(store.heldFor("ELE-0003", "J-1")).toBe(1);
    });
    pin("setAsideKit: a part the store has not, and nothing is set aside", () => {
        const store = withStock(mod, "ENG-0412", 4);
        const kit = [{ partNo: "ENG-0412", units: 3 }, { partNo: "ENG-9999", units: 1 }];
        expect(() => store.setAsideKit("J-1", kit, 4)).toThrow(RangeError);
        expect(store.held("ENG-0412")).toBe(0);
        expect(store.holdsFor("J-1")).toEqual([]);
    });

    pin("release: frees everything the job had and returns the units", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.addPart(part("GAS-0002"));
        store.receive("GAS-0002", 5, 100, 1);
        store.setAside("ENG-0412", 3, "J-1", 2);
        store.setAside("GAS-0002", 4, "J-1", 2);
        store.setAside("ENG-0412", 2, "J-2", 2);
        expect(store.release("J-1")).toBe(7);
        expect(store.holdsFor("J-1")).toEqual([]);
        expect(store.heldFor("ENG-0412", "J-2")).toBe(2);
        expect(store.freeOf("ENG-0412")).toBe(8);
        expect(store.freeOf("GAS-0002")).toBe(5);
        expect(store.onHand("ENG-0412")).toBe(10);
    });
    pin("release: 0 for a job with nothing set aside", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.setAside("ENG-0412", 3, "J-1", 2);
        expect(store.release("J-9")).toBe(0);
        expect(store.release("")).toBe(0);
        expect(store.held("ENG-0412")).toBe(3);
        expect(store.release("J-1")).toBe(3);
        expect(store.release("J-1")).toBe(0);
    });

    pin("holdsFor: the job's holds in the order they were made", () => {
        const store = withStock(mod, "GAS-0002", 5);
        store.addPart(part("ENG-0412"));
        store.receive("ENG-0412", 5, 100, 1);
        store.setAside("GAS-0002", 1, "J-1", 2);
        store.setAside("ENG-0412", 2, "J-2", 3);
        store.setAside("ENG-0412", 3, "J-1", 4);
        expect(store.holdsFor("J-1")).toEqual([
            { partNo: "GAS-0002", jobId: "J-1", units: 1, day: 2 }, { partNo: "ENG-0412", jobId: "J-1", units: 3, day: 4 },
        ]);
        expect(store.holdsFor("J-9")).toEqual([]);
    });
    pin("holdsFor: hands out copies", () => {
        const store = withStock(mod, "ENG-0412", 5);
        store.setAside("ENG-0412", 2, "J-1", 3);
        const got = store.holdsFor("J-1");
        got[0].units = 50;
        got.pop();
        expect(store.heldFor("ENG-0412", "J-1")).toBe(2);
        expect(store.holdsFor("J-1")).toHaveLength(1);
    });

    pin("moveHold: to a job with no hold, which takes the place and the day", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.setAside("ENG-0412", 4, "J-1", 2);
        store.setAside("ENG-0412", 4, "J-2", 3);
        expect(store.moveHold("eng-0412", "J-1", "J-3")).toBe(4);
        expect(store.holdsFor("J-1")).toEqual([]);
        expect(store.holdsFor("J-3")).toEqual([{ partNo: "ENG-0412", jobId: "J-3", units: 4, day: 2 }]);
        // J-3 stands where J-1 stood, ahead of J-2, so a short count takes from J-2
        store.correct("ENG-0412", 5, 9);
        expect(store.heldFor("ENG-0412", "J-3")).toBe(4);
        expect(store.heldFor("ENG-0412", "J-2")).toBe(1);
    });
    pin("moveHold: to a job with a hold, which grows", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.setAside("ENG-0412", 4, "J-1", 2);
        store.setAside("ENG-0412", 3, "J-2", 5);
        expect(store.moveHold("ENG-0412", "J-1", "J-2")).toBe(4);
        expect(store.holdsFor("J-1")).toEqual([]);
        expect(store.holdsFor("J-2")).toEqual([{ partNo: "ENG-0412", jobId: "J-2", units: 7, day: 5 }]);
        expect(store.held("ENG-0412")).toBe(7);
    });
    pin("moveHold: to a job with a hold, which keeps its own place in the queue", () => {
        const store = withStock(mod, "ENG-0412", 12);
        store.setAside("ENG-0412", 4, "J-1", 2);
        store.setAside("ENG-0412", 4, "J-2", 3);
        store.setAside("ENG-0412", 4, "J-3", 4);
        expect(store.moveHold("ENG-0412", "J-1", "J-3")).toBe(4);
        // J-3's hold is still the one made last, so a short count takes from it
        store.correct("ENG-0412", 9, 10);
        expect(store.heldFor("ENG-0412", "J-2")).toBe(4);
        expect(store.heldFor("ENG-0412", "J-3")).toBe(5);
    });
    pin("moveHold: 0 and no change with no hold to move, no job to give it, or the same job", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.setAside("ENG-0412", 4, "J-1", 2);
        const before = copyOf(seen(store));
        expect(store.moveHold("ENG-0412", "J-2", "J-3")).toBe(0);
        expect(store.moveHold("ENG-9999", "J-1", "J-3")).toBe(0);
        expect(store.moveHold("ENG-0412", "J-1", "")).toBe(0);
        expect(store.moveHold("ENG-0412", "J-1", "J-1")).toBe(0);
        expect(seen(store)).toEqual(before);
    });

    pin("pickList: what the job has set aside, in shelf order", () => {
        const store = new mod.PartsStore();
        store.addPart(part("ENG-0003", { bin: "" }));
        store.addPart(part("ENG-0002", { bin: "B2" }));
        store.addPart(part("ENG-0001", { bin: "A10" }));
        for (const p of store.partNos()) {
            store.receive(p, 5, 100, 1);
        }
        store.setAside("ENG-0003", 1, "J-1", 2);
        store.setAside("ENG-0002", 2, "J-1", 2);
        store.setAside("ENG-0001", 3, "J-1", 2);
        store.setAside("ENG-0001", 2, "J-2", 2);
        expect(store.pickList("J-1")).toEqual([
            { partNo: "ENG-0001", bin: "A10", units: 3 }, { partNo: "ENG-0002", bin: "B2", units: 2 },
            { partNo: "ENG-0003", bin: "", units: 1 },
        ]);
    });
    pin("pickList: empty for a job with nothing set aside", () => {
        const store = withStock(mod, "ENG-0412", 5);
        store.setAside("ENG-0412", 2, "J-1", 2);
        expect(store.pickList("J-2")).toEqual([]);
    });

    // ------------------------------------------------------------------ the store: issues and returns

    pin("issue: takes units off the shelf and returns what they cost", () => {
        const store = withStock(mod, "ENG-0412", 10, 250);
        expect(store.issue("eng-0412", 3, "J-1", 6)).toBe(750);
        expect(store.onHand("ENG-0412")).toBe(7);
        expect(store.history("ENG-0412")[0]).toEqual(move("ENG-0412", "issue", -3, 6, "J-1", 250));
        expect(store.avgPence("ENG-0412")).toBe(250);
    });
    pin("issue: what the job had set aside goes first", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.setAside("ENG-0412", 5, "J-1", 2);
        store.issue("ENG-0412", 3, "J-1", 6);
        expect(store.heldFor("ENG-0412", "J-1")).toBe(2);
        expect(store.freeOf("ENG-0412")).toBe(5);
        store.issue("ENG-0412", 2, "J-1", 6);
        expect(store.holdsFor("J-1")).toEqual([]);
        expect(store.freeOf("ENG-0412")).toBe(5);
    });
    pin("issue: a job may take its hold and the free stock, and no more", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.setAside("ENG-0412", 6, "J-1", 2);
        store.setAside("ENG-0412", 2, "J-2", 2);
        expect(() => store.issue("ENG-0412", 9, "J-1", 6)).toThrow(RangeError);
        expect(store.onHand("ENG-0412")).toBe(10);
        expect(store.heldFor("ENG-0412", "J-1")).toBe(6);
        store.issue("ENG-0412", 8, "J-1", 6);
        expect(store.onHand("ENG-0412")).toBe(2);
        expect(store.holdsFor("J-1")).toEqual([]);
        expect(store.heldFor("ENG-0412", "J-2")).toBe(2);
        expect(store.freeOf("ENG-0412")).toBe(0);
    });
    pin("issue: another job, or the counter, gets only the free stock", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.setAside("ENG-0412", 6, "J-1", 2);
        expect(() => store.issue("ENG-0412", 5, "J-2", 6)).toThrow(RangeError);
        expect(() => store.issue("ENG-0412", 5, "", 6)).toThrow(RangeError);
        expect(store.issue("ENG-0412", 3, "", 6)).toBe(300);
        expect(store.issue("ENG-0412", 1, "J-2", 6)).toBe(100);
        expect(store.heldFor("ENG-0412", "J-1")).toBe(6);
        expect(store.freeOf("ENG-0412")).toBe(0);
        expect(store.history("ENG-0412")[1]).toEqual(move("ENG-0412", "issue", -3, 6, "", 100));
    });
    pin("issue: refuses a part the store has not and a bad number of units", () => {
        const store = withStock(mod, "ENG-0412", 10);
        const before = copyOf(seen(store));
        expect(() => store.issue("ENG-9999", 1, "J-1", 6)).toThrow(RangeError);
        expect(() => store.issue("ENG-0412", 0, "J-1", 6)).toThrow(RangeError);
        expect(() => store.issue("ENG-0412", 2.5, "J-1", 6)).toThrow(RangeError);
        expect(() => store.issue("ENG-0412", 11, "J-1", 6)).toThrow(RangeError);
        expect(seen(store)).toEqual(before);
    });

    pin("giveBack: back on the shelf, logged as a return at the price carried now", () => {
        const store = withStock(mod, "ENG-0412", 10, 250);
        store.issue("ENG-0412", 4, "J-1", 6);
        expect(store.giveBack("eng-0412", 2, "J-1", 8)).toBeUndefined();
        expect(store.onHand("ENG-0412")).toBe(8);
        expect(store.avgPence("ENG-0412")).toBe(250);
        expect(store.history("ENG-0412")[0]).toEqual(move("ENG-0412", "return", 2, 8, "J-1", 250));
    });
    pin("giveBack: the units are free, not set aside again", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.setAside("ENG-0412", 4, "J-1", 2);
        store.issue("ENG-0412", 4, "J-1", 6);
        store.giveBack("ENG-0412", 3, "J-1", 8);
        expect(store.held("ENG-0412")).toBe(0);
        expect(store.freeOf("ENG-0412")).toBe(9);
    });
    pin("giveBack: at the price carried at the return, not the price of the issue", () => {
        const store = withStock(mod, "ENG-0412", 6, 100);
        store.issue("ENG-0412", 4, "J-1", 2);
        store.receive("ENG-0412", 2, 300, 3);
        expect(store.avgPence("ENG-0412")).toBe(200);
        store.giveBack("ENG-0412", 2, "J-1", 4);
        expect(store.history("ENG-0412")[0]).toEqual(move("ENG-0412", "return", 2, 4, "J-1", 200));
        expect(store.avgPence("ENG-0412")).toBe(200);
    });
    pin("giveBack: takes units back from a job that was issued none", () => {
        const store = withStock(mod, "ENG-0412", 9);
        store.giveBack("ENG-0412", 2, "J-7", 3);
        expect(store.onHand("ENG-0412")).toBe(11);
        expect(store.history("ENG-0412")[0]).toEqual(move("ENG-0412", "return", 2, 3, "J-7", 100));
    });
    pin("giveBack: refuses a part the store has not and a bad number of units", () => {
        const store = withStock(mod, "ENG-0412", 10);
        const before = copyOf(seen(store));
        expect(() => store.giveBack("ENG-9999", 1, "J-1", 8)).toThrow(RangeError);
        expect(() => store.giveBack("ENG-0412", 0, "J-1", 8)).toThrow(RangeError);
        expect(() => store.giveBack("ENG-0412", 1.5, "J-1", 8)).toThrow(RangeError);
        expect(seen(store)).toEqual(before);
    });

    // ------------------------------------------------------------------ the store: stocktake

    pin("correct: sets the stock to the count and returns the difference, signed", () => {
        const store = withStock(mod, "ENG-0412", 10, 250);
        expect(store.correct("eng-0412", 7, 12)).toBe(-3);
        expect(store.onHand("ENG-0412")).toBe(7);
        expect(store.history("ENG-0412")[0]).toEqual(move("ENG-0412", "count", -3, 12, "", 250));
        expect(store.correct("ENG-0412", 9, 13)).toBe(2);
        expect(store.history("ENG-0412")[0]).toEqual(move("ENG-0412", "count", 2, 13, "", 250));
        expect(store.avgPence("ENG-0412")).toBe(250);
        expect(store.lastCounted("ENG-0412")).toBe(13);
    });
    pin("correct: a count that agrees logs nothing but still marks the day", () => {
        const store = withStock(mod, "ENG-0412", 10);
        expect(store.correct("ENG-0412", 10, 12)).toBe(0);
        expect(store.history("ENG-0412")).toHaveLength(1);
        expect(store.lastCounted("ENG-0412")).toBe(12);
    });
    pin("correct: when the count cannot cover the holds, the latest hold gives way first", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.addPart(part("GAS-0002"));
        store.receive("GAS-0002", 5, 100, 1);
        store.setAside("ENG-0412", 4, "J-1", 2);
        store.setAside("GAS-0002", 5, "J-3", 2);
        store.setAside("ENG-0412", 4, "J-2", 3);
        store.correct("ENG-0412", 5, 12);
        expect(store.heldFor("ENG-0412", "J-1")).toBe(4);
        expect(store.heldFor("ENG-0412", "J-2")).toBe(1);
        store.correct("ENG-0412", 3, 13);
        expect(store.holdsFor("J-2")).toEqual([]);
        expect(store.heldFor("ENG-0412", "J-1")).toBe(3);
        expect(store.heldFor("GAS-0002", "J-3")).toBe(5);
        expect(store.freeOf("ENG-0412")).toBe(0);
    });
    pin("correct: the hold made last gives way first, whatever its day", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.setAside("ENG-0412", 4, "J-1", 5);
        store.setAside("ENG-0412", 4, "J-2", 3);
        store.correct("ENG-0412", 5, 12);
        expect(store.heldFor("ENG-0412", "J-1")).toBe(4);
        expect(store.heldFor("ENG-0412", "J-2")).toBe(1);
    });
    pin("correct: holds stand while the count covers them", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.setAside("ENG-0412", 4, "J-1", 2);
        store.setAside("ENG-0412", 4, "J-2", 3);
        store.correct("ENG-0412", 8, 12);
        expect(store.heldFor("ENG-0412", "J-1")).toBe(4);
        expect(store.heldFor("ENG-0412", "J-2")).toBe(4);
        expect(store.freeOf("ENG-0412")).toBe(0);
    });
    pin("correct: refuses a part the store has not and a bad count", () => {
        const store = withStock(mod, "ENG-0412", 10);
        const before = copyOf(seen(store));
        expect(() => store.correct("ENG-9999", 1, 12)).toThrow(RangeError);
        expect(() => store.correct("ENG-0412", -1, 12)).toThrow(RangeError);
        expect(() => store.correct("ENG-0412", 2.5, 12)).toThrow(RangeError);
        expect(seen(store)).toEqual(before);
        expect(store.correct("ENG-0412", 0, 12)).toBe(-10);
    });

    pin("stocktake: a line for each part that was out, valued at its average", () => {
        const store = withStock(mod, "ENG-0412", 10, 250);
        store.addPart(part("GAS-0002"));
        store.addPart(part("ELE-0003"));
        store.receive("GAS-0002", 4, 1200, 1);
        store.receive("ELE-0003", 6, 80, 1);
        const sheet = [
            { partNo: "eng-0412", counted: 7 }, { partNo: "ELE-0003", counted: 6 }, { partNo: "GAS-0002", counted: 5 },
        ];
        expect(store.stocktake(sheet, 20)).toEqual([
            { partNo: "ENG-0412", before: 10, counted: 7, pence: -750 },
            { partNo: "GAS-0002", before: 4, counted: 5, pence: 1200 },
        ]);
        expect(store.onHand("ENG-0412")).toBe(7);
        expect(store.onHand("GAS-0002")).toBe(5);
        expect(store.lastCounted("ELE-0003")).toBe(20);
        expect(store.history("ELE-0003")).toHaveLength(1);
    });
    pin("stocktake: the lines come in the order of the sheet", () => {
        const store = withStock(mod, "ENG-0412", 10, 250);
        store.addPart(part("GAS-0002"));
        store.receive("GAS-0002", 4, 1200, 1);
        expect(store.stocktake([{ partNo: "GAS-0002", counted: 3 }, { partNo: "ENG-0412", counted: 9 }], 20)).toEqual([
            { partNo: "GAS-0002", before: 4, counted: 3, pence: -1200 },
            { partNo: "ENG-0412", before: 10, counted: 9, pence: -250 },
        ]);
    });
    pin("stocktake: a bad line anywhere and nothing is booked", () => {
        const store = withStock(mod, "ENG-0412", 10);
        const before = copyOf(seen(store));
        const good = { partNo: "ENG-0412", counted: 7 };
        expect(() => store.stocktake([good, { partNo: "ENG-9999", counted: 1 }], 20)).toThrow(RangeError);
        expect(() => store.stocktake([good, { partNo: "ENG-0412", counted: -1 }], 20)).toThrow(RangeError);
        expect(() => store.stocktake([good, { partNo: "ENG-0412", counted: 1.5 }], 20)).toThrow(RangeError);
        expect(seen(store)).toEqual(before);
        expect(store.stocktake([], 20)).toEqual([]);
    });

    // ------------------------------------------------------------------ the store: reordering

    pin("needsReorder: when free stock is at the level or under it", () => {
        const store = withStock(mod, "ENG-0412", 6, 100, { reorderAt: 5, reorderUpTo: 20 });
        expect(store.needsReorder("ENG-0412")).toBe(false);
        store.issue("ENG-0412", 1, "", 2);
        expect(store.needsReorder("eng-0412")).toBe(true);
        store.issue("ENG-0412", 5, "", 2);
        expect(store.needsReorder("ENG-0412")).toBe(true);
    });
    pin("needsReorder: goes by free stock, not by what is on the shelf", () => {
        const store = withStock(mod, "ENG-0412", 10, 100, { reorderAt: 5, reorderUpTo: 20 });
        store.setAside("ENG-0412", 4, "J-1", 2);
        expect(store.needsReorder("ENG-0412")).toBe(false);
        store.setAside("ENG-0412", 1, "J-1", 2);
        expect(store.needsReorder("ENG-0412")).toBe(true);
    });
    pin("needsReorder: never for a level of 0, nor for a part the store has not", () => {
        const store = withStock(mod, "ENG-0412", 0, 100, { reorderAt: 0, reorderUpTo: 20 });
        expect(store.needsReorder("ENG-0412")).toBe(false);
        expect(store.needsReorder("ENG-9999")).toBe(false);
    });

    pin("reorderList: by supplier, then part number, in whole packs, with the day due", () => {
        const store = new mod.PartsStore();
        store.addPart(part("GAS-0002", { supplier: "Ottermere Gas", reorderAt: 2, reorderUpTo: 10, packSize: 4 }));
        store.addPart(part("ENG-0412", { supplier: "Pellow & Tarn", reorderAt: 5, reorderUpTo: 20, packSize: 6 }));
        store.addPart(part("ENG-0100", { supplier: "Pellow & Tarn", reorderAt: 1, reorderUpTo: 3 }));
        store.addPart(part("ELE-0003", { supplier: "Brindlewick Marine", reorderAt: 0, reorderUpTo: 9 }));
        store.addPart(part("HUL-0004", { supplier: "Brindlewick Marine", reorderAt: 3, reorderUpTo: 8 }));
        store.receive("HUL-0004", 4, 100, 1);
        store.receive("ENG-0412", 1, 600, 1);
        store.setAside("ENG-0412", 4, "J-1", 2);
        expect(store.reorderList(5)).toEqual([
            { partNo: "GAS-0002", supplier: "Ottermere Gas", packs: 3, units: 12, dueDay: 8 },
            { partNo: "ENG-0100", supplier: "Pellow & Tarn", packs: 3, units: 3, dueDay: 10 },
            { partNo: "ENG-0412", supplier: "Pellow & Tarn", packs: 3, units: 18, dueDay: 10 },
        ]);
    });
    pin("reorderList: suppliers compare by character code, so capitals come before small letters", () => {
        const store = new mod.PartsStore();
        store.addPart(part("ENG-0001", { supplier: "de Wyck", reorderAt: 1, reorderUpTo: 3 }));
        store.addPart(part("ENG-0002", { supplier: "Pellow & Tarn", reorderAt: 1, reorderUpTo: 3 }));
        expect(store.reorderList(5)).toEqual([
            { partNo: "ENG-0002", supplier: "Pellow & Tarn", packs: 3, units: 3, dueDay: 10 },
            { partNo: "ENG-0001", supplier: "de Wyck", packs: 3, units: 3, dueDay: 12 },
        ]);
    });
    pin("reorderList: empty when nothing is at its level", () => {
        const store = withStock(mod, "ENG-0412", 6, 100, { reorderAt: 5, reorderUpTo: 20 });
        expect(store.reorderList(5)).toEqual([]);
        expect(new mod.PartsStore().reorderList(5)).toEqual([]);
    });

    // ------------------------------------------------------------------ the store: the log

    pin("history: the part's movements, the newest first", () => {
        const store = withStock(mod, "ENG-0412", 10, 250);
        store.addPart(part("GAS-0002"));
        store.receive("GAS-0002", 1, 100, 2);
        store.issue("ENG-0412", 3, "J-1", 6);
        store.giveBack("ENG-0412", 1, "J-1", 6);
        store.correct("ENG-0412", 7, 4);
        expect(store.history(" eng-0412")).toEqual([
            move("ENG-0412", "count", -1, 4, "", 250), move("ENG-0412", "return", 1, 6, "J-1", 250),
            move("ENG-0412", "issue", -3, 6, "J-1", 250), move("ENG-0412", "delivery", 10, 1, "", 250),
        ]);
    });
    pin("history: copies, and none for a part the store has not", () => {
        const store = withStock(mod, "ENG-0412", 10, 250);
        const got = store.history("ENG-0412");
        got[0].units = 99;
        got.pop();
        expect(store.history("ENG-0412")).toEqual([move("ENG-0412", "delivery", 10, 1, "", 250)]);
        expect(store.history("ENG-9999")).toEqual([]);
    });

    pin("movesBetween: from the first day up to, not including, the second", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.issue("ENG-0412", 1, "J-1", 5);
        store.issue("ENG-0412", 2, "J-1", 8);
        store.issue("ENG-0412", 3, "J-1", 9);
        expect(store.movesBetween(5, 8).map((m) => m.units)).toEqual([-1]);
        expect(store.movesBetween(5, 9).map((m) => m.units)).toEqual([-1, -2]);
        expect(store.movesBetween(1, 5).map((m) => m.units)).toEqual([10]);
        expect(store.movesBetween(9, 9)).toEqual([]);
    });
    pin("movesBetween: every part, the oldest first, as copies", () => {
        const store = withStock(mod, "ENG-0412", 10);
        store.addPart(part("GAS-0002"));
        store.receive("GAS-0002", 2, 300, 3);
        store.issue("ENG-0412", 4, "J-1", 3);
        store.issue("GAS-0002", 1, "J-2", 2);
        const got = store.movesBetween(1, 4);
        expect(got).toEqual([
            move("ENG-0412", "delivery", 10, 1, "", 100), move("GAS-0002", "delivery", 2, 3, "", 300),
            move("ENG-0412", "issue", -4, 3, "J-1", 100), move("GAS-0002", "issue", -1, 2, "J-2", 300),
        ]);
        got[0].units = 99;
        expect(store.movesBetween(1, 2)[0].units).toBe(10);
    });

    pin("usage: units issued less units given back", () => {
        const store = withStock(mod, "ENG-0412", 20);
        store.issue("ENG-0412", 5, "J-1", 3);
        store.issue("ENG-0412", 2, "", 4);
        store.giveBack("ENG-0412", 1, "J-1", 5);
        store.receive("ENG-0412", 10, 100, 5);
        store.correct("ENG-0412", 20, 5);
        expect(store.usage(" eng-0412", 1, 10)).toBe(6);
        expect(store.usage("ENG-9999", 1, 10)).toBe(0);
        // more came back than went out in the period
        expect(store.usage("ENG-0412", 5, 10)).toBe(-1);
    });
    pin("usage: from the first day up to, not including, the second", () => {
        const store = withStock(mod, "ENG-0412", 20);
        store.addPart(part("GAS-0002"));
        store.receive("GAS-0002", 9, 100, 1);
        store.issue("ENG-0412", 1, "J-1", 5);
        store.issue("ENG-0412", 2, "J-1", 8);
        store.issue("GAS-0002", 4, "J-1", 6);
        expect(store.usage("ENG-0412", 5, 8)).toBe(1);
        expect(store.usage("ENG-0412", 5, 9)).toBe(3);
        expect(store.usage("ENG-0412", 6, 8)).toBe(0);
        expect(store.usage("ENG-0412", 8, 8)).toBe(0);
    });

    pin("coverOf: free stock over the weekly use of the four weeks before the day", () => {
        const store = withStock(mod, "ENG-0412", 30);
        store.issue("ENG-0412", 9, "J-1", 2);
        store.issue("ENG-0412", 10, "J-1", 20);
        store.issue("ENG-0412", 2, "J-1", 30);
        // days 2 to 29 count for day 30: 19 used, 5 a week rounded up, 9 free
        expect(store.coverOf("eng-0412", 30)).toBe(12);
        // days 3 to 30 count for day 31: 12 used, 3 a week
        expect(store.coverOf("ENG-0412", 31)).toBe(21);
    });
    pin("coverOf: goes by free stock, and has no limit for a part nobody drew", () => {
        const store = withStock(mod, "ENG-0412", 30);
        expect(store.coverOf("ENG-0412", 30)).toBe(-1);
        store.issue("ENG-0412", 9, "J-1", 20);
        store.setAside("ENG-0412", 20, "J-2", 21);
        // 9 used, 3 a week rounded up, 1 free
        expect(store.coverOf("ENG-0412", 30)).toBe(2);
        expect(store.coverOf("ENG-0412", 60)).toBe(-1);
    });

    pin("stockValue: units on the shelf at their average price", () => {
        const store = withStock(mod, "ENG-0412", 10, 250);
        store.addPart(part("GAS-0002"));
        store.receive("GAS-0002", 3, 1200, 1);
        store.setAside("ENG-0412", 4, "J-1", 2);
        expect(store.stockValue()).toBe(6100);
        store.issue("ENG-0412", 4, "J-1", 3);
        expect(store.stockValue()).toBe(5100);
    });
    pin("stockValue: nothing in an empty store", () => {
        expect(new mod.PartsStore().stockValue()).toBe(0);
        expect(withStock(mod, "ENG-0412", 0).stockValue()).toBe(0);
    });

    pin("valueByCategory: the stock value split by category", () => {
        const store = withStock(mod, "ENG-0412", 10, 250);
        for (const [p, units, pence] of [["ENG-0500", 2, 100], ["GAS-0002", 3, 1200], ["ZZZ-0001", 1, 75]] as const) {
            store.addPart(part(p));
            store.receive(p, units, pence, 1);
        }
        expect(store.valueByCategory()).toEqual({ engine: 2700, electrical: 0, gas: 3600, plumbing: 0, hull: 0, general: 75 });
    });
    pin("valueByCategory: every category at 0 in an empty store", () => {
        expect(new mod.PartsStore().valueByCategory())
            .toEqual({ engine: 0, electrical: 0, gas: 0, plumbing: 0, hull: 0, general: 0 });
    });

    pin("slowMovers: parts on the shelf that no job drew in the days before the day", () => {
        const store = new mod.PartsStore();
        for (const p of ["GAS-0002", "ENG-0412", "ELE-0003", "HUL-0004"]) {
            store.addPart(part(p));
        }
        store.receive("GAS-0002", 5, 100, 1);
        store.receive("ENG-0412", 5, 100, 1);
        store.receive("ELE-0003", 5, 100, 1);
        store.issue("ENG-0412", 1, "J-1", 15);
        store.issue("ELE-0003", 1, "J-1", 15);
        store.giveBack("ELE-0003", 1, "J-1", 16);
        expect(store.slowMovers(20, 10)).toEqual(["GAS-0002"]);
        expect(store.slowMovers(40, 10)).toEqual(["ELE-0003", "ENG-0412", "GAS-0002"]);
    });
    pin("slowMovers: a part that is all set aside is still on the shelf", () => {
        const store = withStock(mod, "ENG-0412", 4);
        store.setAside("ENG-0412", 4, "J-1", 2);
        expect(store.slowMovers(20, 10)).toEqual(["ENG-0412"]);
    });
    pin("slowMovers: the first day of the window counts and the day itself does not", () => {
        const store = withStock(mod, "ENG-0412", 9);
        store.issue("ENG-0412", 1, "J-1", 10);
        expect(store.slowMovers(20, 10)).toEqual([]);
        expect(store.slowMovers(21, 10)).toEqual(["ENG-0412"]);
        expect(store.slowMovers(10, 10)).toEqual(["ENG-0412"]);
        expect(store.slowMovers(11, 10)).toEqual([]);
        // a return and a count are not a job drawing the part
        store.giveBack("ENG-0412", 1, "J-1", 25);
        store.correct("ENG-0412", 8, 26);
        expect(store.slowMovers(30, 10)).toEqual(["ENG-0412"]);
        store.issue("ENG-0412", 8, "J-1", 30);
        expect(store.slowMovers(60, 10)).toEqual([]);
    });

    pin("dueForCount: parts never counted, in shelf order", () => {
        const store = new mod.PartsStore();
        store.addPart(part("ENG-0003", { bin: "" }));
        store.addPart(part("ENG-0002", { bin: "B2" }));
        store.addPart(part("ENG-0001", { bin: "A10" }));
        store.addPart(part("GAS-0009", { bin: "A2" }));
        expect(store.dueForCount(1)).toEqual(["ENG-0001", "GAS-0009", "ENG-0002", "ENG-0003"]);
        // the store's own list of parts is not put in shelf order by this
        expect(store.partNos()).toEqual(["ENG-0001", "ENG-0002", "ENG-0003", "GAS-0009"]);
    });
    pin("dueForCount: a counted part comes due when its category's days are up", () => {
        const store = new mod.PartsStore();
        const days: [string, number][] = [
            ["GAS-0001", 14], ["ENG-0001", 30], ["ELE-0001", 60], ["PLU-0001", 60], ["HUL-0001", 90], ["ZZZ-0001", 120],
        ];
        for (const [p] of days) {
            store.addPart(part(p));
            store.correct(p, 0, 10);
        }
        for (const [p, every] of days) {
            expect(store.dueForCount(10 + every - 1), p).not.toContain(p);
            expect(store.dueForCount(10 + every), p).toContain(p);
        }
        expect(store.dueForCount(10)).toEqual([]);
        expect(store.dueForCount(40)).toEqual(["ENG-0001", "GAS-0001"]);
    });

    describe("the rest of parts does what it did", () => {
        const names = cases.map(([name]) => name);
        it("the cases have names of their own, and every skipped name is a case", () => {
            expect(names.filter((name, at) => names.indexOf(name) !== at)).toEqual([]);
            expect(skip.filter((name) => !names.includes(name))).toEqual([]);
        });
        for (const [name, body] of cases) {
            if (!skip.includes(name)) {
                it(name, body);
            }
        }
    });
}

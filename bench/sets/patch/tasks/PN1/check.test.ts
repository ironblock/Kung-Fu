import { describe, expect, it } from "vitest";
import * as mod from "../src/parts";
import type { Part } from "../src/parts";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-parts";

type Store = InstanceType<typeof mod.PartsStore>;
type Asked = Store & { shortfall(partNo: string, units: number, jobId: string): number };

function part(partNo: string): Part {
    return { partNo, name: "Oil filter", bin: "A1", packSize: 1, reorderAt: 0, reorderUpTo: 0, supplier: "Pellow & Tarn" };
}

/** Everything a caller can see of the store. */
function seen(s: Store): unknown {
    return {
        parts: s.partNos().map((p) => [
            s.part(p), s.onHand(p), s.held(p), s.freeOf(p), s.avgPence(p), s.lastCounted(p), s.lastDelivered(p), s.history(p),
        ]),
        holds: ["J-1", "J-2", "J-3", "J-4"].map((j) => s.holdsFor(j)),
        moves: s.movesBetween(-1000, 100000),
    };
}

/** Ten ENG-0412 on the shelf: four set aside for J-1 and three for J-2, so three are free. */
function store(): Asked {
    const made = new mod.PartsStore();
    made.addPart(part("ENG-0412"));
    made.addPart(part("GAS-0002"));
    made.receive("ENG-0412", 10, 100, 1);
    made.receive("GAS-0002", 2, 100, 1);
    made.setAside("ENG-0412", 4, "J-1", 2);
    made.setAside("ENG-0412", 3, "J-2", 2);
    return made as Asked;
}

describe("PartsStore.shortfall", () => {
    it("is 0 while the units are within the free stock", () => {
        const s = store();
        expect(s.shortfall("ENG-0412", 1, "J-3")).toBe(0);
        expect(s.shortfall("ENG-0412", 3, "J-3")).toBe(0);
        expect(s.shortfall("GAS-0002", 2, "J-3")).toBe(0);
    });

    it("is what is asked beyond the free stock, for a job with nothing set aside", () => {
        const s = store();
        expect(s.shortfall("ENG-0412", 4, "J-3")).toBe(1);
        expect(s.shortfall("ENG-0412", 10, "J-3")).toBe(7);
        expect(s.shortfall("ENG-0412", 25, "J-3")).toBe(22);
        expect(s.shortfall("GAS-0002", 3, "J-3")).toBe(1);
    });

    it("counts what is set aside for the same job as within its reach", () => {
        const s = store();
        expect(s.shortfall("ENG-0412", 4, "J-1")).toBe(0);
        expect(s.shortfall("ENG-0412", 7, "J-1")).toBe(0);
        expect(s.shortfall("ENG-0412", 8, "J-1")).toBe(1);
        expect(s.shortfall("ENG-0412", 12, "J-1")).toBe(5);
        expect(s.shortfall("ENG-0412", 6, "J-2")).toBe(0);
        expect(s.shortfall("ENG-0412", 7, "J-2")).toBe(1);
    });

    it("leaves what is set aside for other jobs out of reach", () => {
        const s = store();
        s.setAside("ENG-0412", 3, "J-4", 3);
        expect(s.shortfall("ENG-0412", 1, "J-3")).toBe(1);
        expect(s.shortfall("ENG-0412", 2, "J-3")).toBe(2);
        expect(s.shortfall("ENG-0412", 4, "J-1")).toBe(0);
        expect(s.shortfall("ENG-0412", 5, "J-1")).toBe(1);
    });

    it("goes by one part: a hold on another part is no help", () => {
        const s = store();
        s.setAside("GAS-0002", 2, "J-3", 3);
        expect(s.shortfall("ENG-0412", 4, "J-3")).toBe(1);
        expect(s.shortfall("GAS-0002", 2, "J-3")).toBe(0);
        expect(s.shortfall("GAS-0002", 1, "J-1")).toBe(1);
    });

    it("is all the units for a part the store does not have", () => {
        const s = store();
        expect(s.shortfall("ENG-9999", 5, "J-1")).toBe(5);
        expect(s.shortfall("ENG-9999", 1, "J-3")).toBe(1);
    });

    it("takes a part number typed in any case", () => {
        const s = store();
        expect(s.shortfall("eng-0412", 8, "J-1")).toBe(1);
        expect(s.shortfall("Eng-0412", 7, "J-1")).toBe(0);
        expect(s.shortfall("eng-0412", 5, "J-3")).toBe(2);
    });

    it("changes nothing in the store", () => {
        const s = store();
        const before = copyOf(seen(s));
        s.shortfall("ENG-0412", 12, "J-1");
        s.shortfall("ENG-0412", 2, "J-3");
        s.shortfall("ENG-9999", 2, "J-3");
        expect(seen(s)).toEqual(before);
        expect(s.partNos()).toEqual(["ENG-0412", "GAS-0002"]);
        expect(s.freeOf("ENG-0412")).toBe(3);
        expect(s.shortfall("ENG-0412", 8, "J-1")).toBe(1);
    });
});

unchanged(mod);

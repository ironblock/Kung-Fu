import { describe, expect, it } from "vitest";
import * as mod from "../src/parts";
import type { Movement, Part } from "../src/parts";
import { unchanged } from "./helpers-parts";

type Store = InstanceType<typeof mod.PartsStore>;
type Asked = Store & { history(partNo: string, limit?: number): Movement[] };

function part(partNo: string): Part {
    return { partNo, name: "Oil filter", bin: "A1", packSize: 1, reorderAt: 0, reorderUpTo: 0, supplier: "Pellow & Tarn" };
}

function move(partNo: string, kind: Movement["kind"], units: number, day: number, jobId: string): Movement {
    return { partNo, kind, units, day, jobId, unitPence: 250 };
}

/**
 * ENG-0412 has five movements, logged in this order: a delivery on day 1, an issue on day 6, a return on day 6,
 * a count booked late for day 4, and an issue on day 7. GAS-0002 has movements logged in between.
 */
function store(): Asked {
    const made = new mod.PartsStore();
    made.addPart(part("ENG-0412"));
    made.addPart(part("GAS-0002"));
    made.receive("ENG-0412", 10, 250, 1);
    made.receive("GAS-0002", 6, 250, 1);
    made.issue("ENG-0412", 3, "J-1", 6);
    made.issue("GAS-0002", 1, "J-1", 6);
    made.giveBack("ENG-0412", 1, "J-1", 6);
    made.correct("ENG-0412", 7, 4);
    made.issue("GAS-0002", 2, "J-2", 8);
    made.issue("ENG-0412", 2, "J-2", 7);
    made.issue("GAS-0002", 1, "J-2", 9);
    return made as Asked;
}

const LAST_ISSUE = move("ENG-0412", "issue", -2, 7, "J-2");
const COUNT = move("ENG-0412", "count", -1, 4, "");
const RETURN = move("ENG-0412", "return", 1, 6, "J-1");
const FIRST_ISSUE = move("ENG-0412", "issue", -3, 6, "J-1");
const DELIVERY = move("ENG-0412", "delivery", 10, 1, "");

describe("PartsStore.history with a limit", () => {
    it("returns the movements recorded last, in the order it returns them without a limit", () => {
        const s = store();
        expect(s.history("ENG-0412", 2)).toEqual([LAST_ISSUE, COUNT]);
        expect(s.history("ENG-0412", 3)).toEqual([LAST_ISSUE, COUNT, RETURN]);
        expect(s.history("ENG-0412", 4)).toEqual([LAST_ISSUE, COUNT, RETURN, FIRST_ISSUE]);
        expect(s.history("ENG-0412", 4)).toEqual(s.history("ENG-0412").slice(0, 4));
    });

    it("returns the one recorded last for a limit of 1", () => {
        const s = store();
        expect(s.history("ENG-0412", 1)).toEqual([LAST_ISSUE]);
        expect(s.history("GAS-0002", 1)).toEqual([move("GAS-0002", "issue", -1, 9, "J-2")]);
    });

    it("goes by when a movement was logged, not by its day", () => {
        const s = store();
        s.receive("ENG-0412", 5, 250, 2);
        expect(s.history("ENG-0412", 1)).toEqual([move("ENG-0412", "delivery", 5, 2, "")]);
        expect(s.history("ENG-0412", 3)).toEqual([move("ENG-0412", "delivery", 5, 2, ""), LAST_ISSUE, COUNT]);
    });

    it("counts only that part's movements toward the limit", () => {
        const s = store();
        expect(s.history("GAS-0002", 2)).toEqual([
            move("GAS-0002", "issue", -1, 9, "J-2"), move("GAS-0002", "issue", -2, 8, "J-2"),
        ]);
        expect(s.history("GAS-0002", 3)).toHaveLength(3);
        expect(s.history(" eng-0412", 2)).toEqual([LAST_ISSUE, COUNT]);
    });

    it("returns everything when the part has no more movements than the limit", () => {
        const s = store();
        const all = [LAST_ISSUE, COUNT, RETURN, FIRST_ISSUE, DELIVERY];
        expect(s.history("ENG-0412", 5)).toEqual(all);
        expect(s.history("ENG-0412", 6)).toEqual(all);
        expect(s.history("ENG-0412", 500)).toEqual(all);
        expect(s.history("ENG-9999", 3)).toEqual([]);
    });

    it("returns everything without a limit, as before", () => {
        const s = store();
        expect(s.history("ENG-0412")).toEqual([LAST_ISSUE, COUNT, RETURN, FIRST_ISSUE, DELIVERY]);
        expect(s.history("GAS-0002")).toHaveLength(4);
    });

    it("still hands out copies", () => {
        const s = store();
        const got = s.history("ENG-0412", 2);
        got[0].units = 99;
        got[1].day = 99;
        got.pop();
        expect(s.history("ENG-0412", 2)).toEqual([LAST_ISSUE, COUNT]);
        expect(s.history("ENG-0412")).toHaveLength(5);
        expect(s.movesBetween(7, 8)).toEqual([LAST_ISSUE]);
    });
});

unchanged(mod);

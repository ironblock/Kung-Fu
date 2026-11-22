import { describe, expect, it } from "vitest";
import * as mod from "../src/rota";
import { unchanged } from "./helpers-rota";

// Made out of order on purpose: the shifts are not kept in order of day.
function yard() {
    const rota = new mod.Rota();
    rota.addStaff({ id: "ada", name: "Ada", roles: ["hand", "lock"], ratePence: 1260, contractMinutes: 2400 });
    rota.addStaff({ id: "cleo", name: "Cleo", roles: ["office"], ratePence: 1333, contractMinutes: 1200 });
    rota.addShift(17, 720, 1020, "hand"); // s1
    rota.addShift(16, 420, 930, "hand", "ada"); // s2, held
    rota.addShift(16, 1320, 360, "lock"); // s3, a night shift on day 16
    rota.addShift(15, 540, 780, "office"); // s4
    rota.addShift(17, 420, 660, "lock"); // s5
    rota.addShift(18, 420, 930, "hand"); // s6
    rota.addShift(16, 480, 960, "office", "cleo"); // s7, held
    rota.addShift(16, 600, 840, "hand"); // s8
    rota.addShift(14, 1320, 360, "hand"); // s9, a night shift on day 14 that ends on day 15
    return rota;
}

const ids = (shifts: mod.Shift[]): string[] => shifts.map((s) => s.id);

describe("Rota.openShifts", () => {
    it("gives the shifts nobody holds, by day and then by start", () => {
        const rota = yard();
        expect(ids(rota.openShifts(14, 19))).toEqual(["s9", "s4", "s8", "s3", "s5", "s1", "s6"]);
        expect(ids(rota.openShifts(16, 18))).toEqual(["s8", "s3", "s5", "s1"]);
    });

    it("gives whole shifts", () => {
        const rota = yard();
        expect(rota.openShifts(16, 17)).toEqual([
            { id: "s8", staffId: "", day: 16, start: 600, end: 840, role: "hand" },
            { id: "s3", staffId: "", day: 16, start: 1320, end: 360, role: "lock" },
        ]);
    });

    it("counts the first day and not the last", () => {
        const rota = yard();
        expect(ids(rota.openShifts(16, 17))).toEqual(["s8", "s3"]);
        expect(ids(rota.openShifts(17, 18))).toEqual(["s5", "s1"]);
        expect(ids(rota.openShifts(18, 19))).toEqual(["s6"]);
        expect(ids(rota.openShifts(17, 19))).toEqual(["s5", "s1", "s6"]);
        expect(rota.openShifts(18, 18)).toEqual([]);
        expect(rota.openShifts(18, 16)).toEqual([]);
        expect(rota.openShifts(19, 40)).toEqual([]);
    });

    it("goes by a shift's own day, though a night shift ends on the next", () => {
        const rota = yard();
        expect(ids(rota.openShifts(15, 16))).toEqual(["s4"]);
        expect(ids(rota.openShifts(14, 15))).toEqual(["s9"]);
    });

    it("leaves out the shifts somebody holds", () => {
        const rota = yard();
        expect(ids(rota.openShifts(16, 17))).not.toContain("s2");
        rota.release("s2");
        expect(ids(rota.openShifts(16, 17))).toEqual(["s2", "s8", "s3"]);
        rota.assign("s3", "ada");
        expect(ids(rota.openShifts(16, 17))).toEqual(["s2", "s8"]);
    });

    it("keeps to one role when a role is given", () => {
        const rota = yard();
        expect(ids(rota.openShifts(14, 19, "hand"))).toEqual(["s9", "s8", "s1", "s6"]);
        expect(ids(rota.openShifts(14, 19, "lock"))).toEqual(["s3", "s5"]);
        expect(ids(rota.openShifts(14, 19, "office"))).toEqual(["s4"]);
        expect(rota.openShifts(14, 19, "fitter")).toEqual([]);
        expect(ids(rota.openShifts(17, 18, "hand"))).toEqual(["s1"]);
    });

    it("is empty for a rota with no shift", () => {
        expect(new mod.Rota().openShifts(0, 100)).toEqual([]);
    });

    it("changes nothing in the rota", () => {
        const rota = yard();
        const lines = rota.toLines();
        const first = rota.openShifts(14, 19);
        first.length = 0;
        expect(ids(rota.openShifts(14, 19))).toEqual(["s9", "s4", "s8", "s3", "s5", "s1", "s6"]);
        expect(rota.toLines()).toEqual(lines);
        expect(ids(rota.shiftsOn(16))).toEqual(["s2", "s7", "s8", "s3"]);

        // The rota's own order of shifts decides which clash is named first, so it shows a list sorted in place.
        const other = new mod.Rota();
        other.addStaff({ id: "ada", name: "Ada", roles: ["hand"], ratePence: 1260, contractMinutes: 2400 });
        other.load(["s1 17 12:00-16:00 hand ada", "s2 17 08:00-13:00 hand ada", "s3 18 09:00-10:00 hand -"]);
        other.load(["s4 16 09:00-10:00 hand -"]);
        const asked = { id: "x1", staffId: "", day: 17, start: 750, end: 765, role: "hand" as const };
        expect(other.whyNot("ada", asked)).toBe("Ada is on s1 then");
        expect(ids(other.openShifts(0, 100))).toEqual(["s4", "s3"]);
        expect(other.whyNot("ada", asked)).toBe("Ada is on s1 then");
    });

    it("changes nothing in the rota when its shifts are on several days", () => {
        // The two clashing shifts are on two days, and the later day's came first: a sort by day turns them round.
        const rota = new mod.Rota();
        rota.addStaff({ id: "ada", name: "Ada", roles: ["hand"], ratePence: 1260, contractMinutes: 2400 });
        rota.load(["s1 17 01:00-05:00 hand ada", "s2 16 22:00-03:00 hand ada", "s3 15 09:00-10:00 hand -"]);
        const asked = { id: "x1", staffId: "", day: 17, start: 120, end: 150, role: "hand" as const };
        expect(rota.whyNot("ada", asked)).toBe("Ada is on s1 then");
        expect(ids(rota.openShifts(0, 100))).toEqual(["s3"]);
        expect(rota.whyNot("ada", asked)).toBe("Ada is on s1 then");
    });
});

unchanged(mod, []);

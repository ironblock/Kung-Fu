import { describe, expect, it } from "vitest";
import * as mod from "../src/survey";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-survey";

type Finding = import("../src/survey").Finding;
type Severity = import("../src/survey").Severity;

function found(code: string, severity: Severity, waived = false): Finding {
    return { code, severity, note: "", waived };
}

const CODES = ["ELE-03", "ENG-03", "FIR-03", "DEK-01", "HUL-03", "DEK-02", "FIR-01", "FIR-02", "ELE-01", "HUL-02",
    "ENG-02"];

/** `n` minor findings, each on an item of its own; the first `waived` of them are waived. */
function minors(n: number, waived = 0): Finding[] {
    return CODES.slice(0, n).map((code, at) => found(code, "minor", at < waived));
}

/** `n` major findings that stand. */
function majors(n: number): Finding[] {
    return ["GAS-03", "ELE-02", "ENG-01", "HUL-01"].slice(0, n).map((code) => found(code, "major"));
}

describe("outcomeOf, with five minor findings counted as a major one", () => {
    it("five minor findings and nothing worse make a survey conditional", () => {
        expect(mod.outcomeOf(minors(5))).toBe("conditional");
        expect(mod.outcomeOf([...minors(5), found("DEK-03", "advisory")])).toBe("conditional");
    });

    it("more than five do too, ten and eleven as well", () => {
        expect(mod.outcomeOf(minors(6))).toBe("conditional");
        expect(mod.outcomeOf(minors(7))).toBe("conditional");
        expect(mod.outcomeOf(minors(10))).toBe("conditional");
        expect(mod.outcomeOf(minors(11))).toBe("conditional");
    });

    it("four minor findings or fewer change nothing", () => {
        expect(mod.outcomeOf(minors(4))).toBe("pass");
        expect(mod.outcomeOf(minors(1))).toBe("pass");
        expect(mod.outcomeOf([...minors(4), ...majors(1)])).toBe("conditional");
        expect(mod.outcomeOf([...minors(4), ...majors(2)])).toBe("conditional");
        expect(mod.outcomeOf([...minors(4), ...majors(3)])).toBe("fail");
    });

    it("five minor findings beside one major finding are conditional, as two majors are", () => {
        expect(mod.outcomeOf([...minors(5), ...majors(1)])).toBe("conditional");
        expect(mod.outcomeOf([...majors(1), ...minors(7)])).toBe("conditional");
    });

    it("five minor findings beside two major findings fail, as three majors do", () => {
        expect(mod.outcomeOf([...minors(5), ...majors(2)])).toBe("fail");
        const [first, second] = majors(2);
        expect(mod.outcomeOf([first, ...minors(6), second])).toBe("fail");
    });

    it("five minor findings beside three or four major findings fail", () => {
        expect(mod.outcomeOf([...minors(5), ...majors(3)])).toBe("fail");
        expect(mod.outcomeOf([...majors(4), ...minors(5)])).toBe("fail");
    });

    it("ten minor findings count as one major finding, not two", () => {
        expect(mod.outcomeOf([...minors(10), ...majors(1)])).toBe("conditional");
        expect(mod.outcomeOf([...minors(11), ...majors(1)])).toBe("conditional");
        expect(mod.outcomeOf([...minors(10), ...majors(2)])).toBe("fail");
    });

    it("each minor finding counts, two on one item as two", () => {
        const twice = [found("ELE-03", "minor"), found("ELE-03", "minor"), ...minors(4).slice(1)];
        expect(mod.outcomeOf(twice)).toBe("conditional");
        expect(mod.outcomeOf([...twice, ...majors(2)])).toBe("fail");
    });

    it("a waived minor finding does not count towards the five", () => {
        expect(mod.outcomeOf(minors(5, 1))).toBe("pass");
        expect(mod.outcomeOf(minors(7, 3))).toBe("pass");
        expect(mod.outcomeOf(minors(7, 2))).toBe("conditional");
        expect(mod.outcomeOf([...minors(5, 1), ...majors(2)])).toBe("conditional");
        expect(mod.outcomeOf([...minors(6, 1), ...majors(2)])).toBe("fail");
    });

    it("advisories are not counted with the minors", () => {
        const list = [...minors(4), found("DEK-03", "advisory"), found("HUL-01", "advisory"), found("GAS-01", "advisory")];
        expect(mod.outcomeOf(list)).toBe("pass");
        expect(mod.outcomeOf([...minors(4), found("DEK-03", "advisory"), ...majors(2)])).toBe("conditional");
    });

    it("a waived major finding is still not counted, beside five minor findings", () => {
        expect(mod.outcomeOf([...minors(5), ...majors(1), found("FIR-02", "major", true)])).toBe("conditional");
        expect(mod.outcomeOf([...minors(5), found("FIR-02", "major", true), found("ENG-02", "major", true)]))
            .toBe("conditional");
        expect(mod.outcomeOf([...minors(4), found("GAS-03", "major", true)])).toBe("pass");
    });

    it("a critical finding still fails, and a waived one still changes nothing", () => {
        expect(mod.outcomeOf([...minors(5), found("HUL-01", "critical")])).toBe("fail");
        expect(mod.outcomeOf([found("GAS-02", "critical"), ...minors(6)])).toBe("fail");
        expect(mod.outcomeOf([...minors(5), found("HUL-01", "critical", true)])).toBe("conditional");
    });

    it("still leaves the findings as they were", () => {
        const list = [...minors(6, 1), ...majors(2)];
        const before = copyOf(list);
        mod.outcomeOf(list);
        expect(list).toEqual(before);
    });

    it("a record closed with five minor findings and two major ones fails, and waiving a minor one helps", () => {
        const record = mod.closeSurvey("Heron", 1000, 570, [...minors(5), ...majors(2)]);
        expect(record.outcome).toBe("fail");
        expect(mod.waive(record, "FIR-03", "fitted today")).toBe(true);
        expect(record.outcome).toBe("conditional");
    });
});

unchanged(mod, ["outcomeOf: minors alone never stop a pass"]);

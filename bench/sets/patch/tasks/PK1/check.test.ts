import { describe, expect, it } from "vitest";
import * as mod from "../src/survey";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-survey";

type Finding = import("../src/survey").Finding;
type Severity = import("../src/survey").Severity;

function found(code: string, severity: Severity, waived = false): Finding {
    return { code, severity, note: "", waived };
}

function tally(advisory: number, minor: number, major: number, critical: number): Record<Severity, number> {
    return { advisory, minor, major, critical };
}

describe("openBySeverity", () => {
    it("counts each finding under its severity", () => {
        const tally = mod.openBySeverity([found("FIR-01", "major"), found("ELE-03", "minor"), found("FIR-02", "major"),
            found("HUL-01", "critical"), found("DEK-03", "advisory"), found("DEK-02", "major")]);
        expect(tally.advisory).toBe(1);
        expect(tally.minor).toBe(1);
        expect(tally.major).toBe(3);
        expect(tally.critical).toBe(1);
    });

    it("counts every finding, so two on one item count as two", () => {
        expect(mod.openBySeverity([found("ELE-03", "minor"), found("ELE-03", "minor"), found("FIR-01", "major"),
            found("FIR-01", "major"), found("FIR-01", "major")])).toEqual(tally(0, 2, 3, 0));
    });

    it("has all four severities as keys, with 0 where there is no finding", () => {
        const none = mod.openBySeverity([]);
        expect([none.advisory, none.minor, none.major, none.critical]).toEqual([0, 0, 0, 0]);
        const one = mod.openBySeverity([found("ELE-03", "minor"), found("DEK-01", "minor")]);
        expect([one.advisory, one.minor, one.major, one.critical]).toEqual([0, 2, 0, 0]);
    });

    it("has the four severities as its own keys and no other key", () => {
        const none = mod.openBySeverity([]);
        expect(none).toEqual(tally(0, 0, 0, 0));
        expect(Object.keys(none).sort()).toEqual(["advisory", "critical", "major", "minor"]);
        const some = mod.openBySeverity([found("FIR-01", "major"), found("ELE-03", "minor", true)]);
        expect(some).toEqual(tally(0, 0, 1, 0));
        expect(Object.keys(some).sort()).toEqual(["advisory", "critical", "major", "minor"]);
    });

    it("gives each call a tally of its own, which a later call leaves as it was", () => {
        const first = mod.openBySeverity([found("FIR-01", "major"), found("DEK-03", "advisory")]);
        const second = mod.openBySeverity([]);
        const third = mod.openBySeverity([found("ELE-03", "minor"), found("ELE-03", "minor")]);
        expect(first).toEqual(tally(1, 0, 1, 0));
        expect(second).toEqual(tally(0, 0, 0, 0));
        expect(third).toEqual(tally(0, 2, 0, 0));
    });

    it("does not count a waived finding", () => {
        const tally = mod.openBySeverity([found("FIR-01", "major", true), found("ELE-03", "minor"),
            found("FIR-02", "major"), found("DEK-03", "advisory", true), found("HUL-03", "major", true)]);
        expect([tally.advisory, tally.minor, tally.major, tally.critical]).toEqual([0, 1, 1, 0]);
        const all = mod.openBySeverity([found("FIR-01", "major", true), found("HUL-01", "critical", true)]);
        expect([all.advisory, all.minor, all.major, all.critical]).toEqual([0, 0, 0, 0]);
    });

    it("goes by the finding's own severity, whatever its checklist item says", () => {
        const tally = mod.openBySeverity([found("DEK-03", "major"), found("HUL-01", "minor"), found("HUL-02", "minor"),
            found("ELE-03", "critical")]);
        expect([tally.advisory, tally.minor, tally.major, tally.critical]).toEqual([0, 2, 1, 1]);
    });

    it("leaves the array and its findings as they were", () => {
        const findings = [found("ELE-03", "minor"), found("HUL-01", "critical"), found("FIR-01", "major", true),
            found("DEK-03", "advisory")];
        const before = copyOf(findings);
        const first = findings[0];
        mod.openBySeverity(findings);
        expect(findings).toEqual(before);
        expect(findings[0]).toBe(first);
    });

    it("leaves a finding as it was written down, with its code and note untidied", () => {
        const findings: Finding[] = [{ code: "ele-03", severity: "minor", note: " dim ", waived: false },
            { code: " FIR-01", severity: "major", note: "out of date ", waived: true },
            { code: "hul-02 ", severity: "critical", note: "  ", waived: false }];
        const before = copyOf(findings);
        const each = [...findings];
        expect(mod.openBySeverity(findings)).toEqual(tally(0, 1, 0, 1));
        expect(findings).toEqual(before);
        expect(findings.every((finding, at) => finding === each[at])).toBe(true);
    });
});

unchanged(mod);

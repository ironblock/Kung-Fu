// What src/survey.ts does now, pinned case by case. A task's check calls `unchanged` and skips only the cases
// its change must alter.
import { describe, expect, it } from "vitest";
import { copyOf } from "./helpers";

type Mod = typeof import("../src/survey");
type Boat = import("../src/survey").Boat;
type Finding = import("../src/survey").Finding;
type Outcome = import("../src/survey").Outcome;
type Severity = import("../src/survey").Severity;
type SurveyRecord = import("../src/survey").SurveyRecord;
type Certificate = import("../src/survey").Certificate;

const heron: Boat = { name: "Heron", berths: 4, gas: true, shorePower: true };
const teal: Boat = { name: "Teal", berths: 1, gas: false, shorePower: true };
const pike: Boat = { name: "Pike", berths: 8, gas: true, shorePower: false };
const wren: Boat = { name: "Wren", berths: 7, gas: false, shorePower: false };

function found(code: string, severity: Severity, note = "", waived = false): Finding {
    return { code, severity, note, waived };
}

function rec(boat: string, day: number, outcome: Outcome, findings: Finding[] = []): SurveyRecord {
    return { boat, day, startedAt: 570, findings, outcome };
}

/** Newest first, as the module keeps a history. */
function historyOf(boat: string, ...visits: [number, Outcome][]): SurveyRecord[] {
    return visits.map(([day, outcome]) => rec(boat, day, outcome)).reverse();
}

function spans(certs: Certificate[]): [string, number, number, boolean][] {
    return certs.map((c) => [c.serial, c.from, c.expires, c.interim]);
}

const TABLE: [string, string, Severity, number, string | undefined][] = [
    ["HUL-01", "hull", "critical", 20, undefined],
    ["HUL-02", "hull", "critical", 5, undefined],
    ["HUL-03", "hull", "major", 10, undefined],
    ["GAS-01", "gas", "critical", 10, "gas"],
    ["GAS-02", "gas", "critical", 15, "gas"],
    ["GAS-03", "gas", "major", 10, "gas"],
    ["ELE-01", "electrics", "major", 5, undefined],
    ["ELE-02", "electrics", "major", 10, "shorePower"],
    ["ELE-03", "electrics", "minor", 5, undefined],
    ["ENG-01", "engine", "critical", 10, undefined],
    ["ENG-02", "engine", "major", 10, undefined],
    ["ENG-03", "engine", "minor", 5, undefined],
    ["FIR-01", "fire", "major", 5, undefined],
    ["FIR-02", "fire", "major", 5, undefined],
    ["FIR-03", "fire", "minor", 4, undefined],
    ["DEK-01", "deck", "minor", 5, undefined],
    ["DEK-02", "deck", "major", 3, undefined],
    ["DEK-03", "deck", "advisory", 3, undefined],
];

const TITLES = [
    "Hull plating sound below waterline",
    "Weed hatch seals and is secured",
    "Bilge dry and bilge pump runs",
    "Locker drains overboard",
    "Pipework holds pressure",
    "Flame failure cut-outs",
    "Battery terminals covered",
    "Inlet trips",
    "Navigation and tunnel lights",
    "Fuel lines and shut-off valve",
    "Engine mounts and drive coupling",
    "Exhaust lagging intact",
    "Extinguishers in date, one by each exit",
    "Smoke and monoxide alarms sound",
    "Fire blanket by the galley",
    "Handrails and non-slip surfaces",
    "Lifebuoy and throw line at the stern",
    "Fenders and mooring lines",
];

export function unchanged(mod: Mod, skip: string[] = []): void {
    const cases: [string, () => void][] = [];
    const add = (name: string, run: () => void): void => {
        cases.push([name, run]);
    };

    // ---------------------------------------------------------------------------------------- the checklist

    add("CHECKLIST: the items, their areas, severities, minutes and needs, in order", () => {
        expect(mod.CHECKLIST.map((i) => [i.code, i.area, i.severity, i.minutes, i.needs])).toEqual(TABLE);
    });
    add("CHECKLIST: every item has a title", () => {
        expect(mod.CHECKLIST.every((i) => typeof i.title === "string" && i.title.length > 0)).toBe(true);
    });
    add("CHECKLIST: the title of each item, word for word", () => {
        expect(mod.CHECKLIST.map((i) => i.title)).toEqual(TITLES);
    });
    add("findItem: finds an item by its code", () => {
        expect(mod.findItem("GAS-02")).toBe(mod.CHECKLIST[4]);
    });
    add("findItem: the case of the code and the spaces round it do not count", () => {
        expect(mod.findItem("  hul-01 ")).toBe(mod.CHECKLIST[0]);
        expect(mod.findItem("Dek-03")?.code).toBe("DEK-03");
    });
    add("findItem: undefined for a code the checklist does not hold", () => {
        expect(mod.findItem("GAS-9")).toBeUndefined();
        expect(mod.findItem("")).toBeUndefined();
    });
    add("checklistFor: a boat with gas and shore power gets every item, in the table's order", () => {
        expect(mod.checklistFor(heron).map((i) => i.code)).toEqual(TABLE.map((row) => row[0]));
    });
    add("checklistFor: a boat with no gas gets no gas item", () => {
        const codes = mod.checklistFor(teal).map((i) => i.code);
        expect(codes).toEqual(TABLE.filter((row) => row[4] !== "gas").map((row) => row[0]));
        expect(codes).toHaveLength(15);
    });
    add("checklistFor: a boat with no shore power is not asked about its inlet", () => {
        expect(mod.checklistFor(pike).map((i) => i.code)).toEqual(
            TABLE.filter((row) => row[4] !== "shorePower").map((row) => row[0]));
        expect(mod.checklistFor(wren)).toHaveLength(14);
    });
    add("checklistFor: hands back the checklist's own items, not copies", () => {
        expect(mod.checklistFor(heron)[0]).toBe(mod.CHECKLIST[0]);
        expect(mod.checklistFor(teal).every((i) => mod.CHECKLIST.includes(i))).toBe(true);
    });
    add("checklistFor: leaves the checklist as it was", () => {
        const before = copyOf(mod.CHECKLIST);
        mod.checklistFor(wren);
        expect(mod.CHECKLIST).toEqual(before);
    });

    // -------------------------------------------------------------------------------------------- the diary

    add("plannedMinutes: the items' minutes, rounded up to a quarter of an hour", () => {
        expect(mod.plannedMinutes(heron)).toBe(150);
        expect(mod.plannedMinutes(wren)).toBe(120);
    });
    add("plannedMinutes: a sum that is a whole number of quarters is left alone", () => {
        expect(mod.plannedMinutes(teal)).toBe(105);
        expect(mod.plannedMinutes(pike)).toBe(150);
    });
    add("plannedMinutes: five minutes for each berth above four, and nothing off for fewer", () => {
        expect(mod.plannedMinutes({ ...heron, berths: 6 })).toBe(150);
        expect(mod.plannedMinutes({ ...heron, berths: 7 })).toBe(165);
        expect(mod.plannedMinutes({ ...teal, berths: 4 })).toBe(105);
        expect(mod.plannedMinutes({ ...teal, berths: 5 })).toBe(120);
    });
    add("fitsWorkingDay: a survey may start at 08:00 and not a minute before", () => {
        expect(mod.fitsWorkingDay(heron, 480)).toBe(true);
        expect(mod.fitsWorkingDay(heron, 479)).toBe(false);
    });
    add("fitsWorkingDay: a survey may end at 17:00 and not a minute after", () => {
        expect(mod.fitsWorkingDay(heron, 870)).toBe(true);
        expect(mod.fitsWorkingDay(heron, 871)).toBe(false);
        expect(mod.fitsWorkingDay(teal, 915)).toBe(true);
        expect(mod.fitsWorkingDay(teal, 916)).toBe(false);
    });
    add("latestStart: the minute from midnight at which the boat's survey would end at 17:00", () => {
        expect(mod.latestStart(heron)).toBe(870);
        expect(mod.latestStart(teal)).toBe(915);
    });
    add("latestStart: a longer survey has to start sooner", () => {
        expect(mod.latestStart({ ...heron, berths: 7 })).toBe(855);
        expect(mod.latestStart(wren)).toBe(900);
    });
    add("clockLabel: minutes from midnight as hours and minutes, two digits each", () => {
        expect(mod.clockLabel(545)).toBe("09:05");
        expect(mod.clockLabel(1020)).toBe("17:00");
    });
    add("clockLabel: midnight and the last minute of the day", () => {
        expect(mod.clockLabel(0)).toBe("00:00");
        expect(mod.clockLabel(1439)).toBe("23:59");
    });

    // ----------------------------------------------------------------------------------------- the findings

    add("makeFinding: takes the item's own severity, tidies the code and the note, and is not waived", () => {
        expect(mod.makeFinding(" fir-03", "  missing ")).toEqual(found("FIR-03", "minor", "missing"));
        expect(mod.makeFinding("HUL-02", "")).toEqual(found("HUL-02", "critical", ""));
    });
    add("makeFinding: the surveyor may give another severity", () => {
        expect(mod.makeFinding("DEK-03", "frayed", "major")).toEqual(found("DEK-03", "major", "frayed"));
        expect(mod.makeFinding("HUL-03", "damp", "advisory").severity).toBe("advisory");
    });
    add("makeFinding: throws for a code the checklist does not hold, and names the code", () => {
        expect(() => mod.makeFinding("xx-99", "what")).toThrow("no checklist item XX-99");
        expect(() => mod.makeFinding("", "what")).toThrow();
    });
    add("sortFindings: worst first", () => {
        const list = [found("DEK-03", "advisory"), found("HUL-01", "critical"), found("ELE-03", "minor"),
            found("FIR-01", "major")];
        expect(mod.sortFindings(list).map((f) => f.code)).toEqual(["HUL-01", "FIR-01", "ELE-03", "DEK-03"]);
    });
    add("sortFindings: sorts the array it is given, and hands that same array back", () => {
        const list = [found("ELE-03", "minor"), found("FIR-01", "major")];
        const back = mod.sortFindings(list);
        expect(back).toBe(list);
        expect(list.map((f) => f.code)).toEqual(["FIR-01", "ELE-03"]);
    });
    add("sortFindings: findings of one severity keep their order", () => {
        const list = [found("FIR-02", "major", "b"), found("ENG-03", "minor"), found("DEK-02", "major", "a"),
            found("ELE-01", "major", "c"), found("DEK-01", "minor")];
        expect(mod.sortFindings(list).map((f) => f.code)).toEqual(["FIR-02", "DEK-02", "ELE-01", "ENG-03", "DEK-01"]);
    });
    add("outcomeOf: no finding, or none worse than minor, is a pass", () => {
        expect(mod.outcomeOf([])).toBe("pass");
        expect(mod.outcomeOf([found("DEK-03", "advisory"), found("ELE-03", "minor"), found("FIR-03", "minor")]))
            .toBe("pass");
    });
    add("outcomeOf: one or two majors make it conditional", () => {
        expect(mod.outcomeOf([found("FIR-01", "major")])).toBe("conditional");
        expect(mod.outcomeOf([found("FIR-01", "major"), found("ELE-03", "minor"), found("FIR-02", "major")]))
            .toBe("conditional");
    });
    add("outcomeOf: three majors fail, and so do more", () => {
        expect(mod.outcomeOf([found("FIR-01", "major"), found("FIR-02", "major"), found("DEK-02", "major")]))
            .toBe("fail");
        expect(mod.outcomeOf([found("FIR-01", "major"), found("FIR-02", "major"), found("DEK-02", "major"),
            found("ELE-01", "major")])).toBe("fail");
    });
    add("outcomeOf: one critical fails", () => {
        expect(mod.outcomeOf([found("HUL-01", "critical")])).toBe("fail");
        expect(mod.outcomeOf([found("ELE-03", "minor"), found("GAS-02", "critical")])).toBe("fail");
    });
    add("outcomeOf: a waived finding does not count", () => {
        const majors = [found("FIR-01", "major"), found("FIR-02", "major", "", true), found("DEK-02", "major")];
        expect(mod.outcomeOf(majors)).toBe("conditional");
        expect(mod.outcomeOf([found("FIR-01", "major", "", true)])).toBe("pass");
        expect(mod.outcomeOf([found("HUL-01", "critical", "", true)])).toBe("pass");
    });
    add("outcomeOf: minors alone never stop a pass", () => {
        const minors = ["ELE-03", "ENG-03", "FIR-03", "DEK-01", "HUL-03", "DEK-02"].map((c) => found(c, "minor"));
        expect(mod.outcomeOf(minors)).toBe("pass");
    });
    add("outcomeOf: leaves the findings as they were", () => {
        const list = [found("ELE-03", "minor"), found("FIR-01", "major"), found("HUL-01", "critical")];
        const before = copyOf(list);
        mod.outcomeOf(list);
        expect(list).toEqual(before);
    });
    add("closeSurvey: the record holds the findings worst first, and their outcome", () => {
        const sheet = [found("ELE-03", "minor", "dim"), found("FIR-01", "major", "out of date")];
        expect(mod.closeSurvey("Heron", 1000, 570, sheet)).toEqual({
            boat: "Heron", day: 1000, startedAt: 570, outcome: "conditional",
            findings: [found("FIR-01", "major", "out of date"), found("ELE-03", "minor", "dim")],
        });
    });
    add("closeSurvey: a clean sheet is a pass with no findings", () => {
        expect(mod.closeSurvey("Teal", 12, 480, [])).toEqual({
            boat: "Teal", day: 12, startedAt: 480, findings: [], outcome: "pass" });
    });
    add("closeSurvey: the sheet is left as it was, and the record shares no finding with it", () => {
        const sheet = [found("ELE-03", "minor", "dim"), found("HUL-02", "critical", "loose")];
        const before = copyOf(sheet);
        const record = mod.closeSurvey("Heron", 1000, 570, sheet);
        expect(sheet).toEqual(before);
        record.findings[0].note = "changed";
        record.findings[1].waived = true;
        expect(sheet).toEqual(before);
        expect(record.findings).not.toBe(sheet);
    });
    add("addFinding: a finding on a new item is added, the list sorted again and the outcome worked out again", () => {
        const record = mod.closeSurvey("Heron", 1000, 570, [found("ELE-03", "minor", "dim")]);
        const extra = found("FIR-01", "major", "out of date");
        expect(mod.addFinding(record, extra)).toBeUndefined();
        expect(record.findings).toEqual([found("FIR-01", "major", "out of date"), found("ELE-03", "minor", "dim")]);
        expect(record.outcome).toBe("conditional");
        expect(record.findings[0]).not.toBe(extra);
    });
    add("addFinding: a worse finding on the same item takes the place of the one that stands", () => {
        const record = mod.closeSurvey("Heron", 1000, 570, [found("ELE-03", "minor", "dim"),
            found("DEK-01", "minor", "slippery")]);
        const worse = found("DEK-01", "critical", "rail gone");
        mod.addFinding(record, worse);
        expect(record.findings).toEqual([found("DEK-01", "critical", "rail gone"), found("ELE-03", "minor", "dim")]);
        expect(record.outcome).toBe("fail");
        expect(record.findings[0]).not.toBe(worse);
    });
    add("addFinding: a finding no worse than the one that stands on its item is dropped", () => {
        const record = mod.closeSurvey("Heron", 1000, 570, [found("FIR-01", "major", "first")]);
        mod.addFinding(record, found("FIR-01", "major", "second"));
        mod.addFinding(record, found("FIR-01", "minor", "third"));
        expect(record.findings).toEqual([found("FIR-01", "major", "first")]);
        expect(record.outcome).toBe("conditional");
    });
    add("addFinding: a waived finding does not stand, so a new one on its item is added beside it", () => {
        const record = rec("Heron", 1000, "pass", [found("FIR-01", "major", "old", true)]);
        mod.addFinding(record, found("FIR-01", "minor", "new"));
        expect(record.findings).toEqual([found("FIR-01", "major", "old", true), found("FIR-01", "minor", "new")]);
        expect(record.outcome).toBe("pass");
    });
    add("waive: marks the finding, notes the reason after its note, and works the outcome out again", () => {
        const record = mod.closeSurvey("Heron", 1000, 570, [found("FIR-01", "major", "out of date")]);
        expect(mod.waive(record, "FIR-01", "new ones on order")).toBe(true);
        expect(record.findings).toEqual([found("FIR-01", "major", "out of date (waived: new ones on order)", true)]);
        expect(record.outcome).toBe("pass");
    });
    add("waive: a finding with no note gets the reason alone, and the code's case does not count", () => {
        const record = mod.closeSurvey("Heron", 1000, 570, [found("DEK-02", "major"), found("FIR-01", "major"),
            found("FIR-02", "major")]);
        expect(record.outcome).toBe("fail");
        expect(mod.waive(record, " fir-02 ", "fitted today")).toBe(true);
        expect(record.findings[2]).toEqual(found("FIR-02", "major", "waived: fitted today", true));
        expect(record.outcome).toBe("conditional");
    });
    add("waive: a critical finding is never waived", () => {
        const record = mod.closeSurvey("Heron", 1000, 570, [found("HUL-01", "critical", "pitted")]);
        const before = copyOf(record);
        expect(mod.waive(record, "HUL-01", "owner insists")).toBe(false);
        expect(record).toEqual(before);
    });
    add("waive: false for an item with no finding, and for one waived already", () => {
        const record = mod.closeSurvey("Heron", 1000, 570, [found("ELE-03", "minor", "dim")]);
        expect(mod.waive(record, "FIR-01", "none")).toBe(false);
        expect(mod.waive(record, "ELE-03", "bulb in the post")).toBe(true);
        const before = copyOf(record);
        expect(mod.waive(record, "ELE-03", "again")).toBe(false);
        expect(record).toEqual(before);
    });
    add("waive: passes over a finding waived already to the one on its item that stands", () => {
        const record = rec("Heron", 1000, "conditional", [found("FIR-01", "major", "old", true),
            found("FIR-01", "major", "new")]);
        expect(mod.waive(record, "FIR-01", "fitted today")).toBe(true);
        expect(record.findings).toEqual([found("FIR-01", "major", "old", true),
            found("FIR-01", "major", "new (waived: fitted today)", true)]);
        expect(record.outcome).toBe("pass");
    });
    add("waive: the reason is noted as it was given, spaces and all", () => {
        const record = mod.closeSurvey("Heron", 1000, 570, [found("FIR-01", "major")]);
        expect(mod.waive(record, "FIR-01", " fitted today ")).toBe(true);
        expect(record.findings[0].note).toBe("waived:  fitted today ");
    });
    add("reinspectList: the items of the major and critical findings that stand, in the checklist's order", () => {
        const record = rec("Heron", 1000, "fail", [found("FIR-01", "major"), found("HUL-01", "critical"),
            found("ELE-03", "minor"), found("DEK-02", "major", "", true), found("DEK-03", "advisory")]);
        expect(mod.reinspectList(record)).toEqual(["HUL-01", "FIR-01"]);
    });
    add("reinspectList: goes by the finding's severity, and names an item once", () => {
        const record = rec("Heron", 1000, "fail", [found("ELE-03", "major"), found("HUL-01", "minor"),
            found("ELE-03", "major", "again"), found("ELE-01", "critical")]);
        expect(mod.reinspectList(record)).toEqual(["ELE-01", "ELE-03"]);
        expect(mod.reinspectList(rec("Heron", 1000, "pass"))).toEqual([]);
    });
    add("needsSlipway: a major or critical hull finding that stands", () => {
        expect(mod.needsSlipway(rec("Heron", 1000, "conditional", [found("HUL-03", "major")]))).toBe(true);
        expect(mod.needsSlipway(rec("Heron", 1000, "fail", [found("ELE-03", "minor"), found("HUL-01", "critical")])))
            .toBe(true);
    });
    add("needsSlipway: not for a minor hull finding, a waived one, or a finding elsewhere", () => {
        expect(mod.needsSlipway(rec("Heron", 1000, "pass", [found("HUL-03", "minor")]))).toBe(false);
        expect(mod.needsSlipway(rec("Heron", 1000, "pass", [found("HUL-03", "major", "", true)]))).toBe(false);
        expect(mod.needsSlipway(rec("Heron", 1000, "fail", [found("GAS-02", "critical")]))).toBe(false);
        expect(mod.needsSlipway(rec("Heron", 1000, "pass"))).toBe(false);
    });
    add("summaryLine: a survey with no finding is clean", () => {
        expect(mod.summaryLine(rec("Heron", 1000, "pass"))).toBe("Heron day 1000 09:30 pass, clean");
    });
    add("summaryLine: counts the findings, and says how many are waived when any is", () => {
        const record = { ...rec("Teal", 87, "conditional", [found("FIR-01", "major"), found("ELE-03", "minor"),
            found("DEK-01", "minor", "", true)]), startedAt: 485 };
        expect(mod.summaryLine(record)).toBe("Teal day 87 08:05 conditional, 3 findings (1 waived)");
        record.findings[0].waived = true;
        expect(mod.summaryLine(record)).toBe("Teal day 87 08:05 conditional, 3 findings (2 waived)");
    });
    add("summaryLine: a survey whose findings are all waived is not clean", () => {
        const record = rec("Teal", 87, "pass", [found("FIR-01", "major", "", true),
            found("ELE-03", "minor", "", true)]);
        expect(mod.summaryLine(record)).toBe("Teal day 87 09:30 pass, 2 findings (2 waived)");
    });
    add("summaryLine: one finding is `1 finding`", () => {
        expect(mod.summaryLine(rec("Pike", 5, "fail", [found("HUL-01", "critical")])))
            .toBe("Pike day 5 09:30 fail, 1 finding");
    });

    // ------------------------------------------------------------------------------------------ the history

    add("fileSurvey: a newer survey goes to the front, and the place it took is handed back", () => {
        const history: SurveyRecord[] = [];
        const first = rec("Heron", 1000, "fail");
        const second = rec("Heron", 1010, "pass");
        expect(mod.fileSurvey(history, first)).toBe(0);
        expect(mod.fileSurvey(history, second)).toBe(0);
        expect(history).toHaveLength(2);
        expect(history[0]).toBe(second);
        expect(history[1]).toBe(first);
    });
    add("fileSurvey: a survey filed late goes to its place by day", () => {
        const history = historyOf("Heron", [1000, "pass"], [1010, "pass"], [1020, "pass"]);
        expect(mod.fileSurvey(history, rec("Heron", 1005, "fail"))).toBe(2);
        expect(history.map((r) => r.day)).toEqual([1020, 1010, 1005, 1000]);
        expect(mod.fileSurvey(history, rec("Heron", 990, "fail"))).toBe(4);
        expect(history.map((r) => r.day)).toEqual([1020, 1010, 1005, 1000, 990]);
    });
    add("fileSurvey: a second survey on one day goes ahead of the first", () => {
        const history = historyOf("Heron", [1000, "pass"], [1010, "fail"], [1020, "pass"]);
        const again = rec("Heron", 1010, "pass");
        expect(mod.fileSurvey(history, again)).toBe(1);
        expect(history.map((r) => [r.day, r.outcome])).toEqual(
            [[1020, "pass"], [1010, "pass"], [1010, "fail"], [1000, "pass"]]);
        expect(history[1]).toBe(again);
    });
    add("lastPassDay: the day of the newest pass", () => {
        expect(mod.lastPassDay(historyOf("Heron", [1000, "pass"], [1010, "pass"], [1020, "fail"]))).toBe(1010);
        expect(mod.lastPassDay(historyOf("Heron", [0, "pass"]))).toBe(0);
    });
    add("lastPassDay: -1 when the boat has never passed", () => {
        expect(mod.lastPassDay([])).toBe(-1);
        expect(mod.lastPassDay(historyOf("Heron", [1000, "fail"], [1010, "conditional"]))).toBe(-1);
    });
    add("surveysBetween: from the first day up to, and not on, the second; oldest first", () => {
        const history = historyOf("Heron", [1000, "pass"], [1010, "fail"], [1020, "pass"], [1030, "pass"]);
        expect(mod.surveysBetween(history, 1010, 1030).map((r) => r.day)).toEqual([1010, 1020]);
        expect(mod.surveysBetween(history, 1011, 1031).map((r) => r.day)).toEqual([1020, 1030]);
        expect(mod.surveysBetween(history, 0, 5000).map((r) => r.day)).toEqual([1000, 1010, 1020, 1030]);
    });
    add("surveysBetween: nothing in the days asked for, and the history left as it was", () => {
        const history = historyOf("Heron", [1000, "pass"], [1010, "fail"], [1020, "pass"]);
        const before = copyOf(history);
        expect(mod.surveysBetween(history, 1001, 1010)).toEqual([]);
        mod.surveysBetween(history, 0, 5000);
        expect(history).toEqual(before);
    });
    add("passRate: the whole percent of the surveys in the days that passed, rounded down", () => {
        const history = historyOf("Heron", [1000, "pass"], [1010, "fail"], [1020, "pass"], [1030, "conditional"]);
        expect(mod.passRate(history, 1000, 1021)).toBe(66);
        expect(mod.passRate(history, 1000, 1020)).toBe(50);
        expect(mod.passRate(history, 1020, 1021)).toBe(100);
        expect(mod.passRate(history, 1010, 1011)).toBe(0);
    });
    add("passRate: -1 when no survey falls in the days", () => {
        const history = historyOf("Heron", [1000, "pass"], [1010, "fail"]);
        expect(mod.passRate(history, 1001, 1010)).toBe(-1);
        expect(mod.passRate([], 0, 5000)).toBe(-1);
    });

    // ------------------------------------------------------------------------------------- the certificates

    add("issueCertificate: a pass earns 365 days from the day of the survey", () => {
        expect(mod.issueCertificate(rec("Heron", 1000, "pass"), null)).toEqual({
            boat: "Heron", serial: "SC-HERON-01000", from: 1000, expires: 1365, interim: false });
    });
    add("issueCertificate: a conditional earns an interim certificate of 21 days", () => {
        expect(mod.issueCertificate(rec("Heron", 1000, "conditional"), null)).toEqual({
            boat: "Heron", serial: "IC-HERON-01000", from: 1000, expires: 1021, interim: true });
    });
    add("issueCertificate: a fail earns nothing", () => {
        const full = mod.issueCertificate(rec("Heron", 1000, "pass"), null);
        expect(mod.issueCertificate(rec("Heron", 1100, "fail"), null)).toBeNull();
        expect(mod.issueCertificate(rec("Heron", 1100, "fail"), full)).toBeNull();
    });
    add("issueCertificate: the serial takes six letters and digits of the name, and the day in five digits", () => {
        expect(mod.issueCertificate(rec("Marsh Lily II", 42, "pass"), null)?.serial).toBe("SC-MARSHL-00042");
        expect(mod.issueCertificate(rec("no. 7", 12345, "conditional"), null)?.serial).toBe("IC-NO7-12345");
    });
    add("issueCertificate: a pass in the last 28 days of a full certificate carries on from its end", () => {
        const full = mod.issueCertificate(rec("Heron", 1000, "pass"), null);
        expect(mod.issueCertificate(rec("Heron", 1337, "pass"), full)).toEqual({
            boat: "Heron", serial: "SC-HERON-01365", from: 1365, expires: 1730, interim: false });
        expect(mod.issueCertificate(rec("Heron", 1364, "pass"), full)).toMatchObject({ from: 1365, expires: 1730 });
    });
    add("issueCertificate: a pass sooner than that, or after the certificate has run out, starts on its own day", () => {
        const full = mod.issueCertificate(rec("Heron", 1000, "pass"), null);
        expect(mod.issueCertificate(rec("Heron", 1336, "pass"), full)).toMatchObject({
            serial: "SC-HERON-01336", from: 1336, expires: 1701 });
        expect(mod.issueCertificate(rec("Heron", 1365, "pass"), full)).toMatchObject({ from: 1365, expires: 1730 });
        expect(mod.issueCertificate(rec("Heron", 1366, "pass"), full)).toMatchObject({ from: 1366, expires: 1731 });
    });
    add("issueCertificate: an interim certificate is not followed by another", () => {
        const interim = mod.issueCertificate(rec("Heron", 1000, "conditional"), null);
        expect(mod.issueCertificate(rec("Heron", 1010, "conditional"), interim)).toBeNull();
        expect(mod.issueCertificate(rec("Heron", 1400, "conditional"), interim)).toBeNull();
    });
    add("issueCertificate: a pass after an interim certificate starts on its own day", () => {
        const interim = mod.issueCertificate(rec("Heron", 1000, "conditional"), null);
        expect(mod.issueCertificate(rec("Heron", 1010, "pass"), interim)).toMatchObject({
            serial: "SC-HERON-01010", from: 1010, expires: 1375, interim: false });
    });
    add("issueCertificate: a conditional after a full certificate earns an interim one from its own day", () => {
        const full = mod.issueCertificate(rec("Heron", 1000, "pass"), null);
        expect(mod.issueCertificate(rec("Heron", 1350, "conditional"), full)).toMatchObject({
            serial: "IC-HERON-01350", from: 1350, expires: 1371, interim: true });
    });
    add("issueCertificate: leaves the record and the certificate before as they were", () => {
        const full = mod.issueCertificate(rec("Heron", 1000, "pass"), null);
        const record = rec("Heron", 1350, "pass", [found("ELE-03", "minor")]);
        const before = [copyOf(full), copyOf(record)];
        mod.issueCertificate(record, full);
        expect([full, record]).toEqual(before);
    });
    add("certificates: none for a boat never surveyed, or never better than a fail", () => {
        expect(mod.certificates([])).toEqual([]);
        expect(mod.certificates(historyOf("Heron", [1000, "fail"], [1010, "fail"]))).toEqual([]);
    });
    add("certificates: newest first, and a fail ends the certificate before it on its day", () => {
        const history = historyOf("Heron", [1000, "pass"], [1100, "fail"], [1110, "pass"]);
        expect(spans(mod.certificates(history))).toEqual([
            ["SC-HERON-01110", 1110, 1475, false], ["SC-HERON-01000", 1000, 1100, false]]);
    });
    add("certificates: an early pass carries on and leaves the certificate before it whole", () => {
        const history = historyOf("Heron", [1000, "pass"], [1340, "pass"]);
        expect(spans(mod.certificates(history))).toEqual([
            ["SC-HERON-01365", 1365, 1730, false], ["SC-HERON-01000", 1000, 1365, false]]);
    });
    add("certificates: a pass that does not carry on ends the certificate before it on its day", () => {
        const history = historyOf("Heron", [1000, "pass"], [1200, "pass"]);
        expect(spans(mod.certificates(history))).toEqual([
            ["SC-HERON-01200", 1200, 1565, false], ["SC-HERON-01000", 1000, 1200, false]]);
    });
    add("certificates: a conditional ends a full certificate, and a second conditional ends the interim one", () => {
        const history = historyOf("Heron", [1000, "pass"], [1200, "conditional"], [1215, "conditional"],
            [1230, "pass"]);
        expect(spans(mod.certificates(history))).toEqual([
            ["SC-HERON-01230", 1230, 1595, false], ["IC-HERON-01200", 1200, 1215, true],
            ["SC-HERON-01000", 1000, 1200, false]]);
    });
    add("certificates: a fail also ends a certificate that had not started yet", () => {
        const history = historyOf("Heron", [1000, "pass"], [1340, "pass"], [1350, "fail"]);
        expect(spans(mod.certificates(history))).toEqual([
            ["SC-HERON-01365", 1365, 1350, false], ["SC-HERON-01000", 1000, 1350, false]]);
    });
    add("certificates: a pass soon after a fail starts on its own day, though the old one had days to run", () => {
        const history = historyOf("Heron", [1000, "pass"], [1350, "fail"], [1360, "pass"]);
        expect(spans(mod.certificates(history))).toEqual([
            ["SC-HERON-01360", 1360, 1725, false], ["SC-HERON-01000", 1000, 1350, false]]);
    });
    add("certificates: an interim certificate still bars another after a fail between them", () => {
        const history = historyOf("Heron", [1000, "conditional"], [1005, "fail"], [1010, "conditional"]);
        expect(spans(mod.certificates(history))).toEqual([["IC-HERON-01000", 1000, 1005, true]]);
    });
    add("certificates: leaves the history as it was", () => {
        const history = historyOf("Heron", [1000, "pass"], [1100, "fail"], [1110, "pass"]);
        const before = copyOf(history);
        mod.certificates(history);
        expect(history).toEqual(before);
    });
    add("currentCertificate: covers from its first day up to, and not on, the day it expires", () => {
        const history = historyOf("Heron", [1000, "pass"]);
        expect(mod.currentCertificate(history, 999)).toBeNull();
        expect(mod.currentCertificate(history, 1000)?.serial).toBe("SC-HERON-01000");
        expect(mod.currentCertificate(history, 1364)?.serial).toBe("SC-HERON-01000");
        expect(mod.currentCertificate(history, 1365)).toBeNull();
    });
    add("currentCertificate: the certificate in force on the day, across an early pass", () => {
        const history = historyOf("Heron", [1000, "pass"], [1340, "pass"]);
        expect(mod.currentCertificate(history, 1340)).toEqual({
            boat: "Heron", serial: "SC-HERON-01000", from: 1000, expires: 1365, interim: false });
        expect(mod.currentCertificate(history, 1364)?.serial).toBe("SC-HERON-01000");
        expect(mod.currentCertificate(history, 1365)?.serial).toBe("SC-HERON-01365");
        expect(mod.currentCertificate(history, 1729)?.serial).toBe("SC-HERON-01365");
        expect(mod.currentCertificate(history, 1730)).toBeNull();
    });
    add("currentCertificate: none from the day of a fail until the next certificate", () => {
        const history = historyOf("Heron", [1000, "pass"], [1100, "fail"], [1110, "conditional"]);
        expect(mod.currentCertificate(history, 1099)?.serial).toBe("SC-HERON-01000");
        expect(mod.currentCertificate(history, 1100)).toBeNull();
        expect(mod.currentCertificate(history, 1109)).toBeNull();
        expect(mod.currentCertificate(history, 1110)).toMatchObject({ serial: "IC-HERON-01110", interim: true });
        expect(mod.currentCertificate(history, 1131)).toBeNull();
    });
    add("isCertified: from the day of a pass up to, and not on, the day the certificate expires", () => {
        const history = historyOf("Heron", [1000, "pass"]);
        expect([999, 1000, 1364, 1365].map((day) => mod.isCertified(history, day))).toEqual(
            [false, true, true, false]);
    });
    add("isCertified: an interim certificate covers 21 days, and a boat never surveyed has no cover", () => {
        const history = historyOf("Teal", [1000, "conditional"]);
        expect([1000, 1020, 1021].map((day) => mod.isCertified(history, day))).toEqual([true, true, false]);
        expect(mod.isCertified([], 1000)).toBe(false);
    });
    add("runsOut: the day the certificate in force expires", () => {
        expect(mod.runsOut(historyOf("Heron", [1000, "pass"]), 1000)).toBe(1365);
        expect(mod.runsOut(historyOf("Heron", [1000, "pass"], [1100, "fail"], [1110, "pass"]), 1050)).toBe(1100);
    });
    add("runsOut: follows on into a certificate that starts where the one in force ends", () => {
        expect(mod.runsOut(historyOf("Heron", [1000, "pass"], [1340, "pass"]), 1100)).toBe(1730);
        expect(mod.runsOut(historyOf("Heron", [1000, "pass"], [1340, "pass"]), 1365)).toBe(1730);
        expect(mod.runsOut(historyOf("Heron", [1000, "pass"], [1200, "pass"]), 1100)).toBe(1565);
        expect(mod.runsOut(historyOf("Heron", [1000, "pass"], [1200, "conditional"]), 1100)).toBe(1221);
    });
    add("runsOut: follows on through more than one certificate that carries on", () => {
        const history = historyOf("Heron", [1000, "pass"], [1340, "pass"], [1710, "pass"]);
        expect(mod.runsOut(history, 1100)).toBe(2095);
        expect(mod.runsOut(history, 1400)).toBe(2095);
    });
    add("runsOut: -1 when the boat has no cover on the day", () => {
        expect(mod.runsOut([], 1000)).toBe(-1);
        expect(mod.runsOut(historyOf("Heron", [1000, "pass"]), 1365)).toBe(-1);
        expect(mod.runsOut(historyOf("Heron", [1000, "pass"], [1100, "fail"], [1110, "pass"]), 1105)).toBe(-1);
    });
    add("renewalWindow: the last 28 days of the full certificate in force", () => {
        expect(mod.renewalWindow(historyOf("Heron", [1000, "pass"]), 1100)).toEqual({ opens: 1337, closes: 1365 });
        expect(mod.renewalWindow(historyOf("Heron", [1000, "pass"], [1340, "pass"]), 1365)).toEqual(
            { opens: 1702, closes: 1730 });
    });
    add("renewalWindow: goes by the certificate in force, not by one that carries on from it", () => {
        expect(mod.renewalWindow(historyOf("Heron", [1000, "pass"], [1340, "pass"]), 1100)).toEqual(
            { opens: 1337, closes: 1365 });
    });
    add("renewalWindow: null with no cover on the day, or with an interim certificate", () => {
        expect(mod.renewalWindow(historyOf("Heron", [1000, "pass"]), 1365)).toBeNull();
        expect(mod.renewalWindow([], 1000)).toBeNull();
        expect(mod.renewalWindow(historyOf("Heron", [1000, "conditional"]), 1005)).toBeNull();
    });

    const fleet = [
        { boat: wren, history: historyOf("Wren", [1000, "pass"]) },
        { boat: teal, history: [] },
        { boat: pike, history: historyOf("Pike", [1010, "pass"]) },
        { boat: heron, history: historyOf("Heron", [990, "fail"], [1000, "pass"]) },
        { boat: { ...heron, name: "Coot" }, history: historyOf("Coot", [1300, "fail"]) },
    ];
    add("dueForSurvey: boats with no cover first, then those whose cover runs out within the days given", () => {
        expect(mod.dueForSurvey(fleet, 1335, 30)).toEqual(["Teal", "Coot", "Wren", "Heron"]);
        expect(mod.dueForSurvey(fleet, 1335, 40)).toEqual(["Teal", "Coot", "Wren", "Heron", "Pike"]);
    });
    add("dueForSurvey: cover that runs out one day beyond the days given is not due", () => {
        expect(mod.dueForSurvey(fleet, 1335, 29)).toEqual(["Teal", "Coot"]);
        expect(mod.dueForSurvey(fleet, 1335, 39)).toEqual(["Teal", "Coot", "Wren", "Heron"]);
    });
    add("dueForSurvey: the soonest to run out comes first, and the fleet is left as it was", () => {
        const before = copyOf(fleet);
        expect(mod.dueForSurvey([fleet[2], fleet[0], fleet[3]], 1300, 100)).toEqual(["Wren", "Heron", "Pike"]);
        expect(mod.dueForSurvey([], 1300, 100)).toEqual([]);
        expect(fleet).toEqual(before);
    });
    add("dueForSurvey: cover that carries on from an early pass counts to its end", () => {
        const early = [{ boat: heron, history: historyOf("Heron", [1000, "pass"], [1338, "pass"]) }];
        expect(mod.dueForSurvey(early, 1340, 30)).toEqual([]);
        expect(mod.dueForSurvey(early, 1340, 389)).toEqual([]);
        expect(mod.dueForSurvey(early, 1340, 390)).toEqual(["Heron"]);
    });
    add("certificateLine: a boat with no certificate", () => {
        expect(mod.certificateLine("Heron", null, 1000)).toBe("Heron: no certificate");
        expect(mod.certificateLine("Marsh Lily II", null, 0)).toBe("Marsh Lily II: no certificate");
    });
    add("certificateLine: a certificate that has not started says in how many days it starts", () => {
        const next = mod.currentCertificate(historyOf("Heron", [1000, "pass"], [1340, "pass"]), 1365);
        expect(mod.certificateLine("Heron", next, 1360)).toBe("Heron: certificate SC-HERON-01365, starts in 5 days");
        expect(mod.certificateLine("Heron", next, 1364)).toBe("Heron: certificate SC-HERON-01365, starts in 1 day");
        const interim = mod.issueCertificate(rec("Teal", 1010, "conditional"), null);
        expect(mod.certificateLine("Teal", interim, 1008)).toBe(
            "Teal: interim certificate IC-TEAL-01010, starts in 2 days");
        // a fail ended this one before it began: it runs from 1365 and expires on 1350
        const ended = mod.certificates(historyOf("Heron", [1000, "pass"], [1340, "pass"], [1350, "fail"]))[0];
        expect(mod.certificateLine("Heron", ended, 1360)).toBe("Heron: certificate SC-HERON-01365, starts in 5 days");
    });
    add("certificateLine: a full certificate that has started is named by its serial", () => {
        const cert = mod.issueCertificate(rec("Heron", 1000, "pass"), null);
        expect(mod.certificateLine("Heron", cert, 1000)).toBe("Heron: certificate SC-HERON-01000");
        expect(mod.certificateLine("Heron", cert, 1200)).toBe("Heron: certificate SC-HERON-01000");
        expect(mod.certificateLine("Heron", cert, 1365)).toBe("Heron: certificate SC-HERON-01000");
        expect(mod.certificateLine("Heron", cert, 2000)).toBe("Heron: certificate SC-HERON-01000");
    });
    add("certificateLine: an interim certificate that has started is called interim", () => {
        const cert = mod.issueCertificate(rec("Teal", 1010, "conditional"), null);
        expect(mod.certificateLine("Teal", cert, 1015)).toBe("Teal: interim certificate IC-TEAL-01010");
        expect(mod.certificateLine("Teal", cert, 1031)).toBe("Teal: interim certificate IC-TEAL-01010");
    });

    // --------------------------------------------------------------------------------------------- the fees

    add("surveyFee: 14500 pence, and 725 more for each berth above six", () => {
        expect(mod.surveyFee(heron, 1000, [])).toBe(14500);
        expect(mod.surveyFee({ ...heron, berths: 6 }, 1000, [])).toBe(14500);
        expect(mod.surveyFee(wren, 1000, [])).toBe(15225);
        expect(mod.surveyFee(pike, 1000, [])).toBe(15950);
    });
    add("surveyFee: half, rounded down to a penny, up to 14 days after a fail", () => {
        expect(mod.surveyFee(heron, 1014, historyOf("Heron", [1000, "fail"]))).toBe(7250);
        expect(mod.surveyFee(wren, 1014, historyOf("Wren", [1000, "fail"]))).toBe(7612);
        expect(mod.surveyFee(wren, 1000, historyOf("Wren", [1000, "fail"]))).toBe(7612);
        expect(mod.surveyFee(wren, 1015, historyOf("Wren", [1000, "fail"]))).toBe(15225);
    });
    add("surveyFee: nothing up to 14 days after a conditional", () => {
        expect(mod.surveyFee(pike, 1014, historyOf("Pike", [1000, "conditional"]))).toBe(0);
        expect(mod.surveyFee(pike, 1015, historyOf("Pike", [1000, "conditional"]))).toBe(15950);
    });
    add("surveyFee: only the newest survey decides, and a pass earns no discount", () => {
        expect(mod.surveyFee(heron, 1012, historyOf("Heron", [1000, "pass"], [1010, "fail"]))).toBe(7250);
        expect(mod.surveyFee(heron, 1012, historyOf("Heron", [1005, "fail"], [1010, "pass"]))).toBe(14500);
        expect(mod.surveyFee(heron, 1012, historyOf("Heron", [1005, "conditional"], [1010, "fail"]))).toBe(7250);
    });
    add("feeLabel: pence as pounds and two digits of pence", () => {
        expect(mod.feeLabel(14500)).toBe("£145.00");
        expect(mod.feeLabel(7612)).toBe("£76.12");
    });
    add("feeLabel: less than a pound, and nothing", () => {
        expect(mod.feeLabel(5)).toBe("£0.05");
        expect(mod.feeLabel(0)).toBe("£0.00");
    });
    add("feeLabel: a thousand pounds and more, with no comma", () => {
        expect(mod.feeLabel(123456)).toBe("£1234.56");
        expect(mod.feeLabel(100000)).toBe("£1000.00");
    });

    const names = cases.map(([name]) => name);
    describe("survey: what was there is as it was", () => {
        it("the cases of the regression helper have names of their own, and every skipped name is one of them", () => {
            expect(names.filter((name, at) => names.indexOf(name) !== at)).toEqual([]);
            expect(skip.filter((name) => !names.includes(name))).toEqual([]);
        });
        for (const [name, run] of cases) {
            if (!skip.includes(name)) {
                it(name, run);
            }
        }
    });
}

import { describe, expect, it } from "vitest";
import * as mod from "../src/handover";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-handover";

type Hand = InstanceType<typeof mod.Handover>;

const kestrel = { name: "Kestrel", berths: 4, tankLitres: 180, gasBottles: 2 };
const at = (day: number, hour: number, minute = 0): number => day * 1440 + hour * 60 + minute;
const DUE_BACK = at(17, 9, 30);
const OUT_MUST = ["KEYS", "GAS", "SAFETY", "HELM", "INVENTORY"];
const BACK_MUST = ["KEYS", "INVENTORY", "PUMP", "MOORED"];

const fresh = (): Hand => new mod.Handover("kf-12", kestrel, at(10, 14), DUE_BACK, 20000);
const opened = (by = "Mo"): Hand => {
    const h = fresh();
    h.open(at(10, 13), by);
    return h;
};
const gone = (): Hand => {
    const h = opened();
    for (const code of OUT_MUST) h.tick("out", code, "ok", at(10, 13, 5), "Mo");
    h.read("out", { at: at(10, 13, 20), fuel: 1500, engine: 12034, water: 8, gas: 2 }, "Mo");
    h.release(at(10, 13, 40), "Mo");
    return h;
};
const finish = (h: Hand, backAt: number, gas: number) => {
    for (const code of BACK_MUST) h.tick("back", code, "ok", backAt + 5, "Ines");
    h.read("back", { at: backAt + 10, fuel: 1100, engine: 12290, water: 3, gas }, "Ines");
    return h.close(backAt + 30, "Ines");
};

const BOOKED = [
    "KF-12 Kestrel: booked",
    "due out day 10 14:00, went --",
    "due back day 17 09:30, came --",
    "checks: out 0/7, back 0/6",
];

describe("Handover.report, ending with the latest events", () => {
    it("adds no line for a hire with no events", () => {
        expect(fresh().report()).toEqual([...BOOKED, "events: 0"]);
    });

    it("adds the one event of a hire that has one", () => {
        expect(opened().report()).toEqual([
            "KF-12 Kestrel: checking",
            "due out day 10 14:00, went --",
            "due back day 17 09:30, came --",
            "checks: out 0/7, back 0/6",
            "events: 1",
            "day 10 13:00 opened by Mo",
        ]);
    });

    it("writes each event as describeEvent does, so a hire called off by nobody named has no name in its line", () => {
        const h = fresh();
        h.cancel(at(9, 10), "", "party withdrew");
        expect(h.report()).toEqual([
            "KF-12 Kestrel: void",
            "due out day 10 14:00, went --",
            "due back day 17 09:30, came --",
            "checks: out 0/7, back 0/6",
            "events: 1",
            "day 9 10:00 void: party withdrew",
        ]);
        expect(opened("").report()[5]).toBe("day 10 13:00 opened");
    });

    it("puts the event added last first when there are two", () => {
        const h = opened();
        h.tick("out", "KEYS", "ok", at(10, 13, 5), "Mo");
        expect(h.report().slice(4)).toEqual([
            "events: 2",
            "day 10 13:05 ticked by Mo: out KEYS ok",
            "day 10 13:00 opened by Mo",
        ]);
    });

    it("gives all three, the last added first, when there are exactly three", () => {
        const h = opened();
        h.tick("out", "KEYS", "ok", at(10, 13, 5), "Mo");
        h.tick("out", "GAS", "fault", at(10, 13, 6), "Mo", "regulator hisses");
        expect(h.report().slice(4)).toEqual([
            "events: 3",
            "day 10 13:06 ticked by Mo: out GAS fault",
            "day 10 13:05 ticked by Mo: out KEYS ok",
            "day 10 13:00 opened by Mo",
        ]);
    });

    it("gives only the three added last when there are more", () => {
        const h = gone();
        expect(h.report()).toEqual([
            "KF-12 Kestrel: out",
            "due out day 10 14:00, went day 10 13:40",
            "due back day 17 09:30, came --",
            "checks: out 5/7, back 0/6",
            "events: 8",
            "day 10 13:40 released by Mo",
            "day 10 13:20 read by Mo: out fuel 150.0 L, engine 1203.4 h",
            "day 10 13:05 ticked by Mo: out INVENTORY ok",
        ]);
    });

    it("goes by when an event was added, not by the time written on it", () => {
        const h = opened();
        h.tick("out", "KEYS", "ok", at(10, 13, 30), "Mo");
        h.read("out", { at: at(10, 12, 50), fuel: 1500, engine: 12034, water: 8, gas: 2 }, "Mo");
        h.tick("out", "GAS", "ok", at(10, 13, 10), "Mo");
        expect(h.report().slice(4)).toEqual([
            "events: 4",
            "day 10 13:10 ticked by Mo: out GAS ok",
            "day 10 12:50 read by Mo: out fuel 150.0 L, engine 1203.4 h",
            "day 10 13:30 ticked by Mo: out KEYS ok",
        ]);
    });

    it("gives events of every kind, so a damage mark, the return and an extra are among the three", () => {
        const h = gone();
        h.addExtra(1850, "lost windlass", at(12, 10), "Mo");
        h.takeBack(DUE_BACK + 10, "Ines");
        h.noteDamage("back", { zone: "stern", kind: "dent", size: 30, note: "" }, DUE_BACK + 15, "Ines");
        expect(h.report()).toEqual([
            "KF-12 Kestrel: returned",
            "due out day 10 14:00, went day 10 13:40",
            "due back day 17 09:30, came day 17 09:40",
            "checks: out 5/7, back 0/6",
            "damage £60.00 dent on stern, 30 mm",
            "extra £18.50 lost windlass",
            "total £78.50",
            "events: 11",
            "day 17 09:45 damage by Ines: back dent on stern, 30 mm",
            "day 17 09:40 returned by Ines: on time",
            "day 12 10:00 extra by Mo: £18.50 lost windlass",
        ]);
    });

    it("leaves the lines of a closed hire as they were, and ends with its last three events", () => {
        const h = gone();
        h.takeBack(at(17, 9), "Ines");
        finish(h, at(17, 9), 2);
        expect(h.report()).toEqual([
            "KF-12 Kestrel: closed",
            "due out day 10 14:00, went day 10 13:40",
            "due back day 17 09:30, came day 17 09:00",
            "checks: out 5/7, back 4/6",
            "fuel £67.20 40.0 L by dipstick",
            "total £67.20",
            "events: 15",
            "day 17 09:30 closed by Ines: refund £132.80",
            "day 17 09:10 read by Ines: back fuel 110.0 L, engine 1229.0 h",
            "day 17 09:05 ticked by Ines: back MOORED ok",
        ]);
    });

    it("leaves a line for each charge as it was, with no space after a charge that has no note", () => {
        const h = gone();
        h.addExtra(1850, "", at(12, 10), "Mo");
        h.takeBack(DUE_BACK + 45, "Ines");
        h.tick("back", "CLEAN", "fault", DUE_BACK + 46, "Ines", "galley greasy");
        h.noteDamage("back", { zone: "stern", kind: "dent", size: 30, note: "" }, DUE_BACK + 47, "Ines");
        finish(h, DUE_BACK + 45, 1);
        expect(h.report()).toEqual([
            "KF-12 Kestrel: closed",
            "due out day 10 14:00, went day 10 13:40",
            "due back day 17 09:30, came day 17 10:15",
            "checks: out 5/7, back 4/6, 1 fault",
            "fuel £67.20 40.0 L by dipstick",
            "gas £39.50 1 of 2 bottles",
            "late £24.00 45 min late",
            "damage £60.00 dent on stern, 30 mm",
            "cleaning £60.00 galley greasy",
            "extra £18.50",
            "total £269.20",
            "events: 18",
            "day 17 10:45 closed by Ines: owes £69.20",
            "day 17 10:25 read by Ines: back fuel 110.0 L, engine 1229.0 h",
            "day 17 10:20 ticked by Ines: back MOORED ok",
        ]);
    });

    it("changes nothing in the handover, and gives the same lines when asked again", () => {
        const h = gone();
        const before = copyOf({ timeline: h.timeline(), out: h.checklist("out"), phase: h.phase });
        const first = h.report();
        first.pop();
        first[0] = "changed";
        expect(h.report()).toHaveLength(8);
        expect(h.report()[7]).toBe("day 10 13:05 ticked by Mo: out INVENTORY ok");
        expect({ timeline: h.timeline(), out: h.checklist("out"), phase: h.phase }).toEqual(before);
    });
});

unchanged(mod, [
    "Handover.report: a closed hire with its charge and the total",
    "Handover.report: a line for each charge, and no space after a charge with no note",
]);

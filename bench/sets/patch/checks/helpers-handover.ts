// What src/handover.ts does now, as cases. A task's check calls `unchanged` and skips only the cases its change
// must alter.
import { describe, expect, it } from "vitest";
import { copyOf } from "./helpers";

type Mod = typeof import("../src/handover");
type Hand = InstanceType<Mod["Handover"]>;
type BoatSpec = import("../src/handover").BoatSpec;
type Reading = import("../src/handover").Reading;
type DamageMark = import("../src/handover").DamageMark;
type Checklist = import("../src/handover").Checklist;
type Charge = import("../src/handover").Charge;
type TimelineEvent = import("../src/handover").TimelineEvent;
type Side = import("../src/handover").Side;

export function unchanged(mod: Mod, skip: string[] = []): void {
    const cases: [string, () => void][] = [];
    const add = (name: string, run: () => void): void => {
        if (cases.some(([had]) => had === name)) throw new Error(`two cases are named "${name}"`);
        cases.push([name, run]);
    };

    // ------------------------------------------------------------------------------------------ what the cases use
    const kestrel: BoatSpec = { name: "Kestrel", berths: 4, tankLitres: 180, gasBottles: 2 };
    const bittern: BoatSpec = { name: "Bittern", berths: 6, tankLitres: 220, gasBottles: 3 };
    // A stamp worked out here, not by the module.
    const at = (day: number, hour: number, minute = 0): number => day * 1440 + hour * 60 + minute;
    const DUE_OUT = at(10, 14); // 15240
    const DUE_BACK = at(17, 9, 30); // 25050
    const reading = (when: number, fuel: number, engine: number, water = 8, gas = 2): Reading => (
        { at: when, fuel, engine, water, gas }
    );
    const mark = (zone: string, kind: string, size: number, note = ""): DamageMark => (
        { zone, kind, size, note } as DamageMark
    );
    const charge = (code: string, pence: number, note = ""): Charge => ({ code, pence, note } as Charge);
    const event = (when: number, kind: string, by = "Mo", text = ""): TimelineEvent => (
        { at: when, kind, by, text } as TimelineEvent
    );
    const codes = (list: Checklist): string[] => list.items.map((item) => item.code);

    const fresh = (boat: BoatSpec = kestrel, deposit = 20000, ref = "kf-12"): Hand => (
        new mod.Handover(ref, boat, DUE_OUT, DUE_BACK, deposit)
    );
    const settleSide = (h: Hand, side: Side, when: number, by: string): void => {
        for (const item of h.checklist(side).items) {
            if (item.must) h.tick(side, item.code, "ok", when, by);
        }
    };
    // One event: opened.
    const opened = (h: Hand = fresh()): Hand => {
        h.open(at(10, 13), "Mo");
        return h;
    };
    // Eight events for a boat of under six berths: opened, five ticks, read, released.
    const gone = (h: Hand = fresh(), outReading: Reading = reading(at(10, 13, 20), 1500, 12034)): Hand => {
        opened(h);
        settleSide(h, "out", at(10, 13, 5), "Mo");
        h.read("out", outReading, "Mo");
        h.release(at(10, 13, 40), "Mo");
        return h;
    };
    // Nine events.
    const back = (h: Hand = fresh(), backAt: number = at(17, 9), outReading?: Reading): Hand => {
        gone(h, outReading);
        h.takeBack(backAt, "Ines");
        return h;
    };
    const finish = (h: Hand, backReading: Reading, closeAt: number) => {
        settleSide(h, "back", backReading.at - 5, "Ines");
        h.read("back", backReading, "Ines");
        return h.close(closeAt, "Ines");
    };
    // Fifteen events: the nine, four ticks, read, closed.
    const shut = (h: Hand = fresh(), backAt: number = at(17, 9)): Hand => {
        back(h, backAt);
        finish(h, reading(backAt + 10, 1100, 12290, 3, 2), backAt + 30);
        return h;
    };
    const kinds = (h: Hand): string[] => h.timeline().map((each) => each.kind);

    // ------------------------------------------------------------------------------------------ the constants
    add("constants: a day is 1440 minutes, and NOT_YET and UNREAD are both -1", () => {
        expect(mod.DAY_MIN).toBe(1440);
        expect(mod.NOT_YET).toBe(-1);
        expect(mod.UNREAD).toBe(-1);
    });
    add("constants: ZONES and CHARGE_ORDER list their values in their order", () => {
        expect([...mod.ZONES]).toEqual(["bow", "port", "starboard", "stern", "roof", "cabin"]);
        expect([...mod.CHARGE_ORDER]).toEqual(["fuel", "gas", "late", "damage", "cleaning", "extra"]);
    });
    add("constants: the prices are in pence", () => {
        expect(mod.FUEL_PENCE_PER_LITRE).toBe(168);
        expect(mod.GAS_BOTTLE_PENCE).toBe(3950);
        expect(mod.CLEANING_PENCE).toBe(6000);
    });
    add("constants: the grace, the step and the cap for lateness", () => {
        expect(mod.LATE_GRACE_MIN).toBe(20);
        expect(mod.LATE_STEP_MIN).toBe(30);
        expect(mod.LATE_STEP_PENCE).toBe(1200);
        expect(mod.LATE_CAP_PENCE).toBe(15000);
    });
    add("constants: the wharf opens at 08:30 and shuts at 17:00, in minutes", () => {
        expect(mod.WHARF_OPENS_MIN).toBe(510);
        expect(mod.WHARF_SHUTS_MIN).toBe(1020);
    });

    // ------------------------------------------------------------------------------------------ stamps
    add("stamp: minutes from midnight at the start of day 0", () => {
        expect(mod.stamp(0, 0)).toBe(0);
        expect(mod.stamp(1, 0)).toBe(1440);
        expect(mod.stamp(3, 570)).toBe(4890);
        expect(mod.stamp(17, 570)).toBe(DUE_BACK);
    });
    add("stamp: a minute past the end of the day runs on into the next", () => {
        expect(mod.stamp(2, 1500)).toBe(4380);
    });
    add("dayOf: the day a stamp falls on", () => {
        expect(mod.dayOf(0)).toBe(0);
        expect(mod.dayOf(1439)).toBe(0);
        expect(mod.dayOf(1440)).toBe(1);
        expect(mod.dayOf(4890)).toBe(3);
    });
    add("minuteOf: the minute of the day", () => {
        expect(mod.minuteOf(0)).toBe(0);
        expect(mod.minuteOf(1439)).toBe(1439);
        expect(mod.minuteOf(1440)).toBe(0);
        expect(mod.minuteOf(4890)).toBe(570);
    });
    add("dayOf: the days of the stamps the cases use", () => {
        expect(mod.dayOf(DUE_OUT)).toBe(10);
        expect(mod.dayOf(DUE_BACK)).toBe(17);
        expect(mod.dayOf(25919)).toBe(17);
        expect(mod.dayOf(25920)).toBe(18);
    });
    add("minuteOf: the last minute of a day and the first of the next", () => {
        expect(mod.minuteOf(DUE_OUT)).toBe(840);
        expect(mod.minuteOf(DUE_BACK)).toBe(570);
        expect(mod.minuteOf(25919)).toBe(1439);
        expect(mod.minuteOf(25920)).toBe(0);
    });
    add("formatStamp: the day and a 24 hour clock", () => {
        expect(mod.formatStamp(4890)).toBe("day 3 09:30");
        expect(mod.formatStamp(0)).toBe("day 0 00:00");
        expect(mod.formatStamp(1439)).toBe("day 0 23:59");
        expect(mod.formatStamp(at(12, 14, 5))).toBe("day 12 14:05");
    });
    add("formatStamp: two dashes for a time that is not set", () => {
        expect(mod.formatStamp(mod.NOT_YET)).toBe("--");
        expect(mod.formatStamp(-1)).toBe("--");
    });

    // ------------------------------------------------------------------------------------------ formats
    add("formatPence: pounds and two places of pence", () => {
        expect(mod.formatPence(0)).toBe("£0.00");
        expect(mod.formatPence(5)).toBe("£0.05");
        expect(mod.formatPence(1250)).toBe("£12.50");
        expect(mod.formatPence(123456)).toBe("£1234.56");
    });
    add("formatPence: the minus sign goes before the pound sign", () => {
        expect(mod.formatPence(-5)).toBe("-£0.05");
        expect(mod.formatPence(-1250)).toBe("-£12.50");
    });
    add("formatLitres: reads tenths of a litre", () => {
        expect(mod.formatLitres(400)).toBe("40.0 L");
        expect(mod.formatLitres(1235)).toBe("123.5 L");
        expect(mod.formatLitres(7)).toBe("0.7 L");
        expect(mod.formatLitres(0)).toBe("0.0 L");
    });
    add("formatLitres: says unread for a gauge nobody read", () => {
        expect(mod.formatLitres(mod.UNREAD)).toBe("unread");
    });
    add("formatHours: reads tenths of an hour", () => {
        expect(mod.formatHours(12034)).toBe("1203.4 h");
        expect(mod.formatHours(0)).toBe("0.0 h");
        expect(mod.formatHours(9)).toBe("0.9 h");
    });
    add("formatHours: says unread for a counter nobody read", () => {
        expect(mod.formatHours(mod.UNREAD)).toBe("unread");
    });

    // ------------------------------------------------------------------------------------------ checklists
    add("checklistFor: the out list of a small boat", () => {
        expect(mod.checklistFor("out", 4)).toEqual({
            side: "out",
            items: [
                { code: "KEYS", label: "Keys and windlasses handed over", must: true, state: "todo", note: "" },
                { code: "GAS", label: "Gas turned on and bottles checked", must: true, state: "todo", note: "" },
                { code: "SAFETY", label: "Safety talk given, lifejackets fitted", must: true, state: "todo", note: "" },
                { code: "HELM", label: "Helm lesson done", must: true, state: "todo", note: "" },
                { code: "WATER", label: "Water tank filled", must: false, state: "todo", note: "" },
                { code: "INVENTORY", label: "Inventory agreed with the party", must: true, state: "todo", note: "" },
                { code: "WEED", label: "Weed hatch shown", must: false, state: "todo", note: "" },
            ],
        });
    });
    add("checklistFor: the back list", () => {
        expect(mod.checklistFor("back", 4)).toEqual({
            side: "back",
            items: [
                { code: "KEYS", label: "Keys and windlasses returned", must: true, state: "todo", note: "" },
                { code: "INVENTORY", label: "Inventory counted", must: true, state: "todo", note: "" },
                { code: "CLEAN", label: "Boat left clean", must: false, state: "todo", note: "" },
                { code: "PUMP", label: "Toilet tank pumped out", must: true, state: "todo", note: "" },
                { code: "BILGE", label: "Bilge dry", must: false, state: "todo", note: "" },
                { code: "MOORED", label: "Moored and locked on the wharf", must: true, state: "todo", note: "" },
            ],
        });
    });
    add("checklistFor: a boat of six berths or more gets the second steerer after the helm lesson", () => {
        const big = mod.checklistFor("out", 6);
        expect(codes(big)).toEqual(["KEYS", "GAS", "SAFETY", "HELM", "CREW", "WATER", "INVENTORY", "WEED"]);
        expect(big.items[4]).toEqual({
            code: "CREW", label: "Second steerer named and shown the controls", must: true, state: "todo", note: "",
        });
        expect(codes(mod.checklistFor("out", 8))).toContain("CREW");
        expect(codes(mod.checklistFor("out", 5))).not.toContain("CREW");
    });
    add("checklistFor: the back list is the same for a big boat", () => {
        expect(mod.checklistFor("back", 8)).toEqual(mod.checklistFor("back", 2));
        expect(codes(mod.checklistFor("back", 8))).toEqual(["KEYS", "INVENTORY", "CLEAN", "PUMP", "BILGE", "MOORED"]);
    });
    add("checklistFor: every call gives a list of its own", () => {
        const first = mod.checklistFor("out", 6);
        mod.tick(first, "KEYS", "ok");
        first.items.pop();
        const second = mod.checklistFor("out", 6);
        expect(codes(second)).toEqual(["KEYS", "GAS", "SAFETY", "HELM", "CREW", "WATER", "INVENTORY", "WEED"]);
        expect(second.items[0].state).toBe("todo");
        expect(codes(mod.checklistFor("out", 4))).toHaveLength(7);
    });
    add("checklistFor: however many berths a big boat has, it gets the second steerer", () => {
        expect(codes(mod.checklistFor("out", 12))).toEqual([
            "KEYS", "GAS", "SAFETY", "HELM", "CREW", "WATER", "INVENTORY", "WEED",
        ]);
        expect(codes(mod.checklistFor("out", 40))).toContain("CREW");
    });

    add("tick: sets the item in the list it is given", () => {
        const list = mod.checklistFor("out", 4);
        const items = list.items;
        expect(mod.tick(list, "GAS", "ok")).toBe(true);
        expect(list.items).toBe(items);
        expect(list.items[1]).toEqual({
            code: "GAS", label: "Gas turned on and bottles checked", must: true, state: "ok", note: "",
        });
        expect(list.items.filter((item) => item.state !== "todo")).toHaveLength(1);
    });
    add("tick: the code is trimmed and may be in small letters", () => {
        const list = mod.checklistFor("out", 4);
        expect(mod.tick(list, "  weed ", "na")).toBe(true);
        expect(list.items[6].state).toBe("na");
    });
    add("tick: refuses a code the list does not hold", () => {
        const list = mod.checklistFor("back", 4);
        const before = copyOf(list);
        expect(mod.tick(list, "HELM", "ok")).toBe(false);
        expect(mod.tick(list, "", "ok")).toBe(false);
        expect(list).toEqual(before);
    });
    add("tick: a fault must say what is wrong", () => {
        const list = mod.checklistFor("out", 4);
        const before = copyOf(list);
        expect(mod.tick(list, "GAS", "fault")).toBe(false);
        expect(mod.tick(list, "GAS", "fault", "   ")).toBe(false);
        expect(list).toEqual(before);
        expect(mod.tick(list, "GAS", "fault", "  regulator hisses ")).toBe(true);
        expect(list.items[1].state).toBe("fault");
        expect(list.items[1].note).toBe("regulator hisses");
    });
    add("tick: keeps a trimmed note with ok and na", () => {
        const list = mod.checklistFor("out", 4);
        mod.tick(list, "WATER", "ok", " topped up at the lock ");
        mod.tick(list, "WEED", "na", "no hatch on this boat");
        expect(list.items[4].note).toBe("topped up at the lock");
        expect(list.items[6].note).toBe("no hatch on this boat");
    });
    add("tick: an item put back to todo loses its note", () => {
        const list = mod.checklistFor("out", 4);
        mod.tick(list, "GAS", "fault", "regulator hisses");
        expect(mod.tick(list, "GAS", "todo", "look again")).toBe(true);
        expect(list.items[1].state).toBe("todo");
        expect(list.items[1].note).toBe("");
    });
    add("tick: an item ticked again with no note loses the note it had", () => {
        const list = mod.checklistFor("out", 4);
        mod.tick(list, "WATER", "ok", "topped up at the lock");
        expect(mod.tick(list, "WATER", "ok")).toBe(true);
        expect(list.items[4].note).toBe("");
        mod.tick(list, "GAS", "fault", "regulator hisses");
        expect(mod.tick(list, "GAS", "na")).toBe(true);
        expect(list.items[1]).toEqual({
            code: "GAS", label: "Gas turned on and bottles checked", must: true, state: "na", note: "",
        });
    });

    add("outstanding: the items that must be settled and are still todo", () => {
        const list = mod.checklistFor("out", 4);
        expect(mod.outstanding(list).map((item) => item.code)).toEqual(["KEYS", "GAS", "SAFETY", "HELM", "INVENTORY"]);
        mod.tick(list, "KEYS", "ok");
        mod.tick(list, "HELM", "na");
        expect(mod.outstanding(list).map((item) => item.code)).toEqual(["GAS", "SAFETY", "INVENTORY"]);
    });
    add("outstanding: a fault on an item that must be settled still stands, and other items never do", () => {
        const list = mod.checklistFor("out", 4);
        for (const code of ["KEYS", "SAFETY", "HELM", "INVENTORY"]) mod.tick(list, code, "ok");
        mod.tick(list, "GAS", "fault", "regulator hisses");
        mod.tick(list, "WATER", "fault", "tap drips");
        expect(mod.outstanding(list).map((item) => item.code)).toEqual(["GAS"]);
    });
    add("outstanding: gives the list's own items and changes nothing", () => {
        const list = mod.checklistFor("back", 4);
        const before = copyOf(list);
        const got = mod.outstanding(list);
        expect(got[0]).toBe(list.items[0]);
        expect(got[2]).toBe(list.items[3]);
        expect(list).toEqual(before);
    });
    add("isReady: false while an item that must be settled is todo or at fault", () => {
        const list = mod.checklistFor("back", 4);
        expect(mod.isReady(list)).toBe(false);
        for (const code of ["KEYS", "INVENTORY", "PUMP"]) mod.tick(list, code, "ok");
        expect(mod.isReady(list)).toBe(false);
        mod.tick(list, "MOORED", "fault", "left on the towpath side");
        expect(mod.isReady(list)).toBe(false);
    });
    add("isReady: true once those items are ok or na, whatever the others are", () => {
        const list = mod.checklistFor("back", 4);
        for (const code of ["KEYS", "INVENTORY", "PUMP"]) mod.tick(list, code, "ok");
        mod.tick(list, "MOORED", "na");
        mod.tick(list, "CLEAN", "fault", "galley greasy");
        expect(mod.isReady(list)).toBe(true);
    });
    add("faults: the items at fault, whether they must be settled or not, in the list's order", () => {
        const list = mod.checklistFor("out", 4);
        mod.tick(list, "WEED", "fault", "hatch seized");
        mod.tick(list, "GAS", "fault", "regulator hisses");
        mod.tick(list, "KEYS", "ok");
        const got = mod.faults(list);
        expect(got.map((item) => item.code)).toEqual(["GAS", "WEED"]);
        expect(got[0]).toBe(list.items[1]);
    });
    add("faults: an empty list when nothing is at fault", () => {
        expect(mod.faults(mod.checklistFor("out", 4))).toEqual([]);
    });
    add("faultNotes: the code and the note of each fault", () => {
        const list = mod.checklistFor("out", 4);
        mod.tick(list, "WEED", "fault", "hatch seized");
        mod.tick(list, "GAS", "fault", "regulator hisses");
        expect(mod.faultNotes(list)).toEqual(["GAS: regulator hisses", "WEED: hatch seized"]);
    });
    add("faultNotes: nothing for a list with no fault", () => {
        const list = mod.checklistFor("back", 4);
        mod.tick(list, "KEYS", "ok", "all three");
        expect(mod.faultNotes(list)).toEqual([]);
    });
    add("progress: how many items are ok or na, of how many", () => {
        const list = mod.checklistFor("out", 4);
        expect(mod.progress(list)).toBe("0/7");
        mod.tick(list, "KEYS", "ok");
        mod.tick(list, "GAS", "ok");
        mod.tick(list, "WEED", "na");
        expect(mod.progress(list)).toBe("3/7");
        expect(mod.progress(mod.checklistFor("out", 6))).toBe("0/8");
        expect(mod.progress(mod.checklistFor("back", 6))).toBe("0/6");
    });
    add("progress: faults are not counted as done and are told after a comma", () => {
        const list = mod.checklistFor("out", 4);
        mod.tick(list, "KEYS", "ok");
        mod.tick(list, "GAS", "fault", "regulator hisses");
        expect(mod.progress(list)).toBe("1/7, 1 fault");
        mod.tick(list, "WATER", "fault", "tap drips");
        expect(mod.progress(list)).toBe("1/7, 2 faults");
    });

    // ------------------------------------------------------------------------------------------ readings
    add("blankReading: every gauge unread and no time", () => {
        expect(mod.blankReading()).toEqual({ at: -1, fuel: -1, engine: -1, water: -1, gas: -1 });
    });
    add("blankReading: a new reading each time", () => {
        const first = mod.blankReading();
        first.fuel = 900;
        expect(mod.blankReading().fuel).toBe(-1);
    });
    add("readingProblems: none for a reading the boat can show, nor for unread gauges", () => {
        expect(mod.readingProblems(reading(at(10, 13), 1500, 12034, 8, 2), kestrel)).toEqual([]);
        expect(mod.readingProblems(reading(at(10, 13), 1800, 0, 0, 0), kestrel)).toEqual([]);
        expect(mod.readingProblems(mod.blankReading(), kestrel)).toEqual([]);
    });
    add("readingProblems: fuel is in tenths of a litre against the tank's litres", () => {
        expect(mod.readingProblems(reading(0, 1801, 100), kestrel)).toEqual(["fuel is not a level a 180 litre tank can hold"]);
        expect(mod.readingProblems(reading(0, 2200, 100, 8, 3), bittern)).toEqual([]);
        expect(mod.readingProblems(reading(0, 2201, 100, 8, 3), bittern)).toEqual([
            "fuel is not a level a 220 litre tank can hold",
        ]);
        expect(mod.readingProblems(reading(0, -2, 100), kestrel)).toEqual(["fuel is not a level a 180 litre tank can hold"]);
    });
    add("readingProblems: the engine counter, the water and the gas", () => {
        expect(mod.readingProblems(reading(0, 900, -5), kestrel)).toEqual(["the engine counter cannot be below zero"]);
        expect(mod.readingProblems(reading(0, 900, 100, 9), kestrel)).toEqual(["water is given in eighths, 0 to 8"]);
        expect(mod.readingProblems(reading(0, 900, 100, -3), kestrel)).toEqual(["water is given in eighths, 0 to 8"]);
        expect(mod.readingProblems(reading(0, 900, 100, 8, 3), kestrel)).toEqual(["the boat carries 2 gas bottles at most"]);
        expect(mod.readingProblems(reading(0, 900, 100, 8, 3), bittern)).toEqual([]);
        expect(mod.readingProblems(reading(0, 900, 100, 8, -4), bittern)).toEqual(["the boat carries 3 gas bottles at most"]);
    });
    add("readingProblems: several problems come in the order fuel, engine, water, gas", () => {
        expect(mod.readingProblems(reading(0, 5000, -7, 12, 9), kestrel)).toEqual([
            "fuel is not a level a 180 litre tank can hold",
            "the engine counter cannot be below zero",
            "water is given in eighths, 0 to 8",
            "the boat carries 2 gas bottles at most",
        ]);
    });
    add("readingProblems: an empty tank is a level like any other", () => {
        expect(mod.readingProblems(reading(0, 0, 100), kestrel)).toEqual([]);
        expect(mod.readingProblems(reading(0, 0, 0, 0, 0), bittern)).toEqual([]);
    });
    add("fuelEighths: the tank's level in eighths, a part of an eighth dropped", () => {
        expect(mod.fuelEighths(reading(0, 1800, 0), kestrel)).toBe(8);
        expect(mod.fuelEighths(reading(0, 900, 0), kestrel)).toBe(4);
        expect(mod.fuelEighths(reading(0, 450, 0), kestrel)).toBe(2);
        expect(mod.fuelEighths(reading(0, 449, 0), kestrel)).toBe(1);
        expect(mod.fuelEighths(reading(0, 0, 0), kestrel)).toBe(0);
        expect(mod.fuelEighths(reading(0, 550, 0), bittern)).toBe(2);
        expect(mod.fuelEighths(reading(0, 549, 0), bittern)).toBe(1);
    });
    add("fuelEighths: unread stays unread", () => {
        expect(mod.fuelEighths(mod.blankReading(), kestrel)).toBe(-1);
        expect(mod.fuelEighths(reading(0, mod.UNREAD, 500), bittern)).toBe(mod.UNREAD);
    });
    add("fuelUsed: what went from the tank, in tenths of a litre", () => {
        const out = reading(0, 1500, 100);
        const back = reading(9000, 1100, 356);
        const before = copyOf([out, back]);
        expect(mod.fuelUsed(out, back)).toBe(400);
        expect(mod.fuelUsed(reading(0, 1500, 0), reading(0, 1493, 0))).toBe(7);
        expect([out, back]).toEqual(before);
    });
    add("fuelUsed: a tank that came back as full or fuller gives 0", () => {
        expect(mod.fuelUsed(reading(0, 900, 0), reading(0, 900, 0))).toBe(0);
        expect(mod.fuelUsed(reading(0, 900, 0), reading(0, 1700, 0))).toBe(0);
    });
    add("fuelUsed: unread when either end was not read", () => {
        expect(mod.fuelUsed(reading(0, mod.UNREAD, 0), reading(0, 900, 0))).toBe(-1);
        expect(mod.fuelUsed(reading(0, 900, 0), reading(0, mod.UNREAD, 0))).toBe(-1);
        expect(mod.fuelUsed(mod.blankReading(), mod.blankReading())).toBe(-1);
    });
    add("fuelUsed: a drop of a tenth of a litre counts", () => {
        expect(mod.fuelUsed(reading(0, 1500, 0), reading(0, 1499, 0))).toBe(1);
        expect(mod.fuelUsed(reading(0, 1500, 0), reading(0, 1496, 0))).toBe(4);
    });
    add("estimateFuel: 1.4 litres for an hour on the engine counter, to the nearest tenth of a litre", () => {
        expect(mod.estimateFuel(reading(0, -1, 12034), reading(0, -1, 12290))).toBe(358);
        expect(mod.estimateFuel(reading(0, -1, 100), reading(0, -1, 110))).toBe(14);
        expect(mod.estimateFuel(reading(0, -1, 100), reading(0, -1, 103))).toBe(4);
        expect(mod.estimateFuel(reading(0, -1, 100), reading(0, -1, 104))).toBe(6);
        expect(mod.estimateFuel(reading(0, -1, 100), reading(0, -1, 101))).toBe(1);
    });
    add("estimateFuel: 0 when the counter did not move on, and it does not look at the dipstick", () => {
        expect(mod.estimateFuel(reading(0, 1500, 100), reading(0, 200, 100))).toBe(0);
        expect(mod.estimateFuel(reading(0, 1500, 100), reading(0, 200, 90))).toBe(0);
        expect(mod.estimateFuel(reading(0, 1500, 100), reading(0, 1500, 150))).toBe(70);
    });
    add("estimateFuel: unread when either counter was not read", () => {
        expect(mod.estimateFuel(reading(0, 1500, mod.UNREAD), reading(0, 1100, 500))).toBe(-1);
        expect(mod.estimateFuel(reading(0, 1500, 500), reading(0, 1100, mod.UNREAD))).toBe(-1);
    });
    add("fuelCharge: tenths of a litre in, pence out, at 168 pence a litre", () => {
        expect(mod.fuelCharge(400)).toBe(6720);
        expect(mod.fuelCharge(10)).toBe(168);
        expect(mod.fuelCharge(1000)).toBe(16800);
    });
    add("fuelCharge: a litre that was started is charged whole", () => {
        expect(mod.fuelCharge(1)).toBe(168);
        expect(mod.fuelCharge(11)).toBe(336);
        expect(mod.fuelCharge(401)).toBe(6888);
        expect(mod.fuelCharge(409)).toBe(6888);
        expect(mod.fuelCharge(410)).toBe(6888);
    });
    add("fuelCharge: nothing for no fuel or an unread figure", () => {
        expect(mod.fuelCharge(0)).toBe(0);
        expect(mod.fuelCharge(mod.UNREAD)).toBe(0);
        expect(mod.fuelCharge(-250)).toBe(0);
    });
    add("fuelCharge: takes another price for a litre", () => {
        expect(mod.fuelCharge(400, 150)).toBe(6000);
        expect(mod.fuelCharge(395, 200)).toBe(8000);
    });
    add("gasUsed: the bottles that were emptied", () => {
        expect(mod.gasUsed(reading(0, 0, 0, 8, 2), reading(0, 0, 0, 8, 1))).toBe(1);
        expect(mod.gasUsed(reading(0, 0, 0, 8, 3), reading(0, 0, 0, 8, 0))).toBe(3);
        expect(mod.gasUsed(reading(0, 0, 0, 8, 2), reading(0, 0, 0, 8, 2))).toBe(0);
    });
    add("gasUsed: 0 when more came back, and 0 when either end was not read", () => {
        expect(mod.gasUsed(reading(0, 0, 0, 8, 1), reading(0, 0, 0, 8, 2))).toBe(0);
        expect(mod.gasUsed(reading(0, 0, 0, 8, mod.UNREAD), reading(0, 0, 0, 8, 1))).toBe(0);
        expect(mod.gasUsed(reading(0, 0, 0, 8, 2), reading(0, 0, 0, 8, mod.UNREAD))).toBe(0);
    });

    // ------------------------------------------------------------------------------------------ lateness
    add("lateMinutes: a boat back by the end of the grace is not late", () => {
        expect(mod.lateMinutes(DUE_BACK, DUE_BACK - 300)).toBe(0);
        expect(mod.lateMinutes(DUE_BACK, DUE_BACK)).toBe(0);
        expect(mod.lateMinutes(DUE_BACK, DUE_BACK + 1)).toBe(0);
        expect(mod.lateMinutes(DUE_BACK, DUE_BACK + 20)).toBe(0);
    });
    add("lateMinutes: after the grace the lateness is counted from the time the boat was due", () => {
        expect(mod.lateMinutes(DUE_BACK, DUE_BACK + 21)).toBe(21);
        expect(mod.lateMinutes(DUE_BACK, DUE_BACK + 95)).toBe(95);
        expect(mod.lateMinutes(1000, 3000)).toBe(2000);
    });
    add("lateMinutes: a boat that is not back yet is not late", () => {
        expect(mod.lateMinutes(DUE_BACK, mod.NOT_YET)).toBe(0);
        expect(mod.lateMinutes(0, mod.NOT_YET)).toBe(0);
    });
    add("lateCharge: nothing for no lateness", () => {
        expect(mod.lateCharge(0)).toBe(0);
        expect(mod.lateCharge(-30)).toBe(0);
    });
    add("lateCharge: each started half hour up to two hours", () => {
        expect(mod.lateCharge(1)).toBe(1200);
        expect(mod.lateCharge(21)).toBe(1200);
        expect(mod.lateCharge(30)).toBe(1200);
        expect(mod.lateCharge(31)).toBe(2400);
        expect(mod.lateCharge(60)).toBe(2400);
        expect(mod.lateCharge(61)).toBe(3600);
        expect(mod.lateCharge(91)).toBe(4800);
        expect(mod.lateCharge(120)).toBe(4800);
    });
    add("lateCharge: a step costs the same after two hours", () => {
        expect(mod.lateCharge(121)).toBe(6000);
        expect(mod.lateCharge(180)).toBe(7200);
        expect(mod.lateCharge(360)).toBe(14400);
    });
    add("lateCharge: stops at the cap", () => {
        expect(mod.lateCharge(361)).toBe(15000);
        expect(mod.lateCharge(390)).toBe(15000);
        expect(mod.lateCharge(5000)).toBe(15000);
    });

    // ------------------------------------------------------------------------------------------ damage
    add("describeMark: the kind, the zone and the size", () => {
        expect(mod.describeMark(mark("port", "scratch", 120))).toBe("scratch on port, 120 mm");
        expect(mod.describeMark(mark("cabin", "burn", 8))).toBe("burn on cabin, 8 mm");
    });
    add("describeMark: a note goes in brackets, trimmed", () => {
        expect(mod.describeMark(mark("port", "scratch", 120, " by the fender "))).toBe(
            "scratch on port, 120 mm (by the fender)",
        );
        expect(mod.describeMark(mark("stern", "dent", 30, "   "))).toBe("dent on stern, 30 mm");
    });
    add("damageCharge: a scratch pays the first step its size is under", () => {
        expect(mod.damageCharge(mark("port", "scratch", 49))).toBe(0);
        expect(mod.damageCharge(mark("port", "scratch", 50))).toBe(4500);
        expect(mod.damageCharge(mark("port", "scratch", 299))).toBe(4500);
        expect(mod.damageCharge(mark("port", "scratch", 300))).toBe(9500);
        expect(mod.damageCharge(mark("port", "scratch", 2000))).toBe(9500);
    });
    add("damageCharge: the steps of a dent, a crack and a burn", () => {
        expect(mod.damageCharge(mark("bow", "dent", 19))).toBe(0);
        expect(mod.damageCharge(mark("bow", "dent", 20))).toBe(6000);
        expect(mod.damageCharge(mark("bow", "dent", 119))).toBe(6000);
        expect(mod.damageCharge(mark("bow", "dent", 120))).toBe(14000);
        expect(mod.damageCharge(mark("roof", "crack", 1))).toBe(3000);
        expect(mod.damageCharge(mark("roof", "crack", 9))).toBe(3000);
        expect(mod.damageCharge(mark("roof", "crack", 10))).toBe(12000);
        expect(mod.damageCharge(mark("roof", "crack", 79))).toBe(12000);
        expect(mod.damageCharge(mark("roof", "crack", 80))).toBe(26000);
        expect(mod.damageCharge(mark("stern", "burn", 4))).toBe(0);
        expect(mod.damageCharge(mark("stern", "burn", 5))).toBe(3500);
        expect(mod.damageCharge(mark("stern", "burn", 39))).toBe(3500);
        expect(mod.damageCharge(mark("stern", "burn", 40))).toBe(8000);
    });
    add("damageCharge: nothing for a mark of no size", () => {
        expect(mod.damageCharge(mark("roof", "crack", 0))).toBe(0);
        expect(mod.damageCharge(mark("cabin", "crack", -4))).toBe(0);
    });
    add("damageCharge: a mark in the cabin costs half as much again, and no other zone does", () => {
        expect(mod.damageCharge(mark("cabin", "scratch", 100))).toBe(6750);
        expect(mod.damageCharge(mark("cabin", "burn", 10))).toBe(5250);
        expect(mod.damageCharge(mark("cabin", "crack", 5))).toBe(4500);
        expect(mod.damageCharge(mark("cabin", "scratch", 10))).toBe(0);
        expect(mod.damageCharge(mark("roof", "scratch", 100))).toBe(4500);
        expect(mod.damageCharge(mark("starboard", "burn", 10))).toBe(3500);
    });
    add("sameMark: true for the same zone and kind, whatever the size and the note", () => {
        expect(mod.sameMark(mark("port", "scratch", 100, "old"), mark("port", "scratch", 5))).toBe(true);
    });
    add("sameMark: false for another zone or another kind", () => {
        expect(mod.sameMark(mark("port", "scratch", 100), mark("starboard", "scratch", 100))).toBe(false);
        expect(mod.sameMark(mark("port", "scratch", 100), mark("port", "dent", 100))).toBe(false);
    });
    add("newDamage: with nothing noted before, every mark is new, and the marks given are copies", () => {
        const after = [mark("stern", "dent", 30, "rudder post"), mark("bow", "scratch", 60)];
        const got = mod.newDamage([], after);
        expect(got).toEqual(after);
        expect(got[0]).not.toBe(after[0]);
        expect(got[1]).not.toBe(after[1]);
    });
    add("newDamage: a mark that was there is excused, also when it grew by 10 mm or shrank", () => {
        const before = [mark("port", "scratch", 100), mark("stern", "dent", 30), mark("roof", "burn", 20)];
        const after = [mark("port", "scratch", 100), mark("stern", "dent", 40), mark("roof", "burn", 12)];
        expect(mod.newDamage(before, after)).toEqual([]);
    });
    add("newDamage: a mark that grew by more than 10 mm is given at the size it grew by", () => {
        const before = [mark("port", "scratch", 100, "old")];
        expect(mod.newDamage(before, [mark("port", "scratch", 111, "longer now")])).toEqual([
            mark("port", "scratch", 11, "longer now"),
        ]);
        expect(mod.newDamage(before, [mark("port", "scratch", 400)])).toEqual([mark("port", "scratch", 300)]);
    });
    add("newDamage: a mark of before excuses one mark only, the first of its zone and kind", () => {
        const before = [mark("port", "scratch", 100)];
        expect(mod.newDamage(before, [mark("port", "scratch", 100), mark("port", "scratch", 60)])).toEqual([
            mark("port", "scratch", 60),
        ]);
        expect(mod.newDamage(before, [mark("port", "scratch", 60), mark("port", "scratch", 100)])).toEqual([
            mark("port", "scratch", 100),
        ]);
    });
    add("newDamage: a mark in another zone or of another kind is not excused", () => {
        const before = [mark("port", "scratch", 100)];
        const after = [mark("starboard", "scratch", 100), mark("port", "dent", 100)];
        expect(mod.newDamage(before, after)).toEqual(after);
    });
    add("newDamage: changes neither list", () => {
        const before = [mark("port", "scratch", 100), mark("port", "scratch", 30)];
        const after = [mark("port", "scratch", 160), mark("bow", "dent", 25), mark("port", "scratch", 30)];
        const kept = copyOf([before, after]);
        expect(mod.newDamage(before, after)).toEqual([mark("port", "scratch", 60), mark("bow", "dent", 25)]);
        expect([before, after]).toEqual(kept);
    });
    add("newDamage: the marks come in the order of after, a grown mark as much as a new one", () => {
        const before = [mark("bow", "scratch", 100)];
        const after = [mark("roof", "dent", 30), mark("bow", "scratch", 200), mark("port", "burn", 10)];
        expect(mod.newDamage(before, after)).toEqual([
            mark("roof", "dent", 30), mark("bow", "scratch", 100), mark("port", "burn", 10),
        ]);
    });
    add("newDamage: of two old marks of one zone and kind, the one noted first is matched first", () => {
        const before = [mark("port", "scratch", 30), mark("port", "scratch", 100)];
        expect(mod.newDamage(before, [mark("port", "scratch", 120)])).toEqual([mark("port", "scratch", 90)]);
    });
    add("sortMarks: sorts the list it is given, in the order of the zones and the largest first in a zone", () => {
        const marks = [
            mark("cabin", "burn", 8), mark("port", "scratch", 40), mark("bow", "dent", 25),
            mark("port", "dent", 90), mark("roof", "crack", 5), mark("stern", "scratch", 70),
            mark("starboard", "scratch", 10),
        ];
        const got = mod.sortMarks(marks);
        expect(got).toBe(marks);
        expect(marks).toEqual([
            mark("bow", "dent", 25), mark("port", "dent", 90), mark("port", "scratch", 40),
            mark("starboard", "scratch", 10), mark("stern", "scratch", 70), mark("roof", "crack", 5),
            mark("cabin", "burn", 8),
        ]);
    });
    add("sortMarks: marks of one zone and one size keep their order", () => {
        const marks = [mark("stern", "dent", 30, "b"), mark("stern", "scratch", 30, "a"), mark("bow", "burn", 30)];
        mod.sortMarks(marks);
        expect(marks.map((each) => each.note)).toEqual(["", "b", "a"]);
        expect(mod.sortMarks([])).toEqual([]);
    });
    add("sortMarks: marks of one zone and one size keep their order, whatever their kinds", () => {
        const marks = [
            mark("stern", "scratch", 30, "first"), mark("stern", "dent", 30, "second"),
            mark("stern", "burn", 30, "third"), mark("stern", "crack", 30, "fourth"),
        ];
        mod.sortMarks(marks);
        expect(marks.map((each) => each.note)).toEqual(["first", "second", "third", "fourth"]);
    });
    add("worstMark: the mark that costs most, as it stands in the list", () => {
        const marks = [mark("port", "scratch", 500), mark("roof", "crack", 12), mark("cabin", "scratch", 500)];
        expect(mod.worstMark(marks)).toBe(marks[2]);
        expect(mod.worstMark([mark("port", "scratch", 500), mark("roof", "crack", 12)])).toEqual(mark("roof", "crack", 12));
    });
    add("worstMark: the first of equals, and undefined for no marks", () => {
        const marks = [mark("port", "scratch", 10), mark("bow", "dent", 5), mark("stern", "burn", 2)];
        expect(mod.worstMark(marks)).toBe(marks[0]);
        const equal = [mark("port", "scratch", 60), mark("bow", "scratch", 200)];
        expect(mod.worstMark(equal)).toBe(equal[0]);
        expect(mod.worstMark([])).toBeUndefined();
    });

    // ------------------------------------------------------------------------------------------ charges
    add("totalPence: the sum of the lines", () => {
        expect(mod.totalPence([charge("fuel", 6720), charge("late", 2400), charge("extra", 1850)])).toBe(10970);
        expect(mod.totalPence([charge("extra", 5000), charge("extra", -1200)])).toBe(3800);
    });
    add("totalPence: 0 for no lines", () => {
        expect(mod.totalPence([])).toBe(0);
    });
    add("mergeCharges: one line a code, in the order of CHARGE_ORDER, the pence added up", () => {
        const lines = [
            charge("extra", 1850, "lost windlass"), charge("damage", 4500, "scratch on bow, 60 mm"),
            charge("fuel", 6720, "40.0 L by dipstick"), charge("damage", 6000, "dent on stern, 30 mm"),
            charge("damage", 3500, "burn on roof, 9 mm"), charge("extra", 700, "pump-out token"),
        ];
        const before = copyOf(lines);
        expect(mod.mergeCharges(lines)).toEqual([
            charge("fuel", 6720, "40.0 L by dipstick"), charge("damage", 14000, "3 items"), charge("extra", 2550, "2 items"),
        ]);
        expect(lines).toEqual(before);
    });
    add("mergeCharges: a code with one line keeps its note, and no lines give no lines", () => {
        expect(mod.mergeCharges([charge("late", 2400, "45 min late"), charge("gas", 3950, "1 of 2 bottles")])).toEqual([
            charge("gas", 3950, "1 of 2 bottles"), charge("late", 2400, "45 min late"),
        ]);
        expect(mod.mergeCharges([])).toEqual([]);
    });
    add("mergeCharges: a code whose lines come to nothing keeps its line", () => {
        expect(mod.mergeCharges([charge("extra", 500, "found aboard"), charge("extra", -500, "handed back")])).toEqual([
            charge("extra", 0, "2 items"),
        ]);
        expect(mod.mergeCharges([charge("late", 0, "on the dot")])).toEqual([charge("late", 0, "on the dot")]);
    });
    add("mergeCharges: lines of one code that share a note are still told as items", () => {
        const lines = [charge("extra", 700, "pump-out token"), charge("extra", 700, "pump-out token")];
        expect(mod.mergeCharges(lines)).toEqual([charge("extra", 1400, "2 items")]);
    });
    add("settle: the deposit pays the charges and the rest goes back", () => {
        expect(mod.settle(20000, [charge("fuel", 6720), charge("late", 2400)])).toEqual({
            chargedPence: 9120, keptPence: 9120, refundPence: 10880, owedPence: 0,
        });
        expect(mod.settle(20000, [])).toEqual({ chargedPence: 0, keptPence: 0, refundPence: 20000, owedPence: 0 });
    });
    add("settle: what the deposit cannot cover is owed", () => {
        expect(mod.settle(20000, [charge("damage", 26000), charge("fuel", 920)])).toEqual({
            chargedPence: 26920, keptPence: 20000, refundPence: 0, owedPence: 6920,
        });
        expect(mod.settle(20000, [charge("damage", 20000)])).toEqual({
            chargedPence: 20000, keptPence: 20000, refundPence: 0, owedPence: 0,
        });
        expect(mod.settle(0, [charge("fuel", 168)])).toEqual({
            chargedPence: 168, keptPence: 0, refundPence: 0, owedPence: 168,
        });
    });
    add("receiptLines: a line a code, then charged, deposit and refund, with dots between", () => {
        const lines = [
            charge("extra", 1850, "lost windlass"), charge("damage", 4500), charge("fuel", 6720), charge("damage", 6000),
        ];
        const before = copyOf(lines);
        expect(mod.receiptLines(20000, lines)).toEqual([
            "fuel .................... £67.20",
            "damage ................. £105.00",
            "extra ................... £18.50",
            "charged ................ £190.70",
            "deposit ................ £200.00",
            "refund ................... £9.30",
        ]);
        expect(lines).toEqual(before);
    });
    add("receiptLines: says what is to pay when the deposit does not cover the charges", () => {
        expect(mod.receiptLines(5000, [charge("cleaning", 6000, "galley greasy")])).toEqual([
            "cleaning ................ £60.00",
            "charged ................. £60.00",
            "deposit ................. £50.00",
            "to pay .................. £10.00",
        ]);
        expect(mod.receiptLines(0, [])).toEqual([
            "charged .................. £0.00",
            "deposit .................. £0.00",
            "refund ................... £0.00",
        ]);
    });
    add("receiptLines: a long sum still gets three dots", () => {
        expect(mod.receiptLines(0, [charge("cleaning", 1e17)])[0]).toBe("cleaning ... £1000000000000000.00");
    });
    add("receiptLines: a penny owed is to pay", () => {
        expect(mod.receiptLines(0, [charge("extra", 1)])).toEqual([
            "extra .................... £0.01",
            "charged .................. £0.01",
            "deposit .................. £0.00",
            "to pay ................... £0.01",
        ]);
        expect(mod.receiptLines(6719, [charge("fuel", 6720)])).toEqual([
            "fuel .................... £67.20",
            "charged ................. £67.20",
            "deposit ................. £67.19",
            "to pay ................... £0.01",
        ]);
    });

    // ------------------------------------------------------------------------------------------ timeline
    add("describeEvent: when, what and by whom", () => {
        expect(mod.describeEvent(event(4890, "released"))).toBe("day 3 09:30 released by Mo");
        expect(mod.describeEvent(event(4890, "ticked", "Mo", "out KEYS ok"))).toBe(
            "day 3 09:30 ticked by Mo: out KEYS ok",
        );
    });
    add("describeEvent: leaves out a name that is empty", () => {
        expect(mod.describeEvent(event(4890, "opened", ""))).toBe("day 3 09:30 opened");
        expect(mod.describeEvent(event(at(12, 16, 5), "extra", "", "£5.00 mooring pin"))).toBe(
            "day 12 16:05 extra: £5.00 mooring pin",
        );
    });
    add("eventsOn: the events of the day, in the order given, as they are", () => {
        const events = [event(at(4, 9), "returned"), event(at(3, 23, 59), "ticked"), event(at(4, 0), "read")];
        const got = mod.eventsOn(events, 4);
        expect(got).toEqual([events[0], events[2]]);
        expect(got[0]).toBe(events[0]);
        expect(events).toHaveLength(3);
    });
    add("eventsOn: an empty list for a day with none", () => {
        expect(mod.eventsOn([event(at(4, 9), "returned")], 5)).toEqual([]);
        expect(mod.eventsOn([], 0)).toEqual([]);
    });
    add("spanOf: minutes from the earliest event to the latest, in whatever order they come", () => {
        const events = [event(500, "ticked"), event(120, "opened"), event(9000, "returned"), event(700, "released")];
        expect(mod.spanOf(events)).toBe(8880);
        expect(mod.spanOf(events.slice().reverse())).toBe(8880);
    });
    add("spanOf: 0 for one event and for none", () => {
        expect(mod.spanOf([event(500, "ticked")])).toBe(0);
        expect(mod.spanOf([])).toBe(0);
    });
    add("stageTimes: the minutes of each stage, in whatever order the events come", () => {
        const events = [
            event(100, "opened"), event(130, "ticked"), event(160, "released"), event(10000, "returned"),
            event(10050, "closed"),
        ];
        expect(mod.stageTimes(events)).toEqual({ checkingMin: 60, outMin: 9840, closingMin: 50 });
        expect(mod.stageTimes(events.slice().reverse())).toEqual({ checkingMin: 60, outMin: 9840, closingMin: 50 });
    });
    add("stageTimes: a stage that has not ended holds NOT_YET", () => {
        const events = [event(100, "opened"), event(160, "released"), event(10000, "returned")];
        expect(mod.stageTimes(events)).toEqual({ checkingMin: 60, outMin: 9840, closingMin: -1 });
        expect(mod.stageTimes([event(100, "opened")])).toEqual({ checkingMin: -1, outMin: -1, closingMin: -1 });
        expect(mod.stageTimes([])).toEqual({ checkingMin: -1, outMin: -1, closingMin: -1 });
    });
    add("stageTimes: of two events of one kind, the first in the list is taken", () => {
        const events = [
            event(10050, "closed"), event(10000, "returned"), event(9000, "returned"), event(300, "released"),
            event(160, "released"), event(100, "opened"),
        ];
        expect(mod.stageTimes(events)).toEqual({ checkingMin: 200, outMin: 9700, closingMin: 50 });
    });
    add("stageTimes: a stage that ends before it begins gives minutes below zero", () => {
        expect(mod.stageTimes([event(160, "opened"), event(100, "released")])).toEqual({
            checkingMin: -60, outMin: -1, closingMin: -1,
        });
    });

    // ------------------------------------------------------------------------------------------ wharf slots
    add("slotFor: 40 minutes for a boat of under six berths", () => {
        expect(mod.slotFor(600, 4)).toEqual({ start: 600, end: 640 });
        expect(mod.slotFor(DUE_OUT, 5)).toEqual({ start: 15240, end: 15280 });
    });
    add("slotFor: an hour for a boat of six berths or more", () => {
        expect(mod.slotFor(600, 6)).toEqual({ start: 600, end: 660 });
        expect(mod.slotFor(600, 10)).toEqual({ start: 600, end: 660 });
    });
    add("slotsClash: true when the slots share a minute", () => {
        expect(mod.slotsClash({ start: 600, end: 640 }, { start: 630, end: 690 })).toBe(true);
        expect(mod.slotsClash({ start: 630, end: 690 }, { start: 600, end: 640 })).toBe(true);
        expect(mod.slotsClash({ start: 600, end: 700 }, { start: 620, end: 630 })).toBe(true);
        expect(mod.slotsClash({ start: 600, end: 640 }, { start: 600, end: 640 })).toBe(true);
        expect(mod.slotsClash({ start: 600, end: 640 }, { start: 639, end: 700 })).toBe(true);
    });
    add("slotsClash: a slot may begin at the minute another ends", () => {
        expect(mod.slotsClash({ start: 600, end: 640 }, { start: 640, end: 680 })).toBe(false);
        expect(mod.slotsClash({ start: 640, end: 680 }, { start: 600, end: 640 })).toBe(false);
        expect(mod.slotsClash({ start: 600, end: 640 }, { start: 700, end: 740 })).toBe(false);
    });
    add("inWharfHours: from 08:30, and right up to 17:00", () => {
        expect(mod.inWharfHours({ start: at(3, 8, 30), end: at(3, 9, 10) })).toBe(true);
        expect(mod.inWharfHours({ start: at(3, 16, 20), end: at(3, 17) })).toBe(true);
        expect(mod.inWharfHours({ start: at(0, 12), end: at(0, 13) })).toBe(true);
    });
    add("inWharfHours: not before opening, not past shutting, not over midnight", () => {
        expect(mod.inWharfHours({ start: at(3, 8, 29), end: at(3, 9, 9) })).toBe(false);
        expect(mod.inWharfHours({ start: at(3, 16, 21), end: at(3, 17, 1) })).toBe(false);
        expect(mod.inWharfHours({ start: at(3, 16), end: at(4, 9) })).toBe(false);
        expect(mod.inWharfHours({ start: at(3, 23, 50), end: at(4, 0, 30) })).toBe(false);
    });
    add("inWharfHours: a slot that ends at midnight is not in hours", () => {
        expect(mod.inWharfHours({ start: at(3, 23, 20), end: at(4, 0) })).toBe(false);
    });
    add("nextFree: the time asked for when it is clear, and opening time when it is too early", () => {
        expect(mod.nextFree([], at(3, 9), 40)).toBe(at(3, 9));
        expect(mod.nextFree([], at(3, 7), 40)).toBe(at(3, 8, 30));
        expect(mod.nextFree([{ start: at(3, 10), end: at(3, 10, 40) }], at(3, 9), 40)).toBe(at(3, 9));
        expect(mod.nextFree([{ start: at(4, 9), end: at(4, 9, 40) }], at(3, 9), 40)).toBe(at(3, 9));
    });
    add("nextFree: moves to the end of a slot it would clash with, and on past the next", () => {
        const first = { start: at(3, 9), end: at(3, 9, 40) };
        const second = { start: at(3, 9, 50), end: at(3, 10, 30) };
        expect(mod.nextFree([first], at(3, 9), 40)).toBe(at(3, 9, 40));
        expect(mod.nextFree([first], at(3, 9, 10), 40)).toBe(at(3, 9, 40));
        expect(mod.nextFree([first], at(3, 8), 40)).toBe(at(3, 9, 40));
        expect(mod.nextFree([first, second], at(3, 9), 40)).toBe(at(3, 10, 30));
        expect(mod.nextFree([first, second], at(3, 9), 10)).toBe(at(3, 9, 40));
    });
    add("nextFree: a slot may touch the one before and the one after", () => {
        const taken = [{ start: at(3, 9), end: at(3, 9, 40) }, { start: at(3, 10, 20), end: at(3, 11) }];
        expect(mod.nextFree(taken, at(3, 9, 40), 40)).toBe(at(3, 9, 40));
        expect(mod.nextFree(taken, at(3, 9, 41), 40)).toBe(at(3, 11));
    });
    add("nextFree: takes the slots in any order and leaves the list as it was", () => {
        const taken = [
            { start: at(3, 9, 50), end: at(3, 10, 30) }, { start: at(3, 10, 30), end: at(3, 11, 30) },
            { start: at(3, 9), end: at(3, 9, 40) },
        ];
        const before = copyOf(taken);
        expect(mod.nextFree(taken, at(3, 9), 40)).toBe(at(3, 11, 30));
        expect(taken).toEqual(before);
    });
    add("nextFree: NOT_YET when the wharf shuts before the slot would end", () => {
        expect(mod.nextFree([], at(3, 16, 20), 40)).toBe(at(3, 16, 20));
        expect(mod.nextFree([], at(3, 16, 21), 40)).toBe(-1);
        expect(mod.nextFree([{ start: at(3, 16), end: at(3, 16, 40) }], at(3, 16), 40)).toBe(mod.NOT_YET);
        expect(mod.nextFree([], at(3, 18), 40)).toBe(-1);
    });
    add("nextFree: NOT_YET for a slot that would run past midnight", () => {
        expect(mod.nextFree([], at(3, 23, 50), 40)).toBe(mod.NOT_YET);
        expect(mod.nextFree([{ start: at(3, 9), end: at(3, 9, 40) }], at(3, 23, 30), 60)).toBe(-1);
    });

    // ------------------------------------------------------------------------------------------ a handover begins
    add("Handover: starts booked, with nothing done and the reference trimmed and in capitals", () => {
        const h = new mod.Handover("  kf-12 ", kestrel, DUE_OUT, DUE_BACK, 20000);
        expect(h.ref).toBe("KF-12");
        expect(h.phase).toBe("booked");
        expect(h.dueOutAt).toBe(15240);
        expect(h.dueBackAt).toBe(25050);
        expect(h.depositPence).toBe(20000);
        expect(h.outAt).toBe(-1);
        expect(h.backAt).toBe(-1);
        expect(h.timeline()).toEqual([]);
        expect(h.charges()).toEqual([]);
        expect(h.damage("out")).toEqual([]);
        expect(h.damage("back")).toEqual([]);
        expect(h.reading("out")).toEqual(mod.blankReading());
        expect(h.reading("back")).toEqual(mod.blankReading());
        expect(h.checklist("out")).toEqual(mod.checklistFor("out", 4));
        expect(h.checklist("back")).toEqual(mod.checklistFor("back", 4));
    });
    add("Handover: keeps a copy of the boat, and a big boat gets the longer out list", () => {
        const spec = { ...bittern };
        const h = new mod.Handover("kf-30", spec, DUE_OUT, DUE_BACK, 27500);
        spec.name = "Changed";
        spec.berths = 2;
        expect(h.boat).toEqual(bittern);
        expect(codes(h.checklist("out"))).toEqual(["KEYS", "GAS", "SAFETY", "HELM", "CREW", "WATER", "INVENTORY", "WEED"]);
    });
    add("Handover.phase: booked, checking, out, returned and closed in turn", () => {
        const h = fresh();
        expect(h.phase).toBe("booked");
        h.open(at(10, 13), "Mo");
        expect(h.phase).toBe("checking");
        settleSide(h, "out", at(10, 13, 5), "Mo");
        h.read("out", reading(at(10, 13, 20), 1500, 12034), "Mo");
        expect(h.phase).toBe("checking");
        h.release(at(10, 13, 40), "Mo");
        expect(h.phase).toBe("out");
        h.takeBack(at(17, 9), "Ines");
        expect(h.phase).toBe("returned");
        finish(h, reading(at(17, 9, 10), 1100, 12290, 3, 2), at(17, 9, 30));
        expect(h.phase).toBe("closed");
    });
    add("Handover.phase: void once the hire is called off, and a refused step leaves the phase alone", () => {
        const h = opened();
        expect(h.release(at(10, 13, 40), "Mo")).toBe(false);
        expect(h.takeBack(at(17, 9), "Ines")).toBe(false);
        expect(h.phase).toBe("checking");
        h.cancel(at(10, 13, 50), "Mo", "engine would not start");
        expect(h.phase).toBe("void");
        expect(h.open(at(10, 14), "Mo")).toBe(false);
        expect(h.phase).toBe("void");
    });
    add("Handover.outAt: NOT_YET until the boat is released", () => {
        expect(fresh().outAt).toBe(mod.NOT_YET);
        const h = opened();
        settleSide(h, "out", at(10, 13, 5), "Mo");
        h.read("out", reading(at(10, 13, 20), 1500, 12034), "Mo");
        expect(h.outAt).toBe(-1);
    });
    add("Handover.outAt: the time of the release, not the time the boat was due, and kept afterwards", () => {
        expect(gone().outAt).toBe(at(10, 13, 40));
        expect(back().outAt).toBe(at(10, 13, 40));
        expect(shut().outAt).toBe(at(10, 13, 40));
    });
    add("Handover.backAt: NOT_YET until the boat is taken back", () => {
        expect(fresh().backAt).toBe(mod.NOT_YET);
        expect(gone().backAt).toBe(-1);
    });
    add("Handover.backAt: the time the boat was taken back, not the time it was due, and kept afterwards", () => {
        expect(back(fresh(), at(17, 8, 15)).backAt).toBe(at(17, 8, 15));
        expect(back(fresh(), DUE_BACK + 95).backAt).toBe(DUE_BACK + 95);
        expect(shut(fresh(), at(17, 11)).backAt).toBe(at(17, 11));
    });
    add("Handover.open: a booked hire goes to checking and the timeline says so", () => {
        const h = fresh();
        expect(h.open(at(10, 13), "  Mo ")).toBe(true);
        expect(h.phase).toBe("checking");
        expect(h.timeline()).toEqual([{ at: at(10, 13), kind: "opened", by: "Mo", text: "" }]);
    });
    add("Handover.open: refused in any other phase, and nothing is noted", () => {
        const h = opened();
        expect(h.open(at(10, 13, 30), "Mo")).toBe(false);
        expect(h.timeline()).toHaveLength(1);
        const off = fresh();
        off.cancel(at(9, 10), "Mo", "party withdrew");
        expect(off.open(at(10, 13), "Mo")).toBe(false);
        expect(off.phase).toBe("void");
        expect(gone().open(at(11, 9), "Mo")).toBe(false);
    });
    add("Handover.open: a hire may be opened with no name given", () => {
        const h = fresh();
        expect(h.open(at(10, 13), "")).toBe(true);
        expect(h.phase).toBe("checking");
        expect(h.timeline()).toEqual([{ at: at(10, 13), kind: "opened", by: "", text: "" }]);
        const blank = fresh();
        expect(blank.open(at(10, 13), "   ")).toBe(true);
        expect(blank.timeline()[0].by).toBe("");
    });

    // ------------------------------------------------------------------------------------------ ticking
    add("Handover.tick: sets an item of the side that is open and notes it", () => {
        const h = opened();
        expect(h.tick("out", "KEYS", "ok", at(10, 13, 5), "Mo")).toBe(true);
        expect(h.checklist("out").items[0].state).toBe("ok");
        expect(h.timeline()[0]).toEqual({ at: at(10, 13, 5), kind: "ticked", by: "Mo", text: "out KEYS ok" });
        expect(h.timeline()).toHaveLength(2);
    });
    add("Handover.tick: the note is kept trimmed, and the event names the code in capitals", () => {
        const h = opened();
        expect(h.tick("out", " water ", "fault", at(10, 13, 6), "Mo", " tap drips ")).toBe(true);
        expect(h.checklist("out").items[4]).toEqual({
            code: "WATER", label: "Water tank filled", must: false, state: "fault", note: "tap drips",
        });
        expect(h.timeline()[0].text).toBe("out WATER fault");
    });
    add("Handover.tick: only the out side while checking, only the back side once returned", () => {
        const h = opened();
        expect(h.tick("back", "KEYS", "ok", at(10, 13, 5), "Mo")).toBe(false);
        expect(h.checklist("back").items[0].state).toBe("todo");
        const b = back();
        expect(b.tick("out", "WATER", "ok", at(17, 9, 5), "Ines")).toBe(false);
        expect(b.tick("back", "PUMP", "ok", at(17, 9, 5), "Ines")).toBe(true);
        expect(b.checklist("back").items[3].state).toBe("ok");
        expect(b.timeline()[0]).toEqual({ at: at(17, 9, 5), kind: "ticked", by: "Ines", text: "back PUMP ok" });
    });
    add("Handover.tick: refused when booked, out, closed or called off", () => {
        expect(fresh().tick("out", "KEYS", "ok", at(10, 13), "Mo")).toBe(false);
        const g = gone();
        expect(g.tick("out", "WATER", "ok", at(11, 9), "Mo")).toBe(false);
        expect(g.tick("back", "KEYS", "ok", at(11, 9), "Mo")).toBe(false);
        expect(g.timeline()).toHaveLength(8);
        expect(shut().tick("back", "CLEAN", "ok", at(17, 10), "Ines")).toBe(false);
    });
    add("Handover.tick: a tick the list refuses leaves no event", () => {
        const h = opened();
        expect(h.tick("out", "PUMP", "ok", at(10, 13, 5), "Mo")).toBe(false);
        expect(h.tick("out", "GAS", "fault", at(10, 13, 5), "Mo")).toBe(false);
        expect(h.timeline()).toHaveLength(1);
        expect(h.checklist("out")).toEqual(mod.checklistFor("out", 4));
    });
    add("Handover.tick: a tick that changes nothing is still noted", () => {
        const h = opened();
        h.tick("out", "KEYS", "ok", at(10, 13, 5), "Mo");
        expect(h.tick("out", "KEYS", "ok", at(10, 13, 6), "Mo")).toBe(true);
        expect(kinds(h)).toEqual(["ticked", "ticked", "opened"]);
        expect(h.timeline()[0]).toEqual({ at: at(10, 13, 6), kind: "ticked", by: "Mo", text: "out KEYS ok" });
    });

    // ------------------------------------------------------------------------------------------ readings kept
    add("Handover.read: keeps a copy of the reading and notes it at the reading's own time", () => {
        const h = opened();
        const taken = reading(at(10, 12, 50), 1500, 12034, 7, 2);
        expect(h.read("out", taken, "Mo")).toBe(true);
        taken.fuel = 3;
        expect(h.reading("out")).toEqual(reading(at(10, 12, 50), 1500, 12034, 7, 2));
        expect(h.timeline()[0]).toEqual({
            at: at(10, 12, 50), kind: "read", by: "Mo", text: "out fuel 150.0 L, engine 1203.4 h",
        });
    });
    add("Handover.read: a later reading takes the place of the earlier one, and both are noted", () => {
        const h = opened();
        h.read("out", reading(at(10, 13, 10), 1500, 12034), "Mo");
        expect(h.read("out", reading(at(10, 13, 15), 1480, 12034), "Mo")).toBe(true);
        expect(h.reading("out").fuel).toBe(1480);
        expect(kinds(h)).toEqual(["read", "read", "opened"]);
    });
    add("Handover.read: gauges nobody read are accepted", () => {
        const h = opened();
        const partial = { at: at(10, 13, 10), fuel: mod.UNREAD, engine: mod.UNREAD, water: 8, gas: mod.UNREAD };
        expect(h.read("out", partial, "Mo")).toBe(true);
        expect(h.timeline()[0].text).toBe("out fuel unread, engine unread");
        expect(h.reading("out")).toEqual(partial);
    });
    add("Handover.read: refuses a reading with no time or with a problem, and notes nothing", () => {
        const h = opened();
        expect(h.read("out", reading(mod.NOT_YET, 1500, 12034), "Mo")).toBe(false);
        expect(h.read("out", reading(at(10, 13, 10), 1801, 12034), "Mo")).toBe(false);
        expect(h.read("out", reading(at(10, 13, 10), 1500, 12034, 8, 3), "Mo")).toBe(false);
        expect(h.reading("out")).toEqual(mod.blankReading());
        expect(h.timeline()).toHaveLength(1);
    });
    add("Handover.read: only for the side that is open", () => {
        const good = reading(at(10, 13, 10), 1500, 12034);
        expect(fresh().read("out", good, "Mo")).toBe(false);
        expect(opened().read("back", good, "Mo")).toBe(false);
        expect(gone().read("out", good, "Mo")).toBe(false);
        const b = back();
        expect(b.read("out", reading(at(17, 9, 10), 1400, 12290), "Ines")).toBe(false);
        expect(b.read("back", reading(at(17, 9, 10), 1400, 12290), "Ines")).toBe(true);
        expect(b.reading("back").fuel).toBe(1400);
        expect(b.reading("out").fuel).toBe(1500);
    });
    add("Handover.read: a later reading takes the place of the earlier one whole, an unread gauge too", () => {
        const h = opened();
        h.read("out", reading(at(10, 13, 10), 1500, 12034), "Mo");
        const later = { at: at(10, 13, 15), fuel: mod.UNREAD, engine: 12034, water: 8, gas: 2 };
        expect(h.read("out", later, "Mo")).toBe(true);
        expect(h.reading("out")).toEqual(later);
    });
    add("Handover.read: a reading timed before the one it replaces still takes its place", () => {
        const h = opened();
        h.read("out", reading(at(10, 13, 15), 1500, 12034), "Mo");
        expect(h.read("out", reading(at(10, 13, 10), 1400, 12034), "Mo")).toBe(true);
        expect(h.reading("out")).toEqual(reading(at(10, 13, 10), 1400, 12034));
        expect(h.timeline()[0].at).toBe(at(10, 13, 10));
    });
    add("Handover.read: a back reading may carry a time before the boat came back", () => {
        const b = back(fresh(), at(17, 9));
        expect(b.read("back", reading(at(17, 8, 50), 1100, 12290), "Ines")).toBe(true);
        expect(b.reading("back").at).toBe(at(17, 8, 50));
    });
    add("Handover.reading: gives a copy", () => {
        const h = gone();
        const got = h.reading("out");
        got.fuel = 1;
        expect(h.reading("out").fuel).toBe(1500);
    });

    add("Handover.reading: blank until that side is read, and each side has its own", () => {
        const b = back();
        expect(b.reading("out")).toEqual(reading(at(10, 13, 20), 1500, 12034));
        expect(b.reading("back")).toEqual({ at: -1, fuel: -1, engine: -1, water: -1, gas: -1 });
    });

    // ------------------------------------------------------------------------------------------ damage noted
    add("Handover.noteDamage: keeps a copy of the mark for the open side and notes it", () => {
        const h = opened();
        const seen = mark("port", "scratch", 120, " by the fender ");
        expect(h.noteDamage("out", seen, at(10, 13, 12), "Mo")).toBe(true);
        seen.size = 999;
        expect(h.damage("out")).toEqual([mark("port", "scratch", 120, "by the fender")]);
        expect(h.damage("back")).toEqual([]);
        expect(h.timeline()[0]).toEqual({
            at: at(10, 13, 12), kind: "damage", by: "Mo", text: "out scratch on port, 120 mm (by the fender)",
        });
    });
    add("Handover.noteDamage: refuses a mark of no size, the side that is not open, and a hire not being checked", () => {
        const h = opened();
        expect(h.noteDamage("out", mark("port", "scratch", 0), at(10, 13, 12), "Mo")).toBe(false);
        expect(h.noteDamage("back", mark("port", "scratch", 50), at(10, 13, 12), "Mo")).toBe(false);
        expect(h.timeline()).toHaveLength(1);
        expect(fresh().noteDamage("out", mark("port", "scratch", 50), at(10, 13), "Mo")).toBe(false);
        expect(gone().noteDamage("back", mark("port", "scratch", 50), at(11, 9), "Mo")).toBe(false);
    });
    add("Handover.noteDamage: a mark of 1 mm is kept", () => {
        const h = opened();
        expect(h.noteDamage("out", mark("roof", "burn", 1), at(10, 13, 12), "Mo")).toBe(true);
        expect(h.damage("out")).toEqual([mark("roof", "burn", 1)]);
    });
    add("Handover.noteDamage: the same mark may be noted twice, and both are kept", () => {
        const h = opened();
        expect(h.noteDamage("out", mark("port", "scratch", 120), at(10, 13, 12), "Mo")).toBe(true);
        expect(h.noteDamage("out", mark("port", "scratch", 120), at(10, 13, 13), "Mo")).toBe(true);
        expect(h.damage("out")).toEqual([mark("port", "scratch", 120), mark("port", "scratch", 120)]);
        expect(h.timeline()).toHaveLength(3);
    });
    add("Handover.damage: the marks in the order they were noted, as copies", () => {
        const b = back();
        b.noteDamage("back", mark("stern", "dent", 30), at(17, 9, 6), "Ines");
        b.noteDamage("back", mark("bow", "scratch", 60), at(17, 9, 7), "Ines");
        const got = b.damage("back");
        expect(got).toEqual([mark("stern", "dent", 30), mark("bow", "scratch", 60)]);
        got[0].size = 1;
        got.pop();
        expect(b.damage("back")).toEqual([mark("stern", "dent", 30), mark("bow", "scratch", 60)]);
    });
    add("Handover.damage: each side has its own marks", () => {
        const h = opened();
        h.noteDamage("out", mark("port", "scratch", 120), at(10, 13, 12), "Mo");
        settleSide(h, "out", at(10, 13, 5), "Mo");
        h.read("out", reading(at(10, 13, 20), 1500, 12034), "Mo");
        h.release(at(10, 13, 40), "Mo");
        h.takeBack(at(17, 9), "Ines");
        h.noteDamage("back", mark("stern", "dent", 30), at(17, 9, 6), "Ines");
        expect(h.damage("out")).toEqual([mark("port", "scratch", 120)]);
        expect(h.damage("back")).toEqual([mark("stern", "dent", 30)]);
    });
    add("Handover.dropDamage: strikes out the mark at that place, counting from 0, and notes it", () => {
        const h = opened();
        h.noteDamage("out", mark("port", "scratch", 120), at(10, 13, 12), "Mo");
        h.noteDamage("out", mark("roof", "crack", 8, "by the vent"), at(10, 13, 13), "Mo");
        h.noteDamage("out", mark("stern", "dent", 30), at(10, 13, 14), "Mo");
        expect(h.dropDamage("out", 1, at(10, 13, 16), "Mo")).toBe(true);
        expect(h.damage("out")).toEqual([mark("port", "scratch", 120), mark("stern", "dent", 30)]);
        expect(h.timeline()[0]).toEqual({
            at: at(10, 13, 16), kind: "damage", by: "Mo", text: "out struck out: crack on roof, 8 mm (by the vent)",
        });
        expect(h.dropDamage("out", 0, at(10, 13, 17), "Mo")).toBe(true);
        expect(h.damage("out")).toEqual([mark("stern", "dent", 30)]);
    });
    add("Handover.dropDamage: refuses a place that holds no mark, and the side that is not open", () => {
        const h = opened();
        h.noteDamage("out", mark("port", "scratch", 120), at(10, 13, 12), "Mo");
        h.noteDamage("out", mark("stern", "dent", 30), at(10, 13, 14), "Mo");
        expect(h.dropDamage("out", 2, at(10, 13, 16), "Mo")).toBe(false);
        expect(h.dropDamage("out", -1, at(10, 13, 16), "Mo")).toBe(false);
        expect(h.dropDamage("out", 0.5, at(10, 13, 16), "Mo")).toBe(false);
        expect(h.dropDamage("back", 0, at(10, 13, 16), "Mo")).toBe(false);
        expect(h.damage("out")).toHaveLength(2);
        expect(h.timeline()).toHaveLength(3);
    });
    add("Handover.dropDamage: refused once that side's paperwork is closed, and the marks stay", () => {
        const h = opened();
        h.noteDamage("out", mark("port", "scratch", 120), at(10, 13, 12), "Mo");
        settleSide(h, "out", at(10, 13, 5), "Mo");
        h.read("out", reading(at(10, 13, 20), 1500, 12034), "Mo");
        h.release(at(10, 13, 40), "Mo");
        expect(h.dropDamage("out", 0, at(11, 9), "Mo")).toBe(false);
        h.takeBack(at(17, 9), "Ines");
        expect(h.dropDamage("out", 0, at(17, 9, 5), "Ines")).toBe(false);
        expect(h.damage("out")).toEqual([mark("port", "scratch", 120)]);
        h.noteDamage("back", mark("stern", "dent", 30), at(17, 9, 6), "Ines");
        expect(h.dropDamage("back", 0, at(17, 9, 7), "Ines")).toBe(true);
        expect(h.damage("back")).toEqual([]);
        expect(h.damage("out")).toEqual([mark("port", "scratch", 120)]);
        expect(h.timeline()).toHaveLength(12);
    });

    // ------------------------------------------------------------------------------------------ out and back
    add("Handover.release: the boat goes out once the out list is ready and the gauges are read", () => {
        const h = opened();
        settleSide(h, "out", at(10, 13, 5), "Mo");
        h.read("out", reading(at(10, 13, 20), 1500, 12034), "Mo");
        expect(h.release(at(10, 13, 40), " Mo")).toBe(true);
        expect(h.phase).toBe("out");
        expect(h.outAt).toBe(at(10, 13, 40));
        expect(h.backAt).toBe(-1);
        expect(h.timeline()[0]).toEqual({ at: at(10, 13, 40), kind: "released", by: "Mo", text: "" });
    });
    add("Handover.release: refused while the gauges are unread", () => {
        const h = opened();
        settleSide(h, "out", at(10, 13, 5), "Mo");
        expect(h.release(at(10, 13, 40), "Mo")).toBe(false);
        expect(h.phase).toBe("checking");
        expect(h.outAt).toBe(-1);
        expect(h.timeline()).toHaveLength(6);
    });
    add("Handover.release: refused while an item that must be settled is todo or at fault", () => {
        const h = opened();
        h.read("out", reading(at(10, 13, 20), 1500, 12034), "Mo");
        for (const code of ["KEYS", "GAS", "SAFETY", "INVENTORY"]) h.tick("out", code, "ok", at(10, 13, 5), "Mo");
        expect(h.release(at(10, 13, 40), "Mo")).toBe(false);
        h.tick("out", "HELM", "fault", at(10, 13, 30), "Mo", "party will not take the lesson");
        expect(h.release(at(10, 13, 40), "Mo")).toBe(false);
        expect(h.phase).toBe("checking");
        h.tick("out", "HELM", "na", at(10, 13, 35), "Mo", "licensed skipper");
        expect(h.release(at(10, 13, 40), "Mo")).toBe(true);
    });
    add("Handover.release: a big boat waits for its second steerer", () => {
        const h = opened(fresh(bittern));
        h.read("out", reading(at(10, 13, 20), 1500, 12034, 8, 3), "Mo");
        for (const code of ["KEYS", "GAS", "SAFETY", "HELM", "INVENTORY"]) h.tick("out", code, "ok", at(10, 13, 5), "Mo");
        expect(h.release(at(10, 13, 40), "Mo")).toBe(false);
        h.tick("out", "CREW", "ok", at(10, 13, 30), "Mo");
        expect(h.release(at(10, 13, 40), "Mo")).toBe(true);
    });
    add("Handover.release: refused unless the hire is being checked", () => {
        expect(fresh().release(at(10, 13, 40), "Mo")).toBe(false);
        const g = gone();
        expect(g.release(at(10, 15), "Mo")).toBe(false);
        expect(g.outAt).toBe(at(10, 13, 40));
        expect(g.timeline()).toHaveLength(8);
    });
    add("Handover.release: an item that need not be settled does not hold the boat, whatever its state", () => {
        const h = opened();
        settleSide(h, "out", at(10, 13, 5), "Mo");
        h.tick("out", "WATER", "fault", at(10, 13, 6), "Mo", "tap drips");
        h.read("out", reading(at(10, 13, 20), 1500, 12034), "Mo");
        expect(h.release(at(10, 13, 40), "Mo")).toBe(true);
        expect(h.phase).toBe("out");
    });
    add("Handover.release: a reading with every gauge unread is enough, so long as it has a time", () => {
        const h = opened();
        settleSide(h, "out", at(10, 13, 5), "Mo");
        const bare = { at: at(10, 13, 20), fuel: mod.UNREAD, engine: mod.UNREAD, water: mod.UNREAD, gas: mod.UNREAD };
        expect(h.read("out", bare, "Mo")).toBe(true);
        expect(h.release(at(10, 13, 40), "Mo")).toBe(true);
        expect(h.phase).toBe("out");
    });
    add("Handover.release: the boat may be let go at a time before the reading's, and goes at that time", () => {
        const h = opened();
        settleSide(h, "out", at(10, 13, 5), "Mo");
        h.read("out", reading(at(10, 13, 20), 1500, 12034), "Mo");
        expect(h.release(at(10, 13, 10), "Mo")).toBe(true);
        expect(h.outAt).toBe(at(10, 13, 10));
        expect(h.timeline()[0]).toEqual({ at: at(10, 13, 10), kind: "released", by: "Mo", text: "" });
    });
    add("Handover.takeBack: the boat is back, and within the grace the timeline says on time", () => {
        const h = gone();
        expect(h.takeBack(DUE_BACK + 20, "Ines")).toBe(true);
        expect(h.phase).toBe("returned");
        expect(h.backAt).toBe(DUE_BACK + 20);
        expect(h.outAt).toBe(at(10, 13, 40));
        expect(h.timeline()[0]).toEqual({ at: DUE_BACK + 20, kind: "returned", by: "Ines", text: "on time" });
    });
    add("Handover.takeBack: after the grace the timeline gives the minutes from the time due", () => {
        const h = gone();
        h.takeBack(DUE_BACK + 21, "Ines");
        expect(h.timeline()[0].text).toBe("21 min late");
        const later = gone();
        later.takeBack(DUE_BACK + 95, "Ines");
        expect(later.timeline()[0].text).toBe("95 min late");
    });
    add("Handover.takeBack: refused unless the boat is out, and refused before the time it went", () => {
        expect(fresh().takeBack(at(17, 9), "Ines")).toBe(false);
        expect(opened().takeBack(at(17, 9), "Ines")).toBe(false);
        const h = gone();
        expect(h.takeBack(at(10, 13, 39), "Ines")).toBe(false);
        expect(h.phase).toBe("out");
        expect(h.backAt).toBe(-1);
        expect(h.takeBack(at(10, 13, 40), "Ines")).toBe(true);
        expect(h.takeBack(at(10, 14), "Ines")).toBe(false);
        expect(h.timeline()).toHaveLength(9);
    });

    // ------------------------------------------------------------------------------------------ warnings, extras
    add("Handover.warnings: before anything is read, the items that need not be done and are not", () => {
        expect(fresh().warnings()).toEqual(["WATER not done", "WEED not done"]);
        const h = opened();
        h.tick("out", "WATER", "ok", at(10, 13, 5), "Mo");
        h.tick("out", "WEED", "na", at(10, 13, 5), "Mo");
        expect(h.warnings()).toEqual([]);
    });
    add("Handover.warnings: low fuel, water, gas, then the items, then the faults that do not stop the boat", () => {
        const h = opened();
        h.read("out", reading(at(10, 13, 20), 449, 12034, 7, 1), "Mo");
        h.tick("out", "WEED", "fault", at(10, 13, 22), "Mo", "hatch seized");
        h.tick("out", "GAS", "fault", at(10, 13, 23), "Mo", "regulator hisses");
        expect(h.warnings()).toEqual([
            "fuel under a quarter", "water tank not full", "gas: 1 of 2 bottles", "WATER not done", "WEED: hatch seized",
        ]);
    });
    add("Handover.warnings: a quarter of a tank, a full water tank and every bottle give no warning", () => {
        const h = opened();
        h.read("out", reading(at(10, 13, 20), 450, 12034, 8, 2), "Mo");
        expect(h.warnings()).toEqual(["WATER not done", "WEED not done"]);
        h.read("out", { at: at(10, 13, 25), fuel: mod.UNREAD, engine: 12034, water: mod.UNREAD, gas: mod.UNREAD }, "Mo");
        expect(h.warnings()).toEqual(["WATER not done", "WEED not done"]);
    });
    add("Handover.warnings: an empty tank and no gas bottle aboard are warned of", () => {
        const h = opened();
        h.read("out", reading(at(10, 13, 20), 0, 12034, 8, 0), "Mo");
        expect(h.warnings()).toEqual([
            "fuel under a quarter", "gas: 0 of 2 bottles", "WATER not done", "WEED not done",
        ]);
    });
    add("Handover.warnings: the same once the boat has gone, and once it is back", () => {
        const want = [
            "fuel under a quarter", "water tank not full", "gas: 1 of 2 bottles", "WATER not done", "WEED not done",
        ];
        const h = gone(fresh(), reading(at(10, 13, 20), 449, 12034, 7, 1));
        expect(h.phase).toBe("out");
        expect(h.warnings()).toEqual(want);
        h.takeBack(at(17, 9), "Ines");
        expect(h.warnings()).toEqual(want);
    });
    add("Handover.addExtra: a charge by hand while the boat is out, kept and noted", () => {
        const h = gone();
        expect(h.addExtra(1850, "  lost windlass ", at(12, 10), "Mo")).toBe(true);
        expect(h.charges()).toEqual([charge("extra", 1850, "lost windlass")]);
        expect(h.timeline()[0]).toEqual({ at: at(12, 10), kind: "extra", by: "Mo", text: "£18.50 lost windlass" });
        expect(h.addExtra(700, "", at(12, 11), "Mo")).toBe(true);
        expect(h.timeline()[0].text).toBe("£7.00");
        expect(h.charges()).toEqual([charge("extra", 1850, "lost windlass"), charge("extra", 700, "")]);
    });
    add("Handover.addExtra: also once the boat is back, and in no other phase", () => {
        expect(back().addExtra(500, "mooring pin", at(17, 9, 20), "Ines")).toBe(true);
        expect(fresh().addExtra(500, "mooring pin", at(9, 9), "Mo")).toBe(false);
        expect(opened().addExtra(500, "mooring pin", at(10, 13, 5), "Mo")).toBe(false);
        const s = shut();
        expect(s.addExtra(500, "mooring pin", at(17, 10), "Ines")).toBe(false);
        expect(s.timeline()).toHaveLength(15);
    });
    add("Handover.addExtra: the pence must be a whole number above 0", () => {
        const h = gone();
        expect(h.addExtra(0, "nothing", at(12, 10), "Mo")).toBe(false);
        expect(h.addExtra(-500, "credit", at(12, 10), "Mo")).toBe(false);
        expect(h.addExtra(12.5, "half pence", at(12, 10), "Mo")).toBe(false);
        expect(h.charges()).toEqual([]);
        expect(h.timeline()).toHaveLength(8);
    });
    add("Handover.addExtra: a charge of a penny, or of a few pence, is taken", () => {
        const h = gone();
        expect(h.addExtra(1, "sticker", at(12, 10), "Mo")).toBe(true);
        expect(h.addExtra(50, "lost mop", at(12, 11), "Mo")).toBe(true);
        expect(h.charges()).toEqual([charge("extra", 1, "sticker"), charge("extra", 50, "lost mop")]);
        expect(h.timeline()[0].text).toBe("£0.50 lost mop");
    });
    add("Handover.addExtra: refused for a hire that was called off", () => {
        const off = fresh();
        off.cancel(at(9, 10), "Mo", "party withdrew");
        expect(off.addExtra(500, "mooring pin", at(9, 11), "Mo")).toBe(false);
        const late = opened();
        late.cancel(at(10, 13, 30), "Mo", "engine would not start");
        expect(late.addExtra(500, "mooring pin", at(10, 13, 35), "Mo")).toBe(false);
        expect(off.charges()).toEqual([]);
        expect(late.charges()).toEqual([]);
        expect(off.timeline()).toHaveLength(1);
        expect(late.timeline()).toHaveLength(2);
    });
    add("Handover.cancel: a hire that has not gone out is called off, with the reason trimmed", () => {
        const h = fresh();
        expect(h.cancel(at(9, 10), "Mo", "  party withdrew ")).toBe(true);
        expect(h.phase).toBe("void");
        expect(h.timeline()).toEqual([{ at: at(9, 10), kind: "void", by: "Mo", text: "party withdrew" }]);
        const c = opened();
        expect(c.cancel(at(10, 13, 30), "Mo", "engine would not start")).toBe(true);
        expect(c.phase).toBe("void");
    });
    add("Handover.cancel: refused once the boat is out, and refused twice", () => {
        const g = gone();
        expect(g.cancel(at(11, 9), "Mo", "too late")).toBe(false);
        expect(g.phase).toBe("out");
        expect(back().cancel(at(17, 10), "Mo", "too late")).toBe(false);
        expect(shut().cancel(at(17, 10), "Mo", "too late")).toBe(false);
        const h = fresh();
        h.cancel(at(9, 10), "Mo", "party withdrew");
        expect(h.cancel(at(9, 11), "Mo", "again")).toBe(false);
        expect(h.timeline()).toHaveLength(1);
    });
    add("Handover.cancel: a hire may be called off with no reason given", () => {
        const h = fresh();
        expect(h.cancel(at(9, 10), "Mo", "")).toBe(true);
        expect(h.phase).toBe("void");
        expect(h.timeline()).toEqual([{ at: at(9, 10), kind: "void", by: "Mo", text: "" }]);
        const c = opened();
        expect(c.cancel(at(10, 13, 30), "Mo", "  ")).toBe(true);
        expect(c.timeline()[0].text).toBe("");
    });

    // ------------------------------------------------------------------------------------------ charges
    add("Handover.charges: nothing but the extras until the boat is back", () => {
        const h = gone();
        expect(h.charges()).toEqual([]);
        expect(opened().charges()).toEqual([]);
    });
    add("Handover.charges: fuel by the dipstick, a started litre charged", () => {
        const b = back();
        b.read("back", reading(at(17, 9, 10), 1100, 12290), "Ines");
        expect(b.charges()).toEqual([charge("fuel", 6720, "40.0 L by dipstick")]);
        b.read("back", reading(at(17, 9, 12), 1095, 12290), "Ines");
        expect(b.charges()).toEqual([charge("fuel", 6888, "40.5 L by dipstick")]);
    });
    add("Handover.charges: no fuel line when the tank came back as full, or when nothing was read", () => {
        const b = back();
        expect(b.charges()).toEqual([]);
        b.read("back", reading(at(17, 9, 10), 1600, 12290), "Ines");
        expect(b.charges()).toEqual([]);
    });
    add("Handover.charges: a part of a litre burned is charged as a whole litre", () => {
        const b = back();
        b.read("back", reading(at(17, 9, 10), 1496, 12290), "Ines");
        expect(b.charges()).toEqual([charge("fuel", 168, "0.4 L by dipstick")]);
        b.read("back", reading(at(17, 9, 12), 1499, 12290), "Ines");
        expect(b.charges()).toEqual([charge("fuel", 168, "0.1 L by dipstick")]);
    });
    add("Handover.charges: fuel by the engine counter when a dipstick figure is missing", () => {
        const b = back();
        b.read("back", reading(at(17, 9, 10), mod.UNREAD, 12290), "Ines");
        expect(b.charges()).toEqual([charge("fuel", 6048, "35.8 L by engine hours")]);
        const blind = back(fresh(), at(17, 9), reading(at(10, 13, 20), mod.UNREAD, mod.UNREAD));
        blind.read("back", reading(at(17, 9, 10), 1100, 12290), "Ines");
        expect(blind.charges()).toEqual([]);
    });
    add("Handover.charges: a gas bottle that was emptied, of the bottles the boat went out with", () => {
        const b = back();
        b.read("back", reading(at(17, 9, 10), 1500, 12290, 3, 0), "Ines");
        expect(b.charges()).toEqual([charge("gas", 7900, "2 of 2 bottles")]);
        const one = back(fresh(bittern), at(17, 9), reading(at(10, 13, 20), 1500, 12034, 8, 3));
        one.read("back", reading(at(17, 9, 10), 1500, 12290, 3, 2), "Ines");
        expect(one.charges()).toEqual([charge("gas", 3950, "1 of 3 bottles")]);
        const short = back(fresh(bittern), at(17, 9), reading(at(10, 13, 20), 1500, 12034, 8, 2));
        short.read("back", reading(at(17, 9, 10), 1500, 12290, 3, 1), "Ines");
        expect(short.charges()).toEqual([charge("gas", 3950, "1 of 2 bottles")]);
    });
    add("Handover.charges: lateness from the first minute after the grace", () => {
        expect(back(fresh(), DUE_BACK + 20).charges()).toEqual([]);
        expect(back(fresh(), DUE_BACK + 21).charges()).toEqual([charge("late", 1200, "21 min late")]);
        expect(back(fresh(), DUE_BACK + 95).charges()).toEqual([charge("late", 4800, "95 min late")]);
    });
    add("Handover.charges: damage that is new, in the order of the zones, and only marks that cost something", () => {
        const h = opened();
        h.noteDamage("out", mark("port", "scratch", 100, "old"), at(10, 13, 12), "Mo");
        settleSide(h, "out", at(10, 13, 5), "Mo");
        h.read("out", reading(at(10, 13, 20), 1500, 12034), "Mo");
        h.release(at(10, 13, 40), "Mo");
        h.takeBack(at(17, 9), "Ines");
        h.noteDamage("back", mark("port", "scratch", 100), at(17, 9, 5), "Ines");
        h.noteDamage("back", mark("stern", "dent", 30, "rudder post"), at(17, 9, 6), "Ines");
        h.noteDamage("back", mark("cabin", "burn", 3), at(17, 9, 7), "Ines");
        h.noteDamage("back", mark("bow", "scratch", 60), at(17, 9, 8), "Ines");
        expect(h.charges()).toEqual([
            charge("damage", 4500, "scratch on bow, 60 mm"),
            charge("damage", 6000, "dent on stern, 30 mm (rudder post)"),
        ]);
        expect(h.damage("back")).toHaveLength(4);
        expect(h.damage("back")[0]).toEqual(mark("port", "scratch", 100));
    });
    add("Handover.charges: a mark that grew is charged at the size it grew by", () => {
        const h = opened();
        h.noteDamage("out", mark("port", "scratch", 100), at(10, 13, 12), "Mo");
        settleSide(h, "out", at(10, 13, 5), "Mo");
        h.read("out", reading(at(10, 13, 20), 1500, 12034), "Mo");
        h.release(at(10, 13, 40), "Mo");
        h.takeBack(at(17, 9), "Ines");
        h.noteDamage("back", mark("port", "scratch", 160), at(17, 9, 5), "Ines");
        expect(h.charges()).toEqual([charge("damage", 4500, "scratch on port, 60 mm")]);
    });
    add("Handover.charges: cleaning when the boat was not left clean, with the note of the fault", () => {
        const b = back();
        b.tick("back", "CLEAN", "fault", at(17, 9, 5), "Ines", "galley greasy");
        expect(b.charges()).toEqual([charge("cleaning", 6000, "galley greasy")]);
        b.tick("back", "CLEAN", "ok", at(17, 9, 6), "Ines");
        expect(b.charges()).toEqual([]);
        b.tick("back", "BILGE", "fault", at(17, 9, 7), "Ines", "an inch of water");
        expect(b.charges()).toEqual([]);
    });
    add("Handover.charges: every kind together comes in the order of CHARGE_ORDER, as lines of its own", () => {
        const h = gone();
        h.addExtra(1850, "lost windlass", at(12, 10), "Mo");
        h.takeBack(DUE_BACK + 45, "Ines");
        h.tick("back", "CLEAN", "fault", DUE_BACK + 50, "Ines", "galley greasy");
        h.noteDamage("back", mark("stern", "dent", 30), DUE_BACK + 51, "Ines");
        h.read("back", reading(DUE_BACK + 55, 1100, 12290, 3, 1), "Ines");
        const want = [
            charge("fuel", 6720, "40.0 L by dipstick"), charge("gas", 3950, "1 of 2 bottles"),
            charge("late", 2400, "45 min late"), charge("damage", 6000, "dent on stern, 30 mm"),
            charge("cleaning", 6000, "galley greasy"), charge("extra", 1850, "lost windlass"),
        ];
        const got = h.charges();
        expect(got).toEqual(want);
        got[0].pence = 1;
        got[5].note = "changed";
        got.pop();
        expect(h.charges()).toEqual(want);
    });
    add("Handover.charges: the same once the hire is closed", () => {
        expect(shut().charges()).toEqual([charge("fuel", 6720, "40.0 L by dipstick")]);
    });

    // ------------------------------------------------------------------------------------------ closing
    add("Handover.close: settles against the deposit and notes the refund", () => {
        const b = back();
        const result = finish(b, reading(at(17, 9, 10), 1100, 12290, 3, 2), at(17, 9, 30));
        expect(result).toEqual({ chargedPence: 6720, keptPence: 6720, refundPence: 13280, owedPence: 0 });
        expect(b.phase).toBe("closed");
        expect(b.timeline()[0]).toEqual({ at: at(17, 9, 30), kind: "closed", by: "Ines", text: "refund £132.80" });
        expect(b.timeline()).toHaveLength(15);
    });
    add("Handover.close: notes what is owed when the deposit does not cover the charges", () => {
        const b = back(fresh(kestrel, 5000));
        const result = finish(b, reading(at(17, 9, 10), 1100, 12290, 3, 2), at(17, 9, 30));
        expect(result).toEqual({ chargedPence: 6720, keptPence: 5000, refundPence: 0, owedPence: 1720 });
        expect(b.timeline()[0].text).toBe("owes £17.20");
        const exact = back(fresh(kestrel, 6720));
        finish(exact, reading(at(17, 9, 10), 1100, 12290, 3, 2), at(17, 9, 30));
        expect(exact.timeline()[0].text).toBe("refund £0.00");
    });
    add("Handover.close: gives nothing and changes nothing until the back list is ready and the gauges are read", () => {
        const b = back();
        settleSide(b, "back", at(17, 9, 5), "Ines");
        expect(b.close(at(17, 9, 30), "Ines")).toBeUndefined();
        expect(b.phase).toBe("returned");
        expect(b.timeline()).toHaveLength(13);
        const c = back();
        c.read("back", reading(at(17, 9, 10), 1100, 12290), "Ines");
        for (const code of ["KEYS", "INVENTORY", "PUMP"]) c.tick("back", code, "ok", at(17, 9, 5), "Ines");
        expect(c.close(at(17, 9, 30), "Ines")).toBeUndefined();
        c.tick("back", "MOORED", "fault", at(17, 9, 20), "Ines", "left on the towpath side");
        expect(c.close(at(17, 9, 30), "Ines")).toBeUndefined();
        expect(c.phase).toBe("returned");
        c.tick("back", "MOORED", "ok", at(17, 9, 25), "Ines");
        expect(c.close(at(17, 9, 30), "Ines")).toEqual({
            chargedPence: 6720, keptPence: 6720, refundPence: 13280, owedPence: 0,
        });
    });
    add("Handover.close: refused unless the boat is back, and refused twice", () => {
        expect(fresh().close(at(17, 9), "Ines")).toBeUndefined();
        expect(gone().close(at(17, 9), "Ines")).toBeUndefined();
        const s = shut();
        expect(s.close(at(17, 10), "Ines")).toBeUndefined();
        expect(s.phase).toBe("closed");
        expect(s.timeline()).toHaveLength(15);
    });
    add("Handover.close: a back reading with no fuel or engine figure is enough, so long as it has a time", () => {
        const b = back();
        settleSide(b, "back", at(17, 9, 5), "Ines");
        const bare = { at: at(17, 9, 10), fuel: mod.UNREAD, engine: mod.UNREAD, water: 3, gas: 2 };
        expect(b.read("back", bare, "Ines")).toBe(true);
        expect(b.close(at(17, 9, 30), "Ines")).toEqual({
            chargedPence: 0, keptPence: 0, refundPence: 20000, owedPence: 0,
        });
        expect(b.phase).toBe("closed");
    });
    add("Handover.close: a debt of a penny, or of under a pound, is noted as owed", () => {
        const b = back(fresh(kestrel, 6670));
        expect(finish(b, reading(at(17, 9, 10), 1100, 12290, 3, 2), at(17, 9, 30))).toEqual({
            chargedPence: 6720, keptPence: 6670, refundPence: 0, owedPence: 50,
        });
        expect(b.timeline()[0].text).toBe("owes £0.50");
        const c = back(fresh(kestrel, 6719));
        finish(c, reading(at(17, 9, 10), 1100, 12290, 3, 2), at(17, 9, 30));
        expect(c.timeline()[0].text).toBe("owes £0.01");
    });
    add("Handover.close: the hire may be closed at a time before the boat came back", () => {
        const b = back(fresh(), at(17, 9));
        expect(finish(b, reading(at(17, 9, 10), 1100, 12290, 3, 2), at(17, 8, 50))).toEqual({
            chargedPence: 6720, keptPence: 6720, refundPence: 13280, owedPence: 0,
        });
        expect(b.phase).toBe("closed");
        expect(b.timeline()[0]).toEqual({ at: at(17, 8, 50), kind: "closed", by: "Ines", text: "refund £132.80" });
    });

    // ------------------------------------------------------------------------------------------ looking
    add("Handover.checklist: gives a copy, items and all", () => {
        const h = opened();
        const got = h.checklist("out");
        got.items[0].state = "ok";
        got.items.pop();
        expect(h.checklist("out")).toEqual(mod.checklistFor("out", 4));
        expect(h.checklist("back").side).toBe("back");
    });
    add("Handover.checklist: each side has its own list", () => {
        const b = back();
        b.tick("back", "KEYS", "ok", at(17, 9, 5), "Ines");
        expect(b.checklist("back").items[0].state).toBe("ok");
        expect(mod.progress(b.checklist("out"))).toBe("5/7");
        expect(mod.progress(b.checklist("back"))).toBe("1/6");
    });
    add("Handover.timeline: the newest event comes first", () => {
        expect(kinds(shut())).toEqual([
            "closed", "read", "ticked", "ticked", "ticked", "ticked", "returned", "released", "read",
            "ticked", "ticked", "ticked", "ticked", "ticked", "opened",
        ]);
        const g = gone();
        expect(g.timeline()[0].kind).toBe("released");
        expect(g.timeline()[7]).toEqual({ at: at(10, 13), kind: "opened", by: "Mo", text: "" });
        expect(g.timeline().slice(2, 7).map((each) => each.text)).toEqual([
            "out INVENTORY ok", "out HELM ok", "out SAFETY ok", "out GAS ok", "out KEYS ok",
        ]);
    });
    add("Handover.timeline: an event goes in front even when its time is earlier than the one before", () => {
        const h = opened();
        h.tick("out", "KEYS", "ok", at(10, 13, 30), "Mo");
        h.read("out", reading(at(10, 12, 50), 1500, 12034), "Mo");
        h.tick("out", "GAS", "ok", at(10, 13, 10), "Mo");
        expect(h.timeline().map((each) => each.at)).toEqual([at(10, 13, 10), at(10, 12, 50), at(10, 13, 30), at(10, 13)]);
    });
    add("Handover.timeline: gives copies", () => {
        const h = opened();
        const got = h.timeline();
        got[0].text = "changed";
        got.push({ at: 0, kind: "closed", by: "x", text: "" });
        expect(h.timeline()).toEqual([{ at: at(10, 13), kind: "opened", by: "Mo", text: "" }]);
    });
    add("Handover.lastEvent: the newest event, or the newest of a kind", () => {
        const h = opened();
        h.read("out", reading(at(10, 13, 10), 1500, 12034), "Mo");
        h.read("out", reading(at(10, 13, 15), 1480, 12034), "Mo");
        h.tick("out", "KEYS", "ok", at(10, 13, 20), "Mo");
        expect(h.lastEvent()).toEqual({ at: at(10, 13, 20), kind: "ticked", by: "Mo", text: "out KEYS ok" });
        expect(h.lastEvent("read")).toEqual({
            at: at(10, 13, 15), kind: "read", by: "Mo", text: "out fuel 148.0 L, engine 1203.4 h",
        });
        expect(h.lastEvent("opened")).toEqual({ at: at(10, 13), kind: "opened", by: "Mo", text: "" });
    });
    add("Handover.lastEvent: undefined when there is none, and what it gives is a copy", () => {
        expect(fresh().lastEvent()).toBeUndefined();
        const h = opened();
        expect(h.lastEvent("released")).toBeUndefined();
        const got = h.lastEvent();
        if (got) got.text = "changed";
        expect(h.lastEvent()).toEqual({ at: at(10, 13), kind: "opened", by: "Mo", text: "" });
    });
    add("Handover.lastEvent: goes by when an event was added, not by the time written on it", () => {
        const h = opened();
        h.tick("out", "KEYS", "ok", at(10, 13, 30), "Mo");
        h.read("out", reading(at(10, 12, 50), 1500, 12034), "Mo");
        expect(h.lastEvent()).toEqual({
            at: at(10, 12, 50), kind: "read", by: "Mo", text: "out fuel 150.0 L, engine 1203.4 h",
        });
        h.tick("out", "GAS", "ok", at(10, 13, 10), "Mo");
        expect(h.lastEvent("ticked")).toEqual({ at: at(10, 13, 10), kind: "ticked", by: "Mo", text: "out GAS ok" });
    });
    add("Handover.headline: when the boat is due out, until it goes; then when it is due back", () => {
        expect(fresh().headline()).toBe("KF-12 Kestrel: due out day 10 14:00");
        expect(opened().headline()).toBe("KF-12 Kestrel: due out day 10 14:00");
        expect(gone().headline()).toBe("KF-12 Kestrel: due back day 17 09:30");
    });
    add("Handover.headline: back with its checks, closed, and called off", () => {
        const b = back();
        expect(b.headline()).toBe("KF-12 Kestrel: back day 17 09:00, checks 0/6");
        b.tick("back", "CLEAN", "fault", at(17, 9, 5), "Ines", "galley greasy");
        b.tick("back", "KEYS", "ok", at(17, 9, 6), "Ines");
        expect(b.headline()).toBe("KF-12 Kestrel: back day 17 09:00, checks 1/6, 1 fault");
        expect(shut().headline()).toBe("KF-12 Kestrel: closed");
        const off = fresh(bittern, 27500, "kf-30");
        off.cancel(at(9, 10), "Mo", "party withdrew");
        expect(off.headline()).toBe("KF-30 Bittern: called off");
    });
    add("Handover.headline: a hire called off while it was being checked is called off", () => {
        const h = opened();
        h.cancel(at(10, 13, 30), "Mo", "engine would not start");
        expect(h.headline()).toBe("KF-12 Kestrel: called off");
    });
    add("Handover.report: a hire that is only booked", () => {
        expect(fresh().report()).toEqual([
            "KF-12 Kestrel: booked",
            "due out day 10 14:00, went --",
            "due back day 17 09:30, came --",
            "checks: out 0/7, back 0/6",
            "events: 0",
        ]);
    });
    add("Handover.report: a closed hire with its charge and the total", () => {
        expect(shut().report()).toEqual([
            "KF-12 Kestrel: closed",
            "due out day 10 14:00, went day 10 13:40",
            "due back day 17 09:30, came day 17 09:00",
            "checks: out 5/7, back 4/6",
            "fuel £67.20 40.0 L by dipstick",
            "total £67.20",
            "events: 15",
        ]);
    });
    add("Handover.report: a line for each charge, and no space after a charge with no note", () => {
        const h = gone();
        h.addExtra(1850, "", at(12, 10), "Mo");
        h.takeBack(DUE_BACK + 45, "Ines");
        h.tick("back", "CLEAN", "fault", DUE_BACK + 50, "Ines", "galley greasy");
        h.noteDamage("back", mark("stern", "dent", 30), DUE_BACK + 51, "Ines");
        expect(finish(h, reading(DUE_BACK + 60, 1100, 12290, 3, 1), DUE_BACK + 70)).toEqual({
            chargedPence: 26920, keptPence: 20000, refundPence: 0, owedPence: 6920,
        });
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
        ]);
    });

    // ------------------------------------------------------------------------------------------ the day's work
    const hire = (ref: string, boat: BoatSpec, dueOut: number, dueBack: number, deposit = 20000): Hand => (
        new mod.Handover(ref, boat, dueOut, dueBack, deposit)
    );
    // The hire taken to "out", with the times of its own dates.
    const sail = (h: Hand): Hand => {
        h.open(h.dueOutAt - 60, "Mo");
        settleSide(h, "out", h.dueOutAt - 50, "Mo");
        h.read("out", reading(h.dueOutAt - 40, 1500, 12034, 8, 2), "Mo");
        h.release(h.dueOutAt - 10, "Mo");
        return h;
    };
    const land = (h: Hand, backAt: number): Hand => {
        sail(h);
        h.takeBack(backAt, "Ines");
        return h;
    };
    const wind = (h: Hand, backAt: number, backFuel = 1100): Hand => {
        land(h, backAt);
        finish(h, reading(backAt + 10, backFuel, 12290, 3, 2), backAt + 30);
        return h;
    };
    const refs = (list: Hand[]): string[] => list.map((each) => each.ref);

    add("dueBack: the boats that are out and due back on the day, the soonest first", () => {
        const a = sail(hire("a-1", kestrel, at(3, 14), at(10, 10)));
        const b = sail(hire("b-2", bittern, at(3, 15), at(10, 9)));
        const c = sail(hire("c-3", kestrel, at(3, 14), at(11, 9)));
        const d = sail(hire("d-4", kestrel, at(3, 14), at(10, 23, 59)));
        const list = [a, b, c, d];
        expect(refs(mod.dueBack(list, 10))).toEqual(["B-2", "A-1", "D-4"]);
        expect(refs(mod.dueBack(list, 11))).toEqual(["C-3"]);
        expect(mod.dueBack(list, 9)).toEqual([]);
        expect(refs(list)).toEqual(["A-1", "B-2", "C-3", "D-4"]);
    });
    add("dueBack: a boat that has not gone, or is back already, is left out", () => {
        const booked = hire("a-1", kestrel, at(3, 14), at(10, 10));
        const checking = hire("b-2", kestrel, at(3, 14), at(10, 10));
        checking.open(at(3, 13), "Mo");
        const landed = land(hire("c-3", kestrel, at(3, 14), at(10, 10)), at(10, 9));
        const out = sail(hire("d-4", kestrel, at(3, 14), at(10, 10)));
        expect(refs(mod.dueBack([booked, checking, landed, out], 10))).toEqual(["D-4"]);
    });
    add("overdue: the boats still out when their grace has run out", () => {
        const a = sail(hire("a-1", kestrel, at(3, 14), at(10, 10)));
        expect(mod.overdue([a], at(10, 10))).toEqual([]);
        expect(mod.overdue([a], at(10, 10, 20))).toEqual([]);
        expect(refs(mod.overdue([a], at(10, 10, 21)))).toEqual(["A-1"]);
    });
    add("overdue: the longest overdue first, and only boats that are out", () => {
        const a = sail(hire("a-1", kestrel, at(3, 14), at(10, 10)));
        const b = sail(hire("b-2", kestrel, at(3, 14), at(9, 16)));
        const c = land(hire("c-3", kestrel, at(3, 14), at(9, 9)), at(10, 11));
        const d = hire("d-4", kestrel, at(3, 14), at(9, 9));
        const list = [a, b, c, d];
        expect(refs(mod.overdue(list, at(10, 12)))).toEqual(["B-2", "A-1"]);
        expect(refs(list)).toEqual(["A-1", "B-2", "C-3", "D-4"]);
    });
    add("dueBack and overdue: boats due back at the same minute keep the order they are given in", () => {
        const z = sail(hire("z-1", kestrel, at(3, 14), at(10, 10)));
        const a = sail(hire("a-1", kestrel, at(3, 15), at(10, 10)));
        expect(refs(mod.dueBack([z, a], 10))).toEqual(["Z-1", "A-1"]);
        expect(refs(mod.dueBack([a, z], 10))).toEqual(["A-1", "Z-1"]);
        expect(refs(mod.overdue([z, a], at(10, 12)))).toEqual(["Z-1", "A-1"]);
        expect(refs(mod.overdue([a, z], at(10, 12)))).toEqual(["A-1", "Z-1"]);
    });
    add("turnaround: from the time the boat came back to the time the next party is due", () => {
        const first = land(hire("a-1", kestrel, at(3, 14), at(10, 9, 30)), at(10, 9, 5));
        const next = hire("a-2", kestrel, at(10, 14), at(17, 9, 30));
        expect(mod.turnaround(first, next)).toBe(295);
        const late = land(hire("a-3", kestrel, at(3, 14), at(10, 9, 30)), at(10, 15));
        expect(mod.turnaround(late, next)).toBe(-60);
    });
    add("turnaround: a boat that is not back yet is taken at the time it is due", () => {
        const first = sail(hire("a-1", kestrel, at(3, 14), at(10, 9, 30)));
        const next = hire("a-2", kestrel, at(10, 14), at(17, 9, 30));
        expect(mod.turnaround(first, next)).toBe(270);
        expect(mod.turnaround(hire("a-0", kestrel, at(3, 14), at(10, 16)), next)).toBe(-120);
    });
    add("daySheet: the day's returns and departures in order of time", () => {
        const list = [
            hire("a-1", kestrel, at(10, 14), at(17, 9, 30)),
            hire("b-2", bittern, at(3, 14), at(10, 9, 30)),
            hire("c-3", kestrel, at(10, 8, 45), at(10, 16, 5)),
            hire("d-4", kestrel, at(11, 14), at(18, 9, 30)),
        ];
        expect(mod.daySheet(list, 10)).toEqual([
            "08:45 out C-3 Kestrel", "09:30 back B-2 Bittern", "14:00 out A-1 Kestrel", "16:05 back C-3 Kestrel",
        ]);
        expect(mod.daySheet(list, 12)).toEqual([]);
        expect(refs(list)).toEqual(["A-1", "B-2", "C-3", "D-4"]);
    });
    add("daySheet: at the same minute a return comes before a departure, and a hire called off is left out", () => {
        const off = hire("x-9", kestrel, at(10, 10), at(17, 10));
        off.cancel(at(9, 10), "Mo", "party withdrew");
        const list = [
            hire("a-1", kestrel, at(10, 10), at(17, 10)),
            off,
            hire("b-2", bittern, at(3, 14), at(10, 10)),
            hire("c-3", kestrel, at(10, 10), at(12, 10)),
        ];
        expect(mod.daySheet(list, 10)).toEqual(["10:00 back B-2 Bittern", "10:00 out A-1 Kestrel", "10:00 out C-3 Kestrel"]);
    });
    add("daySheet: a hire is listed at the times it is due, whether it has gone, is back or is closed", () => {
        const list = [
            wind(hire("k-0", kestrel, at(3, 14), at(10, 9, 30)), at(10, 9)),
            land(hire("b-1", bittern, at(3, 14), at(10, 11)), at(10, 10, 40)),
            sail(hire("k-2", kestrel, at(10, 14), at(17, 9, 30))),
            hire("k-3", kestrel, at(4, 14), at(10, 11)),
        ];
        expect(list.map((each) => each.phase)).toEqual(["closed", "returned", "out", "booked"]);
        expect(list[2].outAt).toBe(at(10, 13, 50));
        expect(mod.daySheet(list, 10)).toEqual([
            "09:30 back K-0 Kestrel", "11:00 back B-1 Bittern", "11:00 back K-3 Kestrel", "14:00 out K-2 Kestrel",
        ]);
    });

    // ------------------------------------------------------------------------------------------ the book
    add("HandoverBook.size: 0 for a new book, and one more for each hire it takes", () => {
        const book = new mod.HandoverBook();
        expect(book.size).toBe(0);
        book.add(hire("k-1", kestrel, at(3, 14), at(10, 9, 30)));
        expect(book.size).toBe(1);
        book.add(hire("k-2", kestrel, at(10, 14), at(17, 9, 30)));
        book.add(hire("b-1", bittern, at(10, 14), at(17, 9, 30)));
        expect(book.size).toBe(3);
        expect(new mod.HandoverBook().size).toBe(0);
    });
    add("HandoverBook.size: the same after a refused add or remove, and one less after a removal", () => {
        const book = new mod.HandoverBook();
        book.add(hire("k-1", kestrel, at(3, 14), at(10, 9, 30)));
        book.add(sail(hire("k-2", kestrel, at(10, 14), at(17, 9, 30))));
        book.add(hire("K-1", bittern, at(10, 14), at(17, 9, 30)));
        book.remove("K-2");
        expect(book.size).toBe(2);
        book.remove("K-1");
        expect(book.size).toBe(1);
    });
    add("HandoverBook.size: a hire counts whatever its phase", () => {
        const book = new mod.HandoverBook();
        const off = hire("k-2", kestrel, at(10, 14), at(17, 9, 30));
        off.cancel(at(9, 10), "Mo", "party withdrew");
        book.add(off);
        book.add(wind(hire("k-0", kestrel, at(1, 14), at(3, 9, 30)), at(3, 9)));
        book.add(hire("k-3", kestrel, at(17, 14), at(24, 9, 30)));
        expect(book.size).toBe(3);
    });
    add("HandoverBook.add: keeps the hire itself, and the first hire stays when a second is refused", () => {
        const book = new mod.HandoverBook();
        const first = hire("kf-12", kestrel, at(10, 14), at(17, 9, 30));
        const second = hire("KF-12", bittern, at(11, 14), at(18, 9, 30));
        expect(book.add(first)).toBe(true);
        expect(book.add(second)).toBe(false);
        expect(book.find("KF-12")).toBe(first);
        first.open(at(10, 13), "Mo");
        expect(book.find("KF-12")?.phase).toBe("checking");
        const other = new mod.HandoverBook();
        expect(other.add(second)).toBe(true);
        expect(other.find("KF-12")).toBe(second);
    });
    add("HandoverBook.add: takes a hire, and refuses a second one with the same reference", () => {
        const book = new mod.HandoverBook();
        expect(book.size).toBe(0);
        const first = hire("kf-12", kestrel, at(10, 14), at(17, 9, 30));
        expect(book.add(first)).toBe(true);
        expect(book.add(hire(" KF-12 ", bittern, at(11, 14), at(18, 9, 30)))).toBe(false);
        expect(book.add(hire("kf-13", bittern, at(11, 14), at(18, 9, 30)))).toBe(true);
        expect(book.size).toBe(2);
        expect(book.find("KF-12")).toBe(first);
    });
    add("HandoverBook.add: a reference stays taken by a hire that was called off", () => {
        const book = new mod.HandoverBook();
        const off = hire("k-2", kestrel, at(10, 14), at(17, 9, 30));
        off.cancel(at(9, 10), "Mo", "party withdrew");
        expect(book.add(off)).toBe(true);
        expect(book.add(hire("K-2", bittern, at(11, 14), at(18, 9, 30)))).toBe(false);
        expect(book.find("k-2")).toBe(off);
        expect(book.size).toBe(1);
    });
    add("HandoverBook.find: by reference, trimmed and in any case, and undefined when it is not there", () => {
        const book = new mod.HandoverBook();
        const first = hire("kf-12", kestrel, at(10, 14), at(17, 9, 30));
        book.add(first);
        expect(book.find("  kf-12 ")).toBe(first);
        expect(book.find("KF-99")).toBeUndefined();
        expect(new mod.HandoverBook().find("KF-12")).toBeUndefined();
    });
    add("HandoverBook.find: a hire is found whatever its phase", () => {
        const book = new mod.HandoverBook();
        const closed = wind(hire("k-0", kestrel, at(1, 14), at(3, 9, 30)), at(3, 9));
        const off = hire("k-2", kestrel, at(10, 14), at(17, 9, 30));
        off.cancel(at(9, 10), "Mo", "party withdrew");
        book.add(closed);
        book.add(off);
        expect(book.find("k-0")).toBe(closed);
        expect(book.find("k-2")).toBe(off);
        expect(book.find("k-1")).toBeUndefined();
    });
    add("HandoverBook.remove: a hire that is booked or called off can go", () => {
        const book = new mod.HandoverBook();
        const off = hire("kf-13", kestrel, at(10, 14), at(17, 9, 30));
        off.cancel(at(9, 10), "Mo", "party withdrew");
        book.add(hire("kf-12", kestrel, at(10, 14), at(17, 9, 30)));
        book.add(off);
        expect(book.remove(" kf-12")).toBe(true);
        expect(book.remove("KF-13")).toBe(true);
        expect(book.size).toBe(0);
        expect(book.find("KF-12")).toBeUndefined();
    });
    add("HandoverBook.remove: a hire that has begun stays, and so does the book when the reference is unknown", () => {
        const book = new mod.HandoverBook();
        const checking = hire("kf-12", kestrel, at(10, 14), at(17, 9, 30));
        checking.open(at(10, 13), "Mo");
        book.add(checking);
        book.add(sail(hire("kf-13", kestrel, at(10, 14), at(17, 9, 30))));
        book.add(wind(hire("kf-14", kestrel, at(3, 14), at(10, 9, 30)), at(10, 9)));
        expect(book.remove("KF-12")).toBe(false);
        expect(book.remove("KF-13")).toBe(false);
        expect(book.remove("KF-14")).toBe(false);
        expect(book.remove("KF-99")).toBe(false);
        expect(book.size).toBe(3);
    });
    add("HandoverBook.remove: a hire whose boat is back stays in the book", () => {
        const book = new mod.HandoverBook();
        const landed = land(hire("kf-12", kestrel, at(3, 14), at(10, 9, 30)), at(10, 9));
        book.add(landed);
        expect(landed.phase).toBe("returned");
        expect(book.remove("KF-12")).toBe(false);
        expect(book.size).toBe(1);
        expect(book.find("KF-12")).toBe(landed);
    });
    add("HandoverBook.forBoat: the hires of one boat in the order they are due out", () => {
        const book = new mod.HandoverBook();
        book.add(hire("k-3", kestrel, at(17, 14), at(24, 9, 30)));
        book.add(hire("b-1", bittern, at(3, 14), at(10, 9, 30)));
        book.add(hire("k-1", kestrel, at(3, 14), at(10, 9, 30)));
        book.add(hire("k-2", kestrel, at(10, 14), at(17, 9, 30)));
        expect(refs(book.forBoat("Kestrel"))).toEqual(["K-1", "K-2", "K-3"]);
        expect(refs(book.forBoat("Bittern"))).toEqual(["B-1"]);
    });
    add("HandoverBook.forBoat: the name is trimmed and may be in any case", () => {
        const book = new mod.HandoverBook();
        book.add(hire("k-1", kestrel, at(3, 14), at(10, 9, 30)));
        expect(refs(book.forBoat("  kestrel "))).toEqual(["K-1"]);
        expect(refs(book.forBoat("KESTREL"))).toEqual(["K-1"]);
        expect(book.forBoat("Kest")).toEqual([]);
    });
    add("HandoverBook.forBoat: gives the boat's hires whatever their phase", () => {
        const book = new mod.HandoverBook();
        const off = hire("k-2", kestrel, at(10, 14), at(17, 9, 30));
        off.cancel(at(9, 10), "Mo", "party withdrew");
        book.add(hire("k-3", kestrel, at(17, 14), at(24, 9, 30)));
        book.add(off);
        book.add(wind(hire("k-0", kestrel, at(1, 14), at(3, 9, 30)), at(3, 9)));
        book.add(sail(hire("k-1", kestrel, at(3, 14), at(10, 9, 30))));
        expect(refs(book.forBoat("Kestrel"))).toEqual(["K-0", "K-1", "K-2", "K-3"]);
    });
    add("HandoverBook.live: the hires that are neither closed nor called off, in the order they were added", () => {
        const book = new mod.HandoverBook();
        const off = hire("k-2", kestrel, at(10, 14), at(17, 9, 30));
        off.cancel(at(9, 10), "Mo", "party withdrew");
        book.add(hire("k-3", kestrel, at(17, 14), at(24, 9, 30)));
        book.add(off);
        book.add(wind(hire("k-0", kestrel, at(1, 14), at(3, 9, 30)), at(3, 9)));
        book.add(land(hire("b-1", bittern, at(3, 14), at(10, 9, 30)), at(10, 9)));
        book.add(sail(hire("k-1", kestrel, at(3, 14), at(10, 9, 30))));
        expect(refs(book.live())).toEqual(["K-3", "B-1", "K-1"]);
    });
    add("HandoverBook.live: an empty list for an empty book", () => {
        expect(new mod.HandoverBook().live()).toEqual([]);
    });
    add("HandoverBook.live: a hire being checked is live, and its deposit is held", () => {
        const book = new mod.HandoverBook();
        const checking = hire("k-1", kestrel, at(10, 14), at(17, 9, 30), 20000);
        checking.open(at(10, 13), "Mo");
        book.add(checking);
        expect(refs(book.live())).toEqual(["K-1"]);
        expect(book.held()).toBe(20000);
    });
    add("HandoverBook.outSlots: the slots of the day's departures, the earliest first", () => {
        const book = new mod.HandoverBook();
        book.add(hire("k-1", kestrel, at(10, 14), at(17, 9, 30)));
        book.add(hire("b-1", bittern, at(10, 11), at(17, 9, 30)));
        book.add(hire("k-2", kestrel, at(11, 9), at(18, 9, 30)));
        expect(book.outSlots(10)).toEqual([
            { start: at(10, 11), end: at(10, 12) }, { start: at(10, 14), end: at(10, 14, 40) },
        ]);
        expect(book.outSlots(11)).toEqual([{ start: at(11, 9), end: at(11, 9, 40) }]);
        expect(book.outSlots(12)).toEqual([]);
    });
    add("HandoverBook.outSlots: a hire being checked keeps its slot, and one that has gone or was called off has none", () => {
        const book = new mod.HandoverBook();
        const checking = hire("k-1", kestrel, at(10, 14), at(17, 9, 30));
        checking.open(at(10, 13), "Mo");
        const off = hire("k-3", kestrel, at(10, 12), at(17, 9, 30));
        off.cancel(at(9, 10), "Mo", "party withdrew");
        book.add(checking);
        book.add(sail(hire("k-2", kestrel, at(10, 9), at(17, 9, 30))));
        book.add(off);
        expect(book.outSlots(10)).toEqual([{ start: at(10, 14), end: at(10, 14, 40) }]);
    });
    add("HandoverBook.clashes: the pairs whose slots overlap, the earlier one first", () => {
        const book = new mod.HandoverBook();
        book.add(hire("k-2", kestrel, at(10, 11, 30), at(17, 9, 30)));
        book.add(hire("b-1", bittern, at(10, 11), at(17, 9, 30)));
        book.add(hire("k-3", kestrel, at(10, 11, 50), at(17, 9, 30)));
        book.add(hire("k-4", kestrel, at(10, 15), at(17, 9, 30)));
        expect(book.clashes(10)).toEqual([["B-1", "K-2"], ["B-1", "K-3"], ["K-2", "K-3"]]);
        expect(book.clashes(11)).toEqual([]);
    });
    add("HandoverBook.clashes: slots that only touch do not clash", () => {
        const book = new mod.HandoverBook();
        book.add(hire("k-1", kestrel, at(10, 11), at(17, 9, 30)));
        book.add(hire("k-2", kestrel, at(10, 11, 40), at(17, 9, 30)));
        book.add(hire("b-1", bittern, at(10, 10), at(17, 9, 30)));
        expect(book.clashes(10)).toEqual([]);
        book.add(hire("k-3", kestrel, at(10, 12, 19), at(17, 9, 30)));
        expect(book.clashes(10)).toEqual([["K-2", "K-3"]]);
    });
    add("HandoverBook.clashes: the earlier hire comes first in a pair, whatever the references", () => {
        const book = new mod.HandoverBook();
        book.add(hire("a-1", kestrel, at(10, 11, 20), at(17, 9, 30)));
        book.add(hire("z-1", kestrel, at(10, 11), at(17, 9, 30)));
        expect(book.clashes(10)).toEqual([["Z-1", "A-1"]]);
    });
    add("HandoverBook.offer: the first clear time at or after the one asked for", () => {
        const book = new mod.HandoverBook();
        book.add(hire("k-1", kestrel, at(10, 11), at(17, 9, 30)));
        book.add(hire("b-1", bittern, at(10, 11, 50), at(17, 9, 30)));
        expect(book.offer(at(10, 9), 4)).toBe(at(10, 9));
        expect(book.offer(at(10, 7), 4)).toBe(at(10, 8, 30));
        expect(book.offer(at(10, 11), 4)).toBe(at(10, 12, 50));
        expect(book.offer(at(10, 11), 2)).toBe(at(10, 12, 50));
        expect(book.offer(at(10, 10, 20), 4)).toBe(at(10, 10, 20));
        expect(book.offer(at(10, 10, 20), 6)).toBe(at(10, 12, 50));
        expect(book.offer(at(11, 11), 4)).toBe(at(11, 11));
    });
    add("HandoverBook.offer: NOT_YET when the slot would run past the wharf's shutting", () => {
        const book = new mod.HandoverBook();
        book.add(hire("k-1", kestrel, at(10, 16), at(17, 9, 30)));
        expect(book.offer(at(10, 16, 20), 4)).toBe(-1);
        expect(book.offer(at(10, 15, 30), 6)).toBe(-1);
        expect(book.offer(at(10, 15), 6)).toBe(at(10, 15));
        expect(new mod.HandoverBook().offer(at(10, 16, 20), 4)).toBe(at(10, 16, 20));
        expect(new mod.HandoverBook().offer(at(10, 16, 20), 6)).toBe(mod.NOT_YET);
    });
    add("HandoverBook.held: the deposits of the live hires, in pence", () => {
        const book = new mod.HandoverBook();
        expect(book.held()).toBe(0);
        const off = hire("k-2", kestrel, at(10, 14), at(17, 9, 30), 15000);
        off.cancel(at(9, 10), "Mo", "party withdrew");
        book.add(hire("k-3", kestrel, at(17, 14), at(24, 9, 30), 20000));
        book.add(off);
        book.add(wind(hire("k-0", kestrel, at(1, 14), at(3, 9, 30), 17500), at(3, 9)));
        book.add(land(hire("b-1", bittern, at(3, 14), at(10, 9, 30), 27500), at(10, 9)));
        expect(book.held()).toBe(47500);
    });
    add("HandoverBook.held: a hire stops counting when it is closed", () => {
        const book = new mod.HandoverBook();
        const h = land(hire("k-1", kestrel, at(3, 14), at(10, 9, 30), 20000), at(10, 9));
        book.add(h);
        expect(book.held()).toBe(20000);
        finish(h, reading(at(10, 9, 10), 1100, 12290, 3, 2), at(10, 9, 30));
        expect(book.held()).toBe(0);
    });
    add("HandoverBook.held: a live hire's whole deposit is held, whatever it has been charged", () => {
        const book = new mod.HandoverBook();
        const out = sail(hire("k-1", kestrel, at(3, 14), at(10, 9, 30), 20000));
        out.addExtra(1850, "lost windlass", at(5, 10), "Mo");
        const landed = land(hire("k-2", kestrel, at(3, 14), at(10, 9, 30), 15000), at(10, 9));
        landed.addExtra(700, "pump-out token", at(10, 9, 5), "Ines");
        book.add(out);
        book.add(landed);
        expect(landed.charges()).toEqual([charge("extra", 700, "pump-out token")]);
        expect(book.held()).toBe(35000);
    });
    add("HandoverBook.takings: what the closed hires were charged, a line a code", () => {
        const book = new mod.HandoverBook();
        expect(book.takings()).toEqual([]);
        book.add(wind(hire("k-0", kestrel, at(1, 14), at(3, 9, 30)), at(3, 9)));
        expect(book.takings()).toEqual([charge("fuel", 6720, "40.0 L by dipstick")]);
        book.add(wind(hire("k-1", kestrel, at(3, 14), at(10, 9, 30)), at(10, 10, 15), 1000));
        expect(book.takings()).toEqual([charge("fuel", 15120, "2 items"), charge("late", 2400, "45 min late")]);
    });
    add("HandoverBook.takings: a hire that is not closed adds nothing", () => {
        const book = new mod.HandoverBook();
        const landed = land(hire("k-1", kestrel, at(3, 14), at(10, 9, 30)), at(10, 10, 15));
        const out = sail(hire("k-2", kestrel, at(3, 14), at(10, 9, 30)));
        out.addExtra(1850, "lost windlass", at(5, 10), "Mo");
        book.add(landed);
        book.add(out);
        expect(landed.charges()).toEqual([charge("late", 2400, "45 min late")]);
        expect(book.takings()).toEqual([]);
    });
    add("HandoverBook.takings: a code's note counts the lines of every closed hire", () => {
        const book = new mod.HandoverBook();
        const first = sail(hire("k-1", kestrel, at(3, 14), at(10, 9, 30)));
        first.addExtra(1850, "lost windlass", at(5, 10), "Mo");
        first.addExtra(700, "pump-out token", at(6, 10), "Mo");
        first.takeBack(at(10, 9), "Ines");
        finish(first, reading(at(10, 9, 10), 1100, 12290, 3, 2), at(10, 9, 30));
        const second = sail(hire("k-2", kestrel, at(3, 14), at(10, 9, 30)));
        second.addExtra(500, "mooring pin", at(5, 11), "Mo");
        second.takeBack(at(10, 9), "Ines");
        finish(second, reading(at(10, 9, 10), 1100, 12290, 3, 2), at(10, 9, 30));
        book.add(first);
        book.add(second);
        expect(book.takings()).toEqual([charge("fuel", 13440, "2 items"), charge("extra", 3050, "3 items")]);
    });

    const unknown = skip.filter((name) => !cases.some(([had]) => had === name));
    if (unknown.length) throw new Error(`skip names no case: ${unknown.join("; ")}`);

    describe("src/handover.ts as it was", () => {
        for (const [name, run] of cases) {
            if (!skip.includes(name)) it(name, run);
        }
    });
}

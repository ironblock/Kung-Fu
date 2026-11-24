// What src/rota.ts does now, as cases a check can register beside its own. A check for one change skips,
// by name, only the cases that change must alter.
import { describe, expect, it } from "vitest";
import { copyOf } from "./helpers";

type Mod = typeof import("../src/rota");
type Rota = InstanceType<Mod["Rota"]>;
type Shift = import("../src/rota").Shift;
type Role = import("../src/rota").Role;

const DAY = 1440;
// Day 14 is a Monday, so day 19 is a Saturday and day 20 a Sunday.
const MON = 14;
const T0 = MON * DAY;

function hm(hours: number, minutes = 0): number {
    return hours * 60 + minutes;
}

function shiftOf(id: string, day: number, start: number, end: number, role: Role = "hand", staffId = ""): Shift {
    return { id, staffId, day, start, end, role };
}

function crew(mod: Mod): Rota {
    const rota = new mod.Rota();
    rota.addStaff({ id: "ada", name: "Ada", roles: ["hand", "lock"], ratePence: 1260, contractMinutes: 2400 });
    rota.addStaff({ id: "bram", name: "Bram", roles: ["hand", "fitter"], ratePence: 1575, contractMinutes: 2250 });
    rota.addStaff({ id: "cleo", name: "Cleo", roles: ["office"], ratePence: 1333, contractMinutes: 1200 });
    rota.addStaff({
        id: "dov",
        name: "Dov",
        roles: ["hand", "office", "lock", "fitter"],
        ratePence: 1100,
        contractMinutes: 900,
    });
    return rota;
}

function messageOf(run: () => unknown): string {
    try {
        run();
    } catch (err) {
        return err instanceof Error ? err.message : `threw ${String(err)}`;
    }
    return "did not throw";
}

export function unchanged(mod: Mod, skip: string[] = []): void {
    const cases: [string, () => void][] = [];
    const add = (name: string, run: () => void): void => {
        if (cases.some(([had]) => had === name)) throw new Error(`two cases are called "${name}"`);
        cases.push([name, run]);
    };

    // ------------------------------------------------------------------------------------ the constants

    add("the constants are what they were", () => {
        expect(mod.OPEN).toBe("");
        expect(mod.NEVER).toBe(-1);
        expect(mod.DAY_MINUTES).toBe(1440);
        expect(mod.MIN_REST).toBe(660);
        expect(mod.MAX_DAYS_RUNNING).toBe(6);
        expect(mod.SWAP_NOTICE).toBe(2880);
    });

    // --------------------------------------------------------------------------------------- the clock

    add("minutesOf reads a clock time as minutes from midnight", () => {
        expect(mod.minutesOf("07:30")).toBe(450);
        expect(mod.minutesOf("7:05")).toBe(425);
        expect(mod.minutesOf("00:00")).toBe(0);
        expect(mod.minutesOf("23:59")).toBe(1439);
    });

    add("minutesOf takes 24:00 and nothing later", () => {
        expect(mod.minutesOf("24:00")).toBe(1440);
        expect(messageOf(() => mod.minutesOf("24:01"))).toBe("not a time: 24:01");
        expect(messageOf(() => mod.minutesOf("25:00"))).toBe("not a time: 25:00");
    });

    add("minutesOf refuses what is not a clock time", () => {
        expect(messageOf(() => mod.minutesOf("12:60"))).toBe("not a time: 12:60");
        expect(messageOf(() => mod.minutesOf("noon"))).toBe("not a time: noon");
        expect(messageOf(() => mod.minutesOf("1230"))).toBe("not a time: 1230");
        expect(messageOf(() => mod.minutesOf("12:5"))).toBe("not a time: 12:5");
        expect(messageOf(() => mod.minutesOf(" 12:05"))).toBe("not a time:  12:05");
    });

    add("minutesOf takes one or two figures for the hours, and no more", () => {
        expect(messageOf(() => mod.minutesOf("007:30"))).toBe("not a time: 007:30");
        expect(messageOf(() => mod.minutesOf("000:00"))).toBe("not a time: 000:00");
        expect(messageOf(() => mod.minutesOf("100:00"))).toBe("not a time: 100:00");
        expect(mod.minutesOf("00:00")).toBe(0);
    });

    add("clockOf writes minutes from midnight with two digits each", () => {
        expect(mod.clockOf(450)).toBe("07:30");
        expect(mod.clockOf(0)).toBe("00:00");
        expect(mod.clockOf(605)).toBe("10:05");
        expect(mod.clockOf(1439)).toBe("23:59");
    });

    add("clockOf writes a time past midnight as the clock shows it", () => {
        expect(mod.clockOf(1440)).toBe("00:00");
        expect(mod.clockOf(1500)).toBe("01:00");
        expect(mod.clockOf(2 * 1440 + 61)).toBe("01:01");
        expect(mod.clockOf(-30)).toBe("23:30");
    });

    add("clockOf keeps a part of a minute as it is", () => {
        expect(mod.clockOf(90.5)).toBe("01:30.5");
        expect(mod.clockOf(605.25)).toBe("10:05.25");
    });

    // ------------------------------------------------------------------------------------- days, weeks

    add("weekdayOf numbers the days of a week from day 0", () => {
        expect([0, 1, 5, 6, 7, 13, 14, 19, 20].map(mod.weekdayOf)).toEqual([0, 1, 5, 6, 0, 6, 0, 5, 6]);
    });

    add("weekdayOf goes on the same way before day 0", () => {
        expect([-1, -2, -7, -8].map(mod.weekdayOf)).toEqual([6, 5, 0, 6]);
    });

    add("weekStart is the first day of the day's week", () => {
        expect([14, 17, 20, 21, 0, 6].map(mod.weekStart)).toEqual([14, 14, 14, 21, 0, 0]);
    });

    add("weekStart before day 0", () => {
        expect([-1, -7, -8].map(mod.weekStart)).toEqual([-7, -7, -14]);
    });

    // ------------------------------------------------------------------------------- one shift's times

    add("shiftLength of a shift inside one day", () => {
        expect(mod.shiftLength(shiftOf("s1", 3, hm(7), hm(15, 30)))).toBe(510);
        expect(mod.shiftLength(shiftOf("s1", 3, hm(16), 1440))).toBe(480);
        expect(mod.shiftLength(shiftOf("s1", 3, 0, 1))).toBe(1);
    });

    add("shiftLength of a shift that ends before it starts runs into the next day", () => {
        expect(mod.shiftLength(shiftOf("s1", 3, hm(22), hm(6)))).toBe(480);
        expect(mod.shiftLength(shiftOf("s1", 3, hm(10), 0))).toBe(840);
        expect(mod.shiftLength(shiftOf("s1", 3, hm(23, 59), hm(23, 58)))).toBe(1439);
    });

    add("shiftLength of a shift that ends when it starts is a whole day", () => {
        expect(mod.shiftLength(shiftOf("s1", 3, hm(9), hm(9)))).toBe(1440);
        expect(mod.shiftLength(shiftOf("s1", 3, 0, 0))).toBe(1440);
        expect(mod.shiftLength(shiftOf("s1", 3, 0, 1440))).toBe(1440);
    });

    add("spanOf counts both ends from midnight of day 0", () => {
        expect(mod.spanOf(shiftOf("s1", 3, hm(7), hm(15, 30)))).toEqual([4740, 5250]);
        expect(mod.spanOf(shiftOf("s1", 0, 0, 30))).toEqual([0, 30]);
        expect(mod.spanOf(shiftOf("s1", -1, hm(8), hm(10)))).toEqual([-960, -840]);
    });

    add("spanOf of a night shift ends on the next day", () => {
        const night = shiftOf("s1", 2, hm(22), hm(6));
        const before = copyOf(night);
        expect(mod.spanOf(night)).toEqual([4200, 4680]);
        expect(night).toEqual(before);
    });

    add("overlaps: shifts that share a minute overlap, either way round", () => {
        const a = shiftOf("s1", 5, hm(7), hm(12));
        const b = shiftOf("s2", 5, hm(11, 59), hm(14));
        const inside = shiftOf("s3", 5, hm(8), hm(9));
        expect(mod.overlaps(a, b)).toBe(true);
        expect(mod.overlaps(b, a)).toBe(true);
        expect(mod.overlaps(a, inside)).toBe(true);
        expect(mod.overlaps(inside, a)).toBe(true);
        expect(mod.overlaps(a, a)).toBe(true);
    });

    add("overlaps: a shift that starts as another ends does not overlap it", () => {
        const a = shiftOf("s1", 5, hm(7), hm(12));
        const b = shiftOf("s2", 5, hm(12), hm(14));
        expect(mod.overlaps(a, b)).toBe(false);
        expect(mod.overlaps(b, a)).toBe(false);
        expect(mod.overlaps(a, shiftOf("s3", 6, hm(7), hm(12)))).toBe(false);
    });

    add("overlaps: a night shift reaches into the next morning", () => {
        const night = shiftOf("s1", 5, hm(22), hm(6));
        expect(mod.overlaps(night, shiftOf("s2", 6, hm(5, 59), hm(9)))).toBe(true);
        expect(mod.overlaps(night, shiftOf("s3", 6, hm(6), hm(9)))).toBe(false);
        expect(mod.overlaps(night, shiftOf("s4", 5, hm(5), hm(9)))).toBe(false);
        expect(mod.overlaps(shiftOf("s5", 5, hm(21), hm(22, 1)), night)).toBe(true);
    });

    add("restBetween is the minutes from one shift's end to the next one's start", () => {
        expect(mod.restBetween(shiftOf("s1", 1, hm(7), hm(17)), shiftOf("s2", 2, hm(7), hm(17)))).toBe(840);
        expect(mod.restBetween(shiftOf("s1", 1, hm(7), hm(12)), shiftOf("s2", 1, hm(12), hm(17)))).toBe(0);
        expect(mod.restBetween(shiftOf("s1", 1, hm(22), hm(6)), shiftOf("s2", 2, hm(14), hm(22)))).toBe(480);
    });

    add("restBetween goes below zero when the second starts before the first ends", () => {
        expect(mod.restBetween(shiftOf("s1", 1, hm(7), hm(12)), shiftOf("s2", 1, hm(11), hm(17)))).toBe(-60);
        expect(mod.restBetween(shiftOf("s1", 2, hm(7), hm(17)), shiftOf("s2", 1, hm(7), hm(17)))).toBe(-2040);
    });

    // --------------------------------------------------------------------------------------------- pay

    add("paidMinutes: a shift of six hours or less is paid in full", () => {
        expect(mod.paidMinutes(shiftOf("s1", 2, hm(7), hm(13)))).toBe(360);
        expect(mod.paidMinutes(shiftOf("s1", 2, hm(9), hm(9, 30)))).toBe(30);
        expect(mod.paidMinutes(shiftOf("s1", 2, hm(21), hm(3)))).toBe(360);
    });

    add("paidMinutes: a longer shift loses its half hour's break", () => {
        expect(mod.paidMinutes(shiftOf("s1", 2, hm(7), hm(13, 1)))).toBe(331);
        expect(mod.paidMinutes(shiftOf("s1", 2, hm(7), hm(15, 30)))).toBe(480);
        expect(mod.paidMinutes(shiftOf("s1", 2, hm(22), hm(6)))).toBe(450);
    });

    add("paidMinutes: a whole day loses one break and no more", () => {
        expect(mod.paidMinutes(shiftOf("s1", 2, hm(9), hm(9)))).toBe(1410);
        expect(mod.paidMinutes(shiftOf("s1", 2, hm(6), hm(18, 30)))).toBe(720);
    });

    add("shiftPayPence pays the paid minutes at the rate for an hour", () => {
        expect(mod.shiftPayPence(shiftOf("s1", 16, hm(7), hm(15, 30)), 1260)).toBe(10080);
        expect(mod.shiftPayPence(shiftOf("s1", 16, hm(7), hm(13)), 1100)).toBe(6600);
        expect(mod.shiftPayPence(shiftOf("s1", 16, hm(7), hm(13)), 0)).toBe(0);
    });

    add("shiftPayPence rounds to a whole penny, a half going up", () => {
        expect(mod.shiftPayPence(shiftOf("s1", 16, hm(9), hm(9, 30)), 1333)).toBe(667);
        expect(mod.shiftPayPence(shiftOf("s1", 16, hm(9), hm(9, 30)), 1332)).toBe(666);
        expect(mod.shiftPayPence(shiftOf("s1", 16, hm(9), hm(9, 20)), 1000)).toBe(333);
        expect(mod.shiftPayPence(shiftOf("s1", 16, hm(9), hm(9, 40)), 1000)).toBe(667);
        expect(mod.shiftPayPence(shiftOf("s1", 16, hm(22), hm(6)), 1575)).toBe(11813);
    });

    add("shiftPayPence pays the same whatever day the shift is on", () => {
        for (const day of [-1, 0, 6, 14, 15, 16, 17, 18, 19, 20, 21]) {
            expect(mod.shiftPayPence(shiftOf("s1", day, hm(7), hm(15, 30)), 1260)).toBe(10080);
            expect(mod.shiftPayPence(shiftOf("s1", day, hm(9), hm(9, 30)), 1333)).toBe(667);
        }
    });

    // ------------------------------------------------------------------------------------------- order

    add("sortShifts sorts the array it is given, earliest first, and gives that array back", () => {
        const a = shiftOf("s1", 4, hm(12), hm(14));
        const b = shiftOf("s2", 3, hm(15), hm(18));
        const c = shiftOf("s3", 4, hm(7), hm(9));
        const list = [a, b, c];
        const back = mod.sortShifts(list);
        expect(back).toBe(list);
        expect(list.map((s) => s.id)).toEqual(["s2", "s3", "s1"]);
        expect(list[0]).toBe(b);
    });

    add("sortShifts puts shifts that start together in the order of their numbers", () => {
        const list = [shiftOf("s10", 4, hm(7), hm(9)), shiftOf("s9", 4, hm(7), hm(15)), shiftOf("s2", 4, hm(7), hm(8))];
        expect(mod.sortShifts(list).map((s) => s.id)).toEqual(["s2", "s9", "s10"]);
    });

    add("sortShifts goes by the start, not the end, and a night shift belongs where it starts", () => {
        const list = [
            shiftOf("s1", 5, hm(1), hm(2)),
            shiftOf("s2", 4, hm(22), hm(6)),
            shiftOf("s3", 4, hm(21), hm(23, 30)),
        ];
        expect(mod.sortShifts(list).map((s) => s.id)).toEqual(["s3", "s2", "s1"]);
    });

    // ------------------------------------------------------------------------------------------- cover

    add("coverNeeds of a working day", () => {
        const want = [
            { role: "hand", from: 420, to: 1020, count: 2 },
            { role: "fitter", from: 480, to: 960, count: 1 },
            { role: "office", from: 540, to: 1020, count: 1 },
        ];
        for (const day of [14, 15, 16, 17, 18, 0, 21, -3]) expect(mod.coverNeeds(day)).toEqual(want);
    });

    add("coverNeeds of the turnaround day", () => {
        const want = [
            { role: "hand", from: 420, to: 1080, count: 3 },
            { role: "fitter", from: 480, to: 960, count: 1 },
            { role: "office", from: 480, to: 1080, count: 2 },
            { role: "lock", from: 540, to: 960, count: 1 },
        ];
        for (const day of [19, 5, 26, -2]) expect(mod.coverNeeds(day)).toEqual(want);
    });

    add("coverNeeds of the quiet day", () => {
        const want = [{ role: "hand", from: 540, to: 780, count: 1 }];
        for (const day of [20, 6, 27, -1]) expect(mod.coverNeeds(day)).toEqual(want);
    });

    add("coverNeeds gives the one table that each kind of day shares", () => {
        expect(mod.coverNeeds(15)).toBe(mod.coverNeeds(14));
        expect(mod.coverNeeds(26)).toBe(mod.coverNeeds(19));
        expect(mod.coverNeeds(27)).toBe(mod.coverNeeds(20));
        expect(mod.coverNeeds(18)[0]).toBe(mod.coverNeeds(14)[0]);
    });

    const counted = (): Shift[] => [
        shiftOf("s1", 16, hm(7), hm(15, 30), "hand", "ada"),
        shiftOf("s2", 16, hm(7), hm(10), "hand", "bram"),
        shiftOf("s3", 16, hm(7), hm(15, 30), "hand", ""),
        shiftOf("s4", 16, hm(8), hm(16), "fitter", "bram"),
        shiftOf("s5", 15, hm(22), hm(6), "hand", "dov"),
    ];

    add("countOn counts the held shifts of the role that cover the minute", () => {
        const shifts = counted();
        const before = copyOf(shifts);
        expect(mod.countOn(shifts, "hand", 16, hm(8))).toBe(2);
        expect(mod.countOn(shifts, "hand", 16, hm(12))).toBe(1);
        expect(mod.countOn(shifts, "fitter", 16, hm(8))).toBe(1);
        expect(mod.countOn(shifts, "lock", 16, hm(8))).toBe(0);
        expect(mod.countOn(shifts, "office", 16, hm(8))).toBe(0);
        expect(shifts).toEqual(before);
    });

    add("countOn: a shift covers its first minute and not its last", () => {
        const shifts = counted();
        expect(mod.countOn(shifts, "hand", 16, hm(7))).toBe(2);
        expect(mod.countOn(shifts, "hand", 16, hm(6, 59))).toBe(0);
        expect(mod.countOn(shifts, "hand", 16, hm(9, 59))).toBe(2);
        expect(mod.countOn(shifts, "hand", 16, hm(10))).toBe(1);
        expect(mod.countOn(shifts, "hand", 16, hm(15, 29))).toBe(1);
        expect(mod.countOn(shifts, "hand", 16, hm(15, 30))).toBe(0);
        expect(mod.countOn(shifts, "fitter", 16, hm(7, 59))).toBe(0);
        expect(mod.countOn(shifts, "fitter", 16, hm(16))).toBe(0);
    });

    add("countOn: a night shift that began the day before counts until it ends", () => {
        const shifts = counted();
        expect(mod.countOn(shifts, "hand", 15, hm(22))).toBe(1);
        expect(mod.countOn(shifts, "hand", 15, hm(21, 59))).toBe(0);
        expect(mod.countOn(shifts, "hand", 16, 0)).toBe(1);
        expect(mod.countOn(shifts, "hand", 16, hm(5, 59))).toBe(1);
        expect(mod.countOn(shifts, "hand", 16, hm(6))).toBe(0);
        expect(mod.countOn(shifts, "hand", 15, hm(5))).toBe(0);
    });

    add("countOn: a shift nobody holds does not count", () => {
        const open = [shiftOf("s1", 16, hm(7), hm(15)), shiftOf("s2", 16, hm(7), hm(15))];
        expect(mod.countOn(open, "hand", 16, hm(8))).toBe(0);
        open[1].staffId = "ada";
        expect(mod.countOn(open, "hand", 16, hm(8))).toBe(1);
        expect(mod.countOn([], "hand", 16, hm(8))).toBe(0);
    });

    add("coverGaps with nobody on: one gap for each need, in the order of the needs", () => {
        expect(mod.coverGaps([], 14)).toEqual([
            { role: "hand", from: 420, to: 1020, short: 2 },
            { role: "fitter", from: 480, to: 960, short: 1 },
            { role: "office", from: 540, to: 1020, short: 1 },
        ]);
        expect(mod.coverGaps([], 19)).toEqual([
            { role: "hand", from: 420, to: 1080, short: 3 },
            { role: "fitter", from: 480, to: 960, short: 1 },
            { role: "office", from: 480, to: 1080, short: 2 },
            { role: "lock", from: 540, to: 960, short: 1 },
        ]);
        expect(mod.coverGaps([], 20)).toEqual([{ role: "hand", from: 540, to: 780, short: 1 }]);
    });

    add("coverGaps starts a new gap where the number short changes", () => {
        const shifts = [
            shiftOf("s1", 14, hm(9), hm(17), "hand", "ada"),
            shiftOf("s2", 14, hm(8), hm(16), "fitter", "bram"),
            shiftOf("s3", 14, hm(9), hm(17), "office", "cleo"),
        ];
        const before = copyOf(shifts);
        expect(mod.coverGaps(shifts, 14)).toEqual([
            { role: "hand", from: 420, to: 540, short: 2 },
            { role: "hand", from: 540, to: 1020, short: 1 },
        ]);
        expect(shifts).toEqual(before);
    });

    add("coverGaps finds a gap in the middle of a day, and more than enough is no gap", () => {
        const shifts = [
            shiftOf("s1", 14, hm(7), hm(17), "hand", "ada"),
            shiftOf("s2", 14, hm(7), hm(10), "hand", "bram"),
            shiftOf("s3", 14, hm(12), hm(17), "hand", "dov"),
            shiftOf("s4", 14, hm(7), hm(9), "hand", "eli"),
            shiftOf("s5", 14, hm(8), hm(16), "fitter", "bram"),
            shiftOf("s6", 14, hm(9), hm(17), "office", "cleo"),
        ];
        expect(mod.coverGaps(shifts, 14)).toEqual([{ role: "hand", from: 600, to: 720, short: 1 }]);
        shifts[1].end = hm(12);
        expect(mod.coverGaps(shifts, 14)).toEqual([]);
    });

    add("coverGaps counts cover at the start of each half hour", () => {
        const late = [shiftOf("s1", 20, hm(9, 15), hm(13), "hand", "ada")];
        expect(mod.coverGaps(late, 20)).toEqual([{ role: "hand", from: 540, to: 570, short: 1 }]);
        const early = [shiftOf("s1", 20, hm(9), hm(12, 10), "hand", "ada")];
        expect(mod.coverGaps(early, 20)).toEqual([{ role: "hand", from: 750, to: 780, short: 1 }]);
        early[0].end = hm(12, 30);
        expect(mod.coverGaps(early, 20)).toEqual([{ role: "hand", from: 750, to: 780, short: 1 }]);
        early[0].end = hm(12, 31);
        expect(mod.coverGaps(early, 20)).toEqual([]);
    });

    add("coverGaps: an open shift is no cover, and a shift from the day before is", () => {
        expect(mod.coverGaps([shiftOf("s1", 20, hm(9), hm(13), "hand", "")], 20)).toEqual([
            { role: "hand", from: 540, to: 780, short: 1 },
        ]);
        expect(mod.coverGaps([shiftOf("s1", 19, hm(20), hm(10), "hand", "ada")], 20)).toEqual([
            { role: "hand", from: 600, to: 780, short: 1 },
        ]);
        expect(mod.coverGaps([shiftOf("s1", 20, hm(9), hm(13), "lock", "ada")], 20)).toEqual([
            { role: "hand", from: 540, to: 780, short: 1 },
        ]);
    });

    // ----------------------------------------------------------------------------------- the rota file

    add("formatShift writes a held shift as a line", () => {
        expect(mod.formatShift(shiftOf("s4", 12, hm(7), hm(15, 30), "hand", "ada"))).toBe("s4 12 07:00-15:30 hand ada");
        expect(mod.formatShift(shiftOf("s11", -2, hm(8, 5), hm(9), "fitter", "bram"))).toBe(
            "s11 -2 08:05-09:00 fitter bram",
        );
    });

    add("formatShift writes a dash for a shift nobody holds", () => {
        expect(mod.formatShift(shiftOf("s9", 3, hm(22), hm(6), "lock", ""))).toBe("s9 3 22:00-06:00 lock -");
    });

    add("formatShift writes an end at midnight as 00:00", () => {
        expect(mod.formatShift(shiftOf("s1", 0, hm(16), 1440, "office", "cleo"))).toBe("s1 0 16:00-00:00 office cleo");
    });

    add("parseShift reads a line back", () => {
        expect(mod.parseShift("s4 12 07:00-15:30 hand ada")).toEqual(
            shiftOf("s4", 12, 420, 930, "hand", "ada"),
        );
        expect(mod.parseShift("s3 -2 7:05-9:00 fitter bram")).toEqual(shiftOf("s3", -2, 425, 540, "fitter", "bram"));
    });

    add("parseShift reads a dash as nobody, and does not mind spaces", () => {
        expect(mod.parseShift("  s9   3 22:00-06:00\tlock -  ")).toEqual(shiftOf("s9", 3, 1320, 360, "lock", ""));
    });

    add("parseShift takes 24:00 as an end and not as a start", () => {
        expect(mod.parseShift("s1 0 16:00-24:00 office cleo")).toEqual(shiftOf("s1", 0, 960, 1440, "office", "cleo"));
        expect(messageOf(() => mod.parseShift("s4 12 24:00-06:00 hand ada"))).toBe(
            "not a shift: s4 12 24:00-06:00 hand ada",
        );
    });

    add("parseShift refuses a line that is not a shift", () => {
        for (const line of [
            "s4 12 07:00-15:30 hand",
            "s4 12 07:00-15:30 hand ada extra",
            "s4 12 07:00-15:30 cook ada",
            "s4 x 07:00-15:30 hand ada",
            "s4 1.5 07:00-15:30 hand ada",
            "q4 12 07:00-15:30 hand ada",
            "s 12 07:00-15:30 hand ada",
            "s4 12 07:00 hand ada",
            "s4 12 07:00-15:30-16:00 hand ada",
            "",
        ]) {
            expect(messageOf(() => mod.parseShift(line))).toBe(`not a shift: ${line}`);
        }
        expect(messageOf(() => mod.parseShift("s4 12 07:00-25:00 hand ada"))).toBe("not a time: 25:00");
    });

    add("parseShift takes a day written in figures alone, with a minus sign before them if it has one", () => {
        for (const day of ["1e1", "0x10", "+5", "5.0", "1_0", "Infinity"]) {
            const line = `s4 ${day} 07:00-15:30 hand ada`;
            expect(messageOf(() => mod.parseShift(line))).toBe(`not a shift: ${line}`);
        }
        expect(mod.parseShift("s4 007 07:00-15:30 hand ada").day).toBe(7);
    });

    add("parseShift looks at the id, the day and the role before it reads the times", () => {
        expect(messageOf(() => mod.parseShift("s4 12 07:00-25:00 cook ada"))).toBe(
            "not a shift: s4 12 07:00-25:00 cook ada",
        );
        expect(messageOf(() => mod.parseShift("q4 12 7-25:00 hand ada"))).toBe("not a shift: q4 12 7-25:00 hand ada");
        expect(messageOf(() => mod.parseShift("s4 x 24:01-06:00 hand ada"))).toBe(
            "not a shift: s4 x 24:01-06:00 hand ada",
        );
        expect(messageOf(() => mod.parseShift("s4 12 24:00-25:00 hand ada"))).toBe("not a time: 25:00");
    });

    // --------------------------------------------------------------------------------------- the staff

    add("Rota.addStaff keeps a copy of the person", () => {
        const rota = new mod.Rota();
        const eve = { id: "eve", name: "Eve", roles: ["hand" as Role], ratePence: 1200, contractMinutes: 600 };
        rota.addStaff(eve);
        eve.name = "Changed";
        eve.ratePence = 1;
        eve.roles.push("office");
        expect(rota.person("eve")).toEqual({
            id: "eve",
            name: "Eve",
            roles: ["hand"],
            ratePence: 1200,
            contractMinutes: 600,
        });
        expect(rota.whyNot("eve", shiftOf("x1", 3, hm(9), hm(12), "office"))).toBe("Eve does not work as office");
    });

    add("Rota.addStaff refuses a person who is there, and an id that stands for nobody", () => {
        const rota = crew(mod);
        const one = { name: "One", roles: ["hand" as Role], ratePence: 1000, contractMinutes: 600 };
        expect(messageOf(() => rota.addStaff({ id: "ada", ...one }))).toBe("ada is on the rota already");
        expect(messageOf(() => rota.addStaff({ id: "", ...one }))).toBe("a person needs an id");
        expect(messageOf(() => rota.addStaff({ id: "-", ...one }))).toBe("a person needs an id");
        expect(rota.person("ada")?.name).toBe("Ada");
    });

    add("Rota.person gives the person, or undefined", () => {
        const rota = crew(mod);
        expect(rota.person("bram")).toEqual({
            id: "bram",
            name: "Bram",
            roles: ["hand", "fitter"],
            ratePence: 1575,
            contractMinutes: 2250,
        });
        expect(rota.person("zed")).toBeUndefined();
        expect(rota.person("")).toBeUndefined();
    });

    add("Rota.person matches the id exactly, and finds a person added later", () => {
        const rota = crew(mod);
        expect(rota.person("Ada")).toBeUndefined();
        expect(rota.person("ada ")).toBeUndefined();
        expect(rota.person("eve")).toBeUndefined();
        rota.addStaff({ id: "eve", name: "Eve", roles: [], ratePence: 0, contractMinutes: 0 });
        expect(rota.person("eve")).toEqual({ id: "eve", name: "Eve", roles: [], ratePence: 0, contractMinutes: 0 });
        expect(rota.person("dov")?.contractMinutes).toBe(900);
    });

    add("Rota.person gives the rota's own record, so a change to it is a change to the rota", () => {
        const rota = crew(mod);
        expect(rota.person("ada")).toBe(rota.person("ada"));
        const ada = rota.person("ada");
        if (ada) ada.ratePence = 2000;
        rota.addShift(16, hm(7), hm(13), "hand", "ada");
        expect(rota.costOn(16)).toBe(12000);
    });

    add("Rota.addLeave and onLeave: both the first day and the last are leave", () => {
        const rota = crew(mod);
        rota.addLeave("ada", 18, 20);
        expect([17, 18, 19, 20, 21].map((day) => rota.onLeave("ada", day))).toEqual([false, true, true, true, false]);
        expect(rota.onLeave("bram", 19)).toBe(false);
        rota.addLeave("bram", 25, 25);
        expect([24, 25, 26].map((day) => rota.onLeave("bram", day))).toEqual([false, true, false]);
    });

    add("Rota.addLeave refuses a stranger and a leave that ends before it starts", () => {
        const rota = crew(mod);
        expect(messageOf(() => rota.addLeave("zed", 18, 20))).toBe("nobody is called zed");
        expect(messageOf(() => rota.addLeave("ada", 20, 19))).toBe("leave ends before it starts");
        expect(rota.onLeave("ada", 20)).toBe(false);
    });

    add("Rota.addLeave refuses leave over a day the person holds a shift on, the ends too", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        expect(messageOf(() => rota.addLeave("ada", 16, 18))).toBe("ada holds s1 in that time");
        expect(messageOf(() => rota.addLeave("ada", 18, 22))).toBe("ada holds s1 in that time");
        expect(rota.onLeave("ada", 17)).toBe(false);
        rota.addLeave("ada", 19, 22);
        rota.addLeave("ada", 12, 17);
        rota.addLeave("bram", 18, 18);
        expect(rota.onLeave("ada", 17)).toBe(true);
    });

    add("Rota.addLeave asks who the person is, then about the days, then about the shifts", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        expect(messageOf(() => rota.addLeave("zed", 20, 19))).toBe("nobody is called zed");
        expect(messageOf(() => rota.addLeave("ada", 19, 18))).toBe("leave ends before it starts");
        expect(messageOf(() => rota.addLeave("ada", 18, 18))).toBe("ada holds s1 in that time");
    });

    add("Rota.addLeave names the first shift in the rota's own order that falls in the leave", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addShift(16, hm(7), hm(15), "hand", "ada");
        rota.addShift(17, hm(7), hm(15), "hand", "ada");
        expect(messageOf(() => rota.addLeave("ada", 15, 19))).toBe("ada holds s1 in that time");
        expect(messageOf(() => rota.addLeave("ada", 16, 17))).toBe("ada holds s2 in that time");
    });

    add("Rota.onLeave is false for someone with no leave", () => {
        const rota = crew(mod);
        expect(rota.onLeave("ada", 18)).toBe(false);
        expect(rota.onLeave("zed", 18)).toBe(false);
    });

    // -------------------------------------------------------------------------------------- the shifts

    add("Rota.addShift numbers the shifts from s1 and leaves them open unless told", () => {
        const rota = crew(mod);
        const first = rota.addShift(16, hm(7), hm(15, 30), "hand");
        const second = rota.addShift(16, hm(22), hm(6), "lock", "ada");
        expect(first).toEqual(shiftOf("s1", 16, 420, 930, "hand", ""));
        expect(second).toEqual(shiftOf("s2", 16, 1320, 360, "lock", "ada"));
        expect(rota.shift("s1")).toBe(first);
        expect(rota.shift("s2")).toBe(second);
    });

    add("Rota.addShift takes times inside one day, and 1440 only as an end", () => {
        const rota = crew(mod);
        const bad = "a shift's times are minutes of one day";
        expect(messageOf(() => rota.addShift(16, 1440, 60, "hand"))).toBe(bad);
        expect(messageOf(() => rota.addShift(16, -1, 60, "hand"))).toBe(bad);
        expect(messageOf(() => rota.addShift(16, 60, 1441, "hand"))).toBe(bad);
        expect(messageOf(() => rota.addShift(16, 60, -1, "hand"))).toBe(bad);
        expect(messageOf(() => rota.addShift(16.5, 60, 120, "hand"))).toBe("a shift is on a whole day");
        expect(rota.addShift(16, 0, 1440, "hand").id).toBe("s1");
        expect(rota.addShift(-3, 1439, 0, "hand").id).toBe("s2");
    });

    add("Rota.addShift asks for a whole day, then for the times, then about the person", () => {
        const rota = crew(mod);
        expect(messageOf(() => rota.addShift(16.5, 1440, 60, "hand"))).toBe("a shift is on a whole day");
        expect(messageOf(() => rota.addShift(16, 1440, 60, "hand", "zed"))).toBe(
            "a shift's times are minutes of one day",
        );
        expect(rota.addShift(16, hm(7), hm(9), "hand").id).toBe("s1");
    });

    add("Rota.addShift takes a time with a part of a minute, and the file writes it so", () => {
        const rota = crew(mod);
        expect(rota.addShift(16, 420.5, 900, "hand")).toEqual(shiftOf("s1", 16, 420.5, 900, "hand", ""));
        expect(rota.toLines()).toEqual(["s1 16 07:00.5-15:00 hand -"]);
    });

    add("Rota.addShift for a person who cannot hold it throws the reason and spends no number", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(15, 30), "hand", "ada");
        expect(messageOf(() => rota.addShift(16, hm(15), hm(17), "hand", "ada"))).toBe("Ada is on s1 then");
        expect(messageOf(() => rota.addShift(16, hm(15), hm(17), "hand", "cleo"))).toBe("Cleo does not work as hand");
        expect(messageOf(() => rota.addShift(16, hm(15), hm(17), "hand", "zed"))).toBe("nobody is called zed");
        expect(rota.shiftsOn(16).map((s) => s.id)).toEqual(["s1"]);
        expect(rota.addShift(16, hm(15, 30), hm(17), "hand", "ada").id).toBe("s2");
    });

    add("Rota.removeShift takes the shift away, and its number is not used again", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(15), "hand");
        rota.addShift(16, hm(8), hm(15), "hand");
        expect(rota.removeShift("s2")).toBe(true);
        expect(rota.shift("s2")).toBeUndefined();
        expect(rota.shiftsOn(16).map((s) => s.id)).toEqual(["s1"]);
        expect(rota.addShift(16, hm(9), hm(15), "hand").id).toBe("s3");
        expect(rota.removeShift("s1")).toBe(true);
        expect(rota.addShift(16, hm(9), hm(15), "hand").id).toBe("s4");
    });

    add("Rota.removeShift says false for a shift that is not there", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(15), "hand");
        expect(rota.removeShift("s9")).toBe(false);
        expect(rota.removeShift("")).toBe(false);
        expect(rota.shiftsOn(16).map((s) => s.id)).toEqual(["s1"]);
        expect(rota.removeShift("s1")).toBe(true);
        expect(rota.removeShift("s1")).toBe(false);
    });

    add("Rota.removeShift drops the requests for the shift, decided or not, and no others", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addShift(19, hm(8), hm(16), "fitter", "bram");
        rota.requestSwap("s1", "bram", T0);
        rota.decideSwap("w1", false, T0 + 5);
        rota.requestSwap("s1", "dov", T0 + 10);
        rota.requestSwap("s2", "dov", T0 + 20);
        expect(rota.removeShift("s1")).toBe(true);
        expect(rota.swapsFor("ada")).toEqual([]);
        expect(rota.swapsFor("dov").map((w) => w.id)).toEqual(["w3"]);
        expect(rota.pendingSwaps().map((w) => w.id)).toEqual(["w3"]);
        expect(messageOf(() => rota.decideSwap("w2", false, T0 + 30))).toBe("no swap w2");
    });

    add("Rota.moveShift changes the shift in place and gives it back", () => {
        const rota = crew(mod);
        const shift = rota.addShift(16, hm(7), hm(15), "hand", "ada");
        const back = rota.moveShift("s1", 17, hm(22), hm(6));
        expect(back).toBe(shift);
        expect(shift).toEqual(shiftOf("s1", 17, 1320, 360, "hand", "ada"));
        expect(rota.shiftsOn(16)).toEqual([]);
        expect(rota.shiftsOn(17)).toEqual([shift]);
    });

    add("Rota.moveShift checks no rule, and throws for a shift that is not there", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(15), "hand", "ada");
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addLeave("ada", 20, 21);
        rota.moveShift("s2", 16, hm(9), hm(12));
        expect(rota.shiftsOn(16).map((s) => s.id)).toEqual(["s1", "s2"]);
        rota.moveShift("s2", 20, hm(9), hm(12));
        expect(rota.shift("s2")?.day).toBe(20);
        expect(messageOf(() => rota.moveShift("s9", 16, 0, 60))).toBe("no shift s9");
    });

    add("Rota.moveShift does not check the day or the times either", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(15), "hand", "ada");
        expect(rota.moveShift("s1", 16, 1440, 60)).toEqual(shiftOf("s1", 16, 1440, 60, "hand", "ada"));
        expect(rota.moveShift("s1", 17, -30, 1500)).toEqual(shiftOf("s1", 17, -30, 1500, "hand", "ada"));
        expect(rota.moveShift("s1", 16.5, hm(7), hm(9)).day).toBe(16.5);
    });

    add("Rota.shift finds a shift by its id, or gives undefined", () => {
        const rota = crew(mod);
        const shift = rota.addShift(16, hm(7), hm(15), "hand");
        expect(rota.shift("s1")).toBe(shift);
        expect(rota.shift("s2")).toBeUndefined();
        expect(rota.shift("S1")).toBeUndefined();
    });

    add("Rota.shift gives the rota's own shift, so a change to it is a change to the rota", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(15), "hand");
        const shift = rota.shift("s1");
        if (shift) shift.day = 17;
        expect(rota.shiftsOn(17).map((s) => s.id)).toEqual(["s1"]);
        expect(rota.shiftsOn(16)).toEqual([]);
    });

    add("Rota.shiftsOn gives the shifts that start on the day, earliest first", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(12), hm(17), "hand");
        rota.addShift(15, hm(22), hm(6), "hand");
        rota.addShift(16, hm(22), hm(6), "lock");
        rota.addShift(16, hm(7), hm(9), "office", "cleo");
        rota.addShift(17, 0, hm(4), "hand");
        expect(rota.shiftsOn(16).map((s) => s.id)).toEqual(["s4", "s1", "s3"]);
        expect(rota.shiftsOn(15).map((s) => s.id)).toEqual(["s2"]);
        expect(rota.shiftsOn(17).map((s) => s.id)).toEqual(["s5"]);
        expect(rota.shiftsOn(18)).toEqual([]);
    });

    add("Rota.shiftsOn: shifts that start together come in the order they were made", () => {
        const rota = crew(mod);
        for (let i = 0; i < 11; i += 1) rota.addShift(16, hm(7), hm(8 + i), "hand");
        rota.addShift(16, hm(6), hm(7), "hand");
        expect(rota.shiftsOn(16).map((s) => s.id)).toEqual([
            "s12", "s1", "s2", "s3", "s4", "s5", "s6", "s7", "s8", "s9", "s10", "s11",
        ]);
    });

    add("Rota.shiftsOn gives a new array of the rota's own shifts", () => {
        const rota = crew(mod);
        const shift = rota.addShift(16, hm(7), hm(15), "hand");
        rota.addShift(16, hm(8), hm(15), "hand");
        const list = rota.shiftsOn(16);
        expect(list[0]).toBe(shift);
        list.length = 0;
        expect(rota.shiftsOn(16).map((s) => s.id)).toEqual(["s1", "s2"]);
    });

    add("Rota.shiftsFor gives a person's shifts over all days, earliest first", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addShift(16, hm(12), hm(17), "hand", "ada");
        rota.addShift(16, hm(7), hm(11), "lock", "ada");
        rota.addShift(17, hm(7), hm(11), "hand", "bram");
        rota.addShift(17, hm(7), hm(11), "hand");
        expect(rota.shiftsFor("ada").map((s) => s.id)).toEqual(["s3", "s2", "s1"]);
        expect(rota.shiftsFor("bram").map((s) => s.id)).toEqual(["s4"]);
        expect(rota.shiftsFor("cleo")).toEqual([]);
        expect(rota.shiftsFor("zed")).toEqual([]);
    });

    add("Rota.shiftsFor the id that stands for nobody gives the open shifts", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand");
        rota.addShift(16, hm(12), hm(17), "hand", "ada");
        rota.addShift(16, hm(7), hm(11), "lock");
        expect(rota.shiftsFor("").map((s) => s.id)).toEqual(["s3", "s1"]);
        const list = rota.shiftsFor("");
        list.pop();
        expect(rota.shiftsFor("").length).toBe(2);
    });

    // --------------------------------------------------------------------------------------- the rules

    add("Rota.whyNot says nothing when the person can hold the shift, and changes nothing", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(15, 30), "hand", "ada");
        const asked = shiftOf("x1", 18, hm(7), hm(15, 30), "lock");
        const before = copyOf(asked);
        expect(rota.whyNot("ada", asked)).toBe("");
        expect(asked).toEqual(before);
        expect(rota.shiftsFor("ada").map((s) => s.id)).toEqual(["s1"]);
        expect(rota.whyNot("dov", asked)).toBe("");
    });

    add("Rota.whyNot: a stranger, and a role the person does not work", () => {
        const rota = crew(mod);
        expect(rota.whyNot("zed", shiftOf("x1", 16, hm(7), hm(15), "hand"))).toBe("nobody is called zed");
        expect(rota.whyNot("", shiftOf("x1", 16, hm(7), hm(15), "hand"))).toBe("nobody is called ");
        expect(rota.whyNot("cleo", shiftOf("x1", 16, hm(7), hm(15), "hand"))).toBe("Cleo does not work as hand");
        expect(rota.whyNot("ada", shiftOf("x1", 16, hm(7), hm(15), "fitter"))).toBe("Ada does not work as fitter");
        expect(rota.whyNot("ada", shiftOf("x1", 16, hm(7), hm(15), "lock"))).toBe("");
    });

    add("Rota.whyNot: leave counts by the day the shift starts on", () => {
        const rota = crew(mod);
        rota.addLeave("ada", 18, 19);
        expect(rota.whyNot("ada", shiftOf("x1", 18, hm(7), hm(15), "hand"))).toBe("Ada is on leave");
        expect(rota.whyNot("ada", shiftOf("x1", 19, hm(22), hm(6), "hand"))).toBe("Ada is on leave");
        expect(rota.whyNot("ada", shiftOf("x1", 17, hm(22), hm(6), "hand"))).toBe("");
        expect(rota.whyNot("ada", shiftOf("x1", 20, 0, hm(6), "hand"))).toBe("");
        expect(rota.whyNot("ada", shiftOf("x1", 18, hm(7), hm(15), "office"))).toBe("Ada does not work as office");
    });

    add("Rota.whyNot: a shift that overlaps one the person holds", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(15, 30), "hand", "ada");
        expect(rota.whyNot("ada", shiftOf("x1", 16, hm(15), hm(17), "hand"))).toBe("Ada is on s1 then");
        expect(rota.whyNot("ada", shiftOf("x1", 16, hm(15, 29), hm(17), "lock"))).toBe("Ada is on s1 then");
        expect(rota.whyNot("ada", shiftOf("x1", 15, hm(22), hm(7, 1), "hand"))).toBe("Ada is on s1 then");
        expect(rota.whyNot("bram", shiftOf("x1", 16, hm(15), hm(17), "hand"))).toBe("");
    });

    add("Rota.whyNot: two shifts on one day need no rest between them, and may touch", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(15, 30), "hand", "ada");
        expect(rota.whyNot("ada", shiftOf("x1", 16, hm(15, 30), hm(17), "hand"))).toBe("");
        expect(rota.whyNot("ada", shiftOf("x1", 16, hm(18), hm(23), "hand"))).toBe("");
        expect(rota.whyNot("ada", shiftOf("x1", 16, hm(1), hm(7), "hand"))).toBe("");
    });

    add("Rota.whyNot: eleven hours of rest after a shift is enough, a minute less is not", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(15, 30), "hand", "ada");
        expect(rota.whyNot("ada", shiftOf("x1", 17, hm(2, 30), hm(8), "hand"))).toBe("");
        expect(rota.whyNot("ada", shiftOf("x1", 17, hm(2, 29), hm(8), "hand"))).toBe(
            "Ada would have too little rest by s1",
        );
        expect(rota.whyNot("ada", shiftOf("x1", 17, 0, hm(1), "lock"))).toBe("Ada would have too little rest by s1");
    });

    add("Rota.whyNot: the rest before a shift the person holds counts too", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(15, 30), "hand", "ada");
        expect(rota.whyNot("ada", shiftOf("x1", 15, hm(14), hm(20), "hand"))).toBe("");
        expect(rota.whyNot("ada", shiftOf("x1", 15, hm(14), hm(20, 1), "hand"))).toBe(
            "Ada would have too little rest by s1",
        );
        expect(rota.whyNot("ada", shiftOf("x1", 15, hm(22), hm(6), "hand"))).toBe(
            "Ada would have too little rest by s1",
        );
    });

    add("Rota.whyNot: six days running are allowed, a seventh is not", () => {
        const rota = crew(mod);
        for (const day of [14, 15, 16, 17, 18]) rota.addShift(day, hm(8), hm(16), "hand", "bram");
        expect(rota.whyNot("bram", shiftOf("x1", 19, hm(8), hm(16), "hand"))).toBe("");
        rota.addShift(19, hm(8), hm(16), "hand", "bram");
        expect(rota.whyNot("bram", shiftOf("x1", 20, hm(8), hm(16), "hand"))).toBe(
            "Bram would work more than 6 days running",
        );
        expect(rota.whyNot("bram", shiftOf("x1", 13, hm(8), hm(16), "hand"))).toBe(
            "Bram would work more than 6 days running",
        );
        expect(rota.whyNot("bram", shiftOf("x1", 16, hm(17), hm(19), "hand"))).toBe("");
        expect(rota.whyNot("bram", shiftOf("x1", 21, hm(8), hm(16), "hand"))).toBe("");
    });

    add("Rota.whyNot: a shift that joins two runs of days is counted with both", () => {
        const rota = crew(mod);
        for (const day of [14, 15, 16, 18, 19, 20]) rota.addShift(day, hm(8), hm(16), "hand", "bram");
        expect(rota.whyNot("bram", shiftOf("x1", 17, hm(8), hm(16), "hand"))).toBe(
            "Bram would work more than 6 days running",
        );
        rota.removeShift("s6");
        expect(rota.whyNot("bram", shiftOf("x1", 17, hm(8), hm(16), "hand"))).toBe("");
    });

    add("Rota.whyNot does not hold a shift against itself", () => {
        const rota = crew(mod);
        const held = rota.addShift(16, hm(7), hm(15, 30), "hand", "ada");
        expect(rota.whyNot("ada", held)).toBe("");
        expect(rota.whyNot("ada", shiftOf("s1", 16, hm(8), hm(12), "hand"))).toBe("");
        expect(rota.whyNot("ada", shiftOf("s2", 16, hm(8), hm(12), "hand"))).toBe("Ada is on s1 then");
    });

    add("Rota.whyNot gives the first reason that holds: leave, then a clash, then rest, then the run", () => {
        const rota = crew(mod);
        for (const day of [14, 15, 16, 17, 18, 19]) rota.addShift(day, hm(8), hm(16), "hand", "bram");
        expect(rota.whyNot("bram", shiftOf("x1", 20, 0, hm(4), "hand"))).toBe(
            "Bram would have too little rest by s6",
        );
        expect(rota.whyNot("bram", shiftOf("x1", 19, hm(12), hm(22), "hand"))).toBe("Bram is on s6 then");
        rota.addLeave("bram", 20, 20);
        rota.moveShift("s6", 20, hm(8), hm(16));
        expect(rota.whyNot("bram", shiftOf("x1", 20, hm(12), hm(22), "hand"))).toBe("Bram is on leave");
    });

    add("Rota.whyNot names the first clash in the rota's own order, the order the shifts came in", () => {
        const rota = crew(mod);
        rota.load(["s1 17 12:00-16:00 hand ada", "s2 17 08:00-13:00 hand ada"]);
        expect(rota.whyNot("ada", shiftOf("x1", 17, hm(12, 30), hm(12, 45), "hand"))).toBe("Ada is on s1 then");
    });

    add("Rota.whyNot names the first short rest in the rota's own order, the order the shifts came in", () => {
        const rota = crew(mod);
        rota.load(["s1 18 07:00-15:00 hand ada", "s2 16 07:00-15:00 hand ada"]);
        expect(rota.whyNot("ada", shiftOf("x1", 17, hm(1), hm(23), "hand"))).toBe(
            "Ada would have too little rest by s1",
        );
    });

    add("Rota.assign gives the shift to the person and gives the rota's shift back", () => {
        const rota = crew(mod);
        const shift = rota.addShift(16, hm(7), hm(15), "hand");
        expect(rota.assign("s1", "ada")).toBe(shift);
        expect(shift.staffId).toBe("ada");
        expect(rota.assign("s1", "bram")).toBe(shift);
        expect(shift.staffId).toBe("bram");
        expect(rota.shiftsFor("ada")).toEqual([]);
    });

    add("Rota.assign throws the reason and leaves the shift as it was", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(15), "hand", "ada");
        rota.addShift(16, hm(14), hm(18), "hand");
        expect(messageOf(() => rota.assign("s2", "ada"))).toBe("Ada is on s1 then");
        expect(messageOf(() => rota.assign("s2", "cleo"))).toBe("Cleo does not work as hand");
        expect(messageOf(() => rota.assign("s2", "zed"))).toBe("nobody is called zed");
        expect(messageOf(() => rota.assign("s2", ""))).toBe("nobody is called ");
        expect(messageOf(() => rota.assign("s9", "ada"))).toBe("no shift s9");
        expect(rota.shift("s2")?.staffId).toBe("");
    });

    add("Rota.release leaves the shift open and gives it back", () => {
        const rota = crew(mod);
        const shift = rota.addShift(16, hm(7), hm(15), "hand", "ada");
        expect(rota.release("s1")).toBe(shift);
        expect(shift.staffId).toBe("");
        expect(rota.release("s1").staffId).toBe("");
        expect(messageOf(() => rota.release("s9"))).toBe("no shift s9");
    });

    add("Rota.release leaves the requests for the shift as they are", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.requestSwap("s1", "bram", T0);
        rota.release("s1");
        expect(rota.pendingSwaps().map((w) => [w.id, w.status, w.decidedAt])).toEqual([["w1", "pending", -1]]);
        expect(messageOf(() => rota.decideSwap("w1", true, T0 + 5))).toBe("ada no longer holds s1");
    });

    // --------------------------------------------------------------------------------------- the swaps

    add("Rota.requestSwap makes a pending request from the holder, numbered from w1", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addShift(19, hm(8), hm(16), "fitter", "bram");
        expect(rota.requestSwap("s1", "bram", T0 + 7)).toEqual({
            id: "w1",
            shiftId: "s1",
            fromStaffId: "ada",
            toStaffId: "bram",
            status: "pending",
            askedAt: T0 + 7,
            decidedAt: -1,
        });
        expect(rota.requestSwap("s2", "dov", T0 + 9)).toEqual({
            id: "w2",
            shiftId: "s2",
            fromStaffId: "bram",
            toStaffId: "dov",
            status: "pending",
            askedAt: T0 + 9,
            decidedAt: -1,
        });
        expect(rota.shift("s1")?.staffId).toBe("ada");
    });

    add("Rota.requestSwap does not ask whether the other person could hold the shift", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        expect(rota.requestSwap("s1", "cleo", T0).status).toBe("pending");
    });

    add("Rota.requestSwap refuses an open shift, the holder, a stranger and a shift that is not there", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addShift(18, hm(7), hm(15), "hand");
        expect(messageOf(() => rota.requestSwap("s2", "bram", T0))).toBe("nobody holds s2");
        expect(messageOf(() => rota.requestSwap("s1", "ada", T0))).toBe("ada holds s1 already");
        expect(messageOf(() => rota.requestSwap("s1", "zed", T0))).toBe("nobody is called zed");
        expect(messageOf(() => rota.requestSwap("s9", "bram", T0))).toBe("no shift s9");
        expect(rota.pendingSwaps()).toEqual([]);
        expect(rota.requestSwap("s1", "bram", T0).id).toBe("w1");
    });

    add("Rota.requestSwap needs 48 hours before the shift starts, and exactly 48 will do", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        const start = 18 * DAY + hm(7);
        expect(messageOf(() => rota.requestSwap("s1", "bram", start - 2879))).toBe("s1 is too soon to swap");
        expect(messageOf(() => rota.requestSwap("s1", "bram", start + 10))).toBe("s1 is too soon to swap");
        expect(rota.requestSwap("s1", "bram", start - 2880).id).toBe("w1");
    });

    add("Rota.requestSwap refuses to ask a person twice while the first request is pending", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.requestSwap("s1", "bram", T0);
        expect(messageOf(() => rota.requestSwap("s1", "bram", T0 + 1))).toBe("bram has been asked about s1 already");
        expect(rota.requestSwap("s1", "dov", T0 + 2).id).toBe("w2");
        rota.decideSwap("w1", false, T0 + 3);
        expect(rota.requestSwap("s1", "bram", T0 + 4).id).toBe("w3");
    });

    add("Rota.requestSwap does not use a request's number again", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addShift(19, hm(8), hm(16), "fitter", "bram");
        rota.requestSwap("s1", "bram", T0);
        rota.requestSwap("s1", "dov", T0 + 1);
        rota.removeShift("s1");
        expect(rota.requestSwap("s2", "dov", T0 + 2).id).toBe("w3");
        expect(messageOf(() => rota.requestSwap("s2", "dov", T0 + 3))).toBe("dov has been asked about s2 already");
        expect(rota.requestSwap("s2", "ada", T0 + 4).id).toBe("w4");
    });

    add("Rota.requestSwap: a person asked is asked already, whoever holds the shift now", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.requestSwap("s1", "bram", T0);
        rota.assign("s1", "dov");
        expect(messageOf(() => rota.requestSwap("s1", "bram", T0 + 1))).toBe("bram has been asked about s1 already");
        expect(rota.requestSwap("s1", "ada", T0 + 2)).toMatchObject({ id: "w2", fromStaffId: "dov", toStaffId: "ada" });
    });

    add("Rota.requestSwap refuses an open shift, the holder, a stranger, too soon, asked twice, in that order", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addShift(18, hm(7), hm(15), "hand");
        const late = 17 * DAY;
        expect(messageOf(() => rota.requestSwap("s2", "zed", late))).toBe("nobody holds s2");
        expect(messageOf(() => rota.requestSwap("s1", "ada", late))).toBe("ada holds s1 already");
        expect(messageOf(() => rota.requestSwap("s1", "zed", late))).toBe("nobody is called zed");
        rota.requestSwap("s1", "bram", T0);
        expect(messageOf(() => rota.requestSwap("s1", "bram", late))).toBe("s1 is too soon to swap");
    });

    add("Rota.decideSwap approving hands the shift over and stamps the request", () => {
        const rota = crew(mod);
        const shift = rota.addShift(18, hm(7), hm(15), "hand", "ada");
        const asked = rota.requestSwap("s1", "bram", T0);
        const decided = rota.decideSwap("w1", true, T0 + 50);
        expect(decided).toBe(asked);
        expect(decided).toEqual({
            id: "w1",
            shiftId: "s1",
            fromStaffId: "ada",
            toStaffId: "bram",
            status: "approved",
            askedAt: T0,
            decidedAt: T0 + 50,
        });
        expect(shift.staffId).toBe("bram");
        expect(rota.pendingSwaps()).toEqual([]);
    });

    add("Rota.decideSwap refusing leaves the shift with its holder and stamps the request", () => {
        const rota = crew(mod);
        const shift = rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.requestSwap("s1", "bram", T0);
        const decided = rota.decideSwap("w1", false, T0 + 60);
        expect([decided.status, decided.decidedAt]).toEqual(["refused", T0 + 60]);
        expect(shift.staffId).toBe("ada");
        expect(rota.pendingSwaps()).toEqual([]);
    });

    add("Rota.decideSwap refusing one request leaves the others for the shift pending", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.requestSwap("s1", "bram", T0);
        rota.requestSwap("s1", "dov", T0 + 1);
        rota.decideSwap("w1", false, T0 + 60);
        expect(rota.swapsFor("ada").map((w) => [w.id, w.status, w.decidedAt])).toEqual([
            ["w2", "pending", -1],
            ["w1", "refused", T0 + 60],
        ]);
    });

    add("Rota.decideSwap approving one request leaves the others for the shift pending", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.requestSwap("s1", "bram", T0);
        rota.requestSwap("s1", "dov", T0 + 1);
        rota.decideSwap("w1", true, T0 + 60);
        expect(rota.swapsFor("ada").map((w) => [w.id, w.status, w.decidedAt])).toEqual([
            ["w2", "pending", -1],
            ["w1", "approved", T0 + 60],
        ]);
        expect(rota.pendingSwaps().map((w) => w.id)).toEqual(["w2"]);
        expect(messageOf(() => rota.decideSwap("w2", true, T0 + 70))).toBe("ada no longer holds s1");
    });

    add("Rota.decideSwap throws for a request that is not there or is decided", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addShift(19, hm(7), hm(15), "hand", "ada");
        rota.requestSwap("s1", "bram", T0);
        rota.requestSwap("s2", "bram", T0);
        expect(messageOf(() => rota.decideSwap("w9", true, T0 + 1))).toBe("no swap w9");
        rota.decideSwap("w1", true, T0 + 2);
        rota.decideSwap("w2", false, T0 + 3);
        expect(messageOf(() => rota.decideSwap("w1", false, T0 + 4))).toBe("w1 is approved already");
        expect(messageOf(() => rota.decideSwap("w2", true, T0 + 4))).toBe("w2 is refused already");
        expect(rota.swapsFor("ada").map((w) => [w.id, w.status, w.decidedAt])).toEqual([
            ["w2", "refused", T0 + 3],
            ["w1", "approved", T0 + 2],
        ]);
    });

    add("Rota.decideSwap approving for a person who cannot hold the shift throws and changes nothing", () => {
        const rota = crew(mod);
        const shift = rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addShift(18, hm(14), hm(18), "hand", "bram");
        rota.requestSwap("s1", "cleo", T0);
        rota.requestSwap("s1", "bram", T0 + 1);
        expect(messageOf(() => rota.decideSwap("w1", true, T0 + 5))).toBe("Cleo does not work as hand");
        expect(messageOf(() => rota.decideSwap("w2", true, T0 + 6))).toBe("Bram is on s2 then");
        expect(shift.staffId).toBe("ada");
        expect(rota.pendingSwaps().map((w) => [w.id, w.status, w.decidedAt])).toEqual([
            ["w1", "pending", -1],
            ["w2", "pending", -1],
        ]);
        expect(rota.decideSwap("w1", false, T0 + 7).status).toBe("refused");
    });

    add("Rota.decideSwap will not approve when the shift has left the person who asked", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.requestSwap("s1", "bram", T0);
        rota.assign("s1", "dov");
        expect(messageOf(() => rota.decideSwap("w1", true, T0 + 5))).toBe("ada no longer holds s1");
        expect(rota.shift("s1")?.staffId).toBe("dov");
        expect(rota.pendingSwaps().map((w) => w.id)).toEqual(["w1"]);
        expect(rota.decideSwap("w1", false, T0 + 6).decidedAt).toBe(T0 + 6);
    });

    add("Rota.decideSwap asks whether the asker still holds the shift before it asks about the other person", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.requestSwap("s1", "cleo", T0);
        rota.assign("s1", "dov");
        expect(messageOf(() => rota.decideSwap("w1", true, T0 + 5))).toBe("ada no longer holds s1");
        expect(rota.pendingSwaps().map((w) => w.id)).toEqual(["w1"]);
    });

    add("Rota.swapsFor gives the requests a person asked or was asked, the newest first", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addShift(19, hm(8), hm(16), "fitter", "bram");
        rota.addShift(20, hm(9), hm(13), "office", "cleo");
        rota.requestSwap("s1", "bram", T0 + 30);
        rota.requestSwap("s2", "dov", T0 + 20);
        rota.requestSwap("s3", "dov", T0 + 10);
        rota.requestSwap("s1", "dov", T0);
        expect(rota.swapsFor("ada").map((w) => w.id)).toEqual(["w4", "w1"]);
        expect(rota.swapsFor("bram").map((w) => w.id)).toEqual(["w2", "w1"]);
        expect(rota.swapsFor("dov").map((w) => w.id)).toEqual(["w4", "w3", "w2"]);
        expect(rota.swapsFor("zed")).toEqual([]);
    });

    add("Rota.swapsFor keeps the decided requests, in a new array", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addShift(19, hm(7), hm(15), "hand", "ada");
        rota.requestSwap("s1", "bram", T0);
        rota.requestSwap("s2", "bram", T0 + 1);
        rota.requestSwap("s2", "dov", T0 + 2);
        rota.decideSwap("w1", true, T0 + 5);
        rota.decideSwap("w2", false, T0 + 6);
        const list = rota.swapsFor("ada");
        expect(list.map((w) => [w.id, w.status])).toEqual([
            ["w3", "pending"],
            ["w2", "refused"],
            ["w1", "approved"],
        ]);
        list.length = 0;
        expect(rota.swapsFor("ada").length).toBe(3);
    });

    add("Rota.pendingSwaps gives the undecided requests, the oldest first", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addShift(19, hm(8), hm(16), "fitter", "bram");
        rota.addShift(20, hm(9), hm(13), "office", "cleo");
        rota.requestSwap("s1", "bram", T0 + 30);
        rota.requestSwap("s2", "dov", T0 + 20);
        rota.requestSwap("s3", "dov", T0 + 10);
        expect(rota.pendingSwaps().map((w) => w.id)).toEqual(["w1", "w2", "w3"]);
        rota.decideSwap("w2", false, T0 + 40);
        expect(rota.pendingSwaps().map((w) => w.id)).toEqual(["w1", "w3"]);
    });

    add("Rota.pendingSwaps does not turn the rota's own list round", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addShift(19, hm(8), hm(16), "fitter", "bram");
        rota.requestSwap("s1", "bram", T0);
        rota.requestSwap("s2", "dov", T0 + 1);
        rota.requestSwap("s1", "dov", T0 + 2);
        expect(new mod.Rota().pendingSwaps()).toEqual([]);
        expect(rota.pendingSwaps().map((w) => w.id)).toEqual(["w1", "w2", "w3"]);
        expect(rota.pendingSwaps().map((w) => w.id)).toEqual(["w1", "w2", "w3"]);
        expect(rota.swapsFor("dov").map((w) => w.id)).toEqual(["w3", "w2"]);
    });

    add("Rota.lapseSwaps refuses the pending requests whose shift starts in under 48 hours", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addShift(19, hm(8), hm(16), "fitter", "bram");
        rota.requestSwap("s1", "bram", T0);
        rota.requestSwap("s1", "dov", T0 + 1);
        rota.requestSwap("s2", "dov", T0 + 2);
        const start = 18 * DAY + hm(7);
        expect(rota.lapseSwaps(start - 2880)).toBe(0);
        expect(rota.pendingSwaps().map((w) => w.id)).toEqual(["w1", "w2", "w3"]);
        expect(rota.lapseSwaps(start - 2879)).toBe(2);
        expect(rota.swapsFor("dov").map((w) => [w.id, w.status, w.decidedAt])).toEqual([
            ["w3", "pending", -1],
            ["w2", "refused", start - 2879],
        ]);
        expect(rota.swapsFor("ada").map((w) => [w.id, w.status, w.decidedAt])).toEqual([
            ["w2", "refused", start - 2879],
            ["w1", "refused", start - 2879],
        ]);
        expect(rota.lapseSwaps(start - 2879)).toBe(0);
    });

    add("Rota.lapseSwaps leaves decided requests as they were", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.addShift(18, hm(8), hm(16), "fitter", "bram");
        rota.requestSwap("s1", "bram", T0);
        rota.requestSwap("s2", "dov", T0 + 1);
        rota.decideSwap("w1", false, T0 + 5);
        rota.decideSwap("w2", true, T0 + 6);
        expect(rota.lapseSwaps(18 * DAY)).toBe(0);
        expect(rota.swapsFor("bram").map((w) => [w.id, w.status, w.decidedAt])).toEqual([
            ["w2", "approved", T0 + 6],
            ["w1", "refused", T0 + 5],
        ]);
        expect(new mod.Rota().lapseSwaps(0)).toBe(0);
    });

    add("Rota.lapseSwaps goes by the notice alone, whether or not anybody holds the shift now", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(7), hm(15), "hand", "ada");
        rota.requestSwap("s1", "bram", T0);
        rota.release("s1");
        expect(rota.lapseSwaps(T0 + 1)).toBe(0);
        expect(rota.pendingSwaps().map((w) => w.id)).toEqual(["w1"]);
        expect(rota.lapseSwaps(18 * DAY + hm(7) - 2879)).toBe(1);
    });

    // ---------------------------------------------------------------------------------- rest and hours

    add("Rota.restBreaches reports a rest of less than eleven hours, and not one of eleven", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(15, 30), "hand", "ada");
        rota.addShift(18, hm(7), hm(15, 30), "hand", "ada");
        expect(rota.restBreaches("ada")).toEqual([]);
        rota.moveShift("s2", 17, hm(2, 29), hm(8));
        expect(rota.restBreaches("ada")).toEqual([{ staffId: "ada", earlierId: "s1", laterId: "s2", rest: 659 }]);
        rota.moveShift("s2", 17, hm(2, 30), hm(8));
        expect(rota.restBreaches("ada")).toEqual([]);
        expect(rota.restBreaches("bram")).toEqual([]);
    });

    add("Rota.restBreaches goes through a person's shifts in order and skips a split shift", () => {
        const rota = crew(mod);
        rota.load([
            "s1 18 08:00-10:00 hand ada",
            "s2 17 23:00-03:00 hand ada",
            "s3 17 12:00-13:00 hand ada",
            "s4 17 01:00-05:00 hand ada",
            "s5 16 07:00-15:30 hand ada",
            "s6 17 05:00-11:00 hand bram",
            "s7 16 16:00-18:00 hand -",
        ]);
        expect(rota.restBreaches("ada")).toEqual([
            { staffId: "ada", earlierId: "s5", laterId: "s4", rest: 570 },
            { staffId: "ada", earlierId: "s2", laterId: "s1", rest: 300 },
        ]);
        expect(rota.restBreaches("bram")).toEqual([]);
        expect(rota.restBreaches("zed")).toEqual([]);
    });

    add("Rota.daysRunning counts back from the day, and is 0 for a day not worked", () => {
        const rota = crew(mod);
        for (const day of [14, 15, 16, 18]) rota.addShift(day, hm(8), hm(16), "hand", "bram");
        expect([14, 15, 16, 17, 18, 19].map((day) => rota.daysRunning("bram", day))).toEqual([1, 2, 3, 0, 1, 0]);
        expect(rota.daysRunning("ada", 16)).toBe(0);
        expect(rota.daysRunning("zed", 16)).toBe(0);
    });

    add("Rota.daysRunning: a night shift counts for the day it starts on, and two shifts are one day", () => {
        const rota = crew(mod);
        rota.addShift(18, hm(8), hm(10), "hand", "bram");
        rota.addShift(18, hm(10), hm(12), "fitter", "bram");
        rota.addShift(19, hm(22), hm(6), "hand", "bram");
        rota.addShift(19, hm(8), hm(16), "hand");
        expect(rota.daysRunning("bram", 18)).toBe(1);
        expect(rota.daysRunning("bram", 19)).toBe(2);
        expect(rota.daysRunning("bram", 20)).toBe(0);
    });

    const week = [
        "s1 13 09:00-13:00 hand ada",
        "s2 14 07:00-15:30 hand ada",
        "s3 20 22:00-06:00 hand ada",
        "s4 21 07:00-13:00 hand ada",
        "s5 16 07:00-15:30 hand bram",
        "s6 17 07:00-15:30 hand -",
    ];

    add("Rota.minutesInWeek adds the paid minutes of the shifts that start in the day's week", () => {
        const rota = crew(mod);
        rota.load(week);
        expect([14, 17, 20].map((day) => rota.minutesInWeek("ada", day))).toEqual([930, 930, 930]);
        expect(rota.minutesInWeek("bram", 15)).toBe(480);
        expect(rota.minutesInWeek("cleo", 15)).toBe(0);
        expect(rota.minutesInWeek("zed", 15)).toBe(0);
    });

    add("Rota.minutesInWeek: the weeks on either side are counted on their own", () => {
        const rota = crew(mod);
        rota.load(week);
        expect(rota.minutesInWeek("ada", 13)).toBe(240);
        expect(rota.minutesInWeek("ada", 7)).toBe(240);
        expect(rota.minutesInWeek("ada", 21)).toBe(360);
        expect(rota.minutesInWeek("ada", 27)).toBe(360);
        expect(rota.minutesInWeek("ada", 28)).toBe(0);
    });

    add("Rota.overContract is the paid minutes over the person's contract for the week", () => {
        const rota = crew(mod);
        rota.load(["s1 14 07:00-15:30 hand dov", "s2 15 07:00-15:30 hand dov"]);
        expect(rota.overContract("dov", 16)).toBe(60);
        expect(rota.overContract("dov", 21)).toBe(0);
        expect(rota.overContract("ada", 16)).toBe(0);
    });

    add("Rota.overContract is 0 at the contract exactly, under it, and for a stranger", () => {
        const rota = crew(mod);
        rota.load(["s1 14 07:00-15:30 hand dov", "s2 15 07:00-14:30 hand dov", "s3 15 07:00-15:30 hand ada"]);
        expect(rota.minutesInWeek("dov", 14)).toBe(900);
        expect(rota.overContract("dov", 14)).toBe(0);
        expect(rota.overContract("ada", 14)).toBe(0);
        expect(rota.overContract("zed", 14)).toBe(0);
        rota.moveShift("s2", 15, hm(7), hm(14, 31));
        expect(rota.overContract("dov", 14)).toBe(1);
    });

    add("Rota.costOn adds each held shift's pay at its holder's rate, rounded shift by shift", () => {
        const rota = crew(mod);
        rota.load([
            "s1 16 07:00-15:30 hand ada",
            "s2 16 22:00-06:00 hand bram",
            "s3 16 09:00-09:30 office cleo",
            "s4 16 12:00-12:30 office cleo",
            "s5 16 10:00-10:30 lock dov",
            "s6 16 07:00-15:30 hand -",
            "s7 15 22:00-06:00 hand dov",
        ]);
        expect(rota.costOn(16)).toBe(10080 + 11813 + 667 + 667 + 550);
        expect(rota.costOn(15)).toBe(8250);
    });

    add("Rota.costOn is 0 for a day with no held shift", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(15), "hand");
        rota.addShift(17, hm(7), hm(15), "hand", "ada");
        expect(rota.costOn(16)).toBe(0);
        expect(rota.costOn(18)).toBe(0);
        expect(rota.costOn(17)).toBe(9450);
    });

    add("Rota.costOn of a Sunday is worked out as for any other day", () => {
        const rota = crew(mod);
        rota.addShift(20, hm(9), hm(13), "hand", "ada");
        rota.addShift(20, hm(9), hm(9, 30), "office", "cleo");
        expect(rota.costOn(20)).toBe(5040 + 667);
    });

    add("Rota.gapsOn gives the gaps in the rota's own shifts", () => {
        const rota = crew(mod);
        rota.addShift(20, hm(9), hm(11), "hand", "ada");
        rota.addShift(20, hm(11), hm(13), "hand");
        expect(rota.gapsOn(20)).toEqual([{ role: "hand", from: 660, to: 780, short: 1 }]);
        expect(rota.gapsOn(19).length).toBe(4);
    });

    add("Rota.gapsOn counts a shift that began the day before", () => {
        const rota = crew(mod);
        rota.addShift(19, hm(20), hm(10), "hand", "ada");
        expect(rota.gapsOn(20)).toEqual([{ role: "hand", from: 600, to: 780, short: 1 }]);
        rota.moveShift("s1", 19, hm(20), hm(13));
        expect(rota.gapsOn(20)).toEqual([]);
        expect(rota.isCovered(20)).toBe(true);
    });

    add("Rota.gapsOn is empty when the day has its cover", () => {
        const rota = crew(mod);
        rota.addShift(14, hm(7), hm(17), "hand", "ada");
        rota.addShift(14, hm(7), hm(17), "hand", "dov");
        rota.addShift(14, hm(8), hm(16), "fitter", "bram");
        rota.addShift(14, hm(9), hm(17), "office", "cleo");
        expect(rota.gapsOn(14)).toEqual([]);
        expect(rota.gapsOn(15).length).toBe(3);
    });

    add("Rota.isCovered is true only when the day has no gap", () => {
        const rota = crew(mod);
        rota.addShift(20, hm(9), hm(13), "hand", "ada");
        expect(rota.isCovered(20)).toBe(true);
        expect(rota.isCovered(27)).toBe(false);
        rota.release("s1");
        expect(rota.isCovered(20)).toBe(false);
    });

    add("Rota.isCovered: half an hour short is not covered", () => {
        const rota = crew(mod);
        rota.addShift(20, hm(9), hm(12, 30), "hand", "ada");
        expect(rota.isCovered(20)).toBe(false);
        rota.moveShift("s1", 20, hm(9), hm(12, 31));
        expect(rota.isCovered(20)).toBe(true);
        expect(new mod.Rota().isCovered(20)).toBe(false);
    });

    // ----------------------------------------------------------------------------- the file, both ways

    add("Rota.toLines writes one line for each shift, earliest first", () => {
        const rota = crew(mod);
        rota.addShift(17, hm(7), hm(15, 30), "hand", "ada");
        rota.addShift(16, hm(22), hm(6), "lock");
        rota.addShift(16, hm(16), 1440, "office", "cleo");
        expect(rota.toLines()).toEqual([
            "s3 16 16:00-00:00 office cleo",
            "s2 16 22:00-06:00 lock -",
            "s1 17 07:00-15:30 hand ada",
        ]);
    });

    add("Rota.toLines of an empty rota is no line, and shifts that start together keep their order", () => {
        expect(new mod.Rota().toLines()).toEqual([]);
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(9), "hand");
        rota.addShift(16, hm(7), hm(8), "lock");
        expect(rota.toLines()).toEqual(["s1 16 07:00-09:00 hand -", "s2 16 07:00-08:00 lock -"]);
    });

    add("Rota.toLines leaves the rota's own order of shifts as it was", () => {
        const rota = crew(mod);
        rota.load(["s1 17 12:00-16:00 hand ada", "s2 17 08:00-13:00 hand ada"]);
        expect(rota.toLines()).toEqual(["s2 17 08:00-13:00 hand ada", "s1 17 12:00-16:00 hand ada"]);
        expect(rota.whyNot("ada", shiftOf("x1", 17, hm(12, 30), hm(12, 45), "hand"))).toBe("Ada is on s1 then");
    });

    add("Rota.load reads the lines, passes over blank lines and # lines, and says how many shifts", () => {
        const rota = crew(mod);
        const lines = ["# week of day 14", "s1 17 07:00-15:30 hand ada", "", "   ", "s2 16 22:00-06:00 lock -"];
        const read = rota.load(lines);
        expect(read).toBe(2);
        expect(rota.shift("s1")).toEqual(shiftOf("s1", 17, 420, 930, "hand", "ada"));
        expect(rota.shift("s2")).toEqual(shiftOf("s2", 16, 1320, 360, "lock", ""));
        expect(rota.toLines()).toEqual(["s2 16 22:00-06:00 lock -", "s1 17 07:00-15:30 hand ada"]);
        expect(rota.load([])).toBe(0);
    });

    add("Rota.load numbers later shifts on from the highest number read", () => {
        const rota = crew(mod);
        rota.addShift(16, hm(7), hm(9), "hand");
        rota.load(["s7 17 07:00-15:30 hand ada", "s4 18 07:00-15:30 hand ada"]);
        expect(rota.addShift(16, hm(7), hm(9), "hand").id).toBe("s8");
        rota.load(["s3 19 07:00-15:30 hand ada"]);
        expect(rota.addShift(16, hm(7), hm(9), "hand").id).toBe("s9");
    });

    add("Rota.load checks no rule, but refuses a shift that is there and a holder who is not", () => {
        const rota = crew(mod);
        rota.load(["s1 17 07:00-15:30 hand cleo", "s2 17 08:00-12:00 hand cleo"]);
        expect(rota.shiftsFor("cleo").map((s) => s.id)).toEqual(["s1", "s2"]);
        expect(messageOf(() => rota.load(["s2 18 07:00-15:30 hand ada"]))).toBe("s2 is on the rota already");
        expect(messageOf(() => rota.load(["s3 18 07:00-15:30 hand zed"]))).toBe("nobody is called zed");
        expect(messageOf(() => rota.load(["s3 18 07:00-15:30 cook ada"]))).toBe(
            "not a shift: s3 18 07:00-15:30 cook ada",
        );
        expect(rota.shift("s3")).toBeUndefined();
    });

    add("Rota.load passes over a # line only when # is the line's first character", () => {
        const rota = crew(mod);
        expect(messageOf(() => rota.load(["  # week of day 14", "s1 17 07:00-15:30 hand ada"]))).toBe(
            "not a shift:   # week of day 14",
        );
        expect(rota.shift("s1")).toBeUndefined();
        expect(rota.load(["#s1 17 07:00-15:30 hand ada", "s2 17 07:00-15:30 hand ada"])).toBe(1);
    });

    add("Rota.load keeps the shifts it read before a line it refuses", () => {
        const rota = crew(mod);
        expect(messageOf(() => rota.load(["s1 17 07:00-15:30 hand ada", "s2 18 07:00-15:30 hand zed"]))).toBe(
            "nobody is called zed",
        );
        expect(rota.shift("s1")).toEqual(shiftOf("s1", 17, 420, 930, "hand", "ada"));
        expect(rota.shift("s2")).toBeUndefined();
        expect(rota.addShift(16, hm(7), hm(9), "hand").id).toBe("s2");
        expect(messageOf(() => rota.load(["s5 19 07:00-15:30 hand -", "s5 20 07:00-15:30 hand -"]))).toBe(
            "s5 is on the rota already",
        );
        expect(rota.shift("s5")?.day).toBe(19);
    });

    for (const name of skip) {
        if (!cases.some(([had]) => had === name)) throw new Error(`no case is called "${name}"`);
    }
    describe("src/rota.ts does what it did", () => {
        for (const [name, run] of cases) {
            if (!skip.includes(name)) it(name, run);
        }
    });
}

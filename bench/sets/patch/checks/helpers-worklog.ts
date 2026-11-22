// What src/worklog.ts does now, pinned case by case. A task's check calls `unchanged` and skips, by name,
// only the cases its change must alter.
import { describe, expect, it } from "vitest";
import { copyOf } from "./helpers";

type Mod = typeof import("../src/worklog");
type Job = import("../src/worklog").Job;
type JobState = import("../src/worklog").JobState;
type Priority = import("../src/worklog").Priority;
type Grade = import("../src/worklog").Grade;
type TimeEntry = import("../src/worklog").TimeEntry;

const STATES: JobState[] = ["reported", "booked", "started", "waiting", "done", "signed", "dropped"];

function job(over: Partial<Job> = {}): Job {
    const base: Job = {
        id: 1,
        boatId: "KESTREL",
        title: "Stern gland weeping",
        priority: "routine",
        state: "started",
        openedDay: 10,
        dueDay: -1,
        closedDay: -1,
        history: [{ to: "reported", day: 10, by: "Ann" }],
        parts: [],
        time: [],
    };
    return { ...base, ...over };
}

function entry(day: number, startMin: number, endMin: number, fitter = "Ann", grade: Grade = "fitter"): TimeEntry {
    return { day, startMin, endMin, fitter, grade };
}

export function unchanged(mod: Mod, skip: string[] = []): void {
    const names = new Set<string>();
    const pin = (name: string, run: () => void): void => {
        if (names.has(name)) {
            throw new Error(`two cases are called "${name}"`);
        }
        names.add(name);
        if (!skip.includes(name)) {
            it(name, run);
        }
    };

    describe("worklog as it was", () => {
        // ---------------------------------------------------------------- constants and states
        pin("constants: NO_DAY is -1, NO_JOB is 0, DAY_MIN is 1440", () => {
            expect(mod.NO_DAY).toBe(-1);
            expect(mod.NO_JOB).toBe(0);
            expect(mod.DAY_MIN).toBe(1440);
        });
        pin("constants: JOB_STATES lists the seven states in their order", () => {
            expect([...mod.JOB_STATES]).toEqual(STATES);
        });

        pin("isOpen: reported, booked, started and waiting are open", () => {
            expect(["reported", "booked", "started", "waiting"].map((s) => mod.isOpen(s as JobState))).toEqual([
                true, true, true, true,
            ]);
        });
        pin("isOpen: done, signed and dropped are not open", () => {
            expect(["done", "signed", "dropped"].map((s) => mod.isOpen(s as JobState))).toEqual([false, false, false]);
        });

        pin("isFrozen: signed and dropped are frozen", () => {
            expect(mod.isFrozen("signed")).toBe(true);
            expect(mod.isFrozen("dropped")).toBe(true);
        });
        pin("isFrozen: done is not frozen, and no open state is", () => {
            expect(["reported", "booked", "started", "waiting", "done"].map((s) => mod.isFrozen(s as JobState))).toEqual([
                false, false, false, false, false,
            ]);
        });

        const table: Record<JobState, JobState[]> = {
            reported: ["booked", "dropped"],
            booked: ["started", "waiting", "dropped"],
            started: ["waiting", "done"],
            waiting: ["booked", "started", "dropped"],
            done: ["started", "signed"],
            signed: [],
            dropped: [],
        };
        pin("canMove: every pair of states, for a routine job", () => {
            for (const from of STATES) {
                for (const to of STATES) {
                    expect([from, to, mod.canMove(from, to, "routine")]).toEqual([from, to, table[from].includes(to)]);
                }
            }
        });
        pin("canMove: only an urgent job goes from reported straight to started", () => {
            expect(mod.canMove("reported", "started", "urgent")).toBe(true);
            expect(mod.canMove("reported", "started", "soon")).toBe(false);
            expect(mod.canMove("reported", "done", "urgent")).toBe(false);
            expect(mod.canMove("signed", "started", "urgent")).toBe(false);
        });
        pin("canMove: every pair of states, for an urgent and a soon job", () => {
            for (const priority of ["urgent", "soon"] as Priority[]) {
                for (const from of STATES) {
                    for (const to of STATES) {
                        const skips = priority === "urgent" && from === "reported" && to === "started";
                        const allowed = table[from].includes(to) || skips;
                        expect([priority, from, to, mod.canMove(from, to, priority)]).toEqual([priority, from, to, allowed]);
                    }
                }
            }
        });
        pin("canMove: with no priority given it is a routine job", () => {
            expect(mod.canMove("reported", "started")).toBe(false);
            expect(mod.canMove("reported", "booked")).toBe(true);
            expect(mod.canMove("started", "started")).toBe(false);
        });

        pin("nextStates: in the order of JOB_STATES", () => {
            expect(mod.nextStates("waiting")).toEqual(["booked", "started", "dropped"]);
            expect(mod.nextStates("done")).toEqual(["started", "signed"]);
            expect(mod.nextStates("booked", "soon")).toEqual(["started", "waiting", "dropped"]);
        });
        pin("nextStates: an urgent reported job may also start; signed and dropped go nowhere", () => {
            expect(mod.nextStates("reported")).toEqual(["booked", "dropped"]);
            expect(mod.nextStates("reported", "urgent")).toEqual(["booked", "started", "dropped"]);
            expect(mod.nextStates("signed", "urgent")).toEqual([]);
            expect(mod.nextStates("dropped")).toEqual([]);
        });

        // ---------------------------------------------------------------- days and weeks
        pin("dueFor: urgent is due the next day, soon a week on", () => {
            expect(mod.dueFor("urgent", 40)).toBe(41);
            expect(mod.dueFor("soon", 40)).toBe(47);
            expect(mod.dueFor("urgent", 0)).toBe(1);
        });
        pin("dueFor: routine has no due day", () => {
            expect(mod.dueFor("routine", 40)).toBe(-1);
            expect(mod.dueFor("routine", 0)).toBe(-1);
        });

        pin("weekOf: day 0 is a Monday, in the week of the Saturday before it", () => {
            expect(mod.weekOf(0)).toBe(-2);
            expect(mod.weekOf(4)).toBe(-2);
        });
        pin("weekOf: a Saturday begins its week, and the Friday after ends it", () => {
            expect(mod.weekOf(5)).toBe(5);
            expect(mod.weekOf(6)).toBe(5);
            expect(mod.weekOf(11)).toBe(5);
            expect(mod.weekOf(12)).toBe(12);
            expect(mod.weekOf(100)).toBe(96);
        });
        pin("weekOf: days before day 0", () => {
            expect(mod.weekOf(-1)).toBe(-2);
            expect(mod.weekOf(-2)).toBe(-2);
            expect(mod.weekOf(-3)).toBe(-9);
        });

        // ---------------------------------------------------------------- labour
        pin("billedMinutes: every started quarter hour is charged whole", () => {
            expect(mod.billedMinutes(entry(3, 480, 481))).toBe(15);
            expect(mod.billedMinutes(entry(3, 480, 495))).toBe(15);
            expect(mod.billedMinutes(entry(3, 480, 496))).toBe(30);
            expect(mod.billedMinutes(entry(3, 480, 580))).toBe(105);
            expect(mod.billedMinutes(entry(3, 0, 1440))).toBe(1440);
        });
        pin("billedMinutes: nothing for an entry that ends at or before its start", () => {
            expect(mod.billedMinutes(entry(3, 480, 480))).toBe(0);
            expect(mod.billedMinutes(entry(3, 480, 470))).toBe(0);
        });

        pin("labourMinutes: each entry is rounded up on its own", () => {
            expect(mod.labourMinutes(job({ time: [entry(11, 480, 485), entry(11, 600, 605)] }))).toBe(30);
            expect(mod.labourMinutes(job({ time: [entry(11, 480, 540), entry(12, 480, 500, "Bo", "engineer")] }))).toBe(90);
        });
        pin("labourMinutes: a job with no time has none", () => {
            expect(mod.labourMinutes(job())).toBe(0);
        });

        pin("labourPence: the rate is by grade, in pence for an hour", () => {
            expect(mod.labourPence(job({ time: [entry(11, 480, 540, "Cy", "apprentice")] }))).toBe(2400);
            expect(mod.labourPence(job({ time: [entry(11, 480, 540, "Ann", "fitter")] }))).toBe(4200);
            expect(mod.labourPence(job({ time: [entry(11, 480, 540, "Bo", "engineer")] }))).toBe(5800);
        });
        pin("labourPence: an entry is rounded up to the quarter hour before it is priced", () => {
            expect(mod.labourPence(job({ time: [entry(11, 480, 481, "Bo", "engineer")] }))).toBe(1450);
            expect(mod.labourPence(job({ time: [entry(11, 480, 525, "Ann"), entry(11, 600, 610, "Cy", "apprentice")] }))).toBe(
                3150 + 600,
            );
            expect(mod.labourPence(job())).toBe(0);
        });

        // ---------------------------------------------------------------- parts and cost
        pin("partsCost: quantity times unit price, summed over the lines", () => {
            const parts = [
                { sku: "GLAND-28", qty: 2, unitPence: 1999 },
                { sku: "GREASE", qty: 1, unitPence: 350 },
            ];
            expect(mod.partsCost(job({ parts }))).toBe(4348);
        });
        pin("partsCost: a job with no parts costs 0, and handling is not in it", () => {
            expect(mod.partsCost(job())).toBe(0);
            expect(mod.partsCost(job({ parts: [{ sku: "A", qty: 4, unitPence: 100 }] }))).toBe(400);
        });

        pin("costOf: handling is an eighth of the parts, rounded once for the job", () => {
            const four = ["A", "B", "C", "D"].map((sku) => ({ sku, qty: 1, unitPence: 1 }));
            expect(mod.costOf(job({ parts: four })).handlingPence).toBe(1);
            expect(mod.costOf(job({ parts: four.slice(0, 3) })).handlingPence).toBe(0);
            expect(mod.costOf(job({ parts: [{ sku: "A", qty: 4, unitPence: 100 }] })).handlingPence).toBe(50);
        });
        pin("costOf: the total is parts, handling and labour", () => {
            const parts = [
                { sku: "GLAND-28", qty: 2, unitPence: 1999 },
                { sku: "GREASE", qty: 1, unitPence: 350 },
            ];
            const time = [entry(11, 480, 580, "Ann", "fitter"), entry(11, 600, 610, "Cy", "apprentice")];
            expect(mod.costOf(job({ parts, time }))).toEqual({
                partsPence: 4348,
                handlingPence: 544,
                labourMin: 120,
                labourPence: 7350 + 600,
                totalPence: 4348 + 544 + 7950,
            });
        });
        pin("costOf: an empty job costs nothing, and the job is not changed", () => {
            const one = job({ parts: [{ sku: "A", qty: 3, unitPence: 7 }], time: [entry(11, 480, 500)] });
            const before = copyOf(one);
            expect(mod.costOf(job())).toEqual({ partsPence: 0, handlingPence: 0, labourMin: 0, labourPence: 0, totalPence: 0 });
            mod.costOf(one);
            expect(one).toEqual(before);
        });

        pin("addPart: changes the job, and keeps the part number trimmed and in capitals", () => {
            const one = job();
            expect(mod.addPart(one, "  gland-28 ", 2, 1999)).toBe(true);
            expect(one.parts).toEqual([{ sku: "GLAND-28", qty: 2, unitPence: 1999 }]);
        });
        pin("addPart: the same part at the same price is one line, at another price another line", () => {
            const one = job();
            mod.addPart(one, "GLAND-28", 2, 1999);
            expect(mod.addPart(one, "gland-28", 3, 1999)).toBe(true);
            expect(mod.addPart(one, "GLAND-28", 1, 2100)).toBe(true);
            expect(mod.addPart(one, "GREASE", 1, 1999)).toBe(true);
            expect(one.parts).toEqual([
                { sku: "GLAND-28", qty: 5, unitPence: 1999 },
                { sku: "GLAND-28", qty: 1, unitPence: 2100 },
                { sku: "GREASE", qty: 1, unitPence: 1999 },
            ]);
        });
        pin("addPart: a return takes the line down, and takes the line away at nothing", () => {
            const one = job();
            mod.addPart(one, "GLAND-28", 5, 1999);
            mod.addPart(one, "GREASE", 1, 350);
            expect(mod.addPart(one, "GLAND-28", -2, 1999)).toBe(true);
            expect(one.parts).toEqual([
                { sku: "GLAND-28", qty: 3, unitPence: 1999 },
                { sku: "GREASE", qty: 1, unitPence: 350 },
            ]);
            expect(mod.addPart(one, "GLAND-28", -3, 1999)).toBe(true);
            expect(one.parts).toEqual([{ sku: "GREASE", qty: 1, unitPence: 350 }]);
        });
        pin("addPart: a return of more than the line holds, or of a part not on the job, is refused", () => {
            const one = job();
            mod.addPart(one, "GLAND-28", 2, 1999);
            const before = copyOf(one);
            expect(mod.addPart(one, "GLAND-28", -3, 1999)).toBe(false);
            expect(mod.addPart(one, "GLAND-28", -1, 2100)).toBe(false);
            expect(mod.addPart(one, "GREASE", -1, 350)).toBe(false);
            expect(one).toEqual(before);
        });
        pin("addPart: refuses a quantity of 0, a part of a unit, a price below 0 and a blank part number", () => {
            const one = job();
            expect(mod.addPart(one, "GREASE", 0, 350)).toBe(false);
            expect(mod.addPart(one, "GREASE", 1.5, 350)).toBe(false);
            expect(mod.addPart(one, "GREASE", 1, -1)).toBe(false);
            expect(mod.addPart(one, "   ", 1, 350)).toBe(false);
            expect(one.parts).toEqual([]);
            expect(mod.addPart(one, "GREASE", 1, 0)).toBe(true);
            expect(one.parts).toEqual([{ sku: "GREASE", qty: 1, unitPence: 0 }]);
        });
        pin("addPart: a unit price need not be a whole number of pence", () => {
            const one = job();
            expect(mod.addPart(one, "ROPE", 3, 12.5)).toBe(true);
            expect(one.parts).toEqual([{ sku: "ROPE", qty: 3, unitPence: 12.5 }]);
        });
        pin("addPart: a signed or dropped job takes no parts, a done job does", () => {
            const signed = job({ state: "signed" });
            const dropped = job({ state: "dropped" });
            const done = job({ state: "done" });
            expect(mod.addPart(signed, "GREASE", 1, 350)).toBe(false);
            expect(mod.addPart(dropped, "GREASE", 1, 350)).toBe(false);
            expect(mod.addPart(done, "GREASE", 1, 350)).toBe(true);
            expect([signed.parts.length, dropped.parts.length, done.parts.length]).toEqual([0, 0, 1]);
        });

        pin("addTime: keeps a copy of the entry, after the ones already there", () => {
            const one = job();
            const first = entry(11, 480, 540);
            const second = entry(10, 600, 660, "Bo", "engineer");
            expect(mod.addTime(one, first)).toBe(true);
            expect(mod.addTime(one, second)).toBe(true);
            expect(one.time).toEqual([entry(11, 480, 540), entry(10, 600, 660, "Bo", "engineer")]);
            expect(one.time[0]).not.toBe(first);
            first.endMin = 500;
            expect(one.time[0].endMin).toBe(540);
        });
        pin("addTime: refuses an entry that ends at or before its start, or that leaves the day", () => {
            const one = job();
            expect(mod.addTime(one, entry(11, 480, 480))).toBe(false);
            expect(mod.addTime(one, entry(11, 480, 470))).toBe(false);
            expect(mod.addTime(one, entry(11, -1, 60))).toBe(false);
            expect(mod.addTime(one, entry(11, 1400, 1441))).toBe(false);
            expect(one.time).toEqual([]);
            expect(mod.addTime(one, entry(11, 0, 1440))).toBe(true);
        });
        pin("addTime: one fitter may not overlap on one day, but may go back to back", () => {
            const one = job();
            mod.addTime(one, entry(11, 480, 540));
            expect(mod.addTime(one, entry(11, 500, 520))).toBe(false);
            expect(mod.addTime(one, entry(11, 539, 600))).toBe(false);
            expect(mod.addTime(one, entry(11, 420, 481))).toBe(false);
            expect(mod.addTime(one, entry(11, 540, 600))).toBe(true);
            expect(mod.addTime(one, entry(11, 420, 480))).toBe(true);
            expect(one.time.length).toBe(3);
        });
        pin("addTime: an entry that holds an old one inside it, or that meets any of several, is refused", () => {
            const one = job();
            expect(mod.addTime(one, entry(11, 480, 540))).toBe(true);
            expect(mod.addTime(one, entry(11, 470, 550))).toBe(false);
            expect(mod.addTime(one, entry(11, 600, 660))).toBe(true);
            expect(mod.addTime(one, entry(11, 500, 520))).toBe(false);
            expect(mod.addTime(one, entry(11, 530, 610))).toBe(false);
            expect(mod.addTime(one, entry(11, 540, 600))).toBe(true);
            expect(one.time.length).toBe(3);
        });
        pin("addTime: keeps the fitter's name as given, and only the very same name is the same fitter", () => {
            const one = job();
            expect(mod.addTime(one, entry(11, 480, 540, " Ann "))).toBe(true);
            expect(one.time[0].fitter).toBe(" Ann ");
            expect(mod.addTime(one, entry(11, 500, 520, "Ann"))).toBe(true);
            expect(mod.addTime(one, entry(11, 500, 520, "ann"))).toBe(true);
            expect(mod.addTime(one, entry(11, 500, 520, " Ann "))).toBe(false);
            expect(one.time.map((e) => e.fitter)).toEqual([" Ann ", "Ann", "ann"]);
        });
        pin("addTime: another fitter, or the same fitter on another day, may overlap", () => {
            const one = job();
            mod.addTime(one, entry(11, 480, 540));
            expect(mod.addTime(one, entry(11, 480, 540, "Bo", "engineer"))).toBe(true);
            expect(mod.addTime(one, entry(12, 480, 540))).toBe(true);
            expect(one.time.length).toBe(3);
        });
        pin("addTime: refuses time before the job was opened, a blank fitter, and a frozen job", () => {
            const one = job();
            expect(mod.addTime(one, entry(9, 480, 540))).toBe(false);
            expect(mod.addTime(one, entry(11, 480, 540, "  "))).toBe(false);
            expect(mod.addTime(job({ state: "signed" }), entry(11, 480, 540))).toBe(false);
            expect(mod.addTime(job({ state: "dropped" }), entry(11, 480, 540))).toBe(false);
            expect(one.time).toEqual([]);
            expect(mod.addTime(one, entry(10, 480, 540))).toBe(true);
            expect(mod.addTime(job({ state: "done" }), entry(11, 480, 540))).toBe(true);
        });

        // ---------------------------------------------------------------- lateness and order
        // `+ 0` makes -0 into 0. toBe tells the two apart, and an answer that gives -0 for not late is right.
        pin("lateBy: 0 with no due day, on or before the due day, and for a dropped job", () => {
            expect(mod.lateBy(job({ dueDay: -1 }), 500) + 0).toBe(0);
            expect(mod.lateBy(job({ dueDay: 20 }), 20) + 0).toBe(0);
            expect(mod.lateBy(job({ dueDay: 20 }), 14) + 0).toBe(0);
            expect(mod.lateBy(job({ dueDay: 20, state: "dropped" }), 500) + 0).toBe(0);
        });
        pin("lateBy: a job closed on or before its due day is not late, whatever the day", () => {
            expect(mod.lateBy(job({ dueDay: 20, closedDay: 20, state: "done" }), 500) + 0).toBe(0);
            expect(mod.lateBy(job({ dueDay: 20, closedDay: 12, state: "signed" }), 500) + 0).toBe(0);
        });
        pin("lateBy: an open job is late by the days since its due day", () => {
            expect(mod.lateBy(job({ dueDay: 20 }), 21)).toBe(1);
            expect(mod.lateBy(job({ dueDay: 20 }), 34)).toBe(14);
            expect(mod.lateBy(job({ dueDay: 20, state: "waiting" }), 26)).toBe(6);
        });
        pin("lateBy: a job closed late is late by the days to its closing, not to the day asked", () => {
            expect(mod.lateBy(job({ dueDay: 20, closedDay: 23, state: "done" }), 500)).toBe(3);
            expect(mod.lateBy(job({ dueDay: 20, closedDay: 29, state: "signed" }), 21)).toBe(9);
        });

        pin("sortJobs: sorts the array it is given, and returns that array", () => {
            const list = [job({ id: 3 }), job({ id: 1 }), job({ id: 2 })];
            const back = mod.sortJobs(list);
            expect(back).toBe(list);
            expect(list.map((j) => j.id)).toEqual([1, 2, 3]);
        });
        pin("sortJobs: urgent first, then soon, then routine", () => {
            const list = [
                job({ id: 1, priority: "routine", dueDay: 3 }),
                job({ id: 2, priority: "soon", dueDay: 30 }),
                job({ id: 3, priority: "urgent", dueDay: 90 }),
                job({ id: 4, priority: "soon", dueDay: 12 }),
            ];
            expect(mod.sortJobs(list).map((j) => j.id)).toEqual([3, 4, 2, 1]);
        });
        pin("sortJobs: within a priority by due day, a job with none last, then by id", () => {
            const list = [
                job({ id: 6, dueDay: -1 }),
                job({ id: 5, dueDay: 40 }),
                job({ id: 4, dueDay: -1 }),
                job({ id: 3, dueDay: 12 }),
                job({ id: 2, dueDay: 40 }),
                job({ id: 1, dueDay: 0 }),
            ];
            expect(mod.sortJobs(list).map((j) => j.id)).toEqual([1, 3, 2, 5, 4, 6]);
            expect(mod.sortJobs([])).toEqual([]);
        });

        // ---------------------------------------------------------------- text
        pin("formatPence: pounds, a point, and two digits of pence", () => {
            expect(mod.formatPence(4520)).toBe("£45.20");
            expect(mod.formatPence(5)).toBe("£0.05");
            expect(mod.formatPence(0)).toBe("£0.00");
            expect(mod.formatPence(123456)).toBe("£1234.56");
        });
        pin("formatPence: the sign of a negative sum goes before the pound sign", () => {
            expect(mod.formatPence(-5)).toBe("-£0.05");
            expect(mod.formatPence(-12345)).toBe("-£123.45");
        });
        pin("formatPence: a sum that is not whole pence is rounded to the nearest penny first", () => {
            expect(mod.formatPence(199.5)).toBe("£2.00");
            expect(mod.formatPence(0.6)).toBe("£0.01");
            expect(mod.formatPence(1234.4)).toBe("£12.34");
            expect(mod.formatPence(-1234.6)).toBe("-£12.35");
        });

        pin("jobLine: number, boat, priority, state, title and total cost", () => {
            const one = job({
                id: 12,
                priority: "urgent",
                parts: [{ sku: "GLAND-28", qty: 2, unitPence: 1999 }],
                time: [entry(11, 480, 500, "Ann", "fitter")],
            });
            expect(mod.jobLine(one)).toBe("#12 KESTREL urgent started: Stern gland weeping (£65.98)");
        });
        pin("jobLine: a job that has cost nothing shows £0.00", () => {
            expect(mod.jobLine(job({ id: 7, boatId: "HERON", state: "reported", title: "Horn dead" }))).toBe(
                "#7 HERON routine reported: Horn dead (£0.00)",
            );
        });
        pin("jobLine: prints the boat as the job holds it", () => {
            expect(mod.jobLine(job({ id: 1, boatId: " kestrel", title: "Horn dead" }))).toBe(
                "#1  kestrel routine started: Horn dead (£0.00)",
            );
        });

        // ---------------------------------------------------------------- summaries
        pin("boatsOf: each boat once, in alphabetical order", () => {
            const list = [job({ boatId: "KESTREL" }), job({ boatId: "HERON" }), job({ boatId: "KESTREL" }), job({ boatId: "AVOCET" })];
            expect(mod.boatsOf(list)).toEqual(["AVOCET", "HERON", "KESTREL"]);
            expect(mod.boatsOf([])).toEqual([]);
        });
        pin("boatsOf: names are trimmed and put in capitals, and a dropped job still counts", () => {
            const list = [job({ boatId: " kestrel " }), job({ boatId: "Kestrel" }), job({ boatId: "heron", state: "dropped" })];
            expect(mod.boatsOf(list)).toEqual(["HERON", "KESTREL"]);
        });
        pin("boatsOf: the order is by character code, so a capital with an accent comes after Z", () => {
            const list = [job({ boatId: "Zebra" }), job({ boatId: "Élan" }), job({ boatId: "Avocet" })];
            expect(mod.boatsOf(list)).toEqual(["AVOCET", "ZEBRA", "ÉLAN"]);
        });

        const fleet = (): Job[] => [
            job({
                id: 1,
                state: "signed",
                closedDay: 14,
                history: [
                    { to: "signed", day: 15, by: "Bo" },
                    { to: "done", day: 14, by: "Ann" },
                    { to: "reported", day: 10, by: "Ann" },
                ],
                parts: [{ sku: "A", qty: 4, unitPence: 1 }],
                time: [entry(13, 480, 490, "Ann", "fitter"), entry(19, 480, 540, "Bo", "engineer")],
            }),
            job({
                id: 2,
                state: "waiting",
                openedDay: 12,
                history: [
                    { to: "waiting", day: 21, by: "Ann" },
                    { to: "reported", day: 12, by: "Cy" },
                ],
                parts: [{ sku: "B", qty: 4, unitPence: 1 }],
                time: [entry(12, 600, 605, "Cy", "apprentice")],
            }),
            job({
                id: 3,
                state: "dropped",
                openedDay: 13,
                history: [
                    { to: "dropped", day: 30, by: "Ann" },
                    { to: "reported", day: 13, by: "Cy" },
                ],
                parts: [{ sku: "C", qty: 1, unitPence: 5000 }],
                time: [entry(13, 600, 660, "Cy", "apprentice")],
            }),
            job({ id: 4, boatId: "HERON", state: "done", openedDay: 18, closedDay: 19, history: [{ to: "done", day: 19, by: "Bo" }] }),
        ];

        pin("summariseBoat: counts the boat's jobs and its open ones, whatever the case of the name asked", () => {
            const got = mod.summariseBoat(fleet(), " kestrel ");
            expect([got.boatId, got.jobs, got.open]).toEqual(["KESTREL", 2, 1]);
            expect(mod.summariseBoat(fleet(), "HERON").jobs).toBe(1);
            expect(mod.summariseBoat(fleet(), "HERON").open).toBe(0);
            expect(mod.summariseBoat([job({ boatId: "Kestrel " })], "KESTREL").jobs).toBe(1);
        });
        pin("summariseBoat: a dropped job is in no figure", () => {
            const got = mod.summariseBoat(fleet(), "KESTREL");
            expect(got.jobs).toBe(2);
            expect(got.lastDay).toBe(21);
            expect(got.labourMin).toBe(15 + 60 + 15);
        });
        pin("summariseBoat: lastDay is the day of the latest move, read from the front of each history", () => {
            expect(mod.summariseBoat(fleet(), "HERON").lastDay).toBe(19);
            expect(mod.summariseBoat(fleet().slice(0, 1), "KESTREL").lastDay).toBe(15);
        });
        pin("summariseBoat: parts carry handling job by job; labour is in billed minutes and pence", () => {
            expect(mod.summariseBoat(fleet(), "KESTREL")).toEqual({
                boatId: "KESTREL",
                jobs: 2,
                open: 1,
                lastDay: 21,
                partsPence: 10,
                labourMin: 90,
                labourPence: 1050 + 5800 + 600,
            });
        });
        pin("summariseBoat: a boat with no jobs has zeros and no last day", () => {
            expect(mod.summariseBoat(fleet(), "Avocet")).toEqual({
                boatId: "AVOCET",
                jobs: 0,
                open: 0,
                lastDay: -1,
                partsPence: 0,
                labourMin: 0,
                labourPence: 0,
            });
        });

        pin("summariseWeek: the week is known by its Saturday", () => {
            expect(mod.summariseWeek(fleet(), 17).week).toBe(12);
            expect(mod.summariseWeek(fleet(), 12).week).toBe(12);
            expect(mod.summariseWeek(fleet(), 11).week).toBe(5);
            expect(mod.summariseWeek([], 0).week).toBe(-2);
        });
        pin("summariseWeek: counts the jobs opened from the Saturday to the Friday", () => {
            const list = [4, 5, 11, 12, 18, 19].map((openedDay, n) => job({ id: n + 1, openedDay }));
            expect(mod.summariseWeek(list, 8).opened).toBe(2);
            expect(mod.summariseWeek(list, 12).opened).toBe(2);
            expect(mod.summariseWeek(list, 19).opened).toBe(1);
            expect(mod.summariseWeek(list, 4).opened).toBe(1);
        });
        pin("summariseWeek: parts go to the week the job closed in, labour to the week it was worked in", () => {
            expect(mod.summariseWeek(fleet(), 12)).toEqual({
                week: 12,
                opened: 2,
                closed: 1,
                labourMin: 15 + 15,
                labourPence: 1050 + 600,
                partsPence: 5,
            });
            expect(mod.summariseWeek(fleet(), 19)).toEqual({
                week: 19,
                opened: 0,
                closed: 1,
                labourMin: 60,
                labourPence: 5800,
                partsPence: 0,
            });
        });
        pin("summariseWeek: a job not yet closed is not closed in the week that holds day -1", () => {
            const list = [job({ id: 1, openedDay: 0, parts: [{ sku: "A", qty: 1, unitPence: 800 }] })];
            expect(mod.summariseWeek(list, 0)).toEqual({ week: -2, opened: 1, closed: 0, labourMin: 0, labourPence: 0, partsPence: 0 });
        });
        pin("summariseWeek: a dropped job is in no figure", () => {
            const got = mod.summariseWeek(fleet(), 13);
            expect(got.opened).toBe(2);
            expect(got.labourMin).toBe(30);
            const only = mod.summariseWeek(fleet().slice(2, 3), 13);
            expect(only).toEqual({ week: 12, opened: 0, closed: 0, labourMin: 0, labourPence: 0, partsPence: 0 });
        });

        // ---------------------------------------------------------------- the log
        pin("WorkLog.count: 0 at first, then one for each job opened", () => {
            const log = new mod.WorkLog();
            expect(log.count).toBe(0);
            log.open("Kestrel", "Horn dead", "routine", 10, "Ann");
            log.open("Heron", "Tiller loose", "soon", 11, "Ann");
            expect(log.count).toBe(2);
        });
        pin("WorkLog.count: a refused opening and a dropped job", () => {
            const log = new mod.WorkLog();
            log.open("", "Horn dead", "routine", 10, "Ann");
            expect(log.count).toBe(0);
            const id = log.open("Kestrel", "Horn dead", "routine", 10, "Ann");
            log.move(id, "dropped", 10, "Ann");
            expect(log.count).toBe(1);
        });

        pin("WorkLog.open: ids run from 1, and each log counts its own", () => {
            const log = new mod.WorkLog();
            expect(log.open("Kestrel", "Horn dead", "routine", 10, "Ann")).toBe(1);
            expect(log.open("Heron", "Tiller loose", "soon", 11, "Ann")).toBe(2);
            expect(new mod.WorkLog().open("Heron", "Tiller loose", "soon", 11, "Ann")).toBe(1);
        });
        pin("WorkLog.open: the job starts reported, with its opening in the history and its due day by priority", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "soon", 10, "Ann");
            expect(log.get(id)).toEqual({
                id: 1,
                boatId: "KESTREL",
                title: "Horn dead",
                priority: "soon",
                state: "reported",
                openedDay: 10,
                dueDay: 17,
                closedDay: -1,
                history: [{ to: "reported", day: 10, by: "Ann" }],
                parts: [],
                time: [],
            });
            expect(log.get(log.open("Kestrel", "Bilge pump", "urgent", 10, "Bo"))?.dueDay).toBe(11);
            expect(log.get(log.open("Kestrel", "Paint", "routine", 10, "Bo"))?.dueDay).toBe(-1);
        });
        pin("WorkLog.open: trims the title, and trims the boat and puts it in capitals", () => {
            const log = new mod.WorkLog();
            const got = log.get(log.open("  kestrel ", "  Horn dead  ", "routine", 10, "Ann"));
            expect([got?.boatId, got?.title]).toEqual(["KESTREL", "Horn dead"]);
        });
        pin("WorkLog.open: keeps the name of the person who opened the job as given", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "routine", 10, " Ann ");
            expect(log.get(id)?.history).toEqual([{ to: "reported", day: 10, by: " Ann " }]);
        });
        pin("WorkLog.open: a blank boat or a blank title gives NO_JOB and uses up no id", () => {
            const log = new mod.WorkLog();
            expect(log.open("   ", "Horn dead", "routine", 10, "Ann")).toBe(0);
            expect(log.open("Kestrel", "  ", "routine", 10, "Ann")).toBe(0);
            expect(log.get(0)).toBeUndefined();
            expect(log.open("Kestrel", "Horn dead", "routine", 10, "Ann")).toBe(1);
        });

        pin("WorkLog.get: the job itself, so a change made to it is kept", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "routine", 10, "Ann");
            const got = log.get(id);
            expect(log.get(id)).toBe(got);
            if (got) {
                got.title = "Horn weak";
            }
            expect(log.get(id)?.title).toBe("Horn weak");
        });
        pin("WorkLog.get: undefined for an id the log has not given", () => {
            const log = new mod.WorkLog();
            log.open("Kestrel", "Horn dead", "routine", 10, "Ann");
            expect(log.get(0)).toBeUndefined();
            expect(log.get(2)).toBeUndefined();
        });

        pin("WorkLog.move: an allowed move sets the state and goes at the front of the history", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "routine", 10, "Ann");
            expect(log.move(id, "booked", 11, "Bo")).toBe(true);
            expect(log.move(id, "started", 13, "Cy")).toBe(true);
            expect(log.get(id)?.state).toBe("started");
            expect(log.get(id)?.history).toEqual([
                { to: "started", day: 13, by: "Cy" },
                { to: "booked", day: 11, by: "Bo" },
                { to: "reported", day: 10, by: "Ann" },
            ]);
        });
        pin("WorkLog.move: a move the table does not allow changes nothing", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "soon", 10, "Ann");
            const before = copyOf(log.get(id));
            expect(log.move(id, "started", 11, "Bo")).toBe(false);
            expect(log.move(id, "done", 11, "Bo")).toBe(false);
            expect(log.move(id, "reported", 11, "Bo")).toBe(false);
            expect(log.get(id)).toEqual(before);
        });
        pin("WorkLog.move: a job the log does not hold is refused", () => {
            const log = new mod.WorkLog();
            expect(log.move(1, "booked", 11, "Bo")).toBe(false);
            expect(log.move(0, "booked", 11, "Bo")).toBe(false);
            expect(log.move(1, "signed", 11, "Bo")).toBe(false);
            expect(log.move(0, "signed", 11, "Bo")).toBe(false);
        });
        pin("WorkLog.move: a move dated before the last one is refused, the same day is taken", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "routine", 10, "Ann");
            log.move(id, "booked", 14, "Bo");
            const before = copyOf(log.get(id));
            expect(log.move(id, "started", 13, "Bo")).toBe(false);
            expect(log.get(id)).toEqual(before);
            expect(log.move(id, "started", 14, "Bo")).toBe(true);
            expect(log.move(id, "waiting", 12, "Bo")).toBe(false);
            expect(log.get(id)?.state).toBe("started");
        });
        pin("WorkLog.move: done sets the closing day, and reopening clears it", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "routine", 10, "Ann");
            log.move(id, "booked", 11, "Bo");
            log.move(id, "started", 12, "Bo");
            expect(log.get(id)?.closedDay).toBe(-1);
            expect(log.move(id, "done", 15, "Bo")).toBe(true);
            expect(log.get(id)?.closedDay).toBe(15);
            expect(log.move(id, "started", 16, "Ann")).toBe(true);
            expect(log.get(id)?.closedDay).toBe(-1);
            expect(log.move(id, "done", 18, "Bo")).toBe(true);
            expect(log.get(id)?.closedDay).toBe(18);
        });
        pin("WorkLog.move: dropping a job leaves it with no closing day", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "routine", 10, "Ann");
            expect(log.move(id, "dropped", 13, "Ann")).toBe(true);
            expect(log.get(id)?.closedDay).toBe(-1);
            const other = log.open("Heron", "Tiller loose", "routine", 10, "Ann");
            log.move(other, "booked", 11, "Bo");
            log.move(other, "waiting", 12, "Bo");
            expect(log.move(other, "dropped", 14, "Bo")).toBe(true);
            expect(log.get(other)?.closedDay).toBe(-1);
        });
        pin("WorkLog.move: takes any name, a blank one too, and keeps it as given", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "routine", 10, "Ann");
            expect(log.move(id, "booked", 11, "")).toBe(true);
            expect(log.move(id, "started", 12, " Bo ")).toBe(true);
            expect(log.get(id)?.history.map((m) => m.by)).toEqual([" Bo ", "", "Ann"]);
        });
        pin("WorkLog.move: an urgent job may go straight to started, and waiting does not touch the closing day", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Taking water", "urgent", 10, "Ann");
            expect(log.move(id, "started", 10, "Bo")).toBe(true);
            expect(log.move(id, "waiting", 10, "Bo")).toBe(true);
            expect(log.move(id, "started", 12, "Bo")).toBe(true);
            expect(log.get(id)?.closedDay).toBe(-1);
            expect(log.get(id)?.history.length).toBe(4);
        });
        pin("WorkLog.move: signing by someone else keeps the closing day and ends the job's moves", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Taking water", "urgent", 10, "Ann");
            log.move(id, "started", 10, "Bo");
            log.move(id, "done", 12, "Bo");
            expect(log.move(id, "signed", 20, "Ann")).toBe(true);
            expect(log.get(id)?.closedDay).toBe(12);
            expect(log.get(id)?.state).toBe("signed");
            expect(log.get(id)?.history[0]).toEqual({ to: "signed", day: 20, by: "Ann" });
            expect(log.move(id, "started", 21, "Ann")).toBe(false);
            expect(log.move(id, "dropped", 21, "Ann")).toBe(false);
        });
        pin("WorkLog.move: the person who finished a job may not sign it, someone else may", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Taking water", "urgent", 10, "Ann");
            log.move(id, "started", 10, "Bo");
            log.move(id, "done", 12, "Bo");
            const before = copyOf(log.get(id));
            expect(log.move(id, "signed", 13, "Bo")).toBe(false);
            expect(log.get(id)).toEqual(before);
            expect(log.move(id, "signed", 13, "Ann")).toBe(true);
            expect(log.get(id)?.state).toBe("signed");
        });
        pin("WorkLog.move: nor may anyone who finished it before it was reopened", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Taking water", "urgent", 10, "Ann");
            log.move(id, "started", 10, "Bo");
            log.move(id, "done", 12, "Bo");
            log.move(id, "started", 13, "Cy");
            log.move(id, "done", 14, "Cy");
            expect(log.move(id, "signed", 15, "Bo")).toBe(false);
            expect(log.get(id)?.state).toBe("done");
            expect(log.move(id, "signed", 15, "Ann")).toBe(true);
        });

        pin("WorkLog.logTime: books the time on the job", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "routine", 10, "Ann");
            expect(log.logTime(id, entry(10, 480, 500))).toBe(true);
            expect(log.get(id)?.time).toEqual([entry(10, 480, 500)]);
        });
        pin("WorkLog.logTime: false for a job not in the log, and for an entry the job refuses", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "routine", 10, "Ann");
            expect(log.logTime(id + 1, entry(10, 480, 500))).toBe(false);
            expect(log.logTime(id, entry(9, 480, 500))).toBe(false);
            expect(log.logTime(id, entry(10, 500, 480))).toBe(false);
            expect(log.get(id)?.time).toEqual([]);
        });
        pin("WorkLog.logTime: a done job still takes time, a signed one does not", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Taking water", "urgent", 10, "Ann");
            log.move(id, "started", 10, "Bo");
            log.move(id, "done", 12, "Bo");
            expect(log.logTime(id, entry(12, 480, 500, "Bo"))).toBe(true);
            log.move(id, "signed", 13, "Ann");
            expect(log.logTime(id, entry(13, 480, 500, "Bo"))).toBe(false);
            expect(log.get(id)?.time).toEqual([entry(12, 480, 500, "Bo")]);
        });

        pin("WorkLog.usePart: puts the part on the job", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "routine", 10, "Ann");
            expect(log.usePart(id, "horn-12v", 1, 2450)).toBe(true);
            expect(log.usePart(id, "HORN-12V", 1, 2450)).toBe(true);
            expect(log.get(id)?.parts).toEqual([{ sku: "HORN-12V", qty: 2, unitPence: 2450 }]);
        });
        pin("WorkLog.usePart: false for a job not in the log, and for a return the job refuses", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "routine", 10, "Ann");
            expect(log.usePart(id + 1, "HORN-12V", 1, 2450)).toBe(false);
            expect(log.usePart(id, "HORN-12V", -1, 2450)).toBe(false);
            log.move(id, "dropped", 10, "Ann");
            expect(log.usePart(id, "HORN-12V", 1, 2450)).toBe(false);
            expect(log.get(id)?.parts).toEqual([]);
        });
        pin("WorkLog.usePart: a done job still takes parts, a signed one does not", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Taking water", "urgent", 10, "Ann");
            log.move(id, "started", 10, "Bo");
            log.move(id, "done", 12, "Bo");
            expect(log.usePart(id, "GLAND-28", 1, 1999)).toBe(true);
            log.move(id, "signed", 13, "Ann");
            expect(log.usePart(id, "GREASE", 1, 350)).toBe(false);
            expect(log.get(id)?.parts).toEqual([{ sku: "GLAND-28", qty: 1, unitPence: 1999 }]);
        });

        pin("WorkLog.escalate: raises the priority and brings the due day in", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "routine", 10, "Ann");
            expect(log.escalate(id, "soon", 12)).toBe(true);
            expect([log.get(id)?.priority, log.get(id)?.dueDay]).toEqual(["soon", 19]);
            expect(log.escalate(id, "urgent", 13)).toBe(true);
            expect([log.get(id)?.priority, log.get(id)?.dueDay]).toEqual(["urgent", 14]);
            expect(log.get(id)?.history.length).toBe(1);
        });
        pin("WorkLog.escalate: does not push a due day back", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "soon", 10, "Ann");
            expect(log.escalate(id, "urgent", 30)).toBe(true);
            expect([log.get(id)?.priority, log.get(id)?.dueDay]).toEqual(["urgent", 17]);
        });
        pin("WorkLog.escalate: never lowers or repeats a priority, and leaves a closed or unknown job alone", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "soon", 10, "Ann");
            expect(log.escalate(id, "routine", 11)).toBe(false);
            expect(log.escalate(id, "soon", 11)).toBe(false);
            expect(log.escalate(id + 1, "urgent", 11)).toBe(false);
            expect([log.get(id)?.priority, log.get(id)?.dueDay]).toEqual(["soon", 17]);
            log.move(id, "dropped", 11, "Ann");
            expect(log.escalate(id, "urgent", 11)).toBe(false);
            expect(log.get(id)?.priority).toBe("soon");
        });
        pin("WorkLog.escalate: leaves a done job alone, and a signed one", () => {
            const log = new mod.WorkLog();
            const id = log.open("Kestrel", "Horn dead", "soon", 10, "Ann");
            log.move(id, "booked", 10, "Ann");
            log.move(id, "started", 11, "Bo");
            log.move(id, "done", 12, "Bo");
            expect(log.escalate(id, "urgent", 12)).toBe(false);
            expect([log.get(id)?.priority, log.get(id)?.dueDay]).toEqual(["soon", 17]);
            log.move(id, "signed", 13, "Ann");
            expect(log.escalate(id, "urgent", 13)).toBe(false);
            expect([log.get(id)?.priority, log.get(id)?.dueDay]).toEqual(["soon", 17]);
        });

        const yard = (): InstanceType<Mod["WorkLog"]> => {
            const log = new mod.WorkLog();
            log.open("Kestrel", "Paint coachroof", "routine", 5, "Ann"); // 1
            log.open("Heron", "Tiller loose", "soon", 9, "Ann"); // 2, due 16
            log.open("kestrel", "Taking water", "urgent", 11, "Bo"); // 3, due 12
            log.open("Heron", "Gas locker hinge", "soon", 12, "Bo"); // 4, due 19
            log.open("Kestrel", "Horn dead", "soon", 4, "Cy"); // 5, due 11
            log.open("Avocet", "Fender eyes", "routine", 18, "Cy"); // 6
            log.move(3, "started", 11, "Bo");
            log.usePart(3, "GLAND-28", 2, 1999);
            log.logTime(3, entry(11, 480, 580, "Bo", "engineer"));
            log.logTime(3, entry(12, 480, 490, "Cy", "apprentice"));
            log.move(3, "done", 12, "Bo");
            log.move(5, "dropped", 13, "Ann");
            log.move(2, "booked", 13, "Ann");
            return log;
        };

        pin("WorkLog.openJobs: only the open jobs, in the order they should be worked", () => {
            expect(yard().openJobs().map((j) => j.id)).toEqual([2, 4, 1, 6]);
            expect(new mod.WorkLog().openJobs()).toEqual([]);
        });
        pin("WorkLog.openJobs: a new array each time, of the jobs themselves", () => {
            const log = yard();
            const first = log.openJobs();
            first.pop();
            expect(log.openJobs().length).toBe(4);
            expect(log.openJobs()[0]).toBe(log.get(2));
        });

        pin("WorkLog.forBoat: the boat's jobs newest first, dropped ones too", () => {
            expect(yard().forBoat("Kestrel").map((j) => j.id)).toEqual([5, 3, 1]);
            expect(yard().forBoat("HERON").map((j) => j.id)).toEqual([4, 2]);
        });
        pin("WorkLog.forBoat: finds the boat whatever the case asked, and gives [] for a boat with no jobs", () => {
            expect(yard().forBoat("  kestrel").map((j) => j.id)).toEqual([5, 3, 1]);
            expect(yard().forBoat("Dabchick")).toEqual([]);
        });

        pin("WorkLog.between: from the first day up to but not on the last", () => {
            expect(yard().between(5, 12).map((j) => j.id)).toEqual([1, 2, 3]);
            expect(yard().between(4, 5).map((j) => j.id)).toEqual([5]);
            expect(yard().between(12, 18).map((j) => j.id)).toEqual([4]);
        });
        pin("WorkLog.between: in the order the jobs were opened in the log, and none when the days are the same", () => {
            expect(yard().between(0, 100).map((j) => j.id)).toEqual([1, 2, 3, 4, 5, 6]);
            expect(yard().between(9, 9)).toEqual([]);
            expect(yard().between(12, 5)).toEqual([]);
        });

        pin("WorkLog.boatSummary: the figures for one boat", () => {
            expect(yard().boatSummary("kestrel")).toEqual({
                boatId: "KESTREL",
                jobs: 2,
                open: 1,
                lastDay: 12,
                partsPence: 3998 + 500,
                labourMin: 105 + 15,
                labourPence: 10150 + 600,
            });
        });
        pin("WorkLog.boatSummary: a boat the log has not seen", () => {
            expect(yard().boatSummary("Dabchick")).toEqual({
                boatId: "DABCHICK",
                jobs: 0,
                open: 0,
                lastDay: -1,
                partsPence: 0,
                labourMin: 0,
                labourPence: 0,
            });
        });

        pin("WorkLog.weekSummary: the yard week that holds the day", () => {
            expect(yard().weekSummary(7)).toEqual({
                week: 5,
                opened: 3,
                closed: 0,
                labourMin: 105,
                labourPence: 10150,
                partsPence: 0,
            });
        });
        pin("WorkLog.weekSummary: the week after, where the job closed", () => {
            expect(yard().weekSummary(18)).toEqual({
                week: 12,
                opened: 2,
                closed: 1,
                labourMin: 15,
                labourPence: 600,
                partsPence: 4498,
            });
        });

        pin("WorkLog.weekly: one summary for each yard week the days touch, oldest first", () => {
            expect(yard().weekly(4, 13).map((w) => [w.week, w.opened, w.closed])).toEqual([
                [-2, 0, 0],
                [5, 3, 0],
                [12, 2, 1],
            ]);
            expect(yard().weekly(11, 12)).toEqual([yard().weekSummary(11)]);
        });
        pin("WorkLog.weekly: the last day is not reached, and no days give no weeks", () => {
            expect(yard().weekly(5, 12).map((w) => w.week)).toEqual([5]);
            expect(yard().weekly(6, 13).map((w) => w.week)).toEqual([5, 12]);
            expect(yard().weekly(8, 8)).toEqual([]);
            expect(yard().weekly(12, 5)).toEqual([]);
        });

        // A name to skip that is no case's name is a slip in the check, and must not pass quietly.
        for (const name of skip) {
            if (!names.has(name)) {
                throw new Error(`nothing to skip called "${name}"`);
            }
        }
    });
}

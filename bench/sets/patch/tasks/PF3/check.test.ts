import { describe, expect, it } from "vitest";
import * as mod from "../src/worklog";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-worklog";

type Job = mod.Job;

function job(over: Partial<Job> = {}): Job {
    const base: Job = {
        id: 1,
        boatId: "KESTREL",
        title: "Stern gland weeping",
        priority: "soon",
        state: "started",
        openedDay: 10,
        dueDay: 20,
        closedDay: -1,
        history: [{ to: "reported", day: 10, by: "Ann" }],
        parts: [],
        time: [],
    };
    return { ...base, ...over };
}

// `+ 0` makes -0 into 0. toBe and toEqual tell the two apart, and an answer that gives -0 for no weeks is right.
function late(one: Job, day: number): number {
    return mod.lateBy(one, day) + 0;
}

// Day 0 was a Monday and the yard's week runs Saturday to Friday. So days 19 to 25 are one yard week,
// 26 to 32 the next, and day 20, the due day of most cases here, is a Sunday.
describe("lateBy, in yard weeks", () => {
    it("is 0 on every day of the yard week that holds the due day", () => {
        for (const day of [19, 20, 21, 22, 23, 24, 25]) {
            expect([day, late(job(), day)]).toEqual([day, 0]);
        }
    });

    it("is 0 in an earlier yard week, never below", () => {
        expect(late(job(), 18)).toBe(0);
        expect(late(job(), 3)).toBe(0);
        expect(late(job(), 0)).toBe(0);
    });

    it("is 1 on every day of the next yard week", () => {
        for (const day of [26, 27, 28, 29, 30, 31, 32]) {
            expect([day, late(job(), day)]).toEqual([day, 1]);
        }
    });

    it("is 2 in the week after that, and goes on by one a week", () => {
        expect(late(job(), 33)).toBe(2);
        expect(late(job(), 39)).toBe(2);
        expect(late(job(), 40)).toBe(3);
        expect(late(job(), 61)).toBe(6);
        expect(late(job(), 67)).toBe(6);
        expect(late(job(), 68)).toBe(7);
    });

    it("turns over between Friday and Saturday, wherever in its week the due day is", () => {
        // Due on a Friday, the last day of its yard week: a week late the next day.
        expect(late(job({ dueDay: 18 }), 18)).toBe(0);
        expect(late(job({ dueDay: 18 }), 19)).toBe(1);
        expect(late(job({ dueDay: 18 }), 25)).toBe(1);
        expect(late(job({ dueDay: 18 }), 26)).toBe(2);
        // Due on a Saturday, the first day: not late for the six days after.
        expect(late(job({ dueDay: 19 }), 25)).toBe(0);
        expect(late(job({ dueDay: 19 }), 26)).toBe(1);
        // Due on a Monday.
        expect(late(job({ dueDay: 21 }), 25)).toBe(0);
        expect(late(job({ dueDay: 21 }), 26)).toBe(1);
        expect(late(job({ dueDay: 21 }), 28)).toBe(1);
    });

    it("counts the yard weeks the same way on days before day 0", () => {
        // Day -3 is a Friday, the last day of the yard week that begins on day -9. Day -2 is the Saturday after it.
        const friday = job({ openedDay: -4, dueDay: -3, priority: "urgent" });
        expect(late(friday, -3)).toBe(0);
        expect(late(friday, -2)).toBe(1);
        expect(late(friday, 0)).toBe(1);
        expect(late(friday, 5)).toBe(2);
        // Day -10 is the Friday before that, the last day of the yard week that begins on day -16.
        const earlier = job({ openedDay: -17, dueDay: -10 });
        expect(late(earlier, -10)).toBe(0);
        expect(late(earlier, -9)).toBe(1);
        expect(late(earlier, -3)).toBe(1);
        expect(late(earlier, -2)).toBe(2);
    });

    it("gives a whole number", () => {
        for (let day = 15; day < 60; day += 1) {
            expect(Number.isInteger(late(job(), day))).toBe(true);
        }
    });

    it("measures a closed job on the day it closed, not on the day asked", () => {
        expect(late(job({ state: "done", closedDay: 27 }), 500)).toBe(1);
        expect(late(job({ state: "signed", closedDay: 39 }), 500)).toBe(2);
        expect(late(job({ state: "done", closedDay: 25 }), 500)).toBe(0);
        expect(late(job({ state: "done", closedDay: 26 }), 21)).toBe(1);
    });

    it("is still 0 with no due day and for a dropped job", () => {
        expect(late(job({ dueDay: -1 }), 500)).toBe(0);
        expect(late(job({ dueDay: -1, state: "done", closedDay: 90 }), 500)).toBe(0);
        expect(late(job({ state: "dropped" }), 500)).toBe(0);
    });

    it("does not change the job", () => {
        const one = job();
        const before = copyOf(one);
        late(one, 40);
        expect(one).toEqual(before);
    });
});

unchanged(mod, [
    "lateBy: an open job is late by the days since its due day",
    "lateBy: a job closed late is late by the days to its closing, not to the day asked",
]);

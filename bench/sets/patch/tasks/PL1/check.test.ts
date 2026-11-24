import { describe, expect, it } from "vitest";
import * as mod from "../src/stoppages";
import type { Route } from "../src/stoppages";
import { copyOf } from "./helpers";
import { booked, closure, registerOf, restriction, unchanged } from "./helpers-stoppages";

describe("closedDays", () => {
    it("lists the days on which the route is shut, in rising order", () => {
        const register = registerOf(
            mod,
            closure("N1", "s4", 10, 13),
            closure("N2", "s2", 15, 16),
            closure("N3", "s1", 12, 14),
            closure("N4", "s2", 18, 19),
        );
        expect(mod.closedDays(register, booked(), 8, 22)).toEqual([10, 11, 12, 13, 15, 18]);
        expect(mod.closedDays(register, { start: "Arlow", stretches: ["s1"] }, 8, 22)).toEqual([12, 13]);
    });

    it("looks at fromDay and does not look at toDay", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 14));
        expect(mod.closedDays(register, booked(), 10, 11)).toEqual([10]);
        expect(mod.closedDays(register, booked(), 8, 12)).toEqual([10, 11]);
        expect(mod.closedDays(register, booked(), 12, 13)).toEqual([12]);
        expect(mod.closedDays(register, booked(), 13, 30)).toEqual([13]);
        expect(mod.closedDays(register, booked(), 9, 10)).toEqual([]);
    });

    it("gives an empty list when no day of the span is shut", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 14));
        expect(mod.closedDays(register, booked(), 14, 40)).toEqual([]);
        expect(mod.closedDays(register, booked(), 0, 10)).toEqual([]);
        expect(mod.closedDays(mod.newRegister(), booked(), 0, 40)).toEqual([]);
    });

    it("gives an empty list when toDay is not after fromDay", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 14));
        expect(mod.closedDays(register, booked(), 12, 12)).toEqual([]);
        expect(mod.closedDays(register, booked(), 13, 11)).toEqual([]);
        expect(mod.closedDays(register, booked(), 13, -1)).toEqual([]);
    });

    it("goes by what routeOpen says for each day", () => {
        const register = registerOf(
            mod,
            restriction("N1", "s1", 1, 99, 600, 700),
            closure("N2", "s5", 1, 99),
            closure("N3", "s2", 10, 20),
            restriction("N4", "s2", 12, 14, 600, 700),
            closure("N5", "s4", 30, mod.OPEN_ENDED),
        );
        const got = mod.closedDays(register, booked(), 5, 35);
        expect(got).toEqual([10, 11, 14, 15, 16, 17, 18, 19, 30, 31, 32, 33, 34]);
        const want: number[] = [];
        for (let day = 5; day < 35; day++) {
            if (!mod.routeOpen(register, booked(), day)) {
                want.push(day);
            }
        }
        expect(got).toEqual(want);
    });

    it("changes neither the register nor the route", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 14), closure("N2", "s1", 3, mod.OPEN_ENDED));
        const route = booked();
        const before = copyOf(register);
        mod.closedDays(register, route, 0, 20);
        expect(register).toEqual(before);
        expect(route).toEqual(booked());
    });

    it("changes neither a notice that is over by fromDay nor a route out of order", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 14), closure("N2", "s1", 3, 5));
        const before = copyOf(register);
        const backwards: Route = { start: "Dunmere", stretches: ["s4", "s2", "s1"] };
        expect(mod.closedDays(register, backwards, 8, 12)).toEqual([10, 11]);
        expect(register).toEqual(before);
        expect(backwards).toEqual({ start: "Dunmere", stretches: ["s4", "s2", "s1"] });
        expect(mod.closedDays(register, backwards, 0, 8)).toEqual([3, 4]);
    });

    it("gives each call a new list of its own, which a later call leaves as it was", () => {
        const register = registerOf(mod, closure("N1", "s4", 10, 14));
        const first = mod.closedDays(register, booked(), 8, 12);
        const second = mod.closedDays(register, booked(), 0, 5);
        const third = mod.closedDays(register, booked(), 8, 12);
        expect(first).toEqual([10, 11]);
        expect(second).toEqual([]);
        expect(third).toEqual([10, 11]);
        expect(third).not.toBe(first);
    });
});

unchanged(mod);

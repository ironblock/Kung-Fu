import { describe, expect, it } from "vitest";
import * as mod from "../src/tides";
import { unchanged } from "./helpers-tides";

interface Win {
    opens: number;
    closes: number;
    depth: number;
}

function w(opens: number, closes: number, depth = 60): Win {
    return { opens, closes, depth };
}

describe("planDeparture when the boat cannot go into the lock again that day", () => {
    it("is null when the boat would arrive after the last window has closed", () => {
        expect(mod.planDeparture([w(480, 690)], 700, 30)).toBeNull();
        expect(mod.planDeparture([w(480, 690), w(780, 990)], 1000, 20)).toBeNull();
    });

    it("is null when the boat would arrive as the last window closes", () => {
        expect(mod.planDeparture([w(480, 690)], 650, 40)).toBeNull();
    });

    it("is null when the boat would arrive with no time left to lock through", () => {
        expect(mod.planDeparture([w(480, 690)], 639, 40)).toBeNull();
        expect(mod.planDeparture([w(480, 690), w(780, 990)], 949, 30)).toBeNull();
    });

    it("is null when there are no windows", () => {
        expect(mod.planDeparture([], 300, 40)).toBeNull();
        expect(mod.planDeparture([], 0, 0)).toBeNull();
    });

    it("is null when the only window is too short to lock through", () => {
        expect(mod.planDeparture([w(480, 491)], 300, 40)).toBeNull();
    });

    it("is null when the cruise runs past midnight", () => {
        expect(mod.planDeparture([w(480, 690), w(1280, 1440)], 1400, 60)).toBeNull();
    });
});

describe("planDeparture when the boat can still go in", () => {
    it("still plans for the last minute there is time to lock through", () => {
        expect(mod.planDeparture([w(480, 690)], 638, 40)).toEqual({ leave: 638, enter: 678, clear: 690, held: 0 });
    });

    it("still plans for a later window when the first cannot be made", () => {
        const day = [w(480, 690), w(780, 990)];
        expect(mod.planDeparture(day, 639, 40)).toEqual({ leave: 740, enter: 780, clear: 792, held: 101 });
    });

    it("still holds the boat at the yard for a window late in the day", () => {
        const day = [w(1280, 1440)];
        expect(mod.planDeparture(day, 0, 0)).toEqual({ leave: 1280, enter: 1280, clear: 1292, held: 1280 });
        expect(mod.planDeparture(day, 1400, 28)).toEqual({ leave: 1400, enter: 1428, clear: 1440, held: 0 });
    });

    it("still plans for a lock that is open in the first minute of the day", () => {
        expect(mod.planDeparture([w(0, 150)], 0, 0)).toEqual({ leave: 0, enter: 0, clear: 12, held: 0 });
        expect(mod.planDeparture([w(0, 150)], 0, 30)).toEqual({ leave: 0, enter: 30, clear: 42, held: 0 });
    });
});

unchanged(mod, ["planDeparture gives a plan even when nothing is left"]);

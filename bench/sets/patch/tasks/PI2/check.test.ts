import { describe, expect, it } from "vitest";
import * as mod from "../src/pumpout";
import type { Visit } from "../src/pumpout";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-pumpout";

function visit(boat: string, day: number, start: number, slots: number): Visit {
    return { boat, service: slots === 1 ? "water" : slots === 2 ? "pumpout" : "both", day, start, slots, tokens: 0,
        paidPence: 0 };
}

describe("nextStart and the lunch closure", () => {
    it("gives no start inside the closure", () => {
        expect(mod.nextStart([], 4, 750, "water")).toBe(790);
        expect(mod.nextStart([], 4, 735, "water")).toBe(790);
        expect(mod.nextStart([], 4, 760, "water")).toBe(790);
        expect(mod.nextStart([], 4, 770, "water")).toBe(790);
        expect(mod.nextStart([], 4, 771, "pumpout")).toBe(790);
    });

    it("gives no start whose visit would run into the closure", () => {
        expect(mod.nextStart([], 4, 711, "pumpout")).toBe(790);
        expect(mod.nextStart([], 4, 730, "pumpout")).toBe(790);
        expect(mod.nextStart([], 4, 691, "both")).toBe(790);
        expect(mod.nextStart([], 4, 730, "both")).toBe(790);
    });

    it("lets a visit end exactly at 12:30", () => {
        expect(mod.nextStart([], 4, 730, "water")).toBe(730);
        expect(mod.nextStart([], 4, 710, "pumpout")).toBe(710);
        expect(mod.nextStart([], 4, 690, "both")).toBe(690);
    });

    it("lets a visit start exactly at 13:10, and keeps to the grid after it", () => {
        expect(mod.nextStart([], 4, 790, "water")).toBe(790);
        expect(mod.nextStart([], 4, 790, "both")).toBe(790);
        expect(mod.nextStart([], 4, 791, "water")).toBe(810);
    });

    it("shuts on every day", () => {
        expect(mod.nextStart([], 3, 750, "water")).toBe(790);
        expect(mod.nextStart([], 9, 720, "pumpout")).toBe(790);
        expect(mod.nextStart([], 0, 750, "water")).toBe(790);
        expect(mod.nextStart([], 5, 740, "pumpout")).toBe(790);
        expect(mod.nextStart([], 6, 735, "water")).toBe(790);
        expect(mod.nextStart([], 13, 700, "both")).toBe(790);
    });

    it("goes past the closure when the morning is taken", () => {
        const log = [visit("Kestrel", 4, 510, 12)];
        expect(mod.nextStart(log, 4, 510, "water")).toBe(790);
        expect(mod.nextStart(log, 4, 0, "both")).toBe(790);
    });

    it("still passes the visits taken on either side of the closure", () => {
        expect(mod.nextStart([visit("Kestrel", 4, 790, 2)], 4, 740, "water")).toBe(830);
        expect(mod.nextStart([visit("Kestrel", 4, 710, 2)], 4, 700, "water")).toBe(790);
        expect(mod.nextStart([visit("Kestrel", 4, 710, 1)], 4, 700, "water")).toBe(730);
    });

    it("leaves a logged visit inside the closure alone, and it blocks as before", () => {
        const log = [visit("Kestrel", 4, 750, 2), visit("Heron", 4, 730, 1)];
        const before = copyOf(log);
        expect(mod.nextStart(log, 4, 700, "water")).toBe(710);
        expect(mod.nextStart(log, 4, 720, "water")).toBe(790);
        expect(mod.nextStart([visit("Kestrel", 4, 770, 2)], 4, 750, "water")).toBe(810);
        expect(log).toEqual(before);
    });

    it("gives the no-start value when nothing is left after lunch", () => {
        const log = [visit("Kestrel", 4, 790, 11)];
        expect(mod.nextStart(log, 4, 750, "water")).toBe(-1);
        expect(mod.nextStart(log, 4, 711, "pumpout")).toBe(-1);
        expect(mod.nextStart(log, 4, 730, "water")).toBe(730);
    });
});

// These two had a start inside the closure.
unchanged(mod, ["nextStart: finds the gap behind a morning of visits", "nextStart: an ask in the middle of the day"]);

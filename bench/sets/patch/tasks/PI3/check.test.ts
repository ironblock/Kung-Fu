import { describe, expect, it } from "vitest";
import * as mod from "../src/pumpout";
import type { Visit } from "../src/pumpout";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-pumpout";

function visit(boat: string, day: number, start: number): Visit {
    return { boat, service: "water", day, start, slots: 1, tokens: 0, paidPence: 950 };
}

// Recorded in this order. k3 was entered late: its day is before the days of the visits recorded ahead of it.
const k1 = visit("Kestrel", 5, 510);
const h1 = visit("Heron", 5, 550);
const k2 = visit("Kestrel", 6, 530);
const k3 = visit("Kestrel", 4, 610);
const h2 = visit("Heron", 7, 510);
const k4 = visit("Kestrel", 7, 570);

function logged(...visits: Visit[]): Visit[] {
    const log: Visit[] = [];
    for (const one of visits) {
        mod.record(log, copyOf(one));
    }
    return log;
}

describe("visitsOf with latest", () => {
    it("gives the boat's most recently recorded visits, in the log's order", () => {
        const log = logged(k1, h1, k2, k3, h2, k4);
        expect(mod.visitsOf(log, "Kestrel", 2)).toEqual([log[0], log[2]]);
        expect(mod.visitsOf(log, "Kestrel", 2)).toEqual([k4, k3]);
        expect(mod.visitsOf(log, "Kestrel", 3)).toEqual([k4, k3, k2]);
        expect(mod.visitsOf(log, "Kestrel", 1)).toEqual([k4]);
        expect(mod.visitsOf(log, "Heron", 1)).toEqual([h2]);
    });

    it("goes by when a visit was recorded, not by its day or start", () => {
        const late = visit("Kestrel", 2, 990);
        const log = logged(k1, h1, k2, k3, h2, k4, late);
        expect(mod.visitsOf(log, "Kestrel", 1)).toEqual([late]);
        expect(mod.visitsOf(log, "Kestrel", 2)).toEqual([late, k4]);
        expect(mod.visitsOf(logged(k4, k2, k1), "Kestrel", 2)).toEqual([k1, k2]);
    });

    it("gives them all when the boat has no more than latest", () => {
        const log = logged(k1, h1, k2, k3, h2, k4);
        expect(mod.visitsOf(log, "Kestrel", 4)).toEqual([k4, k3, k2, k1]);
        expect(mod.visitsOf(log, "Kestrel", 10)).toEqual([k4, k3, k2, k1]);
        expect(mod.visitsOf(log, "Heron", 5)).toEqual([h2, h1]);
        expect(mod.visitsOf(log, "Grebe", 3)).toEqual([]);
    });

    it("gives an empty list for a latest of 0", () => {
        const log = logged(k1, h1, k2, k3, h2, k4);
        expect(mod.visitsOf(log, "Kestrel", 0)).toEqual([]);
        expect(mod.visitsOf(log, "Heron", 0)).toEqual([]);
    });

    it("does what it did when latest is left out", () => {
        const log = logged(k1, h1, k2, k3, h2, k4);
        expect(mod.visitsOf(log, "Kestrel")).toEqual([k4, k3, k2, k1]);
        expect(mod.visitsOf(log, "Kestrel", undefined)).toEqual([k4, k3, k2, k1]);
        expect(mod.visitsOf(log, "Heron")).toEqual([h2, h1]);
    });

    it("gives the log's own visits, not copies of them", () => {
        const log = logged(k1, h1, k2, k3, h2, k4);
        // Every visit of the boat is asked for, so that which end is newest does not matter here.
        const got = mod.visitsOf(log, "Kestrel", 4);
        expect(got[0]).toBe(log[0]);
        expect(got[3]).toBe(log[5]);
        expect(mod.visitsOf(log, "Heron", 5)[1]).toBe(log[4]);
    });

    it("leaves the log as it was", () => {
        const log = logged(k1, h1, k2, k3, h2, k4);
        const before = copyOf(log);
        mod.visitsOf(log, "Kestrel", 2);
        mod.visitsOf(log, "Kestrel", 0);
        expect(log).toEqual(before);
    });
});

unchanged(mod);

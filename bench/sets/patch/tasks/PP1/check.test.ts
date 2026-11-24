import { describe, expect, it } from "vitest";
import * as mod from "../src/notices";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-notices";

type Box = InstanceType<typeof mod.Outbox>;
type Booking = mod.Booking;
type Notice = mod.Notice;

function waitingFor(box: Box, ref: string): Notice[] {
    return (box as unknown as { waitingFor(ref: string): Notice[] }).waitingFor(ref);
}

function at(day: number, min: number): number {
    return day * 1440 + min;
}

function booking(over: Partial<Booking> = {}): Booking {
    const base: Booking = {
        ref: "LW-3001",
        name: "Idris Vane",
        boat: "Dabchick",
        bookedDay: 100,
        startDay: 187,
        endDay: 194,
        party: 2,
        balancePence: 40000,
        depositPence: 10000,
        email: "idris@vane.example",
        phone: "07700 900456",
        address: "9 Lock Row\nOtterby",
    };
    return { ...base, ...over };
}

const NOW = at(100, 615);
const ids = (list: Notice[]): number[] => list.map((n) => n.id);

/** One booking, planned at NOW: notices 1 to 6, each due later than the one before. */
function one(): Box {
    const box = new mod.Outbox();
    box.plan(booking(), NOW);
    return box;
}

/**
 * A booking made late, so that its confirmation (1), balance (2) and arrival (3) are all due at once,
 * and a second booking (7 to 12) whose notices fall due between and after them.
 */
function two(): Box {
    const box = new mod.Outbox();
    box.plan(booking({ bookedDay: 186 }), at(186, 600));
    box.plan(booking({ ref: "LW-3002", bookedDay: 186, startDay: 190, endDay: 193 }), at(186, 660));
    return box;
}

describe("Outbox.waitingFor", () => {
    it("gives an array of the booking's queued notices, soonest due first", () => {
        const got = waitingFor(one(), "LW-3001");
        expect(Array.isArray(got)).toBe(true);
        expect(ids(got)).toEqual([1, 2, 3, 4, 5, 6]);
        expect(got.map((n) => n.dueAt)).toEqual([
            NOW,
            at(145, 540),
            at(185, 600),
            at(193, 1050),
            at(195, 660),
            at(201, 540),
        ]);
        expect(got.map((n) => n.kind)).toEqual(["confirmation", "balance", "arrival", "return", "thanks", "deposit"]);
    });

    it("leaves out the notices of every other booking", () => {
        const box = two();
        expect(ids(waitingFor(box, "LW-3001"))).toEqual([1, 2, 3, 4, 5, 6]);
        expect(ids(waitingFor(box, "LW-3002"))).toEqual([7, 8, 9, 10, 11, 12]);
        expect(waitingFor(box, "LW-3002").every((n) => n.ref === "LW-3002")).toBe(true);
    });

    it("puts the lower id first where two are due at the same time", () => {
        const got = waitingFor(two(), "LW-3001");
        expect(got.slice(0, 3).map((n) => n.dueAt)).toEqual([at(186, 600), at(186, 600), at(186, 600)]);
        expect(ids(got).slice(0, 3)).toEqual([1, 2, 3]);
    });

    it("keeps a failed notice, in the place its new due time gives it", () => {
        const box = two();
        expect(box.failed(1, at(186, 600), "timeout")).toBe(at(186, 615));
        expect(box.get(1)?.state).toBe("failed");
        expect(ids(waitingFor(box, "LW-3001"))).toEqual([2, 3, 1, 4, 5, 6]);
        expect(box.failed(2, at(186, 600), "timeout")).toBe(at(186, 615));
        expect(ids(waitingFor(box, "LW-3001"))).toEqual([3, 1, 2, 4, 5, 6]);
    });

    it("orders by due time and not by the order of queueing", () => {
        const box = one();
        // Four failures put the confirmation's next try a day and more ahead, after the balance notice.
        box.failed(1, at(144, 0), "timeout");
        box.failed(1, at(144, 15), "timeout");
        box.failed(1, at(144, 75), "timeout");
        expect(box.failed(1, at(144, 600), "timeout")).toBe(at(145, 600));
        expect(ids(waitingFor(box, "LW-3001"))).toEqual([2, 1, 3, 4, 5, 6]);
    });

    it("leaves out what was sent and what was dropped", () => {
        const box = one();
        expect(box.sent(1, NOW)).toBe(true);
        expect(ids(waitingFor(box, "LW-3001"))).toEqual([2, 3, 4, 5, 6]);
        expect(box.failed(4, at(193, 1050), "opted-out")).toBe(-1);
        expect(box.get(4)?.state).toBe("dropped");
        expect(ids(waitingFor(box, "LW-3001"))).toEqual([2, 3, 5, 6]);
        box.failed(3, at(185, 600), "timeout");
        expect(ids(waitingFor(box, "LW-3001"))).toEqual([2, 3, 5, 6]);
        expect(box.cancel("LW-3001")).toBe(4);
        expect(waitingFor(box, "LW-3001")).toEqual([]);
    });

    it("gives an empty array for a reference the outbox holds nothing for", () => {
        expect(waitingFor(new mod.Outbox(), "LW-3001")).toEqual([]);
        const box = one();
        expect(waitingFor(box, "LW-300")).toEqual([]);
        expect(waitingFor(box, "lw-3001")).toEqual([]);
        expect(waitingFor(box, "")).toEqual([]);
        // A reference with spaces round it is another reference, and the outbox holds nothing for it.
        expect(waitingFor(box, " LW-3001")).toEqual([]);
        expect(waitingFor(box, "LW-3001 ")).toEqual([]);
    });

    it("gives the notices as the outbox holds them, in full", () => {
        const box = one();
        expect(waitingFor(box, "LW-3001")).toEqual(box.forBooking("LW-3001"));
    });

    it("gives a new array each time", () => {
        const box = one();
        const first = waitingFor(box, "LW-3001");
        first.reverse();
        first.pop();
        const second = waitingFor(box, "LW-3001");
        expect(second).not.toBe(first);
        expect(ids(second)).toEqual([1, 2, 3, 4, 5, 6]);
    });

    it("alters no notice, and leaves the outbox's own order as it was", () => {
        const box = two();
        box.failed(1, at(186, 600), "timeout");
        box.sent(7, at(186, 660));
        const before = copyOf([...box.forBooking("LW-3001"), ...box.forBooking("LW-3002")]);
        expect(ids(waitingFor(box, "LW-3001"))).toEqual([2, 3, 1, 4, 5, 6]);
        expect(ids(waitingFor(box, "LW-3002"))).toEqual([8, 9, 10, 11, 12]);
        expect([...box.forBooking("LW-3001"), ...box.forBooking("LW-3002")]).toEqual(before);
        expect(ids(box.forBooking("LW-3001"))).toEqual([1, 2, 3, 4, 5, 6]);
        expect(ids(box.forBooking("LW-3002"))).toEqual([7, 8, 9, 10, 11, 12]);
        expect(box.size).toBe(12);
        expect(box.counts()).toEqual({ queued: 10, sent: 1, failed: 1, dropped: 0 });
    });
});

unchanged(mod);

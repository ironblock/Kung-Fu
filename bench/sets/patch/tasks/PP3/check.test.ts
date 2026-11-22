import { describe, expect, it } from "vitest";
import * as mod from "../src/notices";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-notices";

type Box = InstanceType<typeof mod.Outbox>;
type Booking = mod.Booking;
type Notice = mod.Notice;
type QuietHours = mod.QuietHours;

function at(day: number, min: number): number {
    return day * 1440 + min;
}

function booking(over: Partial<Booking> = {}): Booking {
    const base: Booking = {
        ref: "LW-4001",
        name: "Maren Holt",
        boat: "Sandpiper",
        bookedDay: 100,
        startDay: 187,
        endDay: 194,
        party: 3,
        balancePence: 52000,
        depositPence: 12000,
        email: "maren@holt.example",
        phone: "07700 900789",
        address: "2 Sluice Cottages\nOtterby",
    };
    return { ...base, ...over };
}

const NOW = at(100, 615);
const ids = (list: Notice[]): number[] => list.map((n) => n.id);

/** One booking planned at NOW. Notice 1 is due at NOW, 2 at 9am on day 145, 3 at 10am on day 185. */
function planned(quiet?: QuietHours): Box {
    const box = quiet ? new mod.Outbox(quiet) : new mod.Outbox();
    box.plan(booking(), NOW);
    return box;
}

describe("Outbox.due in quiet hours", () => {
    it("gives nothing in the evening, from the minute quiet hours begin", () => {
        const box = planned();
        expect(box.due(at(100, 1260))).toEqual([]);
        expect(box.due(at(100, 1380))).toEqual([]);
        expect(box.due(at(100, 1439))).toEqual([]);
    });

    it("gives nothing in the small hours, to the last minute of quiet hours", () => {
        const box = planned();
        expect(box.due(at(101, 0))).toEqual([]);
        expect(box.due(at(101, 200))).toEqual([]);
        expect(box.due(at(101, 479))).toEqual([]);
    });

    it("gives what is due up to the minute before quiet hours begin", () => {
        const box = planned();
        expect(ids(box.due(at(100, 1259)))).toEqual([1]);
        expect(ids(box.due(at(100, 720)))).toEqual([1]);
    });

    it("gives what is due again from the minute quiet hours end", () => {
        const box = planned();
        expect(ids(box.due(at(101, 480)))).toEqual([1]);
        expect(ids(box.due(at(101, 481)))).toEqual([1]);
    });

    it("goes by the time of day of now, on any day", () => {
        const box = planned();
        expect(box.due(at(146, 1300))).toEqual([]);
        expect(box.due(at(147, 100))).toEqual([]);
        expect(ids(box.due(at(147, 720)))).toEqual([1, 2]);
        expect(box.due(at(300, 1260))).toEqual([]);
        expect(ids(box.due(at(300, 1259)))).toEqual([1, 2, 3, 4, 5, 6]);
        expect(box.due(at(0, 30))).toEqual([]);
    });

    it("gives nothing in quiet hours whatever the limit", () => {
        const box = planned();
        expect(box.due(at(300, 1300), 1)).toEqual([]);
        expect(box.due(at(300, 1300), 0)).toEqual([]);
        expect(box.due(at(300, 1300), 100)).toEqual([]);
        expect(box.due(at(301, 300), 2)).toEqual([]);
    });

    it("keeps the order and the limit outside quiet hours", () => {
        const box = planned();
        box.failed(1, at(300, 600), "timeout");
        expect(ids(box.due(at(300, 700)))).toEqual([2, 3, 4, 5, 6, 1]);
        expect(ids(box.due(at(300, 700), 2))).toEqual([2, 3]);
        expect(ids(box.due(at(300, 610)))).toEqual([2, 3, 4, 5, 6]);
    });

    it("goes by the outbox's own quiet hours, not the default ones", () => {
        const box = planned({ fromMin: 780, toMin: 840 });
        expect(ids(box.due(at(100, 779)))).toEqual([1]);
        expect(box.due(at(100, 780))).toEqual([]);
        expect(box.due(at(100, 839))).toEqual([]);
        expect(ids(box.due(at(100, 840)))).toEqual([1]);
        expect(ids(box.due(at(100, 1300)))).toEqual([1]);
        expect(ids(box.due(at(101, 100)))).toEqual([1]);
        expect(box.due(at(146, 800))).toEqual([]);
        expect(ids(box.due(at(146, 900)))).toEqual([1, 2]);
    });

    it("is never quiet for an outbox with no quiet hours", () => {
        const none = planned({ fromMin: 0, toMin: 0 });
        for (const min of [0, 1, 479, 480, 720, 1260, 1439]) {
            expect(ids(none.due(at(101, min))), String(min)).toEqual([1]);
        }
        const same = planned({ fromMin: 600, toMin: 600 });
        for (const min of [0, 599, 600, 601, 1439]) {
            expect(ids(same.due(at(101, min))), String(min)).toEqual([1]);
        }
    });

    it("alters no notice and records nothing when it gives nothing", () => {
        const box = planned();
        box.failed(1, NOW, "timeout");
        const before = copyOf(box.forBooking("LW-4001"));
        // What the log holds for every id, a notice's or not.
        const logged = () => [-1, 0, 1, 2, 3, 4, 5, 6, 7, 99].map((id) => [box.attemptsFor(id), box.lastError(id)]);
        const loggedBefore = copyOf(logged());
        expect(box.due(at(146, 1300))).toEqual([]);
        expect(box.due(at(147, 100), 3)).toEqual([]);
        expect(box.forBooking("LW-4001")).toEqual(before);
        expect(logged()).toEqual(loggedBefore);
        expect(box.attemptsFor(1).length).toBe(1);
        expect(box.attemptsFor(2)).toEqual([]);
        expect(box.nextWake()).toBe(NOW + 15);
        expect(box.counts()).toEqual({ queued: 5, sent: 0, failed: 1, dropped: 0 });
        expect(ids(box.due(at(147, 720)))).toEqual([1, 2]);
    });

    it("gives a new empty array each time", () => {
        const box = planned();
        const first = box.due(at(100, 1300));
        first.push(copyOf(box.get(1) as Notice));
        expect(box.due(at(100, 1300))).toEqual([]);
    });
});

unchanged(mod, ["Outbox.due: hands out what is overdue whatever the time of day"]);

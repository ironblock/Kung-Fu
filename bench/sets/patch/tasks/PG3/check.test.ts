import { describe, expect, it } from "vitest";
import * as mod from "../src/bookings";
import type { Booking } from "../src/bookings";
import { unchanged } from "./helpers-bookings";

type Book = InstanceType<typeof mod.BookingBook>;

const S = (day: number, minute = 0): number => day * 1440 + minute;

const newBook = (): Book =>
    new mod.BookingBook([
        { id: "heron", name: "Heron", boatClass: "narrow", berths: 4 },
        { id: "kestrel", name: "Kestrel", boatClass: "wide", berths: 8 },
    ]);

/**
 * Okafor's week on Heron from day 70, held on day 10 and confirmed on day 11 with the sum given.
 * The charge is 62150 and the deposit 15600.
 */
const hire = (paid = 15600): { book: Book; b: Booking } => {
    const book = newBook();
    const placed = book.place({ boatId: "heron", party: "Okafor", partySize: 4, fromDay: 70, toDay: 77 }, S(10, 600));
    if (!placed.ok) {
        throw new Error(`not placed: ${placed.problems.join("; ")}`);
    }
    expect(placed.booking.depositPence).toBe(15600);
    expect(book.confirm(placed.booking.id, paid, S(11, 540))).toBe("confirmed");
    return { book, b: placed.booking };
};

/** What comes back when the hire, with only its deposit paid, is cancelled at this moment. */
const backAt = (at: number): number => hire().book.cancel("B0001", at);

describe("cancel, with the deposit's share", () => {
    it("six weeks of notice bring the whole deposit back", () => {
        const { book, b } = hire();
        expect(book.cancel("B0001", S(28, 600))).toBe(15600);
        expect(b.state).toBe("cancelled");
        expect(b.closedAt).toBe(S(28, 600));
        expect(b.paidPence).toBe(0);
        expect(b.depositPence).toBe(15600);
    });

    it("the scale's steps, each at its edge", () => {
        expect(backAt(S(20, 0))).toBe(15600);
        expect(backAt(S(28, 0))).toBe(15600);
        expect(backAt(S(29, 0))).toBe(11700);
        expect(backAt(S(42, 0))).toBe(11700);
        expect(backAt(S(43, 0))).toBe(6240);
        expect(backAt(S(56, 0))).toBe(6240);
        expect(backAt(S(57, 0))).toBe(0);
        expect(backAt(S(69, 0))).toBe(0);
    });

    it("the notice counts days, whatever the time of day of the cancelling", () => {
        expect(backAt(S(28, 1439))).toBe(15600);
        expect(backAt(S(42, 900))).toBe(11700);
        expect(backAt(S(56, 1))).toBe(6240);
        expect(backAt(S(57, 0))).toBe(0);
    });

    it("the share comes on top of what was paid beyond the deposit", () => {
        const { book, b } = hire(30000);
        expect(book.cancel("B0001", S(40, 615))).toBe(14400 + 11700);
        expect(b.paidPence).toBe(3900);
        const full = hire(62150);
        expect(full.book.cancel("B0001", S(20, 0))).toBe(62150);
        expect(full.b.paidPence).toBe(0);
        const late = hire(30000);
        expect(late.book.cancel("B0001", S(60, 615))).toBe(14400);
        expect(late.b.paidPence).toBe(15600);
    });

    it("the note and the book's record carry the whole sum paid back", () => {
        const { book, b } = hire(30000);
        book.cancel("B0001", S(40, 615));
        expect(b.notes[0]).toBe("cancelled on Thu wk6, £261.00 back");
        expect(book.history("B0001")[0]).toEqual({ at: S(40, 615), bookingId: "B0001", kind: "cancelled", pence: 26100 });
        expect(book.takings(0, S(100, 0))).toBe(3900);
    });

    it("another deposit, another boat", () => {
        const book = newBook();
        const placed = book.place({ boatId: "kestrel", party: "Adeyemi", partySize: 6, fromDay: 72, toDay: 76 }, S(10, 600));
        expect(placed.ok && placed.booking.depositPence).toBe(14200);
        book.confirm("B0001", 20000, S(11, 540));
        expect(book.cancel("B0001", S(45, 30))).toBe(5800 + 5680);
        expect(book.find("B0001")?.paidPence).toBe(8520);
    });

    it("a hold still gets nothing back, however much notice", () => {
        const book = newBook();
        const placed = book.place({ boatId: "heron", party: "Okafor", partySize: 4, fromDay: 70, toDay: 77 }, S(10, 600));
        expect(book.cancel("B0001", S(11, 0))).toBe(0);
        expect(placed.ok && placed.booking.state).toBe("cancelled");
        expect(placed.ok && placed.booking.paidPence).toBe(0);
        expect(placed.ok && placed.booking.notes).toEqual(["cancelled on Wed wk2, £0.00 back"]);
        expect(book.history("B0001")[0].pence).toBe(0);
    });
});

unchanged(mod, ["cancel: a hire cancelled seven weeks ahead still leaves its whole deposit with the yard"]);

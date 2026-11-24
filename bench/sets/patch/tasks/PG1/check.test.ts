import { describe, expect, it } from "vitest";
import * as mod from "../src/bookings";
import type { Booking, BookingRequest } from "../src/bookings";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-bookings";

type Book = InstanceType<typeof mod.BookingBook> & { outstanding(boatId: string): number };

const S = (day: number, minute = 0): number => day * 1440 + minute;

const newBook = (): Book =>
    new mod.BookingBook([
        { id: "heron", name: "Heron", boatClass: "narrow", berths: 4 },
        { id: "kestrel", name: "Kestrel", boatClass: "wide", berths: 8 },
        { id: "teal", name: "Teal", boatClass: "cruiser", berths: 2 },
    ]) as Book;

const ask = (boatId: string, party: string, partySize: number, fromDay: number, nights: number): BookingRequest => ({
    boatId,
    party,
    partySize,
    fromDay,
    toDay: fromDay + nights,
});

const hold = (book: Book, req: BookingRequest, at: number): Booking => {
    const placed = book.place(req, at);
    if (!placed.ok) {
        throw new Error(`not placed: ${placed.problems.join("; ")}`);
    }
    return placed.booking;
};

// Heron for the week from day 70 is charged 62150 with a deposit of 15600; the three nights after it, 29850.
// Kestrel for four nights from day 72 is charged 56800.
describe("outstanding", () => {
    it("a hold owes its whole charge", () => {
        const book = newBook();
        hold(book, ask("heron", "Okafor", 4, 70, 7), S(40, 600));
        expect(book.outstanding("heron")).toBe(62150);
    });

    it("a confirmed hire owes its charge less what has been paid", () => {
        const book = newBook();
        hold(book, ask("heron", "Okafor", 4, 70, 7), S(40, 600));
        book.confirm("B0001", 15600, S(41, 540));
        expect(book.outstanding("heron")).toBe(46550);
        book.takePayment("B0001", 20000, S(45, 600));
        expect(book.outstanding("heron")).toBe(26550);
    });

    it("a hire paid in full adds nothing", () => {
        const book = newBook();
        hold(book, ask("heron", "Okafor", 4, 70, 7), S(40, 600));
        book.confirm("B0001", 62150, S(41, 540));
        expect(book.outstanding("heron")).toBe(0);
    });

    it("an overpaid hire adds nothing, alone or beside a booking that owes", () => {
        const book = newBook();
        hold(book, ask("heron", "Okafor", 4, 70, 7), S(40, 600));
        book.confirm("B0001", 62650, S(41, 540));
        expect(book.outstanding("heron")).toBe(0);
        hold(book, ask("heron", "Nakamura", 2, 77, 3), S(41, 600));
        expect(book.outstanding("heron")).toBe(29850);
    });

    it("sums the held and the confirmed bookings of the one boat", () => {
        const book = newBook();
        hold(book, ask("heron", "Okafor", 4, 70, 7), S(40, 600));
        hold(book, ask("kestrel", "Adeyemi", 6, 72, 4), S(40, 610));
        hold(book, ask("heron", "Nakamura", 2, 77, 3), S(40, 620));
        book.confirm("B0001", 15600, S(41, 540));
        expect(book.outstanding("heron")).toBe(46550 + 29850);
        expect(book.outstanding("kestrel")).toBe(56800);
    });

    it("leaves out cancelled and lapsed bookings", () => {
        const book = newBook();
        hold(book, ask("heron", "Okafor", 4, 70, 7), S(40, 600));
        hold(book, ask("heron", "Nakamura", 2, 77, 3), S(40, 620));
        hold(book, ask("heron", "Brankovic", 2, 84, 3), S(40, 630));
        book.confirm("B0001", 15600, S(41, 540));
        book.confirm("B0002", 10000, S(41, 545));
        expect(book.outstanding("heron")).toBe(46550 + 19850 + 29850);
        book.cancel("B0001", S(60, 615));
        expect(book.outstanding("heron")).toBe(19850 + 29850);
        expect(book.lapse(S(61, 0))).toEqual(["B0003"]);
        expect(book.outstanding("heron")).toBe(19850);
        book.cancel("B0002", S(62, 0));
        expect(book.outstanding("heron")).toBe(0);
    });

    it("gives 0 for a boat with no bookings and for a boat the book does not know", () => {
        const book = newBook();
        expect(book.outstanding("heron")).toBe(0);
        hold(book, ask("heron", "Okafor", 4, 70, 7), S(40, 600));
        expect(book.outstanding("teal")).toBe(0);
        expect(book.outstanding("osprey")).toBe(0);
        expect(book.outstanding("")).toBe(0);
        // the book knows Heron as "heron" and by no other spelling
        expect(book.outstanding("heron")).toBe(62150);
        expect(book.outstanding("HERON")).toBe(0);
        expect(book.outstanding(" heron")).toBe(0);
    });

    it("changes nothing in the book", () => {
        const book = newBook();
        hold(book, ask("heron", "Okafor", 4, 70, 7), S(40, 600));
        hold(book, ask("heron", "Nakamura", 2, 77, 3), S(40, 620));
        book.confirm("B0001", 62650, S(41, 540));
        book.joinWaiting({ boatId: "heron", party: "Brankovic", partySize: 2, fromDay: 70, toDay: 73, joinedAt: S(41, 0) });
        const bookings = copyOf(book.all());
        const events = copyOf(book.history());
        const queue = copyOf(book.waitingFor("heron"));
        expect(book.outstanding("heron")).toBe(29850);
        expect(book.outstanding("heron")).toBe(29850);
        expect(book.all()).toEqual(bookings);
        expect(book.history()).toEqual(events);
        expect(book.waitingFor("heron")).toEqual(queue);
        expect(book.size).toBe(2);
    });
});

unchanged(mod);

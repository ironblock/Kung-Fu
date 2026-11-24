// What src/bookings.ts does, pinned case by case. A task's check calls `unchanged` and skips, by name, only the
// cases its change must alter.
import { describe, expect, it } from "vitest";
import type { Boat, Booking, BookingRequest, WaitEntry } from "../src/bookings";
import { copyOf } from "./helpers";

type Mod = typeof import("../src/bookings");
type Book = InstanceType<Mod["BookingBook"]>;

/** A stamp, worked out here and not by the module. */
const S = (day: number, minute = 0): number => day * 1440 + minute;

const fleet = (): Boat[] => [
    { id: "heron", name: "Heron", boatClass: "narrow", berths: 4 },
    { id: "kestrel", name: "Kestrel", boatClass: "wide", berths: 8 },
    { id: "teal", name: "Teal", boatClass: "cruiser", berths: 2 },
    { id: "avocet", name: "Avocet", boatClass: "narrow", berths: 6 },
];
const [HERON, KESTREL, TEAL, AVOCET] = fleet();

const ask = (boatId: string, party: string, partySize: number, fromDay: number, nights: number): BookingRequest => ({
    boatId,
    party,
    partySize,
    fromDay,
    toDay: fromDay + nights,
});

/** A booking made by hand, for the functions that take a list. */
const made = (over: Partial<Booking> = {}): Booking => ({
    id: "B0001",
    boatId: "heron",
    party: "Okafor",
    partySize: 4,
    fromDay: 70,
    toDay: 77,
    state: "confirmed",
    placedAt: S(40, 600),
    lapsesAt: S(42, 600),
    confirmedAt: S(41, 30),
    closedAt: -1,
    chargePence: 62150,
    depositPence: 15600,
    paidPence: 15600,
    notes: [],
    ...over,
});

const waiter = (boatId: string, party: string, fromDay: number, nights: number, joinedAt: number, size = 2): WaitEntry => ({
    boatId,
    party,
    partySize: size,
    fromDay,
    toDay: fromDay + nights,
    joinedAt,
});

export function unchanged(mod: Mod, skip: string[] = []): void {
    const cases: [string, () => void][] = [];
    const add = (name: string, run: () => void): void => {
        if (cases.some(([had]) => had === name)) {
            throw new Error(`two cases are named "${name}"`);
        }
        cases.push([name, run]);
    };

    const newBook = (): Book => new mod.BookingBook(fleet());
    const hold = (book: Book, req: BookingRequest, at: number): Booking => {
        const placed = book.place(req, at);
        if (!placed.ok) {
            throw new Error(`not placed: ${placed.problems.join("; ")}`);
        }
        return placed.booking;
    };
    /** A book with one hold: Okafor, four people, Heron for the week from day 70, placed on day 40 at 10:00. */
    const withHold = (): { book: Book; b: Booking } => {
        const book = newBook();
        return { book, b: hold(book, ask("heron", "Okafor", 4, 70, 7), S(40, 600)) };
    };
    /** The same, confirmed on day 41 at 09:00 with the sum given. */
    const withHire = (paid = 15600): { book: Book; b: Booking } => {
        const { book, b } = withHold();
        expect(book.confirm(b.id, paid, S(41, 540))).toBe("confirmed");
        return { book, b };
    };

    // ---------------------------------------------------------------------------------------- the exports

    add("exports: every function, the class and the constants are there", () => {
        const functions = [
            "stampOf", "dayOf", "minuteOf", "weekdayName", "formatDay", "formatStamp", "formatPence", "nightsOf",
            "isLive", "daysOverlap", "validateRequest", "hireCharge", "depositFor", "refundShare", "holdLength",
            "hasLapsed", "sortForDiary", "quoteFor", "parseRequestLine", "refundTerms", "BookingBook", "occupancy",
            "arrivalsOn", "returnsOn", "turnaroundsOn", "freeGaps", "owedLines", "lengthBands", "stateCounts",
            "diaryLine", "weekStrip", "weekTotals", "weekSheet",
        ];
        for (const name of functions) {
            expect(typeof (mod as Record<string, unknown>)[name], name).toBe("function");
        }
    });
    add("constants: a day is 1440 minutes and NEVER is -1", () => {
        expect(mod.MINUTES_PER_DAY).toBe(1440);
        expect(mod.NEVER).toBe(-1);
    });

    // ------------------------------------------------------------------------------------ days and stamps

    add("stampOf: counts minutes from the start of day 0", () => {
        expect(mod.stampOf(0, 0)).toBe(0);
        expect(mod.stampOf(3, 75)).toBe(4395);
        expect(mod.stampOf(40, 600)).toBe(58200);
    });
    add("stampOf: the last minute of a day is one short of the next day", () => {
        expect(mod.stampOf(2, 1439)).toBe(4319);
        expect(mod.stampOf(3, 0)).toBe(4320);
    });
    add("stampOf: minutes past the end of a day run on into the next", () => {
        expect(mod.stampOf(0, 1440)).toBe(1440);
        expect(mod.stampOf(2, 1500)).toBe(4380);
    });
    add("dayOf: the first and the last minute of a day give that day", () => {
        expect(mod.dayOf(4320)).toBe(3);
        expect(mod.dayOf(5759)).toBe(3);
        expect(mod.dayOf(5760)).toBe(4);
    });
    add("dayOf: a stamp inside day 0 gives 0", () => {
        expect(mod.dayOf(0)).toBe(0);
        expect(mod.dayOf(1439)).toBe(0);
    });
    add("dayOf: a stamp before day 0 is in a day before 0", () => {
        expect(mod.dayOf(-1)).toBe(-1);
        expect(mod.dayOf(-1440)).toBe(-1);
        expect(mod.dayOf(-1441)).toBe(-2);
    });
    add("minuteOf: minutes since midnight", () => {
        expect(mod.minuteOf(4395)).toBe(75);
        expect(mod.minuteOf(4320)).toBe(0);
    });
    add("minuteOf: the last minute of a day is 1439", () => {
        expect(mod.minuteOf(5759)).toBe(1439);
        expect(mod.minuteOf(1439)).toBe(1439);
    });
    add("minuteOf: a stamp before day 0 counts from that day's midnight", () => {
        expect(mod.minuteOf(-1)).toBe(1439);
        expect(mod.minuteOf(-60)).toBe(1380);
        expect(mod.minuteOf(-1440)).toBe(0);
    });
    add("weekdayName: day 0 is a Saturday", () => {
        expect([0, 1, 2, 3, 4, 5, 6].map((d) => mod.weekdayName(d))).toEqual([
            "Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri",
        ]);
    });
    add("weekdayName: comes round every seven days, before day 0 too", () => {
        expect(mod.weekdayName(7)).toBe("Sat");
        expect(mod.weekdayName(72)).toBe("Mon");
        expect(mod.weekdayName(76)).toBe("Fri");
        expect(mod.weekdayName(-1)).toBe("Fri");
    });
    add("formatDay: weeks are counted from 1", () => {
        expect(mod.formatDay(0)).toBe("Sat wk1");
        expect(mod.formatDay(6)).toBe("Fri wk1");
        expect(mod.formatDay(7)).toBe("Sat wk2");
    });
    add("formatDay: a day later in the season", () => {
        expect(mod.formatDay(72)).toBe("Mon wk11");
        expect(mod.formatDay(76)).toBe("Fri wk11");
        expect(mod.formatDay(77)).toBe("Sat wk12");
    });
    add("formatDay: days before day 0 fall in week 0 and earlier", () => {
        expect(mod.formatDay(-1)).toBe("Fri wk0");
        expect(mod.formatDay(-7)).toBe("Sat wk0");
        expect(mod.formatDay(-8)).toBe("Fri wk-1");
    });
    add("formatStamp: NEVER prints as a dash", () => {
        expect(mod.formatStamp(-1)).toBe("-");
        expect(mod.formatStamp(mod.NEVER)).toBe("-");
    });
    add("formatStamp: the day, then hours and minutes in two digits each", () => {
        expect(mod.formatStamp(S(72, 545))).toBe("Mon wk11 09:05");
        expect(mod.formatStamp(0)).toBe("Sat wk1 00:00");
        expect(mod.formatStamp(S(6, 1439))).toBe("Fri wk1 23:59");
    });
    add("formatStamp: only NEVER is a dash, and other stamps before day 0 print as times", () => {
        expect(mod.formatStamp(-2)).toBe("Fri wk0 23:58");
        expect(mod.formatStamp(-1440)).toBe("Fri wk0 00:00");
    });
    add("formatPence: pounds and two places", () => {
        expect(mod.formatPence(0)).toBe("£0.00");
        expect(mod.formatPence(5)).toBe("£0.05");
        expect(mod.formatPence(62150)).toBe("£621.50");
    });
    add("formatPence: thousands in groups, and a sign before the pound", () => {
        expect(mod.formatPence(100000)).toBe("£1,000.00");
        expect(mod.formatPence(123456789)).toBe("£1,234,567.89");
        expect(mod.formatPence(-250)).toBe("-£2.50");
        expect(mod.formatPence(-123405)).toBe("-£1,234.05");
    });
    add("nightsOf: the last day is not a night", () => {
        expect(mod.nightsOf({ fromDay: 70, toDay: 77 })).toBe(7);
        expect(mod.nightsOf(made({ fromDay: 72, toDay: 76 }))).toBe(4);
    });
    add("nightsOf: one day apart is one night, the same day none", () => {
        expect(mod.nightsOf({ fromDay: 70, toDay: 71 })).toBe(1);
        expect(mod.nightsOf({ fromDay: 70, toDay: 70 })).toBe(0);
    });
    add("isLive: holds and confirmed hires are live", () => {
        expect(mod.isLive(made({ state: "held" }))).toBe(true);
        expect(mod.isLive(made({ state: "confirmed" }))).toBe(true);
    });
    add("isLive: cancelled and lapsed bookings are not", () => {
        expect(mod.isLive(made({ state: "cancelled" }))).toBe(false);
        expect(mod.isLive(made({ state: "lapsed" }))).toBe(false);
    });
    add("daysOverlap: a hire may begin on the day another ends", () => {
        expect(mod.daysOverlap(70, 77, 77, 80)).toBe(false);
        expect(mod.daysOverlap(77, 80, 70, 77)).toBe(false);
    });
    add("daysOverlap: one shared night is enough", () => {
        expect(mod.daysOverlap(70, 77, 76, 80)).toBe(true);
        expect(mod.daysOverlap(76, 80, 70, 77)).toBe(true);
        expect(mod.daysOverlap(70, 77, 72, 73)).toBe(true);
        expect(mod.daysOverlap(72, 73, 70, 77)).toBe(true);
    });
    add("daysOverlap: a span of no days inside a hire still touches it, one at its edge does not", () => {
        expect(mod.daysOverlap(70, 77, 72, 72)).toBe(true);
        expect(mod.daysOverlap(72, 72, 70, 77)).toBe(true);
        expect(mod.daysOverlap(70, 77, 70, 70)).toBe(false);
        expect(mod.daysOverlap(70, 77, 77, 77)).toBe(false);
    });

    // --------------------------------------------------------------------------------------- the request

    add("validateRequest: a good request has no problems", () => {
        expect(mod.validateRequest(ask("heron", "Okafor", 4, 70, 7), HERON)).toEqual([]);
        expect(mod.validateRequest(ask("kestrel", "Adeyemi", 6, 72, 4), KESTREL)).toEqual([]);
        expect(mod.validateRequest(ask("teal", "Lindqvist", 1, 76, 5), TEAL)).toEqual([]);
    });
    add("validateRequest: names every problem, in order", () => {
        expect(mod.validateRequest(ask("heron", "   ", 9, 73, 2), HERON)).toEqual([
            "no party name",
            "Heron sleeps 4, not 9",
            "a hire is at least 3 nights",
            "hires begin on a Saturday, Monday or Friday, not a Tue",
        ]);
        expect(mod.validateRequest(ask("heron", "", 0, 70, 22), HERON)).toEqual([
            "no party name",
            "party size must be a whole number of at least 1",
            "a narrow boat goes out for at most 21 nights",
        ]);
    });
    add("validateRequest: the party size must be a whole number of at least 1", () => {
        const words = ["party size must be a whole number of at least 1"];
        expect(mod.validateRequest(ask("heron", "Okafor", 0, 70, 7), HERON)).toEqual(words);
        expect(mod.validateRequest(ask("heron", "Okafor", 2.5, 70, 7), HERON)).toEqual(words);
        expect(mod.validateRequest(ask("heron", "Okafor", -2, 70, 7), HERON)).toEqual(words);
    });
    add("validateRequest: a size that is not whole is not also measured against the berths", () => {
        const words = ["party size must be a whole number of at least 1"];
        expect(mod.validateRequest(ask("heron", "Okafor", 4.5, 70, 7), HERON)).toEqual(words);
        expect(mod.validateRequest(ask("teal", "Lindqvist", 9.5, 70, 7), TEAL)).toEqual(words);
    });
    add("validateRequest: a party that fills every berth is fine, one more is not", () => {
        expect(mod.validateRequest(ask("teal", "Lindqvist", 2, 70, 3), TEAL)).toEqual([]);
        expect(mod.validateRequest(ask("teal", "Lindqvist", 3, 70, 3), TEAL)).toEqual(["Teal sleeps 2, not 3"]);
    });
    add("validateRequest: a hire that does not end after it begins is told so and no more about its days", () => {
        expect(mod.validateRequest(ask("heron", "Okafor", 4, 73, 0), HERON)).toEqual([
            "the hire must end after it begins",
        ]);
        expect(mod.validateRequest(ask("heron", "", 4, 73, -2), HERON)).toEqual([
            "no party name",
            "the hire must end after it begins",
        ]);
    });
    add("validateRequest: the shortest hire is three nights", () => {
        expect(mod.validateRequest(ask("heron", "Okafor", 4, 70, 3), HERON)).toEqual([]);
        expect(mod.validateRequest(ask("heron", "Okafor", 4, 70, 2), HERON)).toEqual(["a hire is at least 3 nights"]);
        expect(mod.validateRequest(ask("heron", "Okafor", 4, 70, 1), HERON)).toEqual(["a hire is at least 3 nights"]);
    });
    add("validateRequest: the longest hire depends on the class of boat", () => {
        expect(mod.validateRequest(ask("heron", "Okafor", 4, 70, 21), HERON)).toEqual([]);
        expect(mod.validateRequest(ask("heron", "Okafor", 4, 70, 22), HERON)).toEqual([
            "a narrow boat goes out for at most 21 nights",
        ]);
        expect(mod.validateRequest(ask("kestrel", "Adeyemi", 6, 70, 14), KESTREL)).toEqual([]);
        expect(mod.validateRequest(ask("kestrel", "Adeyemi", 6, 70, 15), KESTREL)).toEqual([
            "a wide boat goes out for at most 14 nights",
        ]);
        expect(mod.validateRequest(ask("teal", "Lindqvist", 2, 70, 10), TEAL)).toEqual([]);
        expect(mod.validateRequest(ask("teal", "Lindqvist", 2, 70, 11), TEAL)).toEqual([
            "a cruiser boat goes out for at most 10 nights",
        ]);
    });
    add("validateRequest: hires begin on a Saturday, a Monday or a Friday", () => {
        const first = (day: number): string[] => mod.validateRequest(ask("heron", "Okafor", 4, day, 4), HERON);
        expect(first(70)).toEqual([]);
        expect(first(72)).toEqual([]);
        expect(first(76)).toEqual([]);
        expect(first(71)).toEqual(["hires begin on a Saturday, Monday or Friday, not a Sun"]);
        expect(first(74)).toEqual(["hires begin on a Saturday, Monday or Friday, not a Wed"]);
        expect(first(75)).toEqual(["hires begin on a Saturday, Monday or Friday, not a Thu"]);
    });
    add("validateRequest: a day before day 0 has its weekday as any other day does", () => {
        expect(mod.validateRequest(ask("heron", "Okafor", 4, -5, 7), HERON)).toEqual([]);
        expect(mod.validateRequest(ask("heron", "Okafor", 4, -1, 7), HERON)).toEqual([]);
        expect(mod.validateRequest(ask("heron", "Okafor", 4, -4, 7), HERON)).toEqual([
            "hires begin on a Saturday, Monday or Friday, not a Tue",
        ]);
    });
    add("validateRequest: leaves the request and the boat as they were", () => {
        const req = ask("heron", "  Okafor ", 9, 73, 2);
        const boat = { ...HERON };
        mod.validateRequest(req, boat);
        expect(req).toEqual(ask("heron", "  Okafor ", 9, 73, 2));
        expect(boat).toEqual(HERON);
    });

    // ----------------------------------------------------------------------------------------- the money

    add("hireCharge: midweek nights at the rate of the class", () => {
        expect(mod.hireCharge(HERON, 72, 75)).toBe(28350);
        expect(mod.hireCharge(TEAL, 72, 75)).toBe(22800);
        expect(mod.hireCharge({ ...KESTREL, berths: 4 }, 72, 76)).toBe(51200);
    });
    add("hireCharge: Friday and Saturday nights cost more", () => {
        expect(mod.hireCharge(HERON, 76, 79)).toBe(31350);
        expect(mod.hireCharge(TEAL, 76, 79)).toBe(25200);
        expect(mod.hireCharge({ ...KESTREL, berths: 4 }, 76, 79)).toBe(42900);
        expect(mod.hireCharge(HERON, 70, 73)).toBe(29850);
        expect(mod.hireCharge(TEAL, 76, 81)).toBe(40400);
    });
    add("hireCharge: each berth beyond four adds to every night", () => {
        expect(mod.hireCharge(AVOCET, 72, 75)).toBe(30450);
        expect(mod.hireCharge(KESTREL, 72, 76)).toBe(56800);
        expect(mod.hireCharge({ ...HERON, berths: 5 }, 72, 75)).toBe(29400);
        expect(mod.hireCharge({ ...HERON, berths: 3 }, 72, 75)).toBe(28350);
    });
    add("hireCharge: days that run backwards bring the berth extra below zero", () => {
        expect(mod.hireCharge(KESTREL, 72, 70)).toBe(-2800);
        expect(mod.hireCharge(AVOCET, 76, 73)).toBe(-2100);
    });
    add("hireCharge: six nights get no discount", () => {
        expect(mod.hireCharge(HERON, 70, 76)).toBe(58200);
        expect(mod.hireCharge(TEAL, 72, 78)).toBe(48000);
    });
    add("hireCharge: seven nights get a tenth off, the discount rounded up to the whole pound", () => {
        expect(mod.hireCharge(HERON, 70, 77)).toBe(62150);
        expect(mod.hireCharge(KESTREL, 70, 77)).toBe(93500);
        expect(mod.hireCharge(TEAL, 72, 79)).toBe(50000);
        expect(mod.hireCharge(AVOCET, 76, 84)).toBe(77100);
    });
    add("hireCharge: thirteen nights get a tenth off", () => {
        expect(mod.hireCharge(HERON, 70, 83)).toBe(114550);
        expect(mod.hireCharge(KESTREL, 72, 85)).toBe(174200);
    });
    add("hireCharge: a fortnight gets a tenth off", () => {
        expect(mod.hireCharge(HERON, 70, 84)).toBe(124400);
        expect(mod.hireCharge(KESTREL, 72, 86)).toBe(187000);
    });
    add("hireCharge: three weeks get a tenth off", () => {
        expect(mod.hireCharge(HERON, 70, 91)).toBe(186650);
        expect(mod.hireCharge(AVOCET, 72, 90)).toBe(169800);
    });
    add("depositFor: a quarter of the charge, rounded up to the whole pound", () => {
        expect(mod.depositFor(62150)).toBe(15600);
        expect(mod.depositFor(56800)).toBe(14200);
        expect(mod.depositFor(40001)).toBe(10100);
        expect(mod.depositFor(40400)).toBe(10100);
    });
    add("depositFor: never under a hundred pounds", () => {
        expect(mod.depositFor(29850)).toBe(10000);
        expect(mod.depositFor(40000)).toBe(10000);
        expect(mod.depositFor(10001)).toBe(10000);
    });
    add("depositFor: never over the charge", () => {
        expect(mod.depositFor(6000)).toBe(6000);
        expect(mod.depositFor(9999)).toBe(9999);
        expect(mod.depositFor(0)).toBe(0);
    });
    add("refundShare: each step of the scale, at its edge", () => {
        expect([42, 41, 28, 27, 14, 13].map((n) => mod.refundShare(n))).toEqual([100, 75, 75, 40, 40, 0]);
    });
    add("refundShare: a year of notice, none, and a hire already begun", () => {
        expect(mod.refundShare(365)).toBe(100);
        expect(mod.refundShare(0)).toBe(0);
        expect(mod.refundShare(-3)).toBe(0);
    });
    add("holdLength: two days when the hire is a week or more off", () => {
        expect(mod.holdLength(S(40, 600), 70)).toBe(2880);
        expect(mod.holdLength(S(63, 0), 70)).toBe(2880);
        expect(mod.holdLength(S(63, 1439), 70)).toBe(2880);
    });
    add("holdLength: four hours when the hire is under a week off", () => {
        expect(mod.holdLength(S(64, 0), 70)).toBe(240);
        expect(mod.holdLength(S(64, 1439), 70)).toBe(240);
        expect(mod.holdLength(S(69, 600), 70)).toBe(240);
    });
    add("hasLapsed: a hold has lapsed at the minute it runs out", () => {
        const b = made({ state: "held", lapsesAt: 5000 });
        expect(mod.hasLapsed(b, 4999)).toBe(false);
        expect(mod.hasLapsed(b, 5000)).toBe(true);
        expect(mod.hasLapsed(b, 5001)).toBe(true);
    });
    add("hasLapsed: only a hold can lapse", () => {
        expect(mod.hasLapsed(made({ state: "confirmed", lapsesAt: 5000 }), 9000)).toBe(false);
        expect(mod.hasLapsed(made({ state: "cancelled", lapsesAt: 5000 }), 9000)).toBe(false);
        expect(mod.hasLapsed(made({ state: "lapsed", lapsesAt: 5000 }), 9000)).toBe(false);
    });
    add("sortForDiary: by first day, then boat, then booking number", () => {
        const list = [
            made({ id: "B0005", boatId: "teal", fromDay: 77 }),
            made({ id: "B0004", boatId: "heron", fromDay: 77 }),
            made({ id: "B0003", boatId: "heron", fromDay: 77 }),
            made({ id: "B0002", boatId: "teal", fromDay: 70 }),
            made({ id: "B0001", boatId: "avocet", fromDay: 84 }),
        ];
        expect(mod.sortForDiary(list).map((b) => b.id)).toEqual(["B0002", "B0003", "B0004", "B0005", "B0001"]);
    });
    add("sortForDiary: on one day the boat comes before the booking number", () => {
        const list = [
            made({ id: "B0001", boatId: "teal", fromDay: 70 }),
            made({ id: "B0002", boatId: "heron", fromDay: 70 }),
        ];
        expect(mod.sortForDiary(list).map((b) => b.id)).toEqual(["B0002", "B0001"]);
    });
    add("sortForDiary: sorts the very array it is given and hands it back", () => {
        const list = [made({ id: "B0002", fromDay: 77 }), made({ id: "B0001", fromDay: 70 })];
        const back = mod.sortForDiary(list);
        expect(back).toBe(list);
        expect(list.map((b) => b.id)).toEqual(["B0001", "B0002"]);
    });
    add("quoteFor: a week on a narrowboat", () => {
        expect(mod.quoteFor(HERON, 70, 77)).toEqual({
            nights: 7,
            chargePence: 62150,
            depositPence: 15600,
            balancePence: 46550,
            balanceDueDay: 42,
        });
    });
    add("quoteFor: a short break pays the least deposit, and the balance is due four weeks before", () => {
        expect(mod.quoteFor(HERON, 76, 79)).toEqual({
            nights: 3,
            chargePence: 31350,
            depositPence: 10000,
            balancePence: 21350,
            balanceDueDay: 48,
        });
    });
    add("quoteFor: for a hire early in the season the balance falls due before day 0", () => {
        expect(mod.quoteFor(HERON, 14, 17)).toEqual({
            nights: 3,
            chargePence: 29850,
            depositPence: 10000,
            balancePence: 19850,
            balanceDueDay: -14,
        });
        expect(mod.quoteFor(HERON, 28, 31).balanceDueDay).toBe(0);
    });
    add("parseRequestLine: reads the five fields, the last as a count of nights", () => {
        expect(mod.parseRequestLine("heron; Okafor; 4; 14; 7")).toEqual({
            boatId: "heron",
            party: "Okafor",
            partySize: 4,
            fromDay: 14,
            toDay: 21,
        });
    });
    add("parseRequestLine: trims each field and puts the boat id in lower case", () => {
        expect(mod.parseRequestLine("  Kestrel ;  Mrs Adeyemi-Clarke ;8;70;4 ")).toEqual({
            boatId: "kestrel",
            party: "Mrs Adeyemi-Clarke",
            partySize: 8,
            fromDay: 70,
            toDay: 74,
        });
        expect(mod.parseRequestLine("teal;Lindqvist;2;70;0")).toEqual(ask("teal", "Lindqvist", 2, 70, 0));
    });
    add("parseRequestLine: undefined for a line with the wrong number of fields or an empty name", () => {
        expect(mod.parseRequestLine("heron; Okafor; 4; 14")).toBeUndefined();
        expect(mod.parseRequestLine("heron; Okafor; 4; 14; 7; 2")).toBeUndefined();
        expect(mod.parseRequestLine("; Okafor; 4; 14; 7")).toBeUndefined();
        expect(mod.parseRequestLine("heron;  ; 4; 14; 7")).toBeUndefined();
        expect(mod.parseRequestLine("")).toBeUndefined();
        expect(mod.parseRequestLine("heron; Okafor; 4; 14; 7;")).toBeUndefined();
        expect(mod.parseRequestLine("heron;;Okafor;4;14;7")).toBeUndefined();
    });
    add("parseRequestLine: undefined when a number is not a row of digits", () => {
        expect(mod.parseRequestLine("heron; Okafor; four; 14; 7")).toBeUndefined();
        expect(mod.parseRequestLine("heron; Okafor; 4; -14; 7")).toBeUndefined();
        expect(mod.parseRequestLine("heron; Okafor; 4.5; 14; 7")).toBeUndefined();
        expect(mod.parseRequestLine("heron; Okafor; 4; ; 7")).toBeUndefined();
        expect(mod.parseRequestLine("heron; Okafor; 4; 14; 7n")).toBeUndefined();
        for (const nights of ["7.0", "1e1", "+7", "0x7"]) {
            expect(mod.parseRequestLine(`heron; Okafor; 4; 14; ${nights}`), nights).toBeUndefined();
        }
    });
    add("refundTerms: says what share of the deposit goes back", () => {
        expect(mod.refundTerms(made(), 28)).toBe("100% of the £156.00 deposit goes back");
        expect(mod.refundTerms(made(), 29)).toBe("75% of the £156.00 deposit goes back");
        expect(mod.refundTerms(made(), 56)).toBe("40% of the £156.00 deposit goes back");
    });
    add("refundTerms: short notice keeps the deposit, and an unconfirmed booking has none", () => {
        expect(mod.refundTerms(made(), 57)).toBe("the £156.00 deposit is kept");
        expect(mod.refundTerms(made({ state: "held" }), 10)).toBe("no deposit taken");
        expect(mod.refundTerms(made({ state: "cancelled" }), 10)).toBe("no deposit taken");
    });

    // ------------------------------------------------------------------------------------------ the book

    add("book: a new book is empty", () => {
        const book = newBook();
        expect(book.size).toBe(0);
        expect(book.all()).toEqual([]);
        expect(book.find("B0001")).toBeUndefined();
        expect(book.history()).toEqual([]);
        expect(book.waitingFor("heron")).toEqual([]);
    });
    add("book: of two boats with one id, the later is kept", () => {
        const book = new mod.BookingBook([HERON, { ...HERON, name: "Heron Two", berths: 2 }]);
        expect(book.place(ask("heron", "Okafor", 4, 70, 7), S(40, 600))).toEqual({
            ok: false,
            problems: ["Heron Two sleeps 2, not 4"],
        });
    });
    add("book: keeps the caller's boats, not copies of them", () => {
        const boat = { ...HERON };
        const book = new mod.BookingBook([boat]);
        boat.berths = 2;
        expect(book.place(ask("heron", "Okafor", 4, 70, 7), S(40, 600))).toEqual({
            ok: false,
            problems: ["Heron sleeps 2, not 4"],
        });
    });
    add("place: a good request becomes a hold", () => {
        const book = newBook();
        const placed = book.place(ask("heron", "Okafor", 4, 70, 7), S(40, 600));
        expect(placed).toEqual({
            ok: true,
            booking: {
                id: "B0001",
                boatId: "heron",
                party: "Okafor",
                partySize: 4,
                fromDay: 70,
                toDay: 77,
                state: "held",
                placedAt: 58200,
                lapsesAt: 61080,
                confirmedAt: -1,
                closedAt: -1,
                chargePence: 62150,
                depositPence: 15600,
                paidPence: 0,
                notes: [],
            },
        });
        expect(book.size).toBe(1);
    });
    add("place: bookings are numbered B0001, B0002, and the book keeps the newest first", () => {
        const book = newBook();
        expect(hold(book, ask("heron", "Okafor", 4, 70, 7), S(40, 600)).id).toBe("B0001");
        expect(hold(book, ask("kestrel", "Adeyemi", 6, 72, 4), S(40, 610)).id).toBe("B0002");
        expect(hold(book, ask("teal", "Lindqvist", 2, 76, 5), S(40, 620)).id).toBe("B0003");
        expect(book.all().map((b) => b.id)).toEqual(["B0003", "B0002", "B0001"]);
        expect(book.find("B0002")?.chargePence).toBe(56800);
        expect(book.find("B0002")?.depositPence).toBe(14200);
        expect(book.find("B0003")?.chargePence).toBe(40400);
        expect(book.find("B0003")?.depositPence).toBe(10100);
    });
    add("place: a refused request takes no number and is not kept", () => {
        const book = newBook();
        expect(book.place(ask("heron", "Okafor", 9, 70, 7), S(40, 600)).ok).toBe(false);
        expect(book.size).toBe(0);
        expect(book.history()).toEqual([]);
        expect(hold(book, ask("heron", "Okafor", 4, 70, 7), S(40, 605)).id).toBe("B0001");
    });
    add("place: trims the party name, and hands back the book's own booking", () => {
        const book = newBook();
        const b = hold(book, ask("heron", "  Okafor ", 4, 70, 7), S(40, 600));
        expect(b.party).toBe("Okafor");
        expect(book.find("B0001")).toBe(b);
    });
    add("place: an unknown boat is the only problem named", () => {
        const book = newBook();
        expect(book.place(ask("osprey", "", 0, 73, 1), S(40, 600))).toEqual({ ok: false, problems: ["no boat osprey"] });
    });
    add("place: the hire must begin after the day of placing", () => {
        const book = newBook();
        expect(book.place(ask("heron", "Okafor", 4, 70, 7), S(70, 0))).toEqual({
            ok: false,
            problems: ["the hire must begin after today"],
        });
        expect(book.place(ask("heron", "Okafor", 4, 70, 7), S(71, 30))).toEqual({
            ok: false,
            problems: ["the hire must begin after today"],
        });
        expect(book.place(ask("heron", "Okafor", 4, 70, 7), S(69, 1439)).ok).toBe(true);
    });
    add("place: the request's own problems come first, then the day, and no clash is looked for among them", () => {
        const { book } = withHold();
        expect(book.place(ask("heron", "Nakamura", 9, 73, 2), S(73, 5))).toEqual({
            ok: false,
            problems: [
                "Heron sleeps 4, not 9",
                "a hire is at least 3 nights",
                "hires begin on a Saturday, Monday or Friday, not a Tue",
                "the hire must begin after today",
            ],
        });
        // a fresh book, where Okafor's hold still stands on those days
        expect(withHold().book.place(ask("heron", "Nakamura", 9, 70, 7), S(40, 700))).toEqual({
            ok: false,
            problems: ["Heron sleeps 4, not 9"],
        });
    });
    add("place: a boat cannot be held twice for one night", () => {
        const { book } = withHold();
        const taken = { ok: false, problems: ["Heron is taken for some of those days"] };
        expect(book.place(ask("heron", "Nakamura", 2, 76, 3), S(40, 700))).toEqual(taken);
        expect(book.place(ask("heron", "Nakamura", 2, 65, 6), S(40, 700))).toEqual(taken);
        expect(book.place(ask("heron", "Nakamura", 2, 72, 3), S(40, 700))).toEqual(taken);
        expect(book.size).toBe(1);
    });
    add("place: a hire may begin on the day another ends, and end on the day another begins", () => {
        const { book } = withHold();
        expect(book.place(ask("heron", "Nakamura", 2, 77, 3), S(40, 700)).ok).toBe(true);
        expect(book.place(ask("heron", "Brankovic", 2, 63, 7), S(40, 710)).ok).toBe(true);
        expect(book.place(ask("avocet", "Fairweather", 2, 70, 7), S(40, 720)).ok).toBe(true);
        expect(book.size).toBe(4);
    });
    add("place: a hold placed under a week before the hire stands for four hours", () => {
        const book = newBook();
        expect(hold(book, ask("heron", "Okafor", 4, 70, 7), S(64, 600)).lapsesAt).toBe(S(64, 840));
        expect(hold(book, ask("avocet", "Okafor", 4, 70, 7), S(63, 600)).lapsesAt).toBe(S(65, 600));
    });
    add("place: holds that have run out are let go first, so they do not stand in the way", () => {
        const { book, b } = withHold();
        const second = book.place(ask("heron", "Nakamura", 2, 70, 7), 61080);
        expect(second.ok).toBe(true);
        expect(b.state).toBe("lapsed");
        expect(b.closedAt).toBe(61080);
        expect(book.all().map((x) => `${x.id} ${x.state}`)).toEqual(["B0002 held", "B0001 lapsed"]);
    });
    add("place: a hold blocks until the last minute before it runs out", () => {
        const { book, b } = withHold();
        expect(book.place(ask("heron", "Nakamura", 2, 70, 7), 61079)).toEqual({
            ok: false,
            problems: ["Heron is taken for some of those days"],
        });
        expect(b.state).toBe("held");
    });
    add("place: old holds are let go even when the request is refused", () => {
        const { book, b } = withHold();
        expect(book.place(ask("osprey", "Nakamura", 2, 70, 7), S(45, 0)).ok).toBe(false);
        expect(b.state).toBe("lapsed");
        expect(b.closedAt).toBe(61080);
    });
    add("place: leaves the request as it was", () => {
        const book = newBook();
        const req = ask("heron", "  Okafor ", 4, 70, 7);
        book.place(req, S(40, 600));
        expect(req).toEqual(ask("heron", "  Okafor ", 4, 70, 7));
    });
    add("confirm: a hold paid for becomes a hire", () => {
        const { book, b } = withHold();
        expect(book.confirm("B0001", 15600, S(41, 540))).toBe("confirmed");
        expect(b).toEqual(
            made({
                state: "confirmed",
                placedAt: 58200,
                lapsesAt: 61080,
                confirmedAt: S(41, 540),
                paidPence: 15600,
                notes: ["confirmed with £156.00"],
            }),
        );
    });
    add("confirm: whatever is handed over is written down as paid", () => {
        const { book, b } = withHold();
        book.addNote("B0001", "rang twice");
        expect(book.confirm("B0001", 62150, S(41, 540))).toBe("confirmed");
        expect(b.paidPence).toBe(62150);
        expect(b.notes).toEqual(["confirmed with £621.50", "rang twice"]);
    });
    add("confirm: more than the charge is written down as paid too", () => {
        const { book, b } = withHold();
        expect(book.confirm("B0001", 70000, S(41, 540))).toBe("confirmed");
        expect(b.paidPence).toBe(70000);
        expect(b.notes).toEqual(["confirmed with £700.00"]);
        expect(book.takePayment("B0001", 100, S(42, 0))).toBe(-7950);
    });
    add("confirm: less than the deposit leaves the hold as it was", () => {
        const { book, b } = withHold();
        const before = copyOf(b);
        expect(book.confirm("B0001", 15599, S(41, 540))).toBe("underpaid");
        expect(book.confirm("B0001", 15599.9, S(41, 540))).toBe("underpaid");
        expect(b).toEqual(before);
        expect(book.history().length).toBe(1);
    });
    add("confirm: an unknown id, and a booking that is no longer a hold", () => {
        const { book } = withHire();
        expect(book.confirm("B0002", 15600, S(41, 600))).toBe("unknown");
        expect(book.confirm("B0001", 15600, S(41, 600))).toBe("not-held");
        book.cancel("B0001", S(41, 700));
        expect(book.confirm("B0001", 15600, S(41, 800))).toBe("not-held");
    });
    add("confirm: the last minute before the hold runs out is in time", () => {
        const { book, b } = withHold();
        expect(book.confirm("B0001", 15600, 61079)).toBe("confirmed");
        expect(b.state).toBe("confirmed");
        expect(b.confirmedAt).toBe(61079);
    });
    add("confirm: at the minute the hold runs out it is too late, and the hold is let go", () => {
        const { book, b } = withHold();
        expect(book.confirm("B0001", 15600, 61080)).toBe("lapsed");
        expect(b.state).toBe("lapsed");
        expect(b.closedAt).toBe(61080);
        expect(b.confirmedAt).toBe(-1);
        expect(b.paidPence).toBe(0);
        expect(b.notes).toEqual([]);
    });
    add("confirm: a hold found lapsed is closed at the minute it ran out, not when it was found", () => {
        const { book, b } = withHold();
        expect(book.confirm("B0001", 15600, S(50, 0))).toBe("lapsed");
        expect(b.closedAt).toBe(61080);
        expect(book.history()).toEqual([
            { at: 61080, bookingId: "B0001", kind: "lapsed", pence: 0 },
            { at: 58200, bookingId: "B0001", kind: "placed", pence: 0 },
        ]);
        expect(book.confirm("B0001", 15600, S(50, 5))).toBe("not-held");
    });
    add("confirm: a hold that has run out is let go, however little is handed over", () => {
        const { book, b } = withHold();
        expect(book.confirm("B0001", 100, S(50, 0))).toBe("lapsed");
        expect(b.state).toBe("lapsed");
        expect(b.closedAt).toBe(61080);
    });
    add("takePayment: adds to what is paid and says what is still owed", () => {
        const { book, b } = withHire();
        expect(book.takePayment("B0001", 20000, S(45, 600))).toBe(26550);
        expect(b.paidPence).toBe(35600);
        expect(b.notes).toEqual(["paid £200.00", "confirmed with £156.00"]);
        expect(book.takePayment("B0001", 26550, S(46, 600))).toBe(0);
        expect(b.paidPence).toBe(62150);
        expect(book.takePayment("B0001", 1, S(47, 600))).toBe(-1);
        expect(b.paidPence).toBe(62151);
    });
    add("takePayment: what is owed goes below zero when the party overpays", () => {
        const { book, b } = withHire();
        expect(book.takePayment("B0001", 47050, S(45, 600))).toBe(-500);
        expect(b.paidPence).toBe(62650);
    });
    add("takePayment: nothing for a hold, an unknown id, or no money", () => {
        const { book, b } = withHold();
        expect(book.takePayment("B0001", 5000, S(40, 700))).toBe(0);
        expect(book.takePayment("B0007", 5000, S(40, 700))).toBe(0);
        expect(b.paidPence).toBe(0);
        expect(b.notes).toEqual([]);
        book.confirm("B0001", 15600, S(41, 540));
        expect(book.takePayment("B0001", 0, S(41, 700))).toBe(0);
        expect(book.takePayment("B0001", -100, S(41, 700))).toBe(0);
        expect(b.paidPence).toBe(15600);
        expect(book.history().map((e) => e.kind)).toEqual(["confirmed", "placed"]);
    });
    add("cancel: a hold gets nothing back and is closed", () => {
        const { book, b } = withHold();
        expect(book.cancel("B0001", S(41, 615))).toBe(0);
        expect(b.state).toBe("cancelled");
        expect(b.closedAt).toBe(S(41, 615));
        expect(b.paidPence).toBe(0);
        expect(b.notes).toEqual(["cancelled on Fri wk6, £0.00 back"]);
        expect(book.history("B0001")[0]).toEqual({ at: S(41, 615), bookingId: "B0001", kind: "cancelled", pence: 0 });
    });
    add("cancel: a hire cancelled ten days ahead gets back what it paid beyond the deposit", () => {
        const { book, b } = withHire(30000);
        expect(book.cancel("B0001", S(60, 615))).toBe(14400);
        expect(b.state).toBe("cancelled");
        expect(b.closedAt).toBe(S(60, 615));
        expect(b.paidPence).toBe(15600);
        expect(b.depositPence).toBe(15600);
        expect(b.notes[0]).toBe("cancelled on Wed wk9, £144.00 back");
        expect(book.history("B0001")[0]).toEqual({
            at: S(60, 615),
            bookingId: "B0001",
            kind: "cancelled",
            pence: 14400,
        });
    });
    add("cancel: a hire cancelled ten days ahead with only the deposit paid gets nothing back", () => {
        const { book, b } = withHire();
        expect(book.cancel("B0001", S(60, 615))).toBe(0);
        expect(b.paidPence).toBe(15600);
        expect(b.notes[0]).toBe("cancelled on Wed wk9, £0.00 back");
    });
    add("cancel: a hire cancelled seven weeks ahead still leaves its whole deposit with the yard", () => {
        const { book, b } = withHire(30000);
        expect(book.cancel("B0001", S(42, 10))).toBe(14400);
        expect(b.paidPence).toBe(15600);
        expect(b.notes[0]).toBe("cancelled on Sat wk7, £144.00 back");
    });
    add("cancel: an unknown id and a booking already closed give 0 and change nothing", () => {
        const { book, b } = withHire(30000);
        expect(book.cancel("B0009", S(60, 0))).toBe(0);
        book.cancel("B0001", S(60, 615));
        const before = copyOf(b);
        expect(book.cancel("B0001", S(61, 0))).toBe(0);
        expect(b).toEqual(before);
        expect(book.history().length).toBe(3);
    });
    add("cancel: a lapsed hold gives 0 and stays lapsed", () => {
        const { book, b } = withHold();
        book.lapse(S(50, 0));
        expect(book.cancel("B0001", S(51, 0))).toBe(0);
        expect(b.state).toBe("lapsed");
        expect(b.closedAt).toBe(61080);
        expect(book.history().length).toBe(2);
    });
    add("cancel: a hold past its minute that nothing has let go yet is cancelled at the minute given", () => {
        const { book, b } = withHold();
        expect(book.cancel("B0001", S(50, 0))).toBe(0);
        expect(b.state).toBe("cancelled");
        expect(b.closedAt).toBe(S(50, 0));
        expect(b.notes).toEqual(["cancelled on Sun wk8, £0.00 back"]);
    });
    add("cancel: the days are free again", () => {
        const { book } = withHire();
        expect(book.isFree("heron", 70, 77)).toBe(false);
        book.cancel("B0001", S(60, 615));
        expect(book.isFree("heron", 70, 77)).toBe(true);
        expect(book.place(ask("heron", "Nakamura", 2, 70, 7), S(60, 700)).ok).toBe(true);
    });
    add("lapse: lets go of every hold that has run out and names them oldest first", () => {
        const book = newBook();
        const a = hold(book, ask("heron", "Okafor", 4, 70, 7), S(40, 600));
        const b = hold(book, ask("kestrel", "Adeyemi", 6, 72, 4), S(40, 900));
        const c = hold(book, ask("teal", "Lindqvist", 2, 76, 5), S(41, 600));
        expect(book.lapse(S(42, 900))).toEqual(["B0001", "B0002"]);
        expect([a.state, b.state, c.state]).toEqual(["lapsed", "lapsed", "held"]);
        expect([a.closedAt, b.closedAt, c.closedAt]).toEqual([S(42, 600), S(42, 900), -1]);
        expect(book.history().map((e) => `${e.kind} ${e.bookingId} ${e.at}`)).toEqual([
            `lapsed B0002 ${S(42, 900)}`,
            `lapsed B0001 ${S(42, 600)}`,
            `placed B0003 ${S(41, 600)}`,
            `placed B0002 ${S(40, 900)}`,
            `placed B0001 ${S(40, 600)}`,
        ]);
    });
    add("lapse: the minute a hold runs out counts, the minute before does not", () => {
        const { book, b } = withHold();
        expect(book.lapse(61079)).toEqual([]);
        expect(b.state).toBe("held");
        expect(book.lapse(61080)).toEqual(["B0001"]);
        expect(b.state).toBe("lapsed");
    });
    add("lapse: a confirmed hire stays, and a second call finds nothing new", () => {
        const { book, b } = withHire();
        const other = hold(book, ask("teal", "Lindqvist", 2, 76, 5), S(41, 600));
        expect(book.lapse(S(60, 0))).toEqual(["B0002"]);
        expect(b.state).toBe("confirmed");
        expect(b.closedAt).toBe(-1);
        expect(other.state).toBe("lapsed");
        expect(book.lapse(S(61, 0))).toEqual([]);
        expect(book.history().filter((e) => e.kind === "lapsed").length).toBe(1);
    });
    add("isFree: only live bookings of that boat count", () => {
        const { book } = withHold();
        expect(book.isFree("heron", 70, 77)).toBe(false);
        expect(book.isFree("avocet", 70, 77)).toBe(true);
        expect(book.isFree("osprey", 70, 77)).toBe(true);
        book.lapse(S(50, 0));
        expect(book.isFree("heron", 70, 77)).toBe(true);
    });
    add("isFree: the day a hire ends is free, its last night is not", () => {
        const { book } = withHire();
        expect(book.isFree("heron", 77, 80)).toBe(true);
        expect(book.isFree("heron", 76, 80)).toBe(false);
        expect(book.isFree("heron", 60, 70)).toBe(true);
        expect(book.isFree("heron", 60, 71)).toBe(false);
    });
    add("isFree: one booking can be left out", () => {
        const { book } = withHire();
        expect(book.isFree("heron", 72, 79, "B0001")).toBe(true);
        expect(book.isFree("heron", 72, 79, "B0002")).toBe(false);
        expect(book.isFree("heron", 72, 79, "")).toBe(false);
    });
    add("find: gives the book's own booking, or undefined", () => {
        const { book, b } = withHold();
        expect(book.find("B0001")).toBe(b);
        expect(book.find("B0002")).toBeUndefined();
        expect(book.find("b0001")).toBeUndefined();
        expect(book.find(" B0001")).toBeUndefined();
    });
    add("forBoat: a boat's bookings in every state, newest first", () => {
        const book = newBook();
        hold(book, ask("heron", "Okafor", 4, 70, 7), S(40, 600));
        hold(book, ask("kestrel", "Adeyemi", 6, 72, 4), S(40, 610));
        hold(book, ask("heron", "Nakamura", 2, 77, 3), S(40, 620));
        book.cancel("B0001", S(40, 630));
        expect(book.forBoat("heron").map((b) => `${b.id} ${b.state}`)).toEqual(["B0003 held", "B0001 cancelled"]);
        expect(book.forBoat("kestrel").map((b) => b.id)).toEqual(["B0002"]);
    });
    add("forBoat: none for a boat with no bookings or an unknown one", () => {
        const { book } = withHold();
        expect(book.forBoat("teal")).toEqual([]);
        expect(book.forBoat("osprey")).toEqual([]);
    });
    add("all: a new array each time, holding the book's own bookings", () => {
        const { book, b } = withHold();
        const list = book.all();
        expect(list[0]).toBe(b);
        list.pop();
        expect(book.size).toBe(1);
        expect(book.all().length).toBe(1);
    });
    add("size: counts every booking ever placed, closed ones too", () => {
        const book = newBook();
        hold(book, ask("heron", "Okafor", 4, 70, 7), S(40, 600));
        hold(book, ask("kestrel", "Adeyemi", 6, 72, 4), S(40, 610));
        book.cancel("B0001", S(40, 630));
        book.lapse(S(60, 0));
        expect(book.size).toBe(2);
        expect(book.all().map((b) => b.state)).toEqual(["lapsed", "cancelled"]);
    });
    add("move: shifts the days, keeps the length, prices again and leaves the deposit", () => {
        const book = newBook();
        const b = hold(book, ask("heron", "Okafor", 4, 70, 3), S(40, 600));
        expect([b.chargePence, b.depositPence]).toEqual([29850, 10000]);
        expect(book.move("B0001", 76, S(41, 0))).toEqual([]);
        expect([b.fromDay, b.toDay]).toEqual([76, 79]);
        expect([b.chargePence, b.depositPence]).toEqual([31350, 10000]);
        expect(b.notes).toEqual(["moved from Sat wk11 to Fri wk11"]);
        expect(b.lapsesAt).toBe(S(42, 600));
        expect(book.history()[0]).toEqual({ at: S(41, 0), bookingId: "B0001", kind: "moved", pence: 0 });
    });
    add("move: a hire that costs more on its new days keeps the deposit it was placed with", () => {
        const book = newBook();
        const b = hold(book, ask("kestrel", "Adeyemi", 6, 72, 4), S(40, 600));
        expect([b.chargePence, b.depositPence]).toEqual([56800, 14200]);
        expect(book.move("B0001", 76, S(41, 0))).toEqual([]);
        expect([b.chargePence, b.depositPence]).toEqual([61300, 14200]);
    });
    add("move: to the day it begins already, the move is still noted and recorded", () => {
        const { book, b } = withHold();
        expect(book.move("B0001", 70, S(41, 0))).toEqual([]);
        expect([b.fromDay, b.toDay]).toEqual([70, 77]);
        expect(b.notes).toEqual(["moved from Sat wk11 to Sat wk11"]);
        expect(book.history().map((e) => e.kind)).toEqual(["moved", "placed"]);
    });
    add("move: a hold moved nearer its days keeps the minute it runs out", () => {
        const { book, b } = withHold();
        expect(book.move("B0001", 44, S(41, 0))).toEqual([]);
        expect([b.fromDay, b.toDay]).toEqual([44, 51]);
        expect(b.lapsesAt).toBe(S(42, 600));
    });
    add("move: a hold past its minute that nothing has let go yet can still be moved", () => {
        const { book, b } = withHold();
        expect(book.move("B0001", 76, S(45, 0))).toEqual([]);
        expect(b.state).toBe("held");
        expect([b.fromDay, b.toDay]).toEqual([76, 83]);
    });
    add("move: says what stands in the way and then changes nothing", () => {
        const { book, b } = withHire();
        const before = copyOf(b);
        expect(book.move("B0001", 73, S(45, 0))).toEqual(["hires begin on a Saturday, Monday or Friday, not a Tue"]);
        expect(book.move("B0001", 42, S(42, 5))).toEqual(["the hire must begin after today"]);
        expect(book.move("B0001", 43, S(43, 5))).toEqual([
            "hires begin on a Saturday, Monday or Friday, not a Sun",
            "the hire must begin after today",
        ]);
        expect(b).toEqual(before);
        expect(book.history().length).toBe(2);
    });
    add("move: may overlap its own old days but not another booking", () => {
        const { book, b } = withHire();
        hold(book, ask("heron", "Nakamura", 2, 77, 3), S(41, 600));
        expect(book.move("B0002", 76, S(41, 700))).toEqual(["Heron is taken for some of those days"]);
        expect(book.move("B0002", 75, S(41, 700))).toEqual([
            "hires begin on a Saturday, Monday or Friday, not a Thu",
            "Heron is taken for some of those days",
        ]);
        expect(book.move("B0002", 84, S(41, 700))).toEqual([]);
        expect(book.move("B0001", 72, S(41, 800))).toEqual([]);
        expect([b.fromDay, b.toDay]).toEqual([72, 79]);
        expect(b.notes).toEqual(["moved from Sat wk11 to Mon wk11", "confirmed with £156.00"]);
        expect(book.move("B0001", 79, S(41, 900))).toEqual(["Heron is taken for some of those days"]);
    });
    add("move: only a live booking moves", () => {
        const { book, b } = withHold();
        expect(book.move("B0009", 77, S(41, 0))).toEqual(["no live booking B0009"]);
        book.cancel("B0001", S(41, 0));
        expect(book.move("B0001", 77, S(41, 5))).toEqual(["no live booking B0001"]);
        expect(b.fromDay).toBe(70);
    });
    add("changeBoat: puts the booking on the other boat for the same days and prices again", () => {
        const book = newBook();
        const b = hold(book, ask("heron", "Okafor", 4, 70, 3), S(40, 600));
        book.addNote("B0001", "asked for more room");
        expect(book.changeBoat("B0001", "avocet", S(41, 0))).toEqual([]);
        expect(b.boatId).toBe("avocet");
        expect([b.fromDay, b.toDay]).toEqual([70, 73]);
        expect([b.chargePence, b.depositPence]).toEqual([31950, 10000]);
        expect(b.notes).toEqual(["moved from Heron to Avocet", "asked for more room"]);
        expect(book.history()[0]).toEqual({ at: S(41, 0), bookingId: "B0001", kind: "moved", pence: 0 });
        expect(book.isFree("heron", 70, 73)).toBe(true);
        expect(book.isFree("avocet", 70, 73)).toBe(false);
    });
    add("changeBoat: the other boat must sleep the party and be free", () => {
        const book = newBook();
        const b = hold(book, ask("heron", "Okafor", 4, 70, 3), S(40, 600));
        hold(book, ask("avocet", "Nakamura", 2, 72, 3), S(40, 610));
        hold(book, ask("teal", "Lindqvist", 2, 70, 5), S(40, 620));
        const before = copyOf(b);
        expect(book.changeBoat("B0001", "avocet", S(41, 0))).toEqual(["Avocet is taken for some of those days"]);
        expect(book.changeBoat("B0001", "teal", S(41, 0))).toEqual([
            "Teal sleeps 2, not 4",
            "Teal is taken for some of those days",
        ]);
        expect(b).toEqual(before);
        expect(book.changeBoat("B0001", "kestrel", S(41, 0))).toEqual([]);
        expect(b.chargePence).toBe(44850);
        expect(before.chargePence).toBe(29850);
        expect(b.depositPence).toBe(10000);
    });
    add("changeBoat: a hold past its minute that nothing has let go yet can still change boat", () => {
        const { book, b } = withHold();
        expect(book.changeBoat("B0001", "avocet", S(45, 0))).toEqual([]);
        expect(b.state).toBe("held");
        expect(b.boatId).toBe("avocet");
    });
    add("changeBoat: an unknown booking, an unknown boat, and the boat it is on already", () => {
        const { book, b } = withHold();
        const before = copyOf(b);
        expect(book.changeBoat("B0007", "avocet", S(41, 0))).toEqual(["no live booking B0007"]);
        expect(book.changeBoat("B0007", "osprey", S(41, 0))).toEqual(["no live booking B0007"]);
        expect(book.changeBoat("B0001", "osprey", S(41, 0))).toEqual(["no boat osprey"]);
        expect(book.changeBoat("B0001", "heron", S(41, 0))).toEqual([]);
        expect(b).toEqual(before);
        expect(book.history().length).toBe(1);
        book.cancel("B0001", S(41, 5));
        expect(book.changeBoat("B0001", "avocet", S(41, 10))).toEqual(["no live booking B0001"]);
    });
    add("addNote: the newest note goes first, trimmed", () => {
        const { book, b } = withHold();
        expect(book.addNote("B0001", "  wants a pump-out on return ")).toBe(true);
        expect(book.addNote("B0001", "dog on board")).toBe(true);
        expect(b.notes).toEqual(["dog on board", "wants a pump-out on return"]);
    });
    add("addNote: false for an empty note or an unknown id", () => {
        const { book, b } = withHold();
        expect(book.addNote("B0001", "   ")).toBe(false);
        expect(book.addNote("B0002", "dog on board")).toBe(false);
        expect(b.notes).toEqual([]);
    });
    add("addNote: a closed booking still takes a note", () => {
        const { book, b } = withHold();
        book.cancel("B0001", S(41, 0));
        expect(book.addNote("B0001", "rang to say sorry")).toBe(true);
        expect(b.notes).toEqual(["rang to say sorry", "cancelled on Fri wk6, £0.00 back"]);
    });

    // ---------------------------------------------------------------------------------- the waiting list

    add("joinWaiting: gives the party's place in that boat's queue, counted from 1", () => {
        const book = newBook();
        expect(book.joinWaiting(waiter("heron", "Okafor", 70, 7, S(30, 545)))).toBe(1);
        expect(book.joinWaiting(waiter("heron", "Nakamura", 70, 3, S(30, 600)))).toBe(2);
        expect(book.joinWaiting(waiter("kestrel", "Adeyemi", 70, 7, S(30, 610)))).toBe(1);
        expect(book.joinWaiting(waiter("heron", "Brankovic", 77, 3, S(30, 620)))).toBe(3);
    });
    add("joinWaiting: 0 for an unknown boat, days that do not run forward, or a party already in that queue", () => {
        const book = newBook();
        expect(book.joinWaiting(waiter("osprey", "Okafor", 70, 7, S(30, 545)))).toBe(0);
        expect(book.joinWaiting(waiter("heron", "Okafor", 70, 0, S(30, 545)))).toBe(0);
        expect(book.joinWaiting(waiter("heron", "Okafor", 70, 7, S(30, 545)))).toBe(1);
        expect(book.joinWaiting(waiter("heron", "Okafor", 84, 7, S(31, 545)))).toBe(0);
        expect(book.joinWaiting(waiter("avocet", "Okafor", 84, 7, S(31, 545)))).toBe(1);
        expect(book.waitingFor("heron").length).toBe(1);
    });
    add("joinWaiting: the book keeps its own copy of the entry", () => {
        const book = newBook();
        const entry = waiter("heron", "Okafor", 70, 7, S(30, 545));
        book.joinWaiting(entry);
        entry.party = "Someone else";
        entry.toDay = 99;
        expect(book.waitingFor("heron")).toEqual([waiter("heron", "Okafor", 70, 7, S(30, 545))]);
    });
    add("waitingFor: one boat's queue, longest wait first", () => {
        const book = newBook();
        book.joinWaiting(waiter("heron", "Okafor", 70, 7, S(30, 545)));
        book.joinWaiting(waiter("kestrel", "Adeyemi", 70, 7, S(30, 600)));
        book.joinWaiting(waiter("heron", "Nakamura", 70, 3, S(30, 610)));
        expect(book.waitingFor("heron").map((w) => w.party)).toEqual(["Okafor", "Nakamura"]);
        expect(book.waitingFor("kestrel").map((w) => w.party)).toEqual(["Adeyemi"]);
    });
    add("waitingFor: the queue is in the order parties joined, whatever stamp they carry", () => {
        const book = newBook();
        expect(book.joinWaiting(waiter("heron", "Okafor", 70, 3, S(30, 600)))).toBe(1);
        expect(book.joinWaiting(waiter("heron", "Nakamura", 70, 3, S(30, 500)))).toBe(2);
        expect(book.waitingFor("heron").map((w) => w.party)).toEqual(["Okafor", "Nakamura"]);
        expect(book.nextInLine("heron", 70, 73)?.party).toBe("Okafor");
    });
    add("waitingFor: hands back the book's own entries", () => {
        const book = newBook();
        book.joinWaiting(waiter("heron", "Okafor", 70, 3, S(30, 600)));
        const [entry] = book.waitingFor("heron");
        entry.toDay = 80;
        expect(book.waitingFor("heron")[0].toDay).toBe(80);
    });
    add("waitingFor: empty for a boat nobody waits for", () => {
        const book = newBook();
        book.joinWaiting(waiter("heron", "Okafor", 70, 7, S(30, 545)));
        expect(book.waitingFor("teal")).toEqual([]);
        expect(book.waitingFor("osprey")).toEqual([]);
    });
    add("leaveWaiting: takes one party off one boat's queue, and the rest move up", () => {
        const book = newBook();
        book.joinWaiting(waiter("heron", "Okafor", 70, 7, S(30, 545)));
        book.joinWaiting(waiter("avocet", "Okafor", 70, 7, S(30, 550)));
        book.joinWaiting(waiter("heron", "Nakamura", 70, 3, S(30, 610)));
        expect(book.leaveWaiting("heron", "Okafor")).toBe(true);
        expect(book.waitingFor("heron").map((w) => w.party)).toEqual(["Nakamura"]);
        expect(book.waitingFor("avocet").map((w) => w.party)).toEqual(["Okafor"]);
        expect(book.joinWaiting(waiter("heron", "Brankovic", 77, 3, S(31, 0)))).toBe(2);
    });
    add("leaveWaiting: false when the party is not waiting for that boat", () => {
        const book = newBook();
        book.joinWaiting(waiter("heron", "Okafor", 70, 7, S(30, 545)));
        expect(book.leaveWaiting("avocet", "Okafor")).toBe(false);
        expect(book.leaveWaiting("heron", "Nakamura")).toBe(false);
        expect(book.waitingFor("heron").length).toBe(1);
    });
    add("nextInLine: the longest wait whose days all lie within the days given", () => {
        const book = newBook();
        book.joinWaiting(waiter("heron", "Okafor", 70, 7, S(30, 545)));
        book.joinWaiting(waiter("heron", "Nakamura", 70, 3, S(30, 610)));
        book.joinWaiting(waiter("heron", "Brankovic", 72, 3, S(30, 620)));
        expect(book.nextInLine("heron", 70, 77)?.party).toBe("Okafor");
        expect(book.nextInLine("heron", 60, 90)?.party).toBe("Okafor");
        expect(book.nextInLine("heron", 70, 76)?.party).toBe("Nakamura");
        expect(book.nextInLine("heron", 71, 76)?.party).toBe("Brankovic");
    });
    add("nextInLine: nobody when no request fits, and the queue stays as it was", () => {
        const book = newBook();
        book.joinWaiting(waiter("heron", "Okafor", 70, 7, S(30, 545)));
        expect(book.nextInLine("heron", 71, 77)).toBeUndefined();
        expect(book.nextInLine("heron", 70, 76)).toBeUndefined();
        expect(book.nextInLine("avocet", 70, 77)).toBeUndefined();
        expect(book.nextInLine("heron", 70, 77)?.party).toBe("Okafor");
        expect(book.waitingFor("heron").length).toBe(1);
    });
    add("promote: the first in line whose days fit gets a hold and leaves the list", () => {
        const book = newBook();
        book.joinWaiting(waiter("heron", "Okafor", 70, 7, S(30, 545), 4));
        book.joinWaiting(waiter("heron", "Nakamura", 70, 3, S(30, 610)));
        const b = book.promote("heron", 70, 77, S(40, 600));
        expect(b).toEqual(
            made({
                state: "held",
                placedAt: 58200,
                lapsesAt: 61080,
                confirmedAt: -1,
                paidPence: 0,
                notes: ["from the waiting list, joined Mon wk5 09:05"],
            }),
        );
        expect(book.find("B0001")).toBe(b);
        expect(book.waitingFor("heron").map((w) => w.party)).toEqual(["Nakamura"]);
    });
    add("promote: a party whose request cannot be placed keeps its place, and the next is tried", () => {
        const book = newBook();
        book.joinWaiting(waiter("heron", "Okafor", 70, 7, S(30, 545), 9));
        book.joinWaiting(waiter("heron", "Nakamura", 70, 3, S(30, 610)));
        const b = book.promote("heron", 70, 77, S(40, 600));
        expect(b?.party).toBe("Nakamura");
        expect(b?.id).toBe("B0001");
        expect(book.waitingFor("heron").map((w) => w.party)).toEqual(["Okafor"]);
    });
    add("promote: nothing when nobody's days fit or nobody waits", () => {
        const book = newBook();
        expect(book.promote("heron", 70, 77, S(40, 600))).toBeUndefined();
        book.joinWaiting(waiter("heron", "Okafor", 70, 7, S(30, 545), 4));
        expect(book.promote("heron", 70, 76, S(40, 600))).toBeUndefined();
        expect(book.promote("heron", 71, 77, S(40, 600))).toBeUndefined();
        expect(book.promote("avocet", 70, 77, S(40, 600))).toBeUndefined();
        expect(book.size).toBe(0);
        expect(book.waitingFor("heron").length).toBe(1);
    });

    // ------------------------------------------------------------------------------ what the book records

    /** Placed, confirmed with £300, £50 more paid, cancelled ten days ahead: £194 back. */
    const story = (): Book => {
        const { book } = withHire(30000);
        book.takePayment("B0001", 5000, S(45, 600));
        book.cancel("B0001", S(60, 615));
        return book;
    };
    add("history: newest first, with the money in and the money back", () => {
        expect(story().history()).toEqual([
            { at: S(60, 615), bookingId: "B0001", kind: "cancelled", pence: 19400 },
            { at: S(45, 600), bookingId: "B0001", kind: "paid", pence: 5000 },
            { at: S(41, 540), bookingId: "B0001", kind: "confirmed", pence: 30000 },
            { at: S(40, 600), bookingId: "B0001", kind: "placed", pence: 0 },
        ]);
    });
    add("history: one booking's events when an id is given", () => {
        const book = story();
        hold(book, ask("teal", "Lindqvist", 2, 76, 5), S(61, 0));
        expect(book.history("B0002")).toEqual([{ at: S(61, 0), bookingId: "B0002", kind: "placed", pence: 0 }]);
        expect(book.history("B0001").length).toBe(4);
        expect(book.history().length).toBe(5);
        expect(book.history("B0003")).toEqual([]);
    });
    add("history: a lapse is stamped with the minute the hold ran out but listed when the book noticed", () => {
        const { book } = withHold();
        hold(book, ask("teal", "Lindqvist", 2, 76, 5), S(50, 0));
        expect(book.history().map((e) => `${e.kind} ${e.bookingId} ${e.at}`)).toEqual([
            `placed B0002 ${S(50, 0)}`,
            "lapsed B0001 61080",
            "placed B0001 58200",
        ]);
    });
    add("history: in the order the book came to know of things, not by stamp", () => {
        const book = newBook();
        hold(book, ask("heron", "Okafor", 4, 70, 7), S(40, 600));
        hold(book, ask("kestrel", "Adeyemi", 6, 72, 4), S(40, 610));
        expect(book.confirm("B0002", 14200, S(40, 700))).toBe("confirmed");
        book.takePayment("B0002", 5000, S(43, 0));
        expect(book.lapse(S(44, 0))).toEqual(["B0001"]);
        expect(book.history().map((e) => `${e.kind} ${e.bookingId} ${e.at}`)).toEqual([
            `lapsed B0001 ${S(42, 600)}`,
            `paid B0002 ${S(43, 0)}`,
            `confirmed B0002 ${S(40, 700)}`,
            `placed B0002 ${S(40, 610)}`,
            `placed B0001 ${S(40, 600)}`,
        ]);
    });
    add("history: hands back copies", () => {
        const book = story();
        const events = book.history();
        events[0].pence = 1;
        events.pop();
        expect(book.history()[0].pence).toBe(19400);
        expect(book.history().length).toBe(4);
    });
    add("takings: money in less money back", () => {
        const book = story();
        expect(book.takings(0, S(100, 0))).toBe(15600);
        expect(book.takings(0, S(60, 0))).toBe(35000);
        expect(book.takings(S(60, 0), S(61, 0))).toBe(-19400);
    });
    add("takings: an event at the first stamp counts, one at the last does not", () => {
        const book = story();
        expect(book.takings(S(41, 540), S(45, 600))).toBe(30000);
        expect(book.takings(S(41, 540), S(45, 601))).toBe(35000);
        expect(book.takings(S(41, 541), S(45, 601))).toBe(5000);
        expect(book.takings(S(45, 600), S(60, 615))).toBe(5000);
        expect(book.takings(S(70, 0), S(80, 0))).toBe(0);
    });

    // --------------------------------------------------------------------------------------- the reports

    const sample = (): Booking[] => [
        made({ id: "B0006", boatId: "teal", fromDay: 73, toDay: 77, state: "confirmed", chargePence: 31600, paidPence: 31600 }),
        made({ id: "B0005", boatId: "heron", fromDay: 73, toDay: 77, state: "cancelled" }),
        made({ id: "B0004", boatId: "heron", fromDay: 77, toDay: 80, state: "held", chargePence: 29850, paidPence: 0 }),
        made({ id: "B0003", boatId: "kestrel", fromDay: 70, toDay: 77, state: "confirmed", chargePence: 93500, paidPence: 50000 }),
        made({ id: "B0002", boatId: "heron", fromDay: 70, toDay: 73, state: "confirmed", chargePence: 29850, paidPence: 10000 }),
        made({ id: "B0001", boatId: "heron", fromDay: 63, toDay: 70, state: "confirmed", paidPence: 62150 }),
    ];

    add("occupancy: confirmed nights of one boat within the days given", () => {
        expect(mod.occupancy(sample(), "heron", 70, 77)).toBe(3);
        expect(mod.occupancy(sample(), "kestrel", 70, 77)).toBe(7);
        expect(mod.occupancy(sample(), "teal", 70, 77)).toBe(4);
        expect(mod.occupancy(sample(), "avocet", 70, 77)).toBe(0);
    });
    add("occupancy: a hire is clipped at both ends, and holds and closed bookings are left out", () => {
        expect(mod.occupancy(sample(), "heron", 60, 84)).toBe(10);
        expect(mod.occupancy(sample(), "heron", 65, 72)).toBe(7);
        expect(mod.occupancy(sample(), "heron", 77, 84)).toBe(0);
        expect(mod.occupancy(sample(), "kestrel", 76, 90)).toBe(1);
        expect(mod.occupancy(sample(), "kestrel", 77, 90)).toBe(0);
    });
    add("arrivalsOn: confirmed hires that go out on the day, by boat", () => {
        expect(mod.arrivalsOn(sample(), 70).map((b) => b.id)).toEqual(["B0002", "B0003"]);
        expect(mod.arrivalsOn(sample(), 73).map((b) => b.id)).toEqual(["B0006"]);
    });
    add("arrivalsOn: holds are left out, and the list given keeps its order", () => {
        const list = sample();
        expect(mod.arrivalsOn(list, 77)).toEqual([]);
        expect(mod.arrivalsOn(list, 71)).toEqual([]);
        mod.arrivalsOn(list, 70);
        expect(list.map((b) => b.id)).toEqual(["B0006", "B0005", "B0004", "B0003", "B0002", "B0001"]);
    });
    add("returnsOn: confirmed hires handed back on the day, by boat", () => {
        expect(mod.returnsOn(sample(), 77).map((b) => b.id)).toEqual(["B0003", "B0006"]);
        expect(mod.returnsOn(sample(), 70).map((b) => b.id)).toEqual(["B0001"]);
    });
    add("returnsOn: nobody on a hire's last night, and the list given keeps its order", () => {
        const list = sample();
        expect(mod.returnsOn(list, 76)).toEqual([]);
        expect(mod.returnsOn(list, 80)).toEqual([]);
        mod.returnsOn(list, 77);
        expect(list.map((b) => b.id)).toEqual(["B0006", "B0005", "B0004", "B0003", "B0002", "B0001"]);
    });
    add("turnaroundsOn: boats handed back and going out again that day", () => {
        expect(mod.turnaroundsOn(sample(), 70)).toEqual(["heron"]);
        const more = [...sample(), made({ id: "B0007", boatId: "avocet", fromDay: 60, toDay: 70 })];
        more.push(made({ id: "B0008", boatId: "avocet", fromDay: 70, toDay: 74 }));
        expect(mod.turnaroundsOn(more, 70)).toEqual(["avocet", "heron"]);
    });
    add("turnaroundsOn: a hold going out does not make a turnaround", () => {
        expect(mod.turnaroundsOn(sample(), 77)).toEqual([]);
        expect(mod.turnaroundsOn(sample(), 73)).toEqual([]);
        expect(mod.turnaroundsOn([], 70)).toEqual([]);
    });
    add("freeGaps: the stretches no live booking has, each ending on the day after its last free day", () => {
        expect(mod.freeGaps(sample(), "heron", 56, 91)).toEqual([
            [56, 63],
            [73, 77],
            [80, 91],
        ]);
        expect(mod.freeGaps(sample(), "teal", 70, 77)).toEqual([[70, 73]]);
        expect(mod.freeGaps(sample(), "avocet", 70, 77)).toEqual([[70, 77]]);
    });
    add("freeGaps: bookings over the edges, back to back, and days wholly taken", () => {
        expect(mod.freeGaps(sample(), "heron", 65, 72)).toEqual([]);
        expect(mod.freeGaps(sample(), "heron", 65, 79)).toEqual([[73, 77]]);
        expect(mod.freeGaps(sample(), "heron", 74, 76)).toEqual([[74, 76]]);
        expect(mod.freeGaps(sample(), "kestrel", 60, 77)).toEqual([[60, 70]]);
        expect(mod.freeGaps(sample(), "kestrel", 77, 80)).toEqual([[77, 80]]);
    });
    add("freeGaps: the list given keeps its order", () => {
        const list = sample();
        mod.freeGaps(list, "heron", 56, 91);
        expect(list.map((b) => b.id)).toEqual(["B0006", "B0005", "B0004", "B0003", "B0002", "B0001"]);
    });
    add("owedLines: hires with a balance due by today, in diary order", () => {
        expect(mod.owedLines(sample(), 50)).toEqual([
            "B0002  Okafor owes £198.50, due Sat wk7",
            "B0003  Okafor owes £435.00, due Sat wk7",
        ]);
    });
    add("owedLines: not before the due day, not once the hire has begun, not when paid or only held", () => {
        const one = [made({ id: "B0009", party: "Nakamura", fromDay: 76, toDay: 79, chargePence: 31350, paidPence: 10000 })];
        expect(mod.owedLines(one, 47)).toEqual([]);
        expect(mod.owedLines(one, 48)).toEqual(["B0009  Nakamura owes £213.50, due Fri wk7"]);
        expect(mod.owedLines(one, 75)).toEqual(["B0009  Nakamura owes £213.50, due Fri wk7"]);
        expect(mod.owedLines(one, 76)).toEqual([]);
        expect(mod.owedLines([made({ paidPence: 62150 })], 50)).toEqual([]);
        expect(mod.owedLines([made({ paidPence: 62650 })], 50)).toEqual([]);
        expect(mod.owedLines([made({ state: "held", paidPence: 0 })], 50)).toEqual([]);
        expect(mod.owedLines(sample(), 69).length).toBe(2);
    });
    add("lengthBands: confirmed hires by length", () => {
        const list = [3, 4, 5, 7, 8, 14].map((n, i) => made({ id: `B000${i + 1}`, fromDay: 70, toDay: 70 + n }));
        expect(mod.lengthBands(list)).toEqual({ short: 2, week: 2, long: 2 });
        expect(mod.lengthBands(sample())).toEqual({ short: 2, week: 2, long: 0 });
    });
    add("lengthBands: holds and closed bookings are not counted", () => {
        const list = [made({ state: "held" }), made({ state: "cancelled" }), made({ state: "lapsed" })];
        expect(mod.lengthBands(list)).toEqual({ short: 0, week: 0, long: 0 });
        expect(mod.lengthBands([])).toEqual({ short: 0, week: 0, long: 0 });
    });
    add("stateCounts: how many bookings are in each state", () => {
        expect(mod.stateCounts(sample())).toEqual({ held: 1, confirmed: 4, cancelled: 1, lapsed: 0 });
    });
    add("stateCounts: every state is there, at 0 for an empty list", () => {
        expect(mod.stateCounts([])).toEqual({ held: 0, confirmed: 0, cancelled: 0, lapsed: 0 });
        expect(mod.stateCounts([made({ state: "lapsed" }), made({ state: "lapsed" })]).lapsed).toBe(2);
    });
    add("diaryLine: a confirmed hire", () => {
        expect(mod.diaryLine(made())).toBe("B0001  Sat wk11 to Sat wk12  Okafor (4)  confirmed");
        expect(mod.diaryLine(made({ state: "cancelled", party: "Nakamura", partySize: 2 }))).toBe(
            "B0001  Sat wk11 to Sat wk12  Nakamura (2)  cancelled",
        );
    });
    add("diaryLine: a hold says when it runs out", () => {
        expect(mod.diaryLine(made({ id: "B0002", state: "held", fromDay: 72, toDay: 76, lapsesAt: S(40, 600) }))).toBe(
            "B0002  Mon wk11 to Fri wk11  Okafor (4)  held until Thu wk6 10:00",
        );
    });
    add("weekStrip: C for a confirmed night, h for a held one, a dot for a free one", () => {
        expect(mod.weekStrip(sample(), "heron", 70)).toBe("CCC....");
        expect(mod.weekStrip(sample(), "heron", 77)).toBe("hhh....");
        expect(mod.weekStrip(sample(), "teal", 70)).toBe("...CCCC");
        expect(mod.weekStrip(sample(), "kestrel", 70)).toBe("CCCCCCC");
    });
    add("weekStrip: the day a hire ends is free, and closed bookings leave no mark", () => {
        expect(mod.weekStrip(sample(), "heron", 63)).toBe("CCCCCCC");
        expect(mod.weekStrip(sample(), "heron", 66)).toBe("CCCCCCC");
        expect(mod.weekStrip(sample(), "heron", 74)).toBe("...hhh.");
        expect(mod.weekStrip(sample(), "kestrel", 74)).toBe("CCC....");
        expect(mod.weekStrip(sample(), "avocet", 70)).toBe(".......");
        expect(mod.weekStrip([made({ state: "lapsed" })], "heron", 70)).toBe(".......");
    });
    add("weekTotals: nights sold and open, and the money of hires that begin in the week", () => {
        expect(mod.weekTotals(sample(), fleet(), 70)).toEqual({
            weekStart: 70,
            nightsSold: 14,
            nightsOpen: 14,
            chargePence: 154950,
            paidPence: 91600,
        });
    });
    add("weekTotals: a held night is still open, and a hire begun earlier brings no money", () => {
        expect(mod.weekTotals(sample(), fleet(), 77)).toEqual({
            weekStart: 77,
            nightsSold: 0,
            nightsOpen: 28,
            chargePence: 0,
            paidPence: 0,
        });
        expect(mod.weekTotals(sample(), [HERON, KESTREL], 66)).toEqual({
            weekStart: 66,
            nightsSold: 10,
            nightsOpen: 4,
            chargePence: 123350,
            paidPence: 60000,
        });
    });
    add("weekTotals: the money counts every boat's hires, not only the boats given", () => {
        expect(mod.weekTotals(sample(), [HERON], 70)).toEqual({
            weekStart: 70,
            nightsSold: 3,
            nightsOpen: 4,
            chargePence: 154950,
            paidPence: 91600,
        });
    });
    add("weekTotals: a hire that begins on the day after the week brings no money to it", () => {
        expect(mod.weekTotals(sample(), fleet(), 63)).toEqual({
            weekStart: 63,
            nightsSold: 7,
            nightsOpen: 21,
            chargePence: 62150,
            paidPence: 62150,
        });
    });
    add("weekTotals: open nights are the boats' nights less those sold, below 0 if a list sells a night twice", () => {
        expect(mod.weekTotals([made(), made({ id: "B0002" })], [HERON], 70)).toEqual({
            weekStart: 70,
            nightsSold: 14,
            nightsOpen: -7,
            chargePence: 124300,
            paidPence: 31200,
        });
    });
    add("weekSheet: a heading, a line for each boat by name, then the totals", () => {
        expect(mod.weekSheet(sample(), fleet(), 70)).toEqual([
            "Week from Sat wk11",
            "Avocet       .......",
            "Heron        CCC....",
            "Kestrel      CCCCCCC",
            "Teal         ...CCCC",
            "sold 14, open 14",
            "charged £1,549.50, paid £916.00",
        ]);
    });
    add("weekSheet: a long name is not cut, and the boats given keep their order", () => {
        const boats = [{ ...TEAL, name: "Teal the Younger" }, HERON];
        expect(mod.weekSheet(sample(), boats, 77)).toEqual([
            "Week from Sat wk12",
            "Heron        hhh....",
            "Teal the Younger .......",
            "sold 0, open 14",
            "charged £0.00, paid £0.00",
        ]);
        expect(boats.map((b) => b.id)).toEqual(["teal", "heron"]);
    });
    add("weekSheet: the boats go by name, whatever their ids", () => {
        const boats = [
            { ...HERON, id: "zz", name: "Alder" },
            { ...HERON, id: "aa", name: "Birch" },
        ];
        expect(mod.weekSheet([], boats, 70)).toEqual([
            "Week from Sat wk11",
            "Alder        .......",
            "Birch        .......",
            "sold 0, open 14",
            "charged £0.00, paid £0.00",
        ]);
    });

    for (const name of skip) {
        if (!cases.some(([had]) => had === name)) {
            throw new Error(`unchanged: no case is named "${name}"`);
        }
    }
    describe("what the module did before", () => {
        for (const [name, run] of cases) {
            if (!skip.includes(name)) {
                it(name, run);
            }
        }
    });
}

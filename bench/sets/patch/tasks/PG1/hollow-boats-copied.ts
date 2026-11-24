// Hire bookings for the yard's boats: provisional holds, confirmation, cancellation, the waiting list,
// and the sheets the office prints. Nothing here reads a clock: the caller passes the day or the stamp in.

/** Money, in whole pence. */
export type Pence = number;

/** A day number. Day 0 was a Saturday. */
export type Day = number;

/** A moment in minutes: the day number times 1440, plus the minutes since midnight. */
export type Stamp = number;

export type BoatClass = "narrow" | "wide" | "cruiser";

export type BookingState = "held" | "confirmed" | "cancelled" | "lapsed";

export interface Boat {
    id: string;
    name: string;
    boatClass: BoatClass;
    berths: number;
}

export interface BookingRequest {
    boatId: string;
    party: string;
    partySize: number;
    fromDay: Day;
    toDay: Day;
}

export interface Booking {
    id: string;
    boatId: string;
    party: string;
    partySize: number;
    // the boat goes out on fromDay and is handed back on the morning of toDay, so toDay itself is free
    fromDay: Day;
    toDay: Day;
    state: BookingState;
    placedAt: Stamp;
    // the first minute at which the hold is no longer good; kept as it was once the hold is confirmed
    lapsesAt: Stamp;
    // NEVER until it happens
    confirmedAt: Stamp;
    closedAt: Stamp;
    chargePence: Pence;
    depositPence: Pence;
    paidPence: Pence;
    // newest first
    notes: string[];
}

export interface WaitEntry {
    boatId: string;
    party: string;
    partySize: number;
    fromDay: Day;
    toDay: Day;
    joinedAt: Stamp;
}

export type PlaceResult = { ok: true; booking: Booking } | { ok: false; problems: string[] };

export type ConfirmOutcome = "confirmed" | "unknown" | "not-held" | "lapsed" | "underpaid";

export type EventKind = "placed" | "confirmed" | "paid" | "moved" | "cancelled" | "lapsed";

export interface BookEvent {
    at: Stamp;
    bookingId: string;
    kind: EventKind;
    // money in for "confirmed" and "paid", money back for "cancelled", otherwise 0
    pence: Pence;
}

export interface Quote {
    nights: number;
    chargePence: Pence;
    depositPence: Pence;
    balancePence: Pence;
    balanceDueDay: Day;
}

export interface WeekTotals {
    weekStart: Day;
    nightsSold: number;
    nightsOpen: number;
    chargePence: Pence;
    paidPence: Pence;
}

export const MINUTES_PER_DAY = 1440;

/** Stands in a stamp field for "has not happened". */
export const NEVER: Stamp = -1;

const HOLD_MINUTES = 48 * 60;
const SHORT_HOLD_MINUTES = 4 * 60;
const SHORT_HOLD_DAYS = 7;

const MIN_NIGHTS = 3;
const LONG_HIRE_NIGHTS = 7;
const MIN_DEPOSIT: Pence = 10000;
const BERTH_EXTRA: Pence = 350;
const BALANCE_DUE_DAYS = 28;
const NAME_WIDTH = 12;

const NIGHT_RATES: Record<BoatClass, Pence> = {
    narrow: 9450,
    wide: 12800,
    cruiser: 7600,
};

const WEEKEND_EXTRA: Record<BoatClass, Pence> = {
    narrow: 1500,
    wide: 2250,
    cruiser: 1200,
};

const MAX_NIGHTS: Record<BoatClass, number> = {
    narrow: 21,
    wide: 14,
    cruiser: 10,
};

// Saturday, Monday and Friday, as day % 7
const START_WEEKDAYS: readonly number[] = [0, 2, 6];

const WEEKDAYS: readonly string[] = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

const REFUND_STEPS: readonly (readonly [number, number])[] = [
    [42, 100],
    [28, 75],
    [14, 40],
];

function pad2(n: number): string {
    return n < 10 ? `0${n}` : String(n);
}

function groupThousands(n: number): string {
    return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function weekdayIndex(day: Day): number {
    return ((day % 7) + 7) % 7;
}

function isWeekendNight(day: Day): boolean {
    // Friday night and Saturday night
    const w = weekdayIndex(day);
    return w === 6 || w === 0;
}

export function stampOf(day: Day, minute: number): Stamp {
    return day * MINUTES_PER_DAY + minute;
}

export function dayOf(stamp: Stamp): Day {
    return Math.floor(stamp / MINUTES_PER_DAY);
}

export function minuteOf(stamp: Stamp): number {
    return stamp - dayOf(stamp) * MINUTES_PER_DAY;
}

export function weekdayName(day: Day): string {
    return WEEKDAYS[weekdayIndex(day)];
}

/** A day as the sheets print it: "Mon wk3". Weeks are counted from 1. */
export function formatDay(day: Day): string {
    return `${weekdayName(day)} wk${Math.floor(day / 7) + 1}`;
}

export function formatStamp(stamp: Stamp): string {
    if (stamp === NEVER) {
        return "-";
    }
    const minute = minuteOf(stamp);
    return `${formatDay(dayOf(stamp))} ${pad2(Math.floor(minute / 60))}:${pad2(minute % 60)}`;
}

export function formatPence(pence: Pence): string {
    const sign = pence < 0 ? "-" : "";
    const size = Math.abs(pence);
    return `${sign}£${groupThousands(Math.floor(size / 100))}.${pad2(size % 100)}`;
}

export function nightsOf(span: { fromDay: Day; toDay: Day }): number {
    return span.toDay - span.fromDay;
}

/** True while a booking keeps its dates: a hold that has not been let go, or a confirmed hire. */
export function isLive(b: Booking): boolean {
    return b.state === "held" || b.state === "confirmed";
}

export function daysOverlap(aFrom: Day, aTo: Day, bFrom: Day, bTo: Day): boolean {
    // a boat handed back in the morning can go out again that afternoon
    return aFrom < bTo && bFrom < aTo;
}

/** What is wrong with a request for this boat, in the order the office reads them out. Empty when nothing is. */
export function validateRequest(req: BookingRequest, boat: Boat): string[] {
    const problems: string[] = [];
    if (req.party.trim() === "") {
        problems.push("no party name");
    }
    if (!Number.isInteger(req.partySize) || req.partySize < 1) {
        problems.push("party size must be a whole number of at least 1");
    } else if (req.partySize > boat.berths) {
        problems.push(`${boat.name} sleeps ${boat.berths}, not ${req.partySize}`);
    }
    const nights = nightsOf(req);
    if (nights <= 0) {
        problems.push("the hire must end after it begins");
        return problems;
    }
    if (nights < MIN_NIGHTS) {
        problems.push(`a hire is at least ${MIN_NIGHTS} nights`);
    } else if (nights > MAX_NIGHTS[boat.boatClass]) {
        problems.push(`a ${boat.boatClass} boat goes out for at most ${MAX_NIGHTS[boat.boatClass]} nights`);
    }
    if (!START_WEEKDAYS.includes(weekdayIndex(req.fromDay))) {
        problems.push(`hires begin on a Saturday, Monday or Friday, not a ${weekdayName(req.fromDay)}`);
    }
    return problems;
}

/** What a hire costs. */
export function hireCharge(boat: Boat, fromDay: Day, toDay: Day): Pence {
    const nights = toDay - fromDay;
    const rate = NIGHT_RATES[boat.boatClass];
    let total = 0;
    for (let night = fromDay; night < toDay; night++) {
        total += isWeekendNight(night) ? rate + WEEKEND_EXTRA[boat.boatClass] : rate;
    }
    // linen and gas for each berth beyond four, whether or not it is slept in
    total += Math.max(0, boat.berths - 4) * BERTH_EXTRA * nights;
    if (nights >= LONG_HIRE_NIGHTS) {
        // a tenth off, rounded in the hirer's favour to the whole pound
        total -= Math.ceil(total / 10 / 100) * 100;
    }
    return total;
}

export function depositFor(chargePence: Pence): Pence {
    // a quarter, rounded up to the whole pound; never under the least deposit, never over the charge
    const quarter = Math.ceil(chargePence / 4 / 100) * 100;
    return Math.min(chargePence, Math.max(MIN_DEPOSIT, quarter));
}

/** The share of a deposit that goes back when a hire is cancelled with this much notice. */
export function refundShare(noticeDays: number): number {
    // whole per cent, so 75 is three quarters; the steps run from the longest notice down
    for (const [days, percent] of REFUND_STEPS) {
        if (noticeDays >= days) {
            return percent;
        }
    }
    return 0;
}

/** How long a hold placed at this moment stands, for a hire that begins on fromDay. */
export function holdLength(placedAt: Stamp, fromDay: Day): number {
    // in minutes; close to the hire the office cannot keep a boat back for two days
    return fromDay - dayOf(placedAt) < SHORT_HOLD_DAYS ? SHORT_HOLD_MINUTES : HOLD_MINUTES;
}

export function hasLapsed(b: Booking, now: Stamp): boolean {
    return b.state === "held" && now >= b.lapsesAt;
}

/** Puts bookings in diary order: by first day, then boat, then booking number. */
export function sortForDiary(list: Booking[]): Booking[] {
    // sorts the caller's array; the return is the same array, for chaining
    return list.sort((a, b) => {
        if (a.fromDay !== b.fromDay) {
            return a.fromDay - b.fromDay;
        }
        if (a.boatId !== b.boatId) {
            return a.boatId < b.boatId ? -1 : 1;
        }
        return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
    });
}

/** What the office tells a caller before anything is held. */
export function quoteFor(boat: Boat, fromDay: Day, toDay: Day): Quote {
    const chargePence = hireCharge(boat, fromDay, toDay);
    const depositPence = depositFor(chargePence);
    return {
        nights: toDay - fromDay,
        chargePence,
        depositPence,
        balancePence: chargePence - depositPence,
        balanceDueDay: fromDay - BALANCE_DUE_DAYS,
    };
}

/**
 * Reads the office's shorthand for a request: "boat; party; size; first day; nights", as in
 * "heron; Okafor; 4; 14; 7". Returns undefined when the line is not in that form.
 */
export function parseRequestLine(line: string): BookingRequest | undefined {
    const parts = line.split(";").map((part) => part.trim());
    if (parts.length !== 5 || parts[0] === "" || parts[1] === "") {
        return undefined;
    }
    const numbers = parts.slice(2).map((part) => (/^\d+$/.test(part) ? Number(part) : NaN));
    if (numbers.some((n) => Number.isNaN(n))) {
        return undefined;
    }
    const [partySize, fromDay, nights] = numbers;
    // boat ids are kept in lower case; the last field is a count of nights, not a day
    return { boatId: parts[0].toLowerCase(), party: parts[1], partySize, fromDay, toDay: fromDay + nights };
}

export function refundTerms(b: Booking, today: Day): string {
    if (b.state !== "confirmed") {
        return "no deposit taken";
    }
    const share = refundShare(b.fromDay - today);
    if (share === 0) {
        return `the ${formatPence(b.depositPence)} deposit is kept`;
    }
    return `${share}% of the ${formatPence(b.depositPence)} deposit goes back`;
}

export class BookingBook {
    private boats = new Map<string, Boat>();
    // newest first
    private bookings: Booking[] = [];
    // longest wait first, all boats together
    private waiting: WaitEntry[] = [];
    // newest first, in the order the book came to know of things
    private log: BookEvent[] = [];
    private nextNumber = 1;

    constructor(boats: Boat[]) {
        for (const boat of boats) {
            this.boats.set(boat.id, { ...boat });
        }
    }

    get size(): number {
        return this.bookings.length;
    }

    private record(kind: EventKind, b: Booking, at: Stamp, pence: Pence = 0): void {
        this.log.unshift({ at, bookingId: b.id, kind, pence });
    }

    /** Every booking ever placed, newest first. The array is the caller's; the bookings are the book's own. */
    all(): Booking[] {
        return this.bookings.slice();
    }

    find(id: string): Booking | undefined {
        return this.bookings.find((b) => b.id === id);
    }

    forBoat(boatId: string): Booking[] {
        return this.bookings.filter((b) => b.boatId === boatId);
    }

    /** True when no live booking of the boat touches these days. exceptId leaves one booking out. */
    isFree(boatId: string, fromDay: Day, toDay: Day, exceptId = ""): boolean {
        return !this.bookings.some(
            (b) =>
                b.boatId === boatId &&
                b.id !== exceptId &&
                isLive(b) &&
                daysOverlap(b.fromDay, b.toDay, fromDay, toDay),
        );
    }

    /** Places a hold. Holds that have run out by then are let go first, so they cannot stand in the way. */
    place(req: BookingRequest, at: Stamp): PlaceResult {
        this.lapse(at);
        const boat = this.boats.get(req.boatId);
        if (!boat) {
            return { ok: false, problems: [`no boat ${req.boatId}`] };
        }
        const problems = validateRequest(req, boat);
        if (req.fromDay <= dayOf(at)) {
            problems.push("the hire must begin after today");
        }
        if (problems.length === 0 && !this.isFree(req.boatId, req.fromDay, req.toDay)) {
            problems.push(`${boat.name} is taken for some of those days`);
        }
        if (problems.length > 0) {
            return { ok: false, problems };
        }
        const charge = hireCharge(boat, req.fromDay, req.toDay);
        const booking: Booking = {
            id: `B${String(this.nextNumber++).padStart(4, "0")}`,
            boatId: req.boatId,
            party: req.party.trim(),
            partySize: req.partySize,
            fromDay: req.fromDay,
            toDay: req.toDay,
            state: "held",
            placedAt: at,
            lapsesAt: at + holdLength(at, req.fromDay),
            confirmedAt: NEVER,
            closedAt: NEVER,
            chargePence: charge,
            depositPence: depositFor(charge),
            paidPence: 0,
            notes: [],
        };
        this.bookings.unshift(booking);
        this.record("placed", booking, at);
        return { ok: true, booking };
    }

    /** Turns a hold into a hire. paidPence is what the party has handed over, which must cover the deposit. */
    confirm(id: string, paidPence: Pence, at: Stamp): ConfirmOutcome {
        const b = this.find(id);
        if (!b) {
            return "unknown";
        }
        if (b.state !== "held") {
            return "not-held";
        }
        if (hasLapsed(b, at)) {
            // too late: the hold goes, dated to when it ran out and not to when we noticed
            b.state = "lapsed";
            b.closedAt = b.lapsesAt;
            this.record("lapsed", b, b.lapsesAt);
            return "lapsed";
        }
        if (paidPence < b.depositPence) {
            return "underpaid";
        }
        b.state = "confirmed";
        b.confirmedAt = at;
        b.paidPence = paidPence;
        b.notes.unshift(`confirmed with ${formatPence(paidPence)}`);
        this.record("confirmed", b, at, paidPence);
        return "confirmed";
    }

    /** Takes a later payment on a confirmed hire and returns what is still owed, below zero when overpaid. */
    takePayment(id: string, pence: Pence, at: Stamp): Pence {
        const b = this.find(id);
        if (!b || b.state !== "confirmed" || pence <= 0) {
            return 0;
        }
        b.paidPence += pence;
        b.notes.unshift(`paid ${formatPence(pence)}`);
        this.record("paid", b, at, pence);
        return b.chargePence - b.paidPence;
    }

    /** Cancels a live booking and returns what the office must pay back. */
    cancel(id: string, at: Stamp): Pence {
        const b = this.find(id);
        if (!b || !isLive(b)) {
            return 0;
        }
        // a hold has paid nothing; a confirmed party gets back what it paid beyond the deposit
        const refund = b.state === "confirmed" ? Math.max(0, b.paidPence - b.depositPence) : 0;
        b.state = "cancelled";
        b.closedAt = at;
        b.paidPence -= refund;
        b.notes.unshift(`cancelled on ${formatDay(dayOf(at))}, ${formatPence(refund)} back`);
        this.record("cancelled", b, at, refund);
        return refund;
    }

    /** Lets go of every hold that has run out by now. Returns their ids, oldest booking first. */
    lapse(now: Stamp): string[] {
        const gone: string[] = [];
        for (let i = this.bookings.length - 1; i >= 0; i--) {
            const b = this.bookings[i];
            if (hasLapsed(b, now)) {
                b.state = "lapsed";
                b.closedAt = b.lapsesAt;
                this.record("lapsed", b, b.lapsesAt);
                gone.push(b.id);
            }
        }
        return gone;
    }

    /** Moves a live booking to begin on another day, keeping its length. Returns what stands in the way. */
    move(id: string, fromDay: Day, at: Stamp): string[] {
        const b = this.find(id);
        const boat = b ? this.boats.get(b.boatId) : undefined;
        if (!b || !boat || !isLive(b)) {
            return [`no live booking ${id}`];
        }
        const toDay = fromDay + nightsOf(b);
        const asked = { boatId: b.boatId, party: b.party, partySize: b.partySize, fromDay, toDay };
        const problems = validateRequest(asked, boat);
        if (fromDay <= dayOf(at)) {
            problems.push("the hire must begin after today");
        }
        if (!this.isFree(b.boatId, fromDay, toDay, b.id)) {
            problems.push(`${boat.name} is taken for some of those days`);
        }
        if (problems.length > 0) {
            return problems;
        }
        b.notes.unshift(`moved from ${formatDay(b.fromDay)} to ${formatDay(fromDay)}`);
        b.fromDay = fromDay;
        b.toDay = toDay;
        // the charge follows the new days; the deposit stays as first worked out
        b.chargePence = hireCharge(boat, fromDay, toDay);
        this.record("moved", b, at);
        return problems;
    }

    /** Puts a live booking on another boat for the same days. Returns what stands in the way. */
    changeBoat(id: string, boatId: string, at: Stamp): string[] {
        const b = this.find(id);
        if (!b || !isLive(b)) {
            return [`no live booking ${id}`];
        }
        const boat = this.boats.get(boatId);
        if (!boat) {
            return [`no boat ${boatId}`];
        }
        if (boatId === b.boatId) {
            return [];
        }
        const asked = { boatId, party: b.party, partySize: b.partySize, fromDay: b.fromDay, toDay: b.toDay };
        const problems = validateRequest(asked, boat);
        if (!this.isFree(boatId, b.fromDay, b.toDay)) {
            problems.push(`${boat.name} is taken for some of those days`);
        }
        if (problems.length > 0) {
            return problems;
        }
        const was = this.boats.get(b.boatId);
        b.notes.unshift(`moved from ${was ? was.name : b.boatId} to ${boat.name}`);
        b.boatId = boatId;
        b.chargePence = hireCharge(boat, b.fromDay, b.toDay);
        this.record("moved", b, at);
        return problems;
    }

    addNote(id: string, text: string): boolean {
        const b = this.find(id);
        const note = text.trim();
        if (!b || note === "") {
            return false;
        }
        b.notes.unshift(note);
        return true;
    }

    /** Adds a party to a boat's waiting list. Returns its place in that boat's queue from 1, or 0 if not added. */
    joinWaiting(entry: WaitEntry): number {
        if (!this.boats.has(entry.boatId) || entry.toDay <= entry.fromDay) {
            return 0;
        }
        const queue = this.waitingFor(entry.boatId);
        // one place for each party on each boat
        if (queue.some((w) => w.party === entry.party)) {
            return 0;
        }
        this.waiting.push({ ...entry });
        return queue.length + 1;
    }

    leaveWaiting(boatId: string, party: string): boolean {
        const at = this.waiting.findIndex((w) => w.boatId === boatId && w.party === party);
        if (at < 0) {
            return false;
        }
        this.waiting.splice(at, 1);
        return true;
    }

    waitingFor(boatId: string): WaitEntry[] {
        return this.waiting.filter((w) => w.boatId === boatId);
    }

    /** The party that has waited longest for this boat and whose days all lie within the days given. */
    nextInLine(boatId: string, fromDay: Day, toDay: Day): WaitEntry | undefined {
        return this.waiting.find((w) => w.boatId === boatId && w.fromDay >= fromDay && w.toDay <= toDay);
    }

    /**
     * Offers freed days to the waiting list: the first party in line whose request can be placed gets a hold
     * and leaves the list. Parties whose request cannot be placed keep their place.
     */
    promote(boatId: string, fromDay: Day, toDay: Day, at: Stamp): Booking | undefined {
        for (const w of this.waitingFor(boatId)) {
            if (w.fromDay < fromDay || w.toDay > toDay) {
                continue;
            }
            const asked = { boatId, party: w.party, partySize: w.partySize, fromDay: w.fromDay, toDay: w.toDay };
            const placed = this.place(asked, at);
            if (placed.ok) {
                this.leaveWaiting(boatId, w.party);
                placed.booking.notes.unshift(`from the waiting list, joined ${formatStamp(w.joinedAt)}`);
                return placed.booking;
            }
        }
        return undefined;
    }

    /** What happened, newest first: to one booking, or to all of them when no id is given. */
    history(bookingId = ""): BookEvent[] {
        return this.log.filter((e) => bookingId === "" || e.bookingId === bookingId).map((e) => ({ ...e }));
    }

    /** Money in less money back, over events stamped from fromAt up to but not at toAt. */
    takings(fromAt: Stamp, toAt: Stamp): Pence {
        let total = 0;
        for (const e of this.log) {
            if (e.at < fromAt || e.at >= toAt) {
                continue;
            }
            total += e.kind === "cancelled" ? -e.pence : e.pence;
        }
        return total;
    }

    /** What is still owed across the live bookings of one boat. */
    outstanding(boatId: string): Pence {
        let owed = 0;
        for (const b of this.forBoat(boatId)) {
            if (!isLive(b)) {
                continue;
            }
            const due = b.chargePence - b.paidPence;
            if (due > 0) {
                owed += due;
            }
        }
        return owed;
    }
}

/** Nights of confirmed hire of one boat that fall within the days given. */
export function occupancy(bookings: Booking[], boatId: string, fromDay: Day, toDay: Day): number {
    let nights = 0;
    for (const b of bookings) {
        if (b.boatId !== boatId || b.state !== "confirmed") {
            continue;
        }
        nights += Math.max(0, Math.min(b.toDay, toDay) - Math.max(b.fromDay, fromDay));
    }
    return nights;
}

function byBoat(a: Booking, b: Booking): number {
    return a.boatId < b.boatId ? -1 : a.boatId > b.boatId ? 1 : 0;
}

/** Confirmed hires that go out on the day, by boat. */
export function arrivalsOn(bookings: Booking[], day: Day): Booking[] {
    return bookings.filter((b) => b.state === "confirmed" && b.fromDay === day).sort(byBoat);
}

/** Confirmed hires that are handed back on the day, by boat. */
export function returnsOn(bookings: Booking[], day: Day): Booking[] {
    return bookings.filter((b) => b.state === "confirmed" && b.toDay === day).sort(byBoat);
}

/** Boats handed back and going out again on the same day, by boat id: the yard has until noon to turn them. */
export function turnaroundsOn(bookings: Booking[], day: Day): string[] {
    const back = returnsOn(bookings, day).map((b) => b.boatId);
    return arrivalsOn(bookings, day)
        .map((b) => b.boatId)
        .filter((boatId) => back.includes(boatId));
}

/** The stretches of the days given on which no live booking has the boat, each as [first day, day after last]. */
export function freeGaps(bookings: Booking[], boatId: string, fromDay: Day, toDay: Day): [Day, Day][] {
    const taken = sortForDiary(bookings.filter((b) => b.boatId === boatId && isLive(b)));
    const gaps: [Day, Day][] = [];
    let cursor = fromDay;
    for (const b of taken) {
        if (b.toDay <= cursor) {
            continue;
        }
        if (b.fromDay >= toDay) {
            break;
        }
        if (b.fromDay > cursor) {
            gaps.push([cursor, b.fromDay]);
        }
        cursor = b.toDay;
    }
    if (cursor < toDay) {
        gaps.push([cursor, toDay]);
    }
    return gaps;
}

/** Confirmed hires whose balance is due by today and not yet paid, in diary order, one line each. */
export function owedLines(bookings: Booking[], today: Day): string[] {
    const late = bookings.filter((b) => {
        if (b.state !== "confirmed" || b.paidPence >= b.chargePence) {
            return false;
        }
        // hires that have already gone out are the skipper's to chase at handover, not the office's
        return today >= b.fromDay - BALANCE_DUE_DAYS && today < b.fromDay;
    });
    return sortForDiary(late).map((b) => {
        const owed = formatPence(b.chargePence - b.paidPence);
        return `${b.id}  ${b.party} owes ${owed}, due ${formatDay(b.fromDay - BALANCE_DUE_DAYS)}`;
    });
}

/** Confirmed hires counted by length: "short" up to 4 nights, "week" for 5 to 7, "long" beyond. */
export function lengthBands(bookings: Booking[]): { short: number; week: number; long: number } {
    const bands = { short: 0, week: 0, long: 0 };
    for (const b of bookings) {
        if (b.state !== "confirmed") {
            continue;
        }
        const nights = nightsOf(b);
        if (nights <= 4) {
            bands.short += 1;
        } else if (nights <= 7) {
            bands.week += 1;
        } else {
            bands.long += 1;
        }
    }
    return bands;
}

export function stateCounts(bookings: Booking[]): Record<BookingState, number> {
    const counts: Record<BookingState, number> = { held: 0, confirmed: 0, cancelled: 0, lapsed: 0 };
    for (const b of bookings) {
        counts[b.state] += 1;
    }
    return counts;
}

export function diaryLine(b: Booking): string {
    const days = `${formatDay(b.fromDay)} to ${formatDay(b.toDay)}`;
    const tail = b.state === "held" ? `held until ${formatStamp(b.lapsesAt)}` : b.state;
    return `${b.id}  ${days}  ${b.party} (${b.partySize})  ${tail}`;
}

/** One boat's week as seven marks, from weekStart: C for a confirmed night, h for a held one, a dot for free. */
export function weekStrip(bookings: Booking[], boatId: string, weekStart: Day): string {
    let strip = "";
    for (let night = weekStart; night < weekStart + 7; night++) {
        const b = bookings.find((x) => x.boatId === boatId && isLive(x) && x.fromDay <= night && night < x.toDay);
        strip += !b ? "." : b.state === "confirmed" ? "C" : "h";
    }
    return strip;
}

export function weekTotals(bookings: Booking[], boats: Boat[], weekStart: Day): WeekTotals {
    const totals: WeekTotals = { weekStart, nightsSold: 0, nightsOpen: 0, chargePence: 0, paidPence: 0 };
    for (const boat of boats) {
        totals.nightsSold += occupancy(bookings, boat.id, weekStart, weekStart + 7);
    }
    // a held night is still open: it is not sold until the deposit is in
    totals.nightsOpen = boats.length * 7 - totals.nightsSold;
    for (const b of bookings) {
        // money is counted in the week the hire begins, however long it runs
        if (b.state === "confirmed" && b.fromDay >= weekStart && b.fromDay < weekStart + 7) {
            totals.chargePence += b.chargePence;
            totals.paidPence += b.paidPence;
        }
    }
    return totals;
}

/** The sheet pinned up in the office each week: a heading, a line for each boat by name, and the totals. */
export function weekSheet(bookings: Booking[], boats: Boat[], weekStart: Day): string[] {
    const lines = [`Week from ${formatDay(weekStart)}`];
    const byName = boats.slice().sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
    for (const boat of byName) {
        lines.push(`${boat.name.padEnd(NAME_WIDTH)} ${weekStrip(bookings, boat.id, weekStart)}`);
    }
    const totals = weekTotals(bookings, boats, weekStart);
    lines.push(`sold ${totals.nightsSold}, open ${totals.nightsOpen}`);
    lines.push(`charged ${formatPence(totals.chargePence)}, paid ${formatPence(totals.paidPence)}`);
    return lines;
}

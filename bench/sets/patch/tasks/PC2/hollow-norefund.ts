// Hire prices for the yard's boats: nightly rates by season and boat class, discounts for longer
// hires, deposits and refunds. Every amount of money is a whole number of pence.

export type BoatClass = "narrow" | "wide" | "cruiser" | "heritage";

export type SeasonName = "low" | "mid" | "high";

export type PaymentKind = "deposit" | "balance" | "refund";

export interface Season {
    name: SeasonName;
    fromDay: number;
    toDay: number;
}

export interface Hire {
    boatClass: BoatClass;
    startDay: number;
    nights: number;
    pets: number;
}

export interface QuoteLine {
    label: string;
    pence: number;
}

export interface Quote {
    lines: QuoteLine[];
    totalPence: number;
    bondPence: number;
}

export interface Payment {
    day: number;
    pence: number;
    kind: PaymentKind;
}

interface RateBand {
    minNights: number;
    rate: number;
}

interface RefundStep {
    minDaysBefore: number;
    rate: number;
}

interface DepositTerms {
    rate: number;
    floorPence: number;
}

export const DAYS_IN_YEAR = 365;

export const BOAT_CLASSES: readonly BoatClass[] = ["narrow", "wide", "cruiser", "heritage"];

const SEASON_NAMES: readonly SeasonName[] = ["low", "mid", "high"];

// Days of the year, 1 for 1 January. The low season runs over the new year.
export const SEASONS: readonly Season[] = [
    { name: "low", fromDay: 305, toDay: 91 },
    { name: "mid", fromDay: 91, toDay: 182 },
    { name: "high", fromDay: 182, toDay: 244 },
    { name: "mid", fromDay: 244, toDay: 305 },
];

const NIGHTLY_PENCE: Record<BoatClass, Record<SeasonName, number>> = {
    narrow: { low: 8500, mid: 11200, high: 14900 },
    wide: { low: 10400, mid: 13600, high: 17800 },
    cruiser: { low: 9200, mid: 12500, high: 16300 },
    heritage: { low: 12800, mid: 16400, high: 21500 },
};

// Held against damage and handed back after the hire. It is never part of a quote's total.
const BOND_PENCE: Record<BoatClass, number> = {
    narrow: 25000,
    wide: 30000,
    cruiser: 25000,
    heritage: 50000,
};

// Longest first: a hire gets the first band it is long enough for.
const LONG_HIRE_BANDS: readonly RateBand[] = [
    { minNights: 21, rate: 150 },
    { minNights: 14, rate: 100 },
    { minNights: 10, rate: 75 },
    { minNights: 7, rate: 50 },
];

// By the notice given, longest first.
const REFUND_STEPS: readonly RefundStep[] = [
    { minDaysBefore: 56, rate: 1000 },
    { minDaysBefore: 28, rate: 500 },
    { minDaysBefore: 14, rate: 250 },
];

const DEPOSIT: DepositTerms = {
    rate: 250,
    floorPence: 10000,
};

const DISCOUNT_CAP_PENCE = 50000;
const ADMIN_FEE_PENCE = 2500;
const MIN_REFUND_PENCE = 500;
const PET_NIGHT_PENCE = 600;
const PET_NIGHTS_CHARGED = 7;

function wrapDay(day: number): number {
    // Day 366 is day 1 again. The tariff has no 29 February.
    return ((((day - 1) % DAYS_IN_YEAR) + DAYS_IN_YEAR) % DAYS_IN_YEAR) + 1;
}

function daysUntil(fromDay: number, toDay: number): number {
    // Never negative: a day that looks earlier is taken to be in the next year.
    return (((toDay - fromDay) % DAYS_IN_YEAR) + DAYS_IN_YEAR) % DAYS_IN_YEAR;
}

function inSeason(season: Season, day: number): boolean {
    if (season.fromDay <= season.toDay) {
        return day >= season.fromDay && day < season.toDay;
    }
    return day >= season.fromDay || day < season.toDay;
}

export function seasonOn(day: number): SeasonName {
    const wrapped = wrapDay(day);
    for (const season of SEASONS) {
        if (inSeason(season, wrapped)) {
            return season.name;
        }
    }
    return "low";
}

export function nightlyRate(boatClass: BoatClass, day: number): number {
    return NIGHTLY_PENCE[boatClass][seasonOn(day)];
}

/** How many of a hire's nights fall in each season. A night belongs to the day it begins on. */
export function nightsBySeason(startDay: number, nights: number): Record<SeasonName, number> {
    const count: Record<SeasonName, number> = { low: 0, mid: 0, high: 0 };
    for (let n = 0; n < nights; n++) {
        count[seasonOn(startDay + n)] += 1;
    }
    return count;
}

function share(pence: number, rate: number): number {
    // A part of a penny is dropped, whoever it favours.
    return Math.floor((pence * rate) / 1000);
}

// The discount rate for a hire of this many nights, in tenths of a percent: 75 is 7.5%.
// 0 when the hire is too short for any.
export function longHireRate(nights: number): number {
    for (const band of LONG_HIRE_BANDS) {
        if (nights >= band.minNights) {
            return band.rate;
        }
    }
    return 0;
}

export function petSupplement(pets: number, nights: number): number {
    // Charged for each pet and night, but for no more than a week however long the hire.
    return pets * Math.min(nights, PET_NIGHTS_CHARGED) * PET_NIGHT_PENCE;
}

export function formatPence(pence: number): string {
    const whole = Math.abs(pence);
    const rest = String(whole % 100).padStart(2, "0");
    // The sign goes before the pound sign, as in -£12.50.
    return `${pence < 0 ? "-" : ""}£${Math.floor(whole / 100)}.${rest}`;
}

export function quoteHire(hire: Hire): Quote {
    if (!Number.isInteger(hire.nights) || hire.nights < 1) {
        throw new RangeError(`a hire is one night or more, not ${hire.nights}`);
    }
    const lines: QuoteLine[] = [];
    const bySeason = nightsBySeason(hire.startDay, hire.nights);
    let boat = 0;
    for (const name of SEASON_NAMES) {
        const nights = bySeason[name];
        if (nights === 0) {
            continue;
        }
        const pence = nights * NIGHTLY_PENCE[hire.boatClass][name];
        lines.push({ label: `${nights} ${nights === 1 ? "night" : "nights"}, ${name} season`, pence });
        boat += pence;
    }
    // The discount is on the boat alone, never on a supplement, and no more than the cap comes off.
    const rate = longHireRate(hire.nights);
    if (rate > 0) {
        const off = Math.min(share(boat, rate), DISCOUNT_CAP_PENCE);
        lines.push({ label: "Long hire discount", pence: -off });
    }
    if (hire.pets > 0) {
        const label = hire.pets === 1 ? "1 pet" : `${hire.pets} pets`;
        lines.push({ label, pence: petSupplement(hire.pets, hire.nights) });
    }
    let totalPence = 0;
    for (const line of lines) {
        totalPence += line.pence;
    }
    return { lines, totalPence, bondPence: BOND_PENCE[hire.boatClass] };
}

/** Adds a line to the quote and returns the quote's new total. */
export function addExtra(quote: Quote, label: string, pence: number): number {
    // A reduction cannot take the total below nothing. The line holds only what came off.
    const taken = Math.max(pence, -quote.totalPence);
    quote.lines.push({ label, pence: taken });
    quote.totalPence += taken;
    return quote.totalPence;
}

export function quoteText(quote: Quote): string[] {
    const width = Math.max(5, ...quote.lines.map((line) => line.label.length));
    const text = quote.lines.map((line) => `${line.label.padEnd(width)}  ${formatPence(line.pence)}`);
    text.push(`${"Total".padEnd(width)}  ${formatPence(quote.totalPence)}`);
    if (quote.bondPence > 0) {
        text.push(`Bond, returned after the hire: ${formatPence(quote.bondPence)}`);
    }
    return text;
}

export function depositDue(quote: Quote): number {
    const wanted = Math.max(DEPOSIT.floorPence, share(quote.totalPence, DEPOSIT.rate));
    // A short hire can cost less than the floor. Then the whole price is the deposit.
    return Math.min(wanted, quote.totalPence);
}

/** Enters a payment in the ledger and returns what has now been paid in all. */
export function recordPayment(ledger: Payment[], payment: Payment): number {
    if (payment.pence > 0) {
        ledger.unshift(payment);
    }
    return paidSoFar(ledger);
}

export function paidSoFar(ledger: readonly Payment[]): number {
    let paid = 0;
    for (const payment of ledger) {
        // A refund is entered as a positive amount, like any payment.
        paid += payment.kind === "refund" ? -payment.pence : payment.pence;
    }
    return paid;
}

export function lastPayment(ledger: readonly Payment[], kind?: PaymentKind): Payment | undefined {
    // The ledger is newest first, so the first match is the latest.
    return ledger.find((payment) => (kind === undefined ? payment.kind !== "refund" : payment.kind === kind));
}

/** The day the booking was secured: the day of its earliest deposit, or 0 when none has come in. */
export function securedOn(ledger: readonly Payment[]): number {
    for (let i = ledger.length - 1; i >= 0; i--) {
        if (ledger[i].kind === "deposit") {
            return ledger[i].day;
        }
    }
    return 0;
}

/** What is still owed before the boat goes out: the price and the bond, less what has come in. */
export function balanceDue(quote: Quote, ledger: readonly Payment[]): number {
    return Math.max(0, quote.totalPence + quote.bondPence - paidSoFar(ledger));
}

export function refundRate(daysBefore: number): number {
    for (const step of REFUND_STEPS) {
        if (daysBefore >= step.minDaysBefore) {
            return step.rate;
        }
    }
    return 0;
}

/** What goes back to a customer who cancels on cancelDay a hire that starts on startDay. */
export function refundDue(ledger: readonly Payment[], startDay: number, cancelDay: number): number {
    const paid = paidSoFar(ledger);
    if (paid <= 0) {
        return 0;
    }
    // The admin fee is a tenth of what was paid, up to the flat fee. It comes off before the rate is applied.
    const tenth = share(paid, 100);
    const afterFee = paid - (tenth > ADMIN_FEE_PENCE ? ADMIN_FEE_PENCE : tenth);
    const back = share(afterFee, refundRate(daysUntil(cancelDay, startDay)));
    // It is not sent when it is under the minimum.
    if (back >= MIN_REFUND_PENCE) {
        return back;
    }
    return 0;
}

// Invoices to hirers: lines, tax, part payments, credit notes, what is still owed, and a statement as text.
// Money is whole pence. A day is a count of days from 1 January 2000, which is day 0.

export type Pence = number;
export type Day = number;

/** Stands for "no day". A draft has it as its issue day and as its due day. */
export const NO_DAY: Day = -1;

export const DEFAULT_TERMS_DAYS = 14;
export const MAX_LINES = 40;
export const FIRST_NUMBER = 1001;

export type LineKind = "hire" | "mooring" | "fuel" | "pumpout" | "damage" | "sundry";
export type TaxBand = "standard" | "reduced" | "exempt";
export type PayMethod = "card" | "transfer" | "cash" | "cheque";
export type InvoiceStatus = "draft" | "open" | "part-paid" | "paid" | "void";
export type ReminderLevel = "none" | "nudge" | "firm" | "final";

export interface InvoiceLine {
    kind: LineKind;
    label: string;
    /** In hundredths of a unit: 250 is two and a half days, 4250 is 42.5 litres. */
    qty: number;
    /** For one whole unit, before tax. */
    unitPence: Pence;
}

export interface Payment {
    day: Day;
    pence: Pence;
    method: PayMethod;
    ref: string;
}

export interface CreditNote {
    id: string;
    day: Day;
    /** Tax included. */
    pence: Pence;
    reason: string;
}

export interface TaxRow {
    band: TaxBand;
    netPence: Pence;
    taxPence: Pence;
}

export interface Totals {
    netPence: Pence;
    taxPence: Pence;
    grossPence: Pence;
}

export interface AgeingRow {
    notDue: Pence;
    to30: Pence;
    to60: Pence;
    older: Pence;
}

export interface AccountSummary {
    hirer: string;
    count: number;
    billedPence: Pence;
    paidPence: Pence;
    creditedPence: Pence;
    owedPence: Pence;
    overduePence: Pence;
    /** The earliest due day among the invoices still owed on. */
    oldestDueDay: Day;
    lastPaidDay: Day;
}

const BAND_OF: Record<LineKind, TaxBand> = {
    hire: "standard",
    mooring: "exempt",
    fuel: "reduced",
    pumpout: "standard",
    damage: "exempt",
    sundry: "standard",
};

// Tenths of a percent, so that a rate can move by half a point without a fraction.
const BAND_RATE: Record<TaxBand, number> = {
    standard: 200,
    reduced: 50,
    exempt: 0,
};

const BAND_ORDER: TaxBand[] = ["standard", "reduced", "exempt"];

// The order of the lines on a printed invoice.
const KIND_ORDER: LineKind[] = ["hire", "mooring", "fuel", "pumpout", "damage", "sundry"];

const KIND_LABEL: Record<LineKind, string> = {
    hire: "Hire",
    mooring: "Mooring",
    fuel: "Fuel",
    pumpout: "Pump-out",
    damage: "Damage",
    sundry: "Sundry",
};

const LATE_FEE_FLAT: Pence = 1500;
const LATE_FEE_RATE = 15;
const GRACE_DAYS = 7;

// The day late on which each reminder starts, the last one first.
const REMINDER_FROM: [number, ReminderLevel][] = [
    [29, "final"],
    [15, "firm"],
    [4, "nudge"],
];

// Days from 1 January 1970 to 1 January 2000.
const EPOCH_SHIFT = 10957;

function pad2(n: number): string {
    return n < 10 ? "0" + n : String(n);
}

function withCommas(whole: number): string {
    const digits = String(whole);
    let out = "";
    for (let i = 0; i < digits.length; i++) {
        if (i > 0 && (digits.length - i) % 3 === 0) out += ",";
        out += digits[i];
    }
    return out;
}

function sum(values: number[]): number {
    let total = 0;
    for (const value of values) total += value;
    return total;
}

function sameHirer(a: string, b: string): boolean {
    return a.trim().toLowerCase() === b.trim().toLowerCase();
}

/** 0 is Sunday. */
function weekday(day: Day): number {
    return (day + 6) % 7;
}

function offWeekend(day: Day): Day {
    const w = weekday(day);
    if (w === 6) return day + 2;
    return w === 0 ? day + 1 : day;
}

/** Up to two decimal places, as a count of hundredths. NaN when the text is not such a number. */
function hundredths(text: string): number {
    const found = /^(\d+)(?:\.(\d{1,2}))?$/.exec(text);
    if (!found) return NaN;
    const part = (found[2] ?? "").padEnd(2, "0");
    return Number(found[1]) * 100 + Number(part);
}

function formatQty(qty: number): string {
    // whole units print bare, parts of a unit with two places
    if (qty % 100 === 0) return String(qty / 100);
    return Math.floor(qty / 100) + "." + pad2(qty % 100);
}

export function formatPence(pence: Pence): string {
    const size = Math.abs(pence);
    const text = "£" + withCommas(Math.floor(size / 100)) + "." + pad2(size % 100);
    return pence < 0 ? "-" + text : text;
}

/** Reads what the desk types: "12", "12.5", "£1,250.00". Anything else gives NaN. */
export function parsePence(text: string): Pence {
    return hundredths(text.trim().replace(/^£/, "").replace(/,/g, ""));
}

/** Reads a line as the desk types it: kind; label; quantity; unit price. Null when it does not read. */
export function parseLine(text: string): InvoiceLine | null {
    const parts = text.split(";").map((part) => part.trim());
    if (parts.length !== 4) return null;
    const kind = KIND_ORDER.find((known) => known === parts[0].toLowerCase());
    const qty = hundredths(parts[2]);
    const unitPence = parsePence(parts[3]);
    if (kind === undefined || Number.isNaN(qty) || qty === 0 || Number.isNaN(unitPence)) return null;
    return { kind, label: parts[1], qty, unitPence };
}

/** month runs from 1 to 12. */
export function dayOf(year: number, month: number, date: number): Day {
    const y = month <= 2 ? year - 1 : year;
    const era = Math.floor(y / 400);
    const yearOfEra = y - era * 400;
    const dayOfYear = Math.floor((153 * (month > 2 ? month - 3 : month + 9) + 2) / 5) + date - 1;
    const dayOfEra = yearOfEra * 365 + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100) + dayOfYear;
    return era * 146097 + dayOfEra - 719468 - EPOCH_SHIFT;
}

export function isoDay(day: Day): string {
    if (day < 0) return "-";
    const z = day + EPOCH_SHIFT + 719468;
    const era = Math.floor(z / 146097);
    const dayOfEra = z - era * 146097;
    const leaps = Math.floor(dayOfEra / 1460) - Math.floor(dayOfEra / 36524) + Math.floor(dayOfEra / 146096);
    const yearOfEra = Math.floor((dayOfEra - leaps) / 365);
    const dayOfYear = dayOfEra - (365 * yearOfEra + Math.floor(yearOfEra / 4) - Math.floor(yearOfEra / 100));
    const shifted = Math.floor((5 * dayOfYear + 2) / 153);
    const date = dayOfYear - Math.floor((153 * shifted + 2) / 5) + 1;
    const month = shifted < 10 ? shifted + 3 : shifted - 9;
    const year = yearOfEra + era * 400 + (month <= 2 ? 1 : 0);
    return `${year}-${pad2(month)}-${pad2(date)}`;
}

/** Reads "2026-03-04". NO_DAY when the text is not a day of the calendar. */
export function dayOfIso(text: string): Day {
    const tidy = text.trim();
    const found = /^(\d{4})-(\d{2})-(\d{2})$/.exec(tidy);
    if (!found) return NO_DAY;
    const day = dayOf(Number(found[1]), Number(found[2]), Number(found[3]));
    // 30 February reads as a day in March, and so does not come back as it went in
    return isoDay(day) === tidy ? day : NO_DAY;
}

export function taxRate(kind: LineKind): number {
    return BAND_RATE[BAND_OF[kind]];
}

export function lineNet(line: InvoiceLine): Pence {
    // qty is in hundredths, and half a penny goes up
    return Math.floor((line.qty * line.unitPence + 50) / 100);
}

export function taxSummary(lines: InvoiceLine[]): TaxRow[] {
    const net: Record<TaxBand, Pence> = { standard: 0, reduced: 0, exempt: 0 };
    const seen = new Set<TaxBand>();
    for (const line of lines) {
        const band = BAND_OF[line.kind];
        net[band] += lineNet(line);
        seen.add(band);
    }
    // Tax is worked out once for each band, on the band's net, and never line by line.
    // A part of a penny is dropped.
    return BAND_ORDER.filter((band) => seen.has(band)).map((band) => ({
        band,
        netPence: net[band],
        taxPence: Math.floor((net[band] * BAND_RATE[band]) / 1000),
    }));
}

export function totalsOf(lines: InvoiceLine[]): Totals {
    const rows = taxSummary(lines);
    const netPence = sum(rows.map((row) => row.netPence));
    const taxPence = sum(rows.map((row) => row.taxPence));
    return { netPence, taxPence, grossPence: netPence + taxPence };
}

/** The tax inside an amount that includes it, for a credit note against one kind of line. */
export function taxWithin(grossPence: Pence, kind: LineKind): Pence {
    const rate = taxRate(kind);
    const net = Math.ceil((grossPence * 1000) / (1000 + rate));
    return grossPence - net;
}

export function describeLine(line: InvoiceLine): string {
    const what = line.label === "" ? KIND_LABEL[line.kind] : `${KIND_LABEL[line.kind]}: ${line.label}`;
    return `${what}  ${formatQty(line.qty)} x ${formatPence(line.unitPence)}  ${formatPence(lineNet(line))}`;
}

/** Puts lines in the order of a printed invoice: by kind, then by label. It sorts the array it is given. */
export function sortLines(lines: InvoiceLine[]): InvoiceLine[] {
    return lines.sort((a, b) => {
        const byKind = KIND_ORDER.indexOf(a.kind) - KIND_ORDER.indexOf(b.kind);
        if (byKind !== 0) return byKind;
        return a.label < b.label ? -1 : a.label > b.label ? 1 : 0;
    });
}

/** Lines of one kind, label and unit price become one line, where the first of them stood. */
export function mergeLines(lines: InvoiceLine[]): InvoiceLine[] {
    const out: InvoiceLine[] = [];
    for (const line of lines) {
        const same = out.find((o) => o.kind === line.kind && o.label === line.label && o.unitPence === line.unitPence);
        if (same) same.qty += line.qty;
        else out.push({ ...line });
    }
    return out;
}

export function lateFee(owedPence: Pence, daysLate: number): Pence {
    if (owedPence <= 0 || daysLate <= GRACE_DAYS) return 0;
    // a flat charge, and then a share of what is owed for each whole 30 days
    const months = Math.floor(daysLate / 30);
    return LATE_FEE_FLAT + Math.floor((owedPence * LATE_FEE_RATE * months) / 1000);
}

/** Splits an amount into equal parts. The pence that will not divide go on the first part. */
export function instalments(totalPence: Pence, parts: number): Pence[] {
    if (!Number.isInteger(parts) || parts < 1) throw new RangeError("an amount splits into one part or more");
    const each = Math.floor(totalPence / parts);
    const out = new Array<Pence>(parts).fill(each);
    out[0] += totalPence - each * parts;
    return out;
}

export function reminderLevel(daysLate: number): ReminderLevel {
    for (const [from, level] of REMINDER_FROM) {
        if (daysLate >= from) return level;
    }
    return "none";
}

export class Invoice {
    readonly number: number;
    readonly hirer: string;
    readonly termsDays: number;
    private lines: InvoiceLine[] = [];
    private payments: Payment[] = [];
    private credits: CreditNote[] = [];
    private issuedOn: Day = NO_DAY;
    private voided = false;

    constructor(number: number, hirer: string, termsDays: number = DEFAULT_TERMS_DAYS) {
        if (!Number.isInteger(number) || number < FIRST_NUMBER) throw new RangeError(`bad invoice number ${number}`);
        if (!Number.isInteger(termsDays) || termsDays < 0) throw new RangeError("terms must be whole days");
        this.number = number;
        this.hirer = hirer.trim();
        this.termsDays = termsDays;
    }

    /** Adds a copy of the line and returns how many lines there are now. Only a draft takes lines. */
    addLine(line: InvoiceLine): number {
        this.mustBeDraft("add a line to");
        if (!Number.isInteger(line.qty) || line.qty <= 0) throw new RangeError("qty must be a whole number above 0");
        if (!Number.isInteger(line.unitPence) || line.unitPence < 0) throw new RangeError("a price is whole pence");
        if (this.lines.length >= MAX_LINES) throw new RangeError(`an invoice holds at most ${MAX_LINES} lines`);
        this.lines.push({ ...line, label: line.label.trim() });
        return this.lines.length;
    }

    /** index counts from 0. False when there is no such line. */
    removeLine(index: number): boolean {
        this.mustBeDraft("remove a line from");
        if (!Number.isInteger(index) || index < 0 || index >= this.lines.length) return false;
        this.lines.splice(index, 1);
        return true;
    }

    lineList(): InvoiceLine[] {
        return this.lines.map((line) => ({ ...line }));
    }

    issue(day: Day): void {
        this.mustBeDraft("issue");
        if (this.lines.length === 0) throw new Error(`invoice ${this.number} has no lines`);
        if (!Number.isInteger(day) || day < 0) throw new RangeError("an invoice is issued on a real day");
        // from here on the lines are as they print
        this.lines = sortLines(mergeLines(this.lines));
        this.issuedOn = day;
    }

    issuedDay(): Day {
        return this.issuedOn;
    }

    dueDay(): Day {
        // nobody is at the desk at a weekend, so a due day that lands on one moves to the Monday
        return this.issuedOn === NO_DAY ? NO_DAY : offWeekend(this.issuedOn + this.termsDays);
    }

    totals(): Totals {
        return totalsOf(this.lines);
    }

    /**
     * Takes a payment against the invoice. It never takes more than is owed, and it gives back
     * the pence it did not take: 0 when the whole payment was used.
     */
    pay(day: Day, pence: Pence, method: PayMethod = "transfer", ref: string = ""): Pence {
        this.mustBeLive("pay");
        if (!Number.isInteger(pence) || pence <= 0) throw new RangeError("a payment is whole pence above 0");
        const wanted = ref.trim().toLowerCase();
        if (wanted !== "" && this.payments.some((payment) => payment.ref.trim().toLowerCase() === wanted)) return pence;
        const taken = Math.min(pence, this.owedPence());
        if (taken > 0) {
            // newest first: the desk asks for the latest payment far more often than for the first
            this.payments.unshift({ day, pence: taken, method, ref });
        }
        return pence - taken;
    }

    paymentList(): Payment[] {
        return this.payments.map((payment) => ({ ...payment }));
    }

    lastPaymentDay(): Day {
        return this.payments.length === 0 ? NO_DAY : this.payments[0].day;
    }

    /** Raises a credit note against what is owed. pence includes tax. */
    credit(day: Day, pence: Pence, reason: string): CreditNote {
        this.mustBeLive("credit");
        if (!Number.isInteger(pence) || pence <= 0) throw new RangeError("a credit note is whole pence above 0");
        if (pence > this.owedPence()) throw new RangeError("a credit note cannot be for more than is owed");
        const id = `CN${this.number}-${this.credits.length + 1}`;
        const note: CreditNote = { id, day, pence, reason: reason.trim() };
        this.credits.push(note);
        return { ...note };
    }

    creditList(): CreditNote[] {
        return this.credits.map((note) => ({ ...note }));
    }

    paidPence(): Pence {
        return sum(this.payments.map((payment) => payment.pence));
    }

    creditedPence(): Pence {
        return sum(this.credits.map((note) => note.pence));
    }

    owedPence(): Pence {
        // a draft is not owed yet, and a void invoice never will be
        if (this.issuedOn === NO_DAY || this.voided) return 0;
        return this.totals().grossPence - this.paidPence() - this.creditedPence();
    }

    status(): InvoiceStatus {
        if (this.voided) return "void";
        if (this.issuedOn === NO_DAY) return "draft";
        if (this.owedPence() === 0) return "paid";
        return this.payments.length > 0 || this.credits.length > 0 ? "part-paid" : "open";
    }

    daysLate(today: Day): number {
        // the due day itself is on time, and nothing is late once nothing is owed
        if (this.owedPence() === 0) return 0;
        return Math.max(0, today - this.dueDay());
    }

    isOverdue(today: Day): boolean {
        return this.daysLate(today) > 0;
    }

    /** Voids the invoice. One that has taken money cannot be voided: credit it. */
    cancel(): boolean {
        if (this.payments.length > 0) return false;
        this.voided = true;
        return true;
    }

    statementLines(today: Day): string[] {
        const totals = this.totals();
        const out: string[] = [];
        out.push(`Invoice ${this.number}  issued ${isoDay(this.issuedOn)}  due ${isoDay(this.dueDay())}`);
        for (const line of this.lines) out.push("  " + describeLine(line));
        const net = formatPence(totals.netPence);
        const tax = formatPence(totals.taxPence);
        out.push(`  Net ${net}  Tax ${tax}  Total ${formatPence(totals.grossPence)}`);
        for (const note of this.credits) {
            out.push(`  Credit ${note.id}  ${isoDay(note.day)}  ${formatPence(-note.pence)}  ${note.reason}`);
        }
        if (this.payments.length > 0) out.push(`  Paid ${formatPence(this.paidPence())}`);
        const late = this.daysLate(today);
        const fee = lateFee(this.owedPence(), late);
        const lateness = late === 1 ? "1 day late" : `${late} days late`;
        out.push(`  Owed ${formatPence(this.owedPence())}` + (late > 0 ? `  (${lateness})` : ""));
        if (fee > 0) out.push(`  Late fee if unpaid ${formatPence(fee)}`);
        return out;
    }

    private mustBeDraft(doing: string): void {
        if (this.voided) throw new Error(`cannot ${doing} invoice ${this.number}: it is void`);
        if (this.issuedOn !== NO_DAY) throw new Error(`cannot ${doing} invoice ${this.number}: it is issued`);
    }

    private mustBeLive(doing: string): void {
        if (this.voided) throw new Error(`cannot ${doing} invoice ${this.number}: it is void`);
        if (this.issuedOn === NO_DAY) throw new Error(`cannot ${doing} invoice ${this.number}: it is a draft`);
    }
}

export function nextNumber(invoices: Invoice[]): number {
    let top = FIRST_NUMBER - 1;
    for (const invoice of invoices) top = Math.max(top, invoice.number);
    return top + 1;
}

export function invoicesOf(hirer: string, invoices: Invoice[]): Invoice[] {
    // drafts and void invoices are the yard's business, not the hirer's
    return invoices
        .filter((invoice) => sameHirer(invoice.hirer, hirer))
        .filter((invoice) => invoice.status() !== "draft" && invoice.status() !== "void")
        .sort((a, b) => a.number - b.number);
}

export function owedBy(hirer: string, invoices: Invoice[]): Pence {
    return sum(invoicesOf(hirer, invoices).map((invoice) => invoice.owedPence()));
}

/** The overdue invoices, the one that fell due first at the front. */
export function overdue(invoices: Invoice[], today: Day): Invoice[] {
    return invoices
        .filter((invoice) => invoice.isOverdue(today))
        .sort((a, b) => a.dueDay() - b.dueDay() || a.number - b.number);
}

export function ageing(invoices: Invoice[], today: Day): AgeingRow {
    const row: AgeingRow = { notDue: 0, to30: 0, to60: 0, older: 0 };
    for (const invoice of invoices) {
        const owed = invoice.owedPence();
        if (owed === 0) continue;
        const late = invoice.daysLate(today);
        if (late === 0) row.notDue += owed;
        else if (late <= 30) row.to30 += owed;
        else if (late <= 60) row.to60 += owed;
        else row.older += owed;
    }
    return row;
}

/**
 * Spreads one payment over the invoices that are owed on, the one due first before the others.
 * Gives back the pence left when all of them are settled.
 */
export function allocate(invoices: Invoice[], day: Day, pence: Pence, method?: PayMethod, ref?: string): Pence {
    if (!Number.isInteger(pence) || pence <= 0) throw new RangeError("a payment is whole pence above 0");
    const open = invoices.filter((invoice) => invoice.owedPence() > 0);
    open.sort((a, b) => a.dueDay() - b.dueDay() || a.number - b.number);
    let left = pence;
    for (const invoice of open) {
        if (left === 0) break;
        left = invoice.pay(day, left, method, ref);
    }
    return left;
}

export function accountSummary(hirer: string, invoices: Invoice[], today: Day): AccountSummary {
    const theirs = invoicesOf(hirer, invoices);
    const summary: AccountSummary = {
        hirer: hirer.trim(),
        count: theirs.length,
        billedPence: 0,
        paidPence: 0,
        creditedPence: 0,
        owedPence: 0,
        overduePence: 0,
        oldestDueDay: NO_DAY,
        lastPaidDay: NO_DAY,
    };
    for (const invoice of theirs) {
        const owed = invoice.owedPence();
        summary.billedPence += invoice.totals().grossPence;
        summary.paidPence += invoice.paidPence();
        summary.creditedPence += invoice.creditedPence();
        summary.owedPence += owed;
        if (invoice.isOverdue(today)) summary.overduePence += owed;
        if (owed > 0 && (summary.oldestDueDay === NO_DAY || invoice.dueDay() < summary.oldestDueDay)) {
            summary.oldestDueDay = invoice.dueDay();
        }
        // NO_DAY is below every real day
        summary.lastPaidDay = Math.max(summary.lastPaidDay, invoice.lastPaymentDay());
    }
    return summary;
}

export function reminderText(invoice: Invoice, today: Day): string {
    const late = invoice.daysLate(today);
    const level = reminderLevel(late);
    if (level === "none") return "";
    const owed = formatPence(invoice.owedPence());
    const head = `Invoice ${invoice.number} for ${owed} was due on ${isoDay(invoice.dueDay())}.`;
    if (level === "nudge") return `${head} Please pay it when you next can.`;
    if (level === "firm") return `${head} Please pay it within 7 days.`;
    return `${head} A late fee of ${formatPence(lateFee(invoice.owedPence(), late))} now applies.`;
}

export function statement(hirer: string, invoices: Invoice[], today: Day): string {
    const theirs = invoicesOf(hirer, invoices);
    const out: string[] = [`Statement for ${hirer.trim()} at ${isoDay(today)}`];
    for (const invoice of theirs) {
        out.push("");
        out.push(...invoice.statementLines(today));
    }
    out.push("");
    out.push(`Total owed ${formatPence(sum(theirs.map((invoice) => invoice.owedPence())))}`);
    const late = overdue(theirs, today);
    if (late.length > 0) {
        const pence = sum(late.map((invoice) => invoice.owedPence()));
        out.push(`Overdue ${formatPence(pence)} on ${late.length} of ${theirs.length}`);
    }
    return out.join("\n");
}

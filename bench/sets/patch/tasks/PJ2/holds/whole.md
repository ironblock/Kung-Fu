You cannot open files or run anything from where you are, so here is app/src/keys.ts, whole:

FILE: app/src/keys.ts
```
// Keys and gear lent to a hire party at handover: what went out, what came back,
// and what is kept from the deposit for what did not.

export type GearKind = "boatKey" | "windlass" | "lifejacket" | "mooringPin" | "mallet" | "waterKey";

export type JacketSize = "infant" | "child" | "junior" | "adult" | "large";

export interface GearLine {
    kind: GearKind;
    issued: number;
    back: number;
    // of those back, how many came back damaged
    damaged: number;
}

export interface LogEntry {
    action: "out" | "back";
    kind: GearKind;
    count: number;
    day: number;
    minute: number;
}

export interface Loan {
    bookingRef: string;
    boat: string;
    dueDay: number;
    depositPence: number;
    keyTag: number;
    settledDay: number;
    lines: GearLine[];
    log: LogEntry[];
}

export interface Settlement {
    gearPence: number;
    latePence: number;
    keptPence: number;
    refundPence: number;
    owedPence: number;
}

export const ALL_KINDS: GearKind[] = ["boatKey", "windlass", "lifejacket", "mooringPin", "mallet", "waterKey"];

// What one item costs to replace.
export const REPLACEMENT_PENCE: Record<GearKind, number> = {
    boatKey: 4500,
    windlass: 1850,
    lifejacket: 3200,
    mooringPin: 600,
    mallet: 950,
    waterKey: 725,
};

// Gear is due back on the due day by 10:00.
export const RETURN_BY_MINUTE = 10 * 60;
export const LATE_DAY_PENCE = 2500;
const LATE_DAYS_CAP = 3;
const LOG_KEEP = 40;

// Each size is for anyone under its weight in kg. Anyone heavier takes a large.
const JACKET_LIMITS: [number, JacketSize][] = [
    [15, "infant"],
    [30, "child"],
    [40, "junior"],
    [70, "adult"],
];

// The deposit for a boat of up to so many berths.
const DEPOSIT_STEPS: [number, number][] = [
    [4, 5000],
    [8, 7500],
];
const DEPOSIT_TOP = 10000;

export function openLoan(bookingRef: string, boat: string, dueDay: number, depositPence: number): Loan {
    return {
        bookingRef: bookingRef.trim().toUpperCase(),
        boat,
        dueDay,
        depositPence,
        // Tags and the days of the season are both numbered from 1.
        keyTag: 0,
        settledDay: 0,
        lines: [],
        log: [],
    };
}

export function isOpen(loan: Loan): boolean {
    return loan.settledDay === 0;
}

function lineFor(loan: Loan, kind: GearKind): GearLine {
    let line = loan.lines.find((l) => l.kind === kind);
    if (!line) {
        line = { kind, issued: 0, back: 0, damaged: 0 };
        loan.lines.push(line);
    }
    return line;
}

// The log is kept newest first, because the desk screen shows its top few entries. Old entries fall off the end.
function record(loan: Loan, entry: LogEntry): void {
    loan.log.unshift(entry);
    if (loan.log.length > LOG_KEEP) loan.log.length = LOG_KEEP;
}

export function issue(loan: Loan, kind: GearKind, count: number, day: number, minute: number): void {
    if (count <= 0) return;
    lineFor(loan, kind).issued += count;
    record(loan, { action: "out", kind, count, day, minute });
}

// The boat's keys hang together on one numbered tag. False when the loan has a tag already.
export function issueKeys(loan: Loan, tag: number, count: number, day: number, minute: number): boolean {
    if (loan.keyTag !== 0 || tag <= 0 || count <= 0) return false;
    loan.keyTag = tag;
    issue(loan, "boatKey", count, day, minute);
    return true;
}

// Gives how many were taken back, which is never more than are out.
export function takeBack(loan: Loan, kind: GearKind, count: number, day: number, minute: number, damaged = 0): number {
    const line = loan.lines.find((l) => l.kind === kind);
    if (!line) return 0;
    const accepted = Math.min(count, line.issued - line.back);
    if (accepted <= 0) return 0;
    line.back += accepted;
    line.damaged += Math.min(Math.max(damaged, 0), accepted);
    // The tag goes back on the board with the last key.
    if (kind === "boatKey" && line.back === line.issued) loan.keyTag = 0;
    record(loan, { action: "back", kind, count: accepted, day, minute });
    return accepted;
}

export function outstanding(loan: Loan, kind?: GearKind): number {
    let out = 0;
    for (const line of loan.lines) {
        if (kind === undefined || line.kind === kind) out += line.issued - line.back;
    }
    return out;
}

export function gearCharge(loan: Loan): number {
    let pence = 0;
    for (const line of loan.lines) {
        const each = REPLACEMENT_PENCE[line.kind];
        pence += (line.issued - line.back) * each;
        // Damaged gear is charged at half its cost, each item rounded up to a whole penny.
        pence += line.damaged * Math.ceil(each / 2);
    }
    return pence;
}

// A late day runs from one return hour to the next, so 10:00 on the due day is still on time.
export function lateDays(loan: Loan, day: number, minute: number): number {
    const days = day - loan.dueDay + (minute > RETURN_BY_MINUTE ? 1 : 0);
    return Math.max(days, 0);
}

export function lateFee(loan: Loan, day: number, minute: number): number {
    return Math.min(lateDays(loan, day, minute), LATE_DAYS_CAP) * LATE_DAY_PENCE;
}

// Closes the loan. The yard keeps what it is owed out of the deposit, and the rest of the debt is still owed.
export function settle(loan: Loan, day: number, minute: number): Settlement {
    const gearPence = gearCharge(loan);
    const latePence = lateFee(loan, day, minute);
    const keptPence = Math.min(gearPence + latePence, loan.depositPence);
    if (loan.settledDay === 0) loan.settledDay = day;
    return {
        gearPence,
        latePence,
        keptPence,
        refundPence: loan.depositPence - keptPence,
        owedPence: gearPence + latePence - keptPence,
    };
}

export function jacketSize(weightKg: number): JacketSize {
    for (const [limit, size] of JACKET_LIMITS) {
        if (weightKg < limit) return size;
    }
    return "large";
}

export function depositFor(berths: number): number {
    for (const [upTo, pence] of DEPOSIT_STEPS) {
        if (berths <= upTo) return pence;
    }
    return DEPOSIT_TOP;
}

// The kit a boat goes out with. The keys are not part of it: they are issued by tag.
export function standardKit(berths: number): GearLine[] {
    const counts: [GearKind, number][] = [
        ["windlass", berths > 6 ? 3 : 2],
        ["lifejacket", berths],
        ["mooringPin", berths > 6 ? 4 : 3],
        ["mallet", 1],
        ["waterKey", 1],
    ];
    return counts.map(([kind, issued]) => ({ kind, issued, back: 0, damaged: 0 }));
}

export function issueKit(loan: Loan, berths: number, day: number, minute: number): void {
    for (const line of standardKit(berths)) issue(loan, line.kind, line.issued, day, minute);
}

// The open loan that holds the keys on this tag.
export function keyHolder(loans: Loan[], tag: number): Loan | undefined {
    if (tag === 0) return undefined;
    return loans.find((loan) => isOpen(loan) && loan.keyTag === tag);
}

// Open loans with gear still out after the return hour, the longest overdue first. `loans` is left as it is.
export function overdueLoans(loans: Loan[], day: number, minute: number): Loan[] {
    return loans
        .filter((loan) => isOpen(loan) && outstanding(loan) > 0 && lateDays(loan, day, minute) > 0)
        .sort((a, b) => a.dueDay - b.dueDay);
}

export function formatPence(pence: number): string {
    const sign = pence < 0 ? "-" : "";
    const whole = Math.abs(pence);
    return `${sign}£${Math.floor(whole / 100)}.${String(whole % 100).padStart(2, "0")}`;
}

// One line for the desk list, such as "BK-204 Heron: 3 out, 1 damaged, key 17".
export function summary(loan: Loan): string {
    const damaged = loan.lines.reduce((sum, line) => sum + line.damaged, 0);
    const parts = [`${outstanding(loan)} out`];
    if (damaged > 0) parts.push(`${damaged} damaged`);
    if (loan.keyTag !== 0) parts.push(`key ${loan.keyTag}`);
    if (!isOpen(loan)) parts.push("settled");
    return `${loan.bookingRef} ${loan.boat}: ${parts.join(", ")}`;
}

// The slip handed to the party at settlement, a line at a time.
export function receiptLines(loan: Loan, settlement: Settlement): string[] {
    const slip = [`Loan ${loan.bookingRef}`];
    for (const kind of ALL_KINDS) {
        const line = loan.lines.find((l) => l.kind === kind);
        if (!line) continue;
        const missing = line.issued - line.back;
        if (missing > 0) slip.push(`${kind} x${missing} not returned`);
        if (line.damaged > 0) slip.push(`${kind} x${line.damaged} damaged`);
    }
    if (settlement.latePence > 0) slip.push(`Late return ${formatPence(settlement.latePence)}`);
    slip.push(`Kept ${formatPence(settlement.keptPence)}`, `Refund ${formatPence(settlement.refundPence)}`);
    if (settlement.owedPence > 0) slip.push(`Still owed ${formatPence(settlement.owedPence)}`);
    return slip;
}
```

// The yard staff's rota: who works which shift, the rest people must have between shifts, swaps between
// people, and whether each day has the cover it needs.

export type Role = "hand" | "fitter" | "office" | "lock";

export type SwapStatus = "pending" | "approved" | "refused";

export interface Staff {
    id: string;
    name: string;
    roles: Role[];
    // for one hour
    ratePence: number;
    // for one week
    contractMinutes: number;
}

export interface Shift {
    id: string;
    // OPEN until somebody holds it
    staffId: string;
    // counted from the day the yard's books were opened
    day: number;
    start: number;
    end: number;
    role: Role;
}

export interface Leave {
    staffId: string;
    firstDay: number;
    lastDay: number;
}

export interface SwapRequest {
    id: string;
    shiftId: string;
    fromStaffId: string;
    toStaffId: string;
    status: SwapStatus;
    askedAt: number;
    decidedAt: number;
}

export interface CoverNeed {
    role: Role;
    from: number;
    to: number;
    count: number;
}

export interface Gap {
    role: Role;
    from: number;
    to: number;
    short: number;
}

export interface RestBreach {
    staffId: string;
    earlierId: string;
    laterId: string;
    rest: number;
}

export const OPEN = "";
export const NEVER = -1;
export const DAY_MINUTES = 24 * 60;
export const MIN_REST = 11 * 60;
export const MAX_DAYS_RUNNING = 6;
export const SWAP_NOTICE = 48 * 60;

const BREAK_AFTER = 6 * 60;
const BREAK_MINUTES = 30;
// Cover is counted at the start of each half hour.
const SLOT = 30;
const ROLES: Role[] = ["hand", "fitter", "office", "lock"];

const WORKING_DAY: CoverNeed[] = [
    { role: "hand", from: 7 * 60, to: 17 * 60, count: 2 },
    { role: "fitter", from: 8 * 60, to: 16 * 60, count: 1 },
    { role: "office", from: 9 * 60, to: 17 * 60, count: 1 },
];

// Boats go out and come back on the turnaround day, so the lock is staffed and the office doubles up.
const TURNAROUND_DAY: CoverNeed[] = [
    { role: "hand", from: 7 * 60, to: 18 * 60, count: 3 },
    { role: "fitter", from: 8 * 60, to: 16 * 60, count: 1 },
    { role: "office", from: 8 * 60, to: 18 * 60, count: 2 },
    { role: "lock", from: 9 * 60, to: 16 * 60, count: 1 },
];

const QUIET_DAY: CoverNeed[] = [
    { role: "hand", from: 9 * 60, to: 13 * 60, count: 1 },
];

// One list for each weekday, as weekdayOf numbers them.
const COVER: CoverNeed[][] = [
    WORKING_DAY, // Monday
    WORKING_DAY,
    WORKING_DAY,
    WORKING_DAY,
    WORKING_DAY,
    TURNAROUND_DAY, // Saturday
    QUIET_DAY, // Sunday
];

function pad2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
}

function idNumber(id: string): number {
    return Number(id.slice(1));
}

function byStart(a: Shift, b: Shift): number {
    return spanOf(a)[0] - spanOf(b)[0] || idNumber(a.id) - idNumber(b.id);
}

export function minutesOf(clock: string): number {
    const match = /^(\d{1,2}):(\d{2})$/.exec(clock);
    if (!match) throw new Error(`not a time: ${clock}`);
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    // 24:00 is allowed, as the end of a shift that stops at midnight.
    if (minutes > 59 || hours * 60 + minutes > DAY_MINUTES) throw new Error(`not a time: ${clock}`);
    return hours * 60 + minutes;
}

export function clockOf(minutes: number): string {
    // A time past midnight is written as the clock shows it, so 1500 is 01:00.
    const inDay = ((minutes % DAY_MINUTES) + DAY_MINUTES) % DAY_MINUTES;
    return `${pad2(Math.floor(inDay / 60))}:${pad2(inDay % 60)}`;
}

export function weekdayOf(day: number): number {
    // Day 0 was a Monday, so 0 is Monday and 6 is Sunday.
    return ((day % 7) + 7) % 7;
}

export function weekStart(day: number): number {
    return day - weekdayOf(day);
}

export function shiftLength(shift: Shift): number {
    // An end at or before the start is on the next day: the night watch is 22:00 to 06:00.
    const end = shift.end <= shift.start ? shift.end + DAY_MINUTES : shift.end;
    return end - shift.start;
}

// Both in minutes from midnight of day 0. The shift covers the first and stops short of the second.
export function spanOf(shift: Shift): [number, number] {
    const from = shift.day * DAY_MINUTES + shift.start;
    return [from, from + shiftLength(shift)];
}

export function overlaps(a: Shift, b: Shift): boolean {
    const [aFrom, aTo] = spanOf(a);
    const [bFrom, bTo] = spanOf(b);
    return aFrom < bTo && bFrom < aTo;
}

export function restBetween(earlier: Shift, later: Shift): number {
    return spanOf(later)[0] - spanOf(earlier)[1];
}

export function paidMinutes(shift: Shift): number {
    const length = shiftLength(shift);
    // The break is unpaid, and only a shift longer than six hours has one.
    return length > BREAK_AFTER ? length - BREAK_MINUTES : length;
}

export function shiftPayPence(shift: Shift, ratePence: number): number {
    return Math.round((paidMinutes(shift) * ratePence) / 60);
}

export function sortShifts(shifts: Shift[]): Shift[] {
    // In place, earliest first. Shifts that start together go in the order they were made.
    return shifts.sort(byStart);
}

export function coverNeeds(day: number): CoverNeed[] {
    return COVER[weekdayOf(day)];
}

// How many held shifts of the role cover the minute. A night shift that began the day before counts.
export function countOn(shifts: Shift[], role: Role, day: number, minute: number): number {
    const at = day * DAY_MINUTES + minute;
    let count = 0;
    for (const shift of shifts) {
        if (shift.role !== role || shift.staffId === OPEN) continue;
        const [from, to] = spanOf(shift);
        if (from <= at && at < to) count += 1;
    }
    return count;
}

export function coverGaps(shifts: Shift[], day: number): Gap[] {
    const gaps: Gap[] = [];
    for (const need of coverNeeds(day)) {
        let run: Gap | undefined;
        for (let minute = need.from; minute < need.to; minute += SLOT) {
            const short = need.count - countOn(shifts, need.role, day, minute);
            if (run && run.short === short) {
                run.to = minute + SLOT;
                continue;
            }
            if (run) gaps.push(run);
            run = short > 0 ? { role: need.role, from: minute, to: minute + SLOT, short } : undefined;
        }
        if (run) gaps.push(run);
    }
    return gaps;
}

// One shift as a line of the rota file: "s4 12 07:00-15:30 hand ada", with "-" for a shift nobody holds.
export function formatShift(shift: Shift): string {
    const holder = shift.staffId === OPEN ? "-" : shift.staffId;
    return `${shift.id} ${shift.day} ${clockOf(shift.start)}-${clockOf(shift.end)} ${shift.role} ${holder}`;
}

export function parseShift(line: string): Shift {
    const parts = line.trim().split(/\s+/);
    if (parts.length !== 5) throw new Error(`not a shift: ${line}`);
    const [id, dayText, times, roleText, holder] = parts;
    const day = Number(dayText);
    const clocks = times.split("-");
    const role = ROLES.find((r) => r === roleText);
    if (!/^s\d+$/.test(id) || !/^-?\d+$/.test(dayText) || clocks.length !== 2 || !role) {
        throw new Error(`not a shift: ${line}`);
    }
    const start = minutesOf(clocks[0]);
    const end = minutesOf(clocks[1]);
    if (start === DAY_MINUTES) throw new Error(`not a shift: ${line}`);
    return { id, staffId: holder === "-" ? OPEN : holder, day, start, end, role };
}

export class Rota {
    private staff = new Map<string, Staff>();
    private shifts: Shift[] = [];
    private leave: Leave[] = [];
    // newest first
    private swaps: SwapRequest[] = [];
    private shiftsMade = 0;
    private swapsMade = 0;

    addStaff(person: Staff): void {
        if (person.id === OPEN || person.id === "-") throw new Error("a person needs an id");
        if (this.staff.has(person.id)) throw new Error(`${person.id} is on the rota already`);
        this.staff.set(person.id, { ...person, roles: [...person.roles] });
    }

    person(staffId: string): Staff | undefined {
        return this.staff.get(staffId);
    }

    addLeave(staffId: string, firstDay: number, lastDay: number): void {
        if (!this.staff.has(staffId)) throw new Error(`nobody is called ${staffId}`);
        if (lastDay < firstDay) throw new Error("leave ends before it starts");
        const held = this.shifts.find((s) => s.staffId === staffId && s.day >= firstDay && s.day <= lastDay);
        if (held) throw new Error(`${staffId} holds ${held.id} in that time`);
        this.leave.push({ staffId, firstDay, lastDay });
    }

    onLeave(staffId: string, day: number): boolean {
        return this.leave.some((l) => l.staffId === staffId && l.firstDay <= day && day <= l.lastDay);
    }

    addShift(day: number, start: number, end: number, role: Role, staffId: string = OPEN): Shift {
        if (!Number.isInteger(day)) throw new Error("a shift is on a whole day");
        if (start < 0 || start >= DAY_MINUTES || end < 0 || end > DAY_MINUTES) {
            throw new Error("a shift's times are minutes of one day");
        }
        // The number is spent only when the shift is kept, and a removed shift's number is not used again.
        const shift: Shift = { id: `s${this.shiftsMade + 1}`, staffId: OPEN, day, start, end, role };
        if (staffId !== OPEN) {
            const reason = this.whyNot(staffId, shift);
            if (reason !== "") throw new Error(reason);
            shift.staffId = staffId;
        }
        this.shiftsMade += 1;
        this.shifts.push(shift);
        return shift;
    }

    removeShift(shiftId: string): boolean {
        const at = this.shifts.findIndex((s) => s.id === shiftId);
        if (at < 0) return false;
        this.shifts.splice(at, 1);
        // Requests for a shift that is gone go with it, decided or not.
        this.swaps = this.swaps.filter((w) => w.shiftId !== shiftId);
        return true;
    }

    // Not checked against the rules: the office moves a shift first and reads restBreaches after.
    moveShift(shiftId: string, day: number, start: number, end: number): Shift {
        const shift = this.need(shiftId);
        shift.day = day;
        shift.start = start;
        shift.end = end;
        return shift;
    }

    shift(shiftId: string): Shift | undefined {
        return this.shifts.find((s) => s.id === shiftId);
    }

    shiftsOn(day: number): Shift[] {
        return sortShifts(this.shifts.filter((s) => s.day === day));
    }

    shiftsFor(staffId: string): Shift[] {
        return sortShifts(this.shifts.filter((s) => s.staffId === staffId));
    }

    // Why the person cannot hold the shift, or "" when they can.
    whyNot(staffId: string, shift: Shift): string {
        const person = this.staff.get(staffId);
        if (!person) return `nobody is called ${staffId}`;
        if (!person.roles.includes(shift.role)) return `${person.name} does not work as ${shift.role}`;
        if (this.onLeave(staffId, shift.day)) return `${person.name} is on leave`;
        const others = this.shiftsFor(staffId).filter((s) => s.id !== shift.id);
        for (const other of others) {
            if (overlaps(other, shift)) return `${person.name} is on ${other.id} then`;
        }
        for (const other of others) {
            // Two shifts that start on one day are a split shift, and need no rest between them.
            if (other.day === shift.day) continue;
            const rest = byStart(other, shift) < 0 ? restBetween(other, shift) : restBetween(shift, other);
            if (rest < MIN_REST) return `${person.name} would have too little rest by ${other.id}`;
        }
        const days = new Set(others.map((s) => s.day));
        let first = shift.day;
        let last = shift.day;
        while (days.has(first - 1)) first -= 1;
        while (days.has(last + 1)) last += 1;
        if (last - first + 1 > MAX_DAYS_RUNNING) {
            return `${person.name} would work more than ${MAX_DAYS_RUNNING} days running`;
        }
        return "";
    }

    assign(shiftId: string, staffId: string): Shift {
        const shift = this.need(shiftId);
        const reason = this.whyNot(staffId, shift);
        if (reason !== "") throw new Error(reason);
        shift.staffId = staffId;
        return shift;
    }

    release(shiftId: string): Shift {
        const shift = this.need(shiftId);
        shift.staffId = OPEN;
        return shift;
    }

    // The holder asks to hand the shift to somebody else. `at` is in minutes from midnight of day 0.
    requestSwap(shiftId: string, toStaffId: string, at: number): SwapRequest {
        const shift = this.need(shiftId);
        if (shift.staffId === OPEN) throw new Error(`nobody holds ${shiftId}`);
        if (shift.staffId === toStaffId) throw new Error(`${toStaffId} holds ${shiftId} already`);
        if (!this.staff.has(toStaffId)) throw new Error(`nobody is called ${toStaffId}`);
        if (spanOf(shift)[0] - at < SWAP_NOTICE) throw new Error(`${shiftId} is too soon to swap`);
        if (this.swaps.some((w) => w.shiftId === shiftId && w.toStaffId === toStaffId && w.status === "pending")) {
            throw new Error(`${toStaffId} has been asked about ${shiftId} already`);
        }
        this.swapsMade += 1;
        const swap: SwapRequest = {
            id: `w${this.swapsMade}`,
            shiftId,
            fromStaffId: shift.staffId,
            toStaffId,
            status: "pending",
            askedAt: at,
            decidedAt: NEVER,
        };
        this.swaps.unshift(swap);
        return swap;
    }

    decideSwap(swapId: string, approve: boolean, at: number): SwapRequest {
        const swap = this.swaps.find((w) => w.id === swapId);
        if (!swap) throw new Error(`no swap ${swapId}`);
        if (swap.status !== "pending") throw new Error(`${swapId} is ${swap.status} already`);
        if (approve) {
            const shift = this.need(swap.shiftId);
            if (shift.staffId !== swap.fromStaffId) throw new Error(`${swap.fromStaffId} no longer holds ${shift.id}`);
            const reason = this.whyNot(swap.toStaffId, shift);
            if (reason !== "") throw new Error(reason);
            shift.staffId = swap.toStaffId;
        }
        swap.status = approve ? "approved" : "refused";
        swap.decidedAt = at;
        if (approve) {
            for (const other of this.swaps) {
                if (other === swap || other.shiftId !== swap.shiftId || other.status !== "pending") continue;
                other.status = "refused";
                other.decidedAt = at;
            }
        }
        return swap;
    }

    // Every request the person asked or was asked.
    swapsFor(staffId: string): SwapRequest[] {
        return this.swaps.filter((w) => w.fromStaffId === staffId || w.toStaffId === staffId);
    }

    pendingSwaps(): SwapRequest[] {
        // The office works through them in the order they were asked.
        return this.swaps.filter((w) => w.status === "pending").reverse();
    }

    // Refuses each pending request whose shift now starts in less than the notice, and says how many.
    lapseSwaps(at: number): number {
        let lapsed = 0;
        for (const swap of this.swaps) {
            const shift = this.shift(swap.shiftId);
            if (swap.status !== "pending" || !shift || spanOf(shift)[0] - at >= SWAP_NOTICE) continue;
            swap.status = "refused";
            swap.decidedAt = at;
            lapsed += 1;
        }
        return lapsed;
    }

    restBreaches(staffId: string): RestBreach[] {
        const mine = this.shiftsFor(staffId);
        const breaches: RestBreach[] = [];
        for (let i = 1; i < mine.length; i += 1) {
            const earlier = mine[i - 1];
            const later = mine[i];
            if (earlier.day === later.day) continue;
            const rest = restBetween(earlier, later);
            if (rest < MIN_REST) breaches.push({ staffId, earlierId: earlier.id, laterId: later.id, rest });
        }
        return breaches;
    }

    // The run of days worked that ends on `day`. A night shift counts for the day it starts on.
    daysRunning(staffId: string, day: number): number {
        const days = new Set(this.shifts.filter((s) => s.staffId === staffId).map((s) => s.day));
        let run = 0;
        while (days.has(day - run)) run += 1;
        return run;
    }

    minutesInWeek(staffId: string, day: number): number {
        const from = weekStart(day);
        let total = 0;
        for (const shift of this.shifts) {
            if (shift.staffId !== staffId || shift.day < from || shift.day >= from + 7) continue;
            total += paidMinutes(shift);
        }
        return total;
    }

    overContract(staffId: string, day: number): number {
        const person = this.staff.get(staffId);
        if (!person) return 0;
        return Math.max(0, this.minutesInWeek(staffId, day) - person.contractMinutes);
    }

    costOn(day: number): number {
        let pence = 0;
        for (const shift of this.shifts) {
            if (shift.day !== day) continue;
            const person = this.staff.get(shift.staffId);
            if (person) pence += shiftPayPence(shift, person.ratePence);
        }
        return pence;
    }

    gapsOn(day: number): Gap[] {
        return coverGaps(this.shifts, day);
    }

    isCovered(day: number): boolean {
        return this.gapsOn(day).length === 0;
    }

    // The rota file: one line for each shift, earliest first.
    toLines(): string[] {
        return sortShifts([...this.shifts]).map(formatShift);
    }

    // Takes shifts from lines of the rota file as they stand. The file is what the office kept, so no rule
    // is checked. New shifts are numbered on from the highest number read.
    load(lines: string[]): number {
        let read = 0;
        for (const line of lines) {
            if (line.trim() === "" || line.startsWith("#")) continue;
            const shift = parseShift(line);
            if (this.shift(shift.id)) throw new Error(`${shift.id} is on the rota already`);
            if (shift.staffId !== OPEN && !this.staff.has(shift.staffId)) {
                throw new Error(`nobody is called ${shift.staffId}`);
            }
            this.shifts.push(shift);
            this.shiftsMade = Math.max(this.shiftsMade, idNumber(shift.id));
            read += 1;
        }
        return read;
    }

    private need(shiftId: string): Shift {
        const shift = this.shift(shiftId);
        if (!shift) throw new Error(`no shift ${shiftId}`);
        return shift;
    }
}

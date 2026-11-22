I'm working on a small app in /home/dev/ac0805/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Open shifts in a run of days

I need one more method on the `Rota` class in `src/rota.ts`:

```ts
openShifts(fromDay: number, toDay: number, role?: Role): Shift[]
```

I want it to return the shifts that nobody holds and that are on a day from `fromDay` up to `toDay`. `fromDay` itself counts and `toDay` does not. A shift that nobody holds has `OPEN` as its `staffId`, and the day a shift is on is its `day`. When I give a `role`, I want only the shifts of that role. The result should be in order of `day`, and within one day in order of `start`.

The method must change nothing in the rota. Please leave the rest of the file as it is.

Please keep every change inside /home/dev/ac0805/app.

You cannot open files or run anything from where you are. Here is what you have of app/src/rota.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/rota.ts
  4: export type Role = "hand" | "fitter" | "office" | "lock";
  6: export type SwapStatus = "pending" | "approved" | "refused";
  8: export interface Staff {
  9:   id: string
 10:   name: string
 11:   roles: Role[]
 13:   ratePence: number
 15:   contractMinutes: number
 18: export interface Shift {
 19:   id: string
 21:   staffId: string
 23:   day: number
 24:   start: number
 25:   end: number
 26:   role: Role
 29: export interface Leave {
 30:   staffId: string
 31:   firstDay: number
 32:   lastDay: number
 35: export interface SwapRequest {
 36:   id: string
 37:   shiftId: string
 38:   fromStaffId: string
 39:   toStaffId: string
 40:   status: SwapStatus
 41:   askedAt: number
 42:   decidedAt: number
 45: export interface CoverNeed {
 46:   role: Role
 47:   from: number
 48:   to: number
 49:   count: number
 52: export interface Gap {
 53:   role: Role
 54:   from: number
 55:   to: number
 56:   short: number
 59: export interface RestBreach {
 60:   staffId: string
 61:   earlierId: string
 62:   laterId: string
 63:   rest: number
 66: export const OPEN = "";
 67: export const NEVER = -1;
 68: export const DAY_MINUTES = 24 * 60;
 69: export const MIN_REST = 11 * 60;
 70: export const MAX_DAYS_RUNNING = 6;
 71: export const SWAP_NOTICE = 48 * 60;
 73: BREAK_AFTER = 6 * 60
 74: BREAK_MINUTES = 30
 76: SLOT = 30
 77: ROLES: Role[] = ["hand", "fitter", "office", "lock"]
 79: WORKING_DAY: CoverNeed[] = [
 86: TURNAROUND_DAY: CoverNeed[] = [
 93: QUIET_DAY: CoverNeed[] = [
 98: COVER: CoverNeed[][] = [
108: function pad2(n: number): string {
112: function idNumber(id: string): number {
116: function byStart(a: Shift, b: Shift): number {
120: export function minutesOf(clock: string): number {
130: export function clockOf(minutes: number): string {
136: export function weekdayOf(day: number): number {
141: export function weekStart(day: number): number {
145: export function shiftLength(shift: Shift): number {
152: export function spanOf(shift: Shift): [number, number] {
157: export function overlaps(a: Shift, b: Shift): boolean {
163: export function restBetween(earlier: Shift, later: Shift): number {
167: export function paidMinutes(shift: Shift): number {
173: export function shiftPayPence(shift: Shift, ratePence: number): number {
177: export function sortShifts(shifts: Shift[]): Shift[] {
182: export function coverNeeds(day: number): CoverNeed[] {
187: export function countOn(shifts: Shift[], role: Role, day: number, minute: number): number {
198: export function coverGaps(shifts: Shift[], day: number): Gap[] {
217: export function formatShift(shift: Shift): string {
222: export function parseShift(line: string): Shift {
238: export class Rota {
239:   private staff = new Map<string, Staff>()
240:   private shifts: Shift[] = []
241:   private leave: Leave[] = []
243:   private swaps: SwapRequest[] = []
244:   private shiftsMade = 0
245:   private swapsMade = 0
247:   addStaff(person: Staff): void {
253:   person(staffId: string): Staff | undefined {
257:   addLeave(staffId: string, firstDay: number, lastDay: number): void {
265:   onLeave(staffId: string, day: number): boolean {
269:   addShift(day: number, start: number, end: number, role: Role, staffId: string = OPEN): Shift {
286:   removeShift(shiftId: string): boolean {
296:   moveShift(shiftId: string, day: number, start: number, end: number): Shift {
304:   shift(shiftId: string): Shift | undefined {
308:   shiftsOn(day: number): Shift[] {
312:   shiftsFor(staffId: string): Shift[] {
317:   whyNot(staffId: string, shift: Shift): string {
343:   assign(shiftId: string, staffId: string): Shift {
351:   release(shiftId: string): Shift {
358:   requestSwap(shiftId: string, toStaffId: string, at: number): SwapRequest {
381:   decideSwap(swapId: string, approve: boolean, at: number): SwapRequest {
398:   swapsFor(staffId: string): SwapRequest[] {
402:   pendingSwaps(): SwapRequest[] {
408:   lapseSwaps(at: number): number {
420:   restBreaches(staffId: string): RestBreach[] {
434:   daysRunning(staffId: string, day: number): number {
441:   minutesInWeek(staffId: string, day: number): number {
451:   overContract(staffId: string, day: number): number {
457:   costOn(day: number): number {
467:   gapsOn(day: number): Gap[] {
471:   isCovered(day: number): boolean {
476:   toLines(): string[] {
482:   load(lines: string[]): number {
498:   private need(shiftId: string): Shift {
```

Lines 66 to 66 of the file, as they are:

```ts
export const OPEN = "";
```

Lines 238 to 503 of the file, as they are:

```ts
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
        const others = this.shifts.filter((s) => s.staffId === staffId && s.id !== shift.id);
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
```

Reply with your change as edits. Each edit is a line 'EDIT: app/<path>' followed by one fenced block of this form:

```
<<<<<<< SEARCH
text that is in the file now, copied exactly
=======
the text to put in its place
>>>>>>> REPLACE
```

The SEARCH text must be found in the file exactly once, or that edit is refused. The edits are applied in the order you give them. An edit with nothing between SEARCH and ======= adds its text at the end of the file. To write a whole file instead, give a line 'FILE: app/<path>' followed by its whole content in one fenced block. After the edits, tell me in a sentence or two what you did, and say if there was anything you were not sure of.

I'm working on a small app in /home/dev/520844/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# A Sunday allowance on a shift's pay

I want to change `shiftPayPence` in `src/rota.ts`. We now pay an allowance of 1,250 pence for a shift that starts on a Sunday, on top of what the shift pays today. The allowance is the same whatever the shift's length and whatever the rate, and I want it added after the pay has been rounded. A night shift that starts on a Saturday and ends on the Sunday morning gets no allowance. One that starts on a Sunday and ends on the Monday morning gets it. A shift that starts on any other day must pay exactly what it pays today.

Please keep every change inside /home/dev/520844/app.

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

Lines 173 to 175 of the file, as they are:

```ts
export function shiftPayPence(shift: Shift, ratePence: number): number {
    return Math.round((paidMinutes(shift) * ratePence) / 60);
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

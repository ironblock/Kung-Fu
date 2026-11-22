I'm working on a small app in /home/dev/60f43b/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# What is still owed on a boat

In `src/bookings.ts`, add a method to the BookingBook class:

```ts
outstanding(boatId: string): Pence
```

It returns how much money is still owed on one boat. Go over every booking in the book that is for that boat and whose state is "held" or "confirmed". Each one adds its charge less what has been paid on it. A booking that is paid in full adds nothing, and one that is overpaid adds nothing either: it must not bring the sum down. Bookings in any other state are left out.

A boat with no such bookings gives 0, and so does a boat id the book does not know. The method changes nothing in the book.

Please keep every change inside /home/dev/60f43b/app.

You cannot open files or run anything from where you are. Here is what you have of app/src/bookings.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/bookings.ts
  5: export type Pence = number;
  8: export type Day = number;
 11: export type Stamp = number;
 13: export type BoatClass = "narrow" | "wide" | "cruiser";
 15: export type BookingState = "held" | "confirmed" | "cancelled" | "lapsed";
 17: export interface Boat {
 18:   id: string
 19:   name: string
 20:   boatClass: BoatClass
 21:   berths: number
 24: export interface BookingRequest {
 25:   boatId: string
 26:   party: string
 27:   partySize: number
 28:   fromDay: Day
 29:   toDay: Day
 32: export interface Booking {
 33:   id: string
 34:   boatId: string
 35:   party: string
 36:   partySize: number
 38:   fromDay: Day
 39:   toDay: Day
 40:   state: BookingState
 41:   placedAt: Stamp
 43:   lapsesAt: Stamp
 45:   confirmedAt: Stamp
 46:   closedAt: Stamp
 47:   chargePence: Pence
 48:   depositPence: Pence
 49:   paidPence: Pence
 51:   notes: string[]
 54: export interface WaitEntry {
 55:   boatId: string
 56:   party: string
 57:   partySize: number
 58:   fromDay: Day
 59:   toDay: Day
 60:   joinedAt: Stamp
 63: export type PlaceResult = { ok: true; booking: Booking } | { ok: false; problems: string[] };
 65: export type ConfirmOutcome = "confirmed" | "unknown" | "not-held" | "lapsed" | "underpaid";
 67: export type EventKind = "placed" | "confirmed" | "paid" | "moved" | "cancelled" | "lapsed";
 69: export interface BookEvent {
 70:   at: Stamp
 71:   bookingId: string
 72:   kind: EventKind
 74:   pence: Pence
 77: export interface Quote {
 78:   nights: number
 79:   chargePence: Pence
 80:   depositPence: Pence
 81:   balancePence: Pence
 82:   balanceDueDay: Day
 85: export interface WeekTotals {
 86:   weekStart: Day
 87:   nightsSold: number
 88:   nightsOpen: number
 89:   chargePence: Pence
 90:   paidPence: Pence
 93: export const MINUTES_PER_DAY = 1440;
 96: export const NEVER: Stamp = -1;
 98: HOLD_MINUTES = 48 * 60
 99: SHORT_HOLD_MINUTES = 4 * 60
100: SHORT_HOLD_DAYS = 7
102: MIN_NIGHTS = 3
103: LONG_HIRE_NIGHTS = 7
104: MIN_DEPOSIT: Pence = 10000
105: BERTH_EXTRA: Pence = 350
106: BALANCE_DUE_DAYS = 28
107: NAME_WIDTH = 12
109: NIGHT_RATES: Record<BoatClass, Pence> = {
115: WEEKEND_EXTRA: Record<BoatClass, Pence> = {
121: MAX_NIGHTS: Record<BoatClass, number> = {
128: START_WEEKDAYS: readonly number[] = [0, 2, 6]
130: WEEKDAYS: readonly string[] = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"]
132: REFUND_STEPS: readonly (readonly [number, number])[] = [
138: function pad2(n: number): string {
142: function groupThousands(n: number): string {
146: function weekdayIndex(day: Day): number {
150: function isWeekendNight(day: Day): boolean {
156: export function stampOf(day: Day, minute: number): Stamp {
160: export function dayOf(stamp: Stamp): Day {
164: export function minuteOf(stamp: Stamp): number {
168: export function weekdayName(day: Day): string {
173: export function formatDay(day: Day): string {
177: export function formatStamp(stamp: Stamp): string {
185: export function formatPence(pence: Pence): string {
191: export function nightsOf(span: { fromDay: Day; toDay: Day }): number {
196: export function isLive(b: Booking): boolean {
200: export function daysOverlap(aFrom: Day, aTo: Day, bFrom: Day, bTo: Day): boolean {
206: export function validateRequest(req: BookingRequest, boat: Boat): string[] {
233: export function hireCharge(boat: Boat, fromDay: Day, toDay: Day): Pence {
249: export function depositFor(chargePence: Pence): Pence {
256: export function refundShare(noticeDays: number): number {
267: export function holdLength(placedAt: Stamp, fromDay: Day): number {
272: export function hasLapsed(b: Booking, now: Stamp): boolean {
277: export function sortForDiary(list: Booking[]): Booking[] {
291: export function quoteFor(boat: Boat, fromDay: Day, toDay: Day): Quote {
307: export function parseRequestLine(line: string): BookingRequest | undefined {
321: export function refundTerms(b: Booking, today: Day): string {
332: export class BookingBook {
333:   private boats = new Map<string, Boat>()
335:   private bookings: Booking[] = []
337:   private waiting: WaitEntry[] = []
339:   private log: BookEvent[] = []
340:   private nextNumber = 1
342:   constructor(boats: Boat[]) {
348:   get size(): number {
352:   private record(kind: EventKind, b: Booking, at: Stamp, pence: Pence = 0): void {
357:   all(): Booking[] {
361:   find(id: string): Booking | undefined {
365:   forBoat(boatId: string): Booking[] {
370:   isFree(boatId: string, fromDay: Day, toDay: Day, exceptId = ""): boolean {
381:   place(req: BookingRequest, at: Stamp): PlaceResult {
421:   confirm(id: string, paidPence: Pence, at: Stamp): ConfirmOutcome {
448:   takePayment(id: string, pence: Pence, at: Stamp): Pence {
460:   cancel(id: string, at: Stamp): Pence {
476:   lapse(now: Stamp): string[] {
491:   move(id: string, fromDay: Day, at: Stamp): string[] {
519:   changeBoat(id: string, boatId: string, at: Stamp): string[] {
547:   addNote(id: string, text: string): boolean {
558:   joinWaiting(entry: WaitEntry): number {
571:   leaveWaiting(boatId: string, party: string): boolean {
580:   waitingFor(boatId: string): WaitEntry[] {
585:   nextInLine(boatId: string, fromDay: Day, toDay: Day): WaitEntry | undefined {
593:   promote(boatId: string, fromDay: Day, toDay: Day, at: Stamp): Booking | undefined {
610:   history(bookingId = ""): BookEvent[] {
615:   takings(fromAt: Stamp, toAt: Stamp): Pence {
628: export function occupancy(bookings: Booking[], boatId: string, fromDay: Day, toDay: Day): number {
639: function byBoat(a: Booking, b: Booking): number {
644: export function arrivalsOn(bookings: Booking[], day: Day): Booking[] {
649: export function returnsOn(bookings: Booking[], day: Day): Booking[] {
654: export function turnaroundsOn(bookings: Booking[], day: Day): string[] {
662: export function freeGaps(bookings: Booking[], boatId: string, fromDay: Day, toDay: Day): [Day, Day][] {
685: export function owedLines(bookings: Booking[], today: Day): string[] {
700: export function lengthBands(bookings: Booking[]): { short: number; week: number; long: number } {
718: export function stateCounts(bookings: Booking[]): Record<BookingState, number> {
726: export function diaryLine(b: Booking): string {
733: export function weekStrip(bookings: Booking[], boatId: string, weekStart: Day): string {
742: export function weekTotals(bookings: Booking[], boats: Boat[], weekStart: Day): WeekTotals {
760: export function weekSheet(bookings: Booking[], boats: Boat[], weekStart: Day): string[] {
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

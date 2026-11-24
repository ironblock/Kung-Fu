I'm working on a small app in /home/dev/1d3b8d/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# One bill line a day

A boat that fills up twice in one day gets two lines on its fuel bill, and each line is rounded up to the penny on its own. I want `boatBill` in `src/fuel.ts` changed so that the bill has one line for each day the boat drew. A day's line has the sum of that day's draws as its volume, and its pence is charged once, on that sum, at the day's price. The lines are in day order, earliest day first, whatever order the draws were entered in. The bill's volume and its total are the sums over its lines, as they are now. Nothing else about a bill changes: it covers the same days, it holds only that boat's draws, and a day with no price is refused as it is now.

Please keep every change inside /home/dev/1d3b8d/app.

You cannot open files or run anything from where you are. Here is what you have of app/src/fuel.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/fuel.ts
  6: export type EntryKind = "delivery" | "draw" | "adjust";
  8: export type Verdict = "ok" | "short" | "over";
 10: export interface Tank {
 11:   capacity: number
 13:   calibration: Array<[number, number]>
 16: export interface Entry {
 17:   kind: EntryKind
 18:   day: number
 19:   minute: number
 21:   boat: string
 23:   volume: number
 26: export interface Ledger {
 27:   tank: Tank
 28:   openedDay: number
 29:   opening: number
 30:   entries: Entry[]
 33: export interface DipReading {
 34:   day: number
 35:   minute: number
 36:   depth: number
 39: export interface Reconciliation {
 40:   book: number
 41:   dipped: number
 42:   gap: number
 43:   verdict: Verdict
 44:   note: string
 47: export interface PricePoint {
 48:   fromDay: number
 49:   price: number
 52: export interface BillLine {
 53:   day: number
 54:   volume: number
 55:   price: number
 56:   pence: number
 59: export interface Bill {
 60:   boat: string
 61:   lines: BillLine[]
 62:   volume: number
 63:   total: number
 66: export const YARD = "";
 68: export const NO_PRICE = 0;
 70: export const NO_COVER = -1;
 73: MIN_TOLERANCE = 50
 74: TOLERANCE_PER_MILLE = 4
 76: KIND_WORDS: Record<EntryKind, string> = {
 82: VERDICT_NOTES: Record<Verdict, string> = {
 88: function mustBeVolume(volume: number, what: string): void {
 94: function signed(entry: Entry): number {
 98: function clock(minute: number): string {
103: export function openLedger(tank: Tank, day: number, opening: number): Ledger {
110: export function post(ledger: Ledger, entry: Entry): void {
118: export function stock(ledger: Ledger): number {
127: export function stockAt(ledger: Ledger, day: number, minute: number): number {
137: export function recordDelivery(ledger: Ledger, day: number, minute: number, volume: number): Entry {
148: export function recordDraw(ledger: Ledger, boat: string, day: number, minute: number, volume: number): Entry {
156: export function drawsOf(ledger: Ledger, boat: string): Entry[] {
160: export function drawnBetween(ledger: Ledger, boat: string, fromDay: number, toDay: number): number {
170: export function dipVolume(tank: Tank, depth: number): number {
187: export function reconcile(ledger: Ledger, reading: DipReading): Reconciliation {
203: export function settle(ledger: Ledger, reading: DipReading): number {
213: export function priceOn(prices: PricePoint[], day: number): number {
226: export function withPrice(prices: PricePoint[], point: PricePoint): PricePoint[] {
232: export function chargeFor(volume: number, price: number): number {
237: export function boatBill(ledger: Ledger, prices: PricePoint[], boat: string, fromDay: number, toDay: number): Bill {
258: export function daysOfCover(ledger: Ledger, day: number, span: number): number {
272: export function formatVolume(volume: number): string {
277: export function formatPence(pence: number): string {
282: export function describeEntry(entry: Entry): string {
291: export function recentLines(ledger: Ledger, count: number): string[] {
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

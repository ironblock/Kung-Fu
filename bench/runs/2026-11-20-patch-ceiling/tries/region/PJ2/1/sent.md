I'm working on a small app in /home/dev/6c15de/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Lost keys and damaged lifejackets

Two rules at the desk have changed, and `gearCharge` in `src/keys.ts` must follow them.

When boat keys are lost we change the lock, and one change of lock covers every key. So a loan with any boat keys missing is charged the cost of one boat key for them, however many are missing. A loan with no boat key missing is charged nothing for missing keys, as now.

A damaged lifejacket cannot be lent again. So each damaged lifejacket is charged the full cost of a lifejacket, in place of the charge it gets now.

Everything else is charged as it is now: missing gear of the other kinds, each missing lifejacket, damaged gear of the other kinds, and each damaged boat key. The function still changes nothing in the loan.

Please keep every change inside /home/dev/6c15de/app.

You cannot open files or run anything from where you are. Here is what you have of app/src/keys.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/keys.ts
  4: export type GearKind = "boatKey" | "windlass" | "lifejacket" | "mooringPin" | "mallet" | "waterKey";
  6: export type JacketSize = "infant" | "child" | "junior" | "adult" | "large";
  8: export interface GearLine {
  9:   kind: GearKind
 10:   issued: number
 11:   back: number
 13:   damaged: number
 16: export interface LogEntry {
 17:   action: "out" | "back"
 18:   kind: GearKind
 19:   count: number
 20:   day: number
 21:   minute: number
 24: export interface Loan {
 25:   bookingRef: string
 26:   boat: string
 27:   dueDay: number
 28:   depositPence: number
 29:   keyTag: number
 30:   settledDay: number
 31:   lines: GearLine[]
 32:   log: LogEntry[]
 35: export interface Settlement {
 36:   gearPence: number
 37:   latePence: number
 38:   keptPence: number
 39:   refundPence: number
 40:   owedPence: number
 43: export const ALL_KINDS: GearKind[] = ["boatKey", "windlass", "lifejacket", "mooringPin", "mallet", "waterKey"];
 46: export const REPLACEMENT_PENCE: Record<GearKind, number> = {
 56: export const RETURN_BY_MINUTE = 10 * 60;
 57: export const LATE_DAY_PENCE = 2500;
 58: LATE_DAYS_CAP = 3
 59: LOG_KEEP = 40
 62: JACKET_LIMITS: [number, JacketSize][] = [
 70: DEPOSIT_STEPS: [number, number][] = [
 74: DEPOSIT_TOP = 10000
 76: export function openLoan(bookingRef: string, boat: string, dueDay: number, depositPence: number): Loan {
 90: export function isOpen(loan: Loan): boolean {
 94: function lineFor(loan: Loan, kind: GearKind): GearLine {
104: function record(loan: Loan, entry: LogEntry): void {
109: export function issue(loan: Loan, kind: GearKind, count: number, day: number, minute: number): void {
116: export function issueKeys(loan: Loan, tag: number, count: number, day: number, minute: number): boolean {
124: export function takeBack(loan: Loan, kind: GearKind, count: number, day: number, minute: number, damaged = 0): number {
137: export function outstanding(loan: Loan, kind?: GearKind): number {
145: export function gearCharge(loan: Loan): number {
157: export function lateDays(loan: Loan, day: number, minute: number): number {
162: export function lateFee(loan: Loan, day: number, minute: number): number {
167: export function settle(loan: Loan, day: number, minute: number): Settlement {
181: export function jacketSize(weightKg: number): JacketSize {
188: export function depositFor(berths: number): number {
196: export function standardKit(berths: number): GearLine[] {
207: export function issueKit(loan: Loan, berths: number, day: number, minute: number): void {
212: export function keyHolder(loans: Loan[], tag: number): Loan | undefined {
218: export function overdueLoans(loans: Loan[], day: number, minute: number): Loan[] {
224: export function formatPence(pence: number): string {
231: export function summary(loan: Loan): string {
241: export function receiptLines(loan: Loan, settlement: Settlement): string[] {
```

Lines 145 to 154 of the file, as they are:

```ts
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

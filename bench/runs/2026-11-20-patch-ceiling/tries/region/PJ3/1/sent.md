I'm working on a small app in /home/dev/d6865c/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# A return entered twice

At the desk a return is sometimes entered twice by mistake, and the second entry takes back gear that is still out with the party. Please change `takeBack` in `src/keys.ts` so that it ignores a repeat.

A call is a repeat when the entry most recently added to the loan's log is itself a return of the same kind, on the same day and at the same minute as the call. The counts do not have to match. A repeat takes nothing back: it gives 0 and changes nothing in the loan, its log included.

Only that one entry is looked at. If anything else has been logged since the matching return, the call is not a repeat. When the log is empty, no call is a repeat. A call that is not a repeat does exactly what it does now.

Please keep every change inside /home/dev/d6865c/app.

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

Lines 123 to 135 of the file, as they are:

```ts
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

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

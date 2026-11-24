I'm working on a small app in /home/dev/0a7ad0/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Show each payment on an invoice's statement

`Invoice.statementLines` in `src/invoices.ts` shows only the sum that has been paid. Hirers ring me to ask which of their payments have reached us.

Please make it show one line for each payment, directly above the "Paid" line. The lines go in the order in which the payments were recorded: the payment recorded first is the top one, whatever days the payments carry.

A payment's line is two spaces, then the word Payment, the day, the amount and the method, with two spaces between each of those four. The day and the amount are printed as the statement prints its other days and amounts. For example:

```
  Payment  2026-03-09  £250.00  card
```

An invoice with no payment gets no such line. Nothing else about the statement changes.

Please keep every change inside /home/dev/0a7ad0/app.

You cannot open files or run anything from where you are. Here is what you have of app/src/invoices.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/invoices.ts
  4: export type Pence = number;
  5: export type Day = number;
  8: export const NO_DAY: Day = -1;
 10: export const DEFAULT_TERMS_DAYS = 14;
 11: export const MAX_LINES = 40;
 12: export const FIRST_NUMBER = 1001;
 14: export type LineKind = "hire" | "mooring" | "fuel" | "pumpout" | "damage" | "sundry";
 15: export type TaxBand = "standard" | "reduced" | "exempt";
 16: export type PayMethod = "card" | "transfer" | "cash" | "cheque";
 17: export type InvoiceStatus = "draft" | "open" | "part-paid" | "paid" | "void";
 18: export type ReminderLevel = "none" | "nudge" | "firm" | "final";
 20: export interface InvoiceLine {
 21:   kind: LineKind
 22:   label: string
 24:   qty: number
 26:   unitPence: Pence
 29: export interface Payment {
 30:   day: Day
 31:   pence: Pence
 32:   method: PayMethod
 33:   ref: string
 36: export interface CreditNote {
 37:   id: string
 38:   day: Day
 40:   pence: Pence
 41:   reason: string
 44: export interface TaxRow {
 45:   band: TaxBand
 46:   netPence: Pence
 47:   taxPence: Pence
 50: export interface Totals {
 51:   netPence: Pence
 52:   taxPence: Pence
 53:   grossPence: Pence
 56: export interface AgeingRow {
 57:   notDue: Pence
 58:   to30: Pence
 59:   to60: Pence
 60:   older: Pence
 63: export interface AccountSummary {
 64:   hirer: string
 65:   count: number
 66:   billedPence: Pence
 67:   paidPence: Pence
 68:   creditedPence: Pence
 69:   owedPence: Pence
 70:   overduePence: Pence
 72:   oldestDueDay: Day
 73:   lastPaidDay: Day
 76: BAND_OF: Record<LineKind, TaxBand> = {
 86: BAND_RATE: Record<TaxBand, number> = {
 92: BAND_ORDER: TaxBand[] = ["standard", "reduced", "exempt"]
 95: KIND_ORDER: LineKind[] = ["hire", "mooring", "fuel", "pumpout", "damage", "sundry"]
 97: KIND_LABEL: Record<LineKind, string> = {
106: LATE_FEE_FLAT: Pence = 1500
107: LATE_FEE_RATE = 15
108: GRACE_DAYS = 7
111: REMINDER_FROM: [number, ReminderLevel][] = [
118: EPOCH_SHIFT = 10957
120: function pad2(n: number): string {
124: function withCommas(whole: number): string {
134: function sum(values: number[]): number {
140: function sameHirer(a: string, b: string): boolean {
145: function weekday(day: Day): number {
149: function offWeekend(day: Day): Day {
156: function hundredths(text: string): number {
163: function formatQty(qty: number): string {
169: export function formatPence(pence: Pence): string {
176: export function parsePence(text: string): Pence {
181: export function parseLine(text: string): InvoiceLine | null {
192: export function dayOf(year: number, month: number, date: number): Day {
201: export function isoDay(day: Day): string {
217: export function dayOfIso(text: string): Day {
226: export function taxRate(kind: LineKind): number {
230: export function lineNet(line: InvoiceLine): Pence {
235: export function taxSummary(lines: InvoiceLine[]): TaxRow[] {
252: export function totalsOf(lines: InvoiceLine[]): Totals {
260: export function taxWithin(grossPence: Pence, kind: LineKind): Pence {
266: export function describeLine(line: InvoiceLine): string {
272: export function sortLines(lines: InvoiceLine[]): InvoiceLine[] {
281: export function mergeLines(lines: InvoiceLine[]): InvoiceLine[] {
291: export function lateFee(owedPence: Pence, daysLate: number): Pence {
299: export function instalments(totalPence: Pence, parts: number): Pence[] {
307: export function reminderLevel(daysLate: number): ReminderLevel {
314: export class Invoice {
315:   readonly number: number
316:   readonly hirer: string
317:   readonly termsDays: number
318:   private lines: InvoiceLine[] = []
319:   private payments: Payment[] = []
320:   private credits: CreditNote[] = []
321:   private issuedOn: Day = NO_DAY
322:   private voided = false
324:   constructor(number: number, hirer: string, termsDays: number = DEFAULT_TERMS_DAYS) {
333:   addLine(line: InvoiceLine): number {
343:   removeLine(index: number): boolean {
350:   lineList(): InvoiceLine[] {
354:   issue(day: Day): void {
363:   issuedDay(): Day {
367:   dueDay(): Day {
372:   totals(): Totals {
380:   pay(day: Day, pence: Pence, method: PayMethod = "transfer", ref: string = ""): Pence {
391:   paymentList(): Payment[] {
395:   lastPaymentDay(): Day {
400:   credit(day: Day, pence: Pence, reason: string): CreditNote {
410:   creditList(): CreditNote[] {
414:   paidPence(): Pence {
418:   creditedPence(): Pence {
422:   owedPence(): Pence {
428:   status(): InvoiceStatus {
435:   daysLate(today: Day): number {
441:   isOverdue(today: Day): boolean {
446:   cancel(): boolean {
452:   statementLines(today: Day): string[] {
472:   private mustBeDraft(doing: string): void {
477:   private mustBeLive(doing: string): void {
483: export function nextNumber(invoices: Invoice[]): number {
489: export function invoicesOf(hirer: string, invoices: Invoice[]): Invoice[] {
497: export function owedBy(hirer: string, invoices: Invoice[]): Pence {
502: export function overdue(invoices: Invoice[], today: Day): Invoice[] {
508: export function ageing(invoices: Invoice[], today: Day): AgeingRow {
526: export function allocate(invoices: Invoice[], day: Day, pence: Pence, method?: PayMethod, ref?: string): Pence {
538: export function accountSummary(hirer: string, invoices: Invoice[], today: Day): AccountSummary {
567: export function reminderText(invoice: Invoice, today: Day): string {
578: export function statement(hirer: string, invoices: Invoice[], today: Day): string {
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

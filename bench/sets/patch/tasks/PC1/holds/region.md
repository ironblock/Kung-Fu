You cannot open files or run anything from where you are. Here is what you have of app/src/tariff.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/tariff.ts
  4: export type BoatClass = "narrow" | "wide" | "cruiser" | "heritage";
  6: export type SeasonName = "low" | "mid" | "high";
  8: export type PaymentKind = "deposit" | "balance" | "refund";
 10: export interface Season {
 11:   name: SeasonName
 12:   fromDay: number
 13:   toDay: number
 16: export interface Hire {
 17:   boatClass: BoatClass
 18:   startDay: number
 19:   nights: number
 20:   pets: number
 23: export interface QuoteLine {
 24:   label: string
 25:   pence: number
 28: export interface Quote {
 29:   lines: QuoteLine[]
 30:   totalPence: number
 31:   bondPence: number
 34: export interface Payment {
 35:   day: number
 36:   pence: number
 37:   kind: PaymentKind
 40: interface RateBand {
 41:   minNights: number
 42:   rate: number
 45: interface RefundStep {
 46:   minDaysBefore: number
 47:   rate: number
 50: interface DepositTerms {
 51:   rate: number
 52:   floorPence: number
 55: export const DAYS_IN_YEAR = 365;
 57: export const BOAT_CLASSES: readonly BoatClass[] = ["narrow", "wide", "cruiser", "heritage"];
 59: SEASON_NAMES: readonly SeasonName[] = ["low", "mid", "high"]
 62: export const SEASONS: readonly Season[] = [
 69: NIGHTLY_PENCE: Record<BoatClass, Record<SeasonName, number>> = {
 77: BOND_PENCE: Record<BoatClass, number> = {
 85: LONG_HIRE_BANDS: readonly RateBand[] = [
 93: REFUND_STEPS: readonly RefundStep[] = [
 99: DEPOSIT: DepositTerms = {
104: DISCOUNT_CAP_PENCE = 50000
105: ADMIN_FEE_PENCE = 2500
106: MIN_REFUND_PENCE = 500
107: PET_NIGHT_PENCE = 600
108: PET_NIGHTS_CHARGED = 7
110: function wrapDay(day: number): number {
115: function daysUntil(fromDay: number, toDay: number): number {
120: function inSeason(season: Season, day: number): boolean {
127: export function seasonOn(day: number): SeasonName {
137: export function nightlyRate(boatClass: BoatClass, day: number): number {
142: export function nightsBySeason(startDay: number, nights: number): Record<SeasonName, number> {
150: function share(pence: number, rate: number): number {
157: export function longHireRate(nights: number): number {
166: export function petSupplement(pets: number, nights: number): number {
171: export function formatPence(pence: number): string {
178: export function quoteHire(hire: Hire): Quote {
212: export function addExtra(quote: Quote, label: string, pence: number): number {
220: export function quoteText(quote: Quote): string[] {
230: export function depositDue(quote: Quote): number {
237: export function recordPayment(ledger: Payment[], payment: Payment): number {
244: export function paidSoFar(ledger: readonly Payment[]): number {
253: export function lastPayment(ledger: readonly Payment[], kind?: PaymentKind): Payment | undefined {
259: export function securedOn(ledger: readonly Payment[]): number {
269: export function balanceDue(quote: Quote, ledger: readonly Payment[]): number {
273: export function refundRate(daysBefore: number): number {
283: export function refundDue(ledger: readonly Payment[], startDay: number, cancelDay: number): number {
```

I'm working on a small app in /home/dev/cd4cfa/app. It is plain TypeScript and uses no library. I need one change to one of its files.

# Charge a very late return more

A boat that comes back hours late costs us the next party's start, and the late charge is too gentle on it. Please change `lateCharge` in `src/handover.ts`.

The first four steps of lateness are charged as they are now. Each step after the fourth is charged at twice the price of a step.

The cap on the whole charge stays as it is, and so does everything else the function does.

Please keep every change inside /home/dev/cd4cfa/app.

You cannot open files or run anything from where you are. Here is what you have of app/src/handover.ts.

Its outline, as `ast-grep outline --view expanded --items all` prints it. Each line is a line number and the first line of a declaration or of one of its members. The rest of the file is not shown.

```
src/handover.ts
  5: export type Side = "out" | "back";
  6: export type Phase = "booked" | "checking" | "out" | "returned" | "closed" | "void";
  7: export type ItemState = "todo" | "ok" | "fault" | "na";
  8: export type Zone = "bow" | "port" | "starboard" | "stern" | "roof" | "cabin";
  9: export type DamageKind = "scratch" | "dent" | "crack" | "burn";
 10: export type EventKind = "opened" | "ticked" | "read" | "damage" | "released" | "returned" | "extra" | "closed" | "void";
 11: export type ChargeCode = "fuel" | "gas" | "late" | "damage" | "cleaning" | "extra";
 13: export interface BoatSpec {
 14:   name: string
 15:   berths: number
 16:   tankLitres: number
 18:   gasBottles: number
 21: export interface ChecklistItem {
 22:   code: string
 23:   label: string
 25:   must: boolean
 26:   state: ItemState
 27:   note: string
 30: export interface Checklist {
 31:   side: Side
 32:   items: ChecklistItem[]
 36: export interface Reading {
 37:   at: number
 39:   fuel: number
 41:   engine: number
 43:   water: number
 45:   gas: number
 48: export interface DamageMark {
 49:   zone: Zone
 50:   kind: DamageKind
 52:   size: number
 53:   note: string
 56: export interface Charge {
 57:   code: ChargeCode
 58:   pence: number
 59:   note: string
 62: export interface Settlement {
 63:   chargedPence: number
 64:   keptPence: number
 65:   refundPence: number
 66:   owedPence: number
 69: export interface TimelineEvent {
 70:   at: number
 71:   kind: EventKind
 72:   by: string
 73:   text: string
 76: export interface StageTimes {
 77:   checkingMin: number
 78:   outMin: number
 79:   closingMin: number
 83: export interface Slot {
 84:   start: number
 85:   end: number
 88: export const DAY_MIN = 1440;
 89: export const NOT_YET = -1;
 90: export const UNREAD = -1;
 92: export const ZONES: readonly Zone[] = ["bow", "port", "starboard", "stern", "roof", "cabin"];
 93: export const CHARGE_ORDER: readonly ChargeCode[] = ["fuel", "gas", "late", "damage", "cleaning", "extra"];
 95: export const FUEL_PENCE_PER_LITRE = 168;
 96: export const GAS_BOTTLE_PENCE = 3950;
 97: export const CLEANING_PENCE = 6000;
 98: export const LATE_GRACE_MIN = 20;
 99: export const LATE_STEP_MIN = 30;
100: export const LATE_STEP_PENCE = 1200;
101: export const LATE_CAP_PENCE = 15000;
102: export const WHARF_OPENS_MIN = 8 * 60 + 30;
103: export const WHARF_SHUTS_MIN = 17 * 60;
105: DAMAGE_TOLERANCE_MM = 10
106: ENGINE_FUEL_RATE = 14
107: BIG_BOAT_BERTHS = 6
108: CABIN_PER_CENT = 150
109: WATER_FULL = 8
110: SLOT_MIN = 40
111: BIG_SLOT_MIN = 60
112: RECEIPT_WIDTH = 30
114: type Seed = [code: string, label: string, must: boolean];
116: OUT_SEEDS: Seed[] = [
126: BACK_SEEDS: Seed[] = [
135: CREW_SEED: Seed = ["CREW", "Second steerer named and shown the controls", true]
138: DAMAGE_STEPS: Record<DamageKind, [number, number][]> = {
145: function pad2(n: number): string {
149: function tenths(n: number): string {
153: export function stamp(day: number, minute: number): number {
157: export function dayOf(at: number): number {
161: export function minuteOf(at: number): number {
165: function clock(at: number): string {
170: export function formatStamp(at: number): string {
175: export function formatPence(pence: number): string {
181: export function formatLitres(fuel: number): string {
185: export function formatHours(engine: number): string {
191: export function checklistFor(side: Side, berths: number): Checklist {
203: export function tick(list: Checklist, code: string, state: ItemState, note: string = ""): boolean {
215: export function outstanding(list: Checklist): ChecklistItem[] {
219: export function isReady(list: Checklist): boolean {
223: export function faults(list: Checklist): ChecklistItem[] {
227: export function faultNotes(list: Checklist): string[] {
231: export function progress(list: Checklist): string {
240: export function blankReading(): Reading {
245: export function readingProblems(reading: Reading, boat: BoatSpec): string[] {
263: export function fuelEighths(reading: Reading, boat: BoatSpec): number {
270: export function fuelUsed(out: Reading, back: Reading): number {
276: export function estimateFuel(out: Reading, back: Reading): number {
284: export function fuelCharge(used: number, pencePerLitre: number = FUEL_PENCE_PER_LITRE): number {
290: export function gasUsed(out: Reading, back: Reading): number {
299: export function lateMinutes(dueAt: number, backAt: number): number {
306: export function lateCharge(lateMin: number): number {
314: export function describeMark(mark: DamageMark): string {
319: export function damageCharge(mark: DamageMark): number {
333: export function sameMark(a: DamageMark, b: DamageMark): boolean {
339: export function newDamage(before: DamageMark[], after: DamageMark[]): DamageMark[] {
357: export function sortMarks(marks: DamageMark[]): DamageMark[] {
361: export function worstMark(marks: DamageMark[]): DamageMark | undefined {
371: export function totalPence(charges: Charge[]): number {
378: export function mergeCharges(charges: Charge[]): Charge[] {
390: export function settle(depositPence: number, charges: Charge[]): Settlement {
401: function leader(label: string, amount: string): string {
407: export function receiptLines(depositPence: number, charges: Charge[]): string[] {
422: export function describeEvent(event: TimelineEvent): string {
428: export function eventsOn(events: TimelineEvent[], day: number): TimelineEvent[] {
433: export function spanOf(events: TimelineEvent[]): number {
446: export function stageTimes(events: TimelineEvent[]): StageTimes {
463: export function slotFor(at: number, berths: number): Slot {
469: export function slotsClash(a: Slot, b: Slot): boolean {
474: export function inWharfHours(slot: Slot): boolean {
481: export function nextFree(taken: Slot[], from: number, length: number): number {
493: export class Handover {
494:   readonly ref: string
495:   readonly boat: BoatSpec
496:   readonly dueOutAt: number
497:   readonly dueBackAt: number
498:   readonly depositPence: number
499:   private state: Phase = "booked"
500:   private lists: Record<Side, Checklist>
501:   private readings: Record<Side, Reading>
502:   private marks: Record<Side, DamageMark[]> = { out: [], back: [] }
503:   private extras: Charge[] = []
505:   private events: TimelineEvent[] = []
506:   private leftAt = NOT_YET
507:   private cameAt = NOT_YET
509:   constructor(ref: string, boat: BoatSpec, dueOutAt: number, dueBackAt: number, depositPence: number) {
519:   get phase(): Phase {
523:   get outAt(): number {
527:   get backAt(): number {
532:   private log(kind: EventKind, at: number, by: string, text: string): void {
537:   private openSide(): Side | undefined {
543:   open(at: number, by: string): boolean {
550:   tick(side: Side, code: string, state: ItemState, at: number, by: string, note: string = ""): boolean {
558:   read(side: Side, reading: Reading, by: string): boolean {
567:   noteDamage(side: Side, mark: DamageMark, at: number, by: string): boolean {
575:   dropDamage(side: Side, index: number, at: number, by: string): boolean {
584:   release(at: number, by: string): boolean {
593:   takeBack(at: number, by: string): boolean {
603:   warnings(): string[] {
619:   addExtra(pence: number, note: string, at: number, by: string): boolean {
628:   cancel(at: number, by: string, reason: string): boolean {
636:   charges(): Charge[] {
669:   close(at: number, by: string): Settlement | undefined {
680:   checklist(side: Side): Checklist {
685:   reading(side: Side): Reading {
689:   damage(side: Side): DamageMark[] {
693:   timeline(): TimelineEvent[] {
697:   lastEvent(kind?: EventKind): TimelineEvent | undefined {
703:   headline(): string {
720:   report(): string[] {
740: export function dueBack(handovers: Handover[], day: number): Handover[] {
747: export function overdue(handovers: Handover[], at: number): Handover[] {
755: export function turnaround(earlier: Handover, later: Handover): number {
762: export function daySheet(handovers: Handover[], day: number): string[] {
777: export class HandoverBook {
778:   private byRef: Map<string, Handover> = new Map()
780:   get size(): number {
785:   add(handover: Handover): boolean {
791:   find(ref: string): Handover | undefined {
796:   remove(ref: string): boolean {
804:   forBoat(name: string): Handover[] {
812:   live(): Handover[] {
817:   private waiting(day: number): Handover[] {
824:   outSlots(day: number): Slot[] {
829:   clashes(day: number): [string, string][] {
843:   offer(wantedAt: number, berths: number): number {
849:   held(): number {
856:   takings(): Charge[] {
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

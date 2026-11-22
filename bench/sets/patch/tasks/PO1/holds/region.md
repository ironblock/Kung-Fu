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

Lines 493 to 735 of the file, as they are:

```ts
export class Handover {
    readonly ref: string;
    readonly boat: BoatSpec;
    readonly dueOutAt: number;
    readonly dueBackAt: number;
    readonly depositPence: number;
    private state: Phase = "booked";
    private lists: Record<Side, Checklist>;
    private readings: Record<Side, Reading>;
    private marks: Record<Side, DamageMark[]> = { out: [], back: [] };
    private extras: Charge[] = [];
    // Newest first.
    private events: TimelineEvent[] = [];
    private leftAt = NOT_YET;
    private cameAt = NOT_YET;

    constructor(ref: string, boat: BoatSpec, dueOutAt: number, dueBackAt: number, depositPence: number) {
        this.ref = ref.trim().toUpperCase();
        this.boat = { ...boat };
        this.dueOutAt = dueOutAt;
        this.dueBackAt = dueBackAt;
        this.depositPence = depositPence;
        this.lists = { out: checklistFor("out", boat.berths), back: checklistFor("back", boat.berths) };
        this.readings = { out: blankReading(), back: blankReading() };
    }

    get phase(): Phase {
        return this.state;
    }

    get outAt(): number {
        return this.leftAt;
    }

    get backAt(): number {
        return this.cameAt;
    }

    // The timeline is kept newest first: each event goes in at the front, so events[0] is the latest.
    private log(kind: EventKind, at: number, by: string, text: string): void {
        this.events.unshift({ at, kind, by: by.trim(), text });
    }

    // The side whose paperwork is open in this phase, if either is.
    private openSide(): Side | undefined {
        if (this.state === "checking") return "out";
        if (this.state === "returned") return "back";
        return undefined;
    }

    open(at: number, by: string): boolean {
        if (this.state !== "booked") return false;
        this.state = "checking";
        this.log("opened", at, by, "");
        return true;
    }

    tick(side: Side, code: string, state: ItemState, at: number, by: string, note: string = ""): boolean {
        if (this.openSide() !== side) return false;
        if (!tick(this.lists[side], code, state, note)) return false;
        this.log("ticked", at, by, `${side} ${code.trim().toUpperCase()} ${state}`);
        return true;
    }

    // Keeps a copy of the reading. A later reading for the same side takes the place of the earlier one.
    read(side: Side, reading: Reading, by: string): boolean {
        if (this.openSide() !== side) return false;
        if (reading.at === NOT_YET || readingProblems(reading, this.boat).length > 0) return false;
        this.readings[side] = { ...reading };
        const said = `fuel ${formatLitres(reading.fuel)}, engine ${formatHours(reading.engine)}`;
        this.log("read", reading.at, by, `${side} ${said}`);
        return true;
    }

    noteDamage(side: Side, mark: DamageMark, at: number, by: string): boolean {
        if (this.openSide() !== side || mark.size <= 0) return false;
        this.marks[side].push({ ...mark, note: mark.note.trim() });
        this.log("damage", at, by, `${side} ${describeMark(mark)}`);
        return true;
    }

    // Strikes out a mark that was noted by mistake. `index` counts from 0, in the order the marks were noted.
    dropDamage(side: Side, index: number, at: number, by: string): boolean {
        if (this.openSide() !== side) return false;
        if (!Number.isInteger(index) || index < 0 || index >= this.marks[side].length) return false;
        const gone = this.marks[side].splice(index, 1)[0];
        this.log("damage", at, by, `${side} struck out: ${describeMark(gone)}`);
        return true;
    }

    // The boat goes out only when the out checklist is ready and the gauges have been read.
    release(at: number, by: string): boolean {
        if (this.state !== "checking") return false;
        if (!isReady(this.lists.out) || this.readings.out.at === NOT_YET) return false;
        this.state = "out";
        this.leftAt = at;
        this.log("released", at, by, "");
        return true;
    }

    takeBack(at: number, by: string): boolean {
        if (this.state !== "out" || at < this.leftAt) return false;
        this.state = "returned";
        this.cameAt = at;
        const late = lateMinutes(this.dueBackAt, at);
        this.log("returned", at, by, late === 0 ? "on time" : `${late} min late`);
        return true;
    }

    // Things the desk should tell the party before the boat goes. None of them stops it going.
    warnings(): string[] {
        const said: string[] = [];
        const out = this.readings.out;
        if (out.fuel !== UNREAD && fuelEighths(out, this.boat) < 2) said.push("fuel under a quarter");
        if (out.water !== UNREAD && out.water < WATER_FULL) said.push("water tank not full");
        if (out.gas !== UNREAD && out.gas < this.boat.gasBottles) {
            said.push(`gas: ${out.gas} of ${this.boat.gasBottles} bottles`);
        }
        for (const item of this.lists.out.items) {
            if (!item.must && item.state === "todo") said.push(`${item.code} not done`);
        }
        const optional: Checklist = { side: "out", items: this.lists.out.items.filter((item) => !item.must) };
        return said.concat(faultNotes(optional));
    }

    // A charge the desk adds by hand, such as a lost windlass. It can be added while the boat is out or back.
    addExtra(pence: number, note: string, at: number, by: string): boolean {
        if (this.state !== "out" && this.state !== "returned") return false;
        if (!Number.isInteger(pence) || pence <= 0) return false;
        const why = note.trim();
        this.extras.push({ code: "extra", pence, note: why });
        this.log("extra", at, by, `${formatPence(pence)} ${why}`.trim());
        return true;
    }

    cancel(at: number, by: string, reason: string): boolean {
        if (this.state !== "booked" && this.state !== "checking") return false;
        this.state = "void";
        this.log("void", at, by, reason.trim());
        return true;
    }

    // What the party is charged, in CHARGE_ORDER. Until the boat is back only the extras are known.
    charges(): Charge[] {
        const list: Charge[] = [];
        if (this.state === "returned" || this.state === "closed") {
            const out = this.readings.out;
            const back = this.readings.back;
            let used = fuelUsed(out, back);
            let how = "by dipstick";
            if (used === UNREAD) {
                used = estimateFuel(out, back);
                how = "by engine hours";
            }
            if (used > 0) list.push({ code: "fuel", pence: fuelCharge(used), note: `${formatLitres(used)} ${how}` });
            const bottles = gasUsed(out, back);
            if (bottles > 0) {
                list.push({ code: "gas", pence: bottles * GAS_BOTTLE_PENCE, note: `${bottles} of ${out.gas} bottles` });
            }
            const late = lateMinutes(this.dueBackAt, this.cameAt);
            if (late > 0) list.push({ code: "late", pence: lateCharge(late), note: `${late} min late` });
            for (const mark of sortMarks(newDamage(this.marks.out, this.marks.back))) {
                const pence = damageCharge(mark);
                if (pence > 0) list.push({ code: "damage", pence, note: describeMark(mark) });
            }
            const clean = this.lists.back.items.find((item) => item.code === "CLEAN");
            if (clean !== undefined && clean.state === "fault") {
                list.push({ code: "cleaning", pence: CLEANING_PENCE, note: clean.note });
            }
        }
        for (const extra of this.extras) list.push({ ...extra });
        return list;
    }

    // Closes the hire and says what becomes of the deposit. Nothing is given, and nothing changes, until the
    // back checklist is ready and the gauges have been read.
    close(at: number, by: string): Settlement | undefined {
        if (this.state !== "returned") return undefined;
        if (!isReady(this.lists.back) || this.readings.back.at === NOT_YET) return undefined;
        const result = settle(this.depositPence, this.charges());
        this.state = "closed";
        const owes = result.owedPence > 0;
        const said = owes ? `owes ${formatPence(result.owedPence)}` : `refund ${formatPence(result.refundPence)}`;
        this.log("closed", at, by, said);
        return result;
    }

    checklist(side: Side): Checklist {
        const list = this.lists[side];
        return { side: list.side, items: list.items.map((item) => ({ ...item })) };
    }

    reading(side: Side): Reading {
        return { ...this.readings[side] };
    }

    damage(side: Side): DamageMark[] {
        return this.marks[side].map((mark) => ({ ...mark }));
    }

    timeline(): TimelineEvent[] {
        return this.events.map((event) => ({ ...event }));
    }

    lastEvent(kind?: EventKind): TimelineEvent | undefined {
        const found = this.events.find((event) => kind === undefined || event.kind === kind);
        return found === undefined ? undefined : { ...found };
    }

    // One line for the wharf board.
    headline(): string {
        const name = `${this.ref} ${this.boat.name}`;
        switch (this.state) {
            case "booked":
            case "checking":
                return `${name}: due out ${formatStamp(this.dueOutAt)}`;
            case "out":
                return `${name}: due back ${formatStamp(this.dueBackAt)}`;
            case "returned":
                return `${name}: back ${formatStamp(this.cameAt)}, checks ${progress(this.lists.back)}`;
            case "closed":
                return `${name}: closed`;
            default:
                return `${name}: called off`;
        }
    }

    report(): string[] {
        const lines = [
            `${this.ref} ${this.boat.name}: ${this.state}`,
            `due out ${formatStamp(this.dueOutAt)}, went ${formatStamp(this.leftAt)}`,
            `due back ${formatStamp(this.dueBackAt)}, came ${formatStamp(this.cameAt)}`,
            `checks: out ${progress(this.lists.out)}, back ${progress(this.lists.back)}`,
        ];
        const charges = this.charges();
        for (const charge of charges) {
            lines.push(`${charge.code} ${formatPence(charge.pence)}${charge.note === "" ? "" : ` ${charge.note}`}`);
        }
        if (charges.length > 0) lines.push(`total ${formatPence(totalPence(charges))}`);
        lines.push(`events: ${this.events.length}`);
        return lines;
    }
}
```

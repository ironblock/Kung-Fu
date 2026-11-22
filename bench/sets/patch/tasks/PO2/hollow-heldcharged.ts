// hollow-heldcharged, a wrong answer to PO2. Latecharge is right.
// Wrong: HandoverBook.held: less what each live hire has been charged.
// Handing a hire boat over to a party, and taking it back again.
//
// A time is a stamp: minutes from midnight at the start of day 0 of the season. Money is whole pence.

export type Side = "out" | "back";
export type Phase = "booked" | "checking" | "out" | "returned" | "closed" | "void";
export type ItemState = "todo" | "ok" | "fault" | "na";
export type Zone = "bow" | "port" | "starboard" | "stern" | "roof" | "cabin";
export type DamageKind = "scratch" | "dent" | "crack" | "burn";
export type EventKind = "opened" | "ticked" | "read" | "damage" | "released" | "returned" | "extra" | "closed" | "void";
export type ChargeCode = "fuel" | "gas" | "late" | "damage" | "cleaning" | "extra";

export interface BoatSpec {
    name: string;
    berths: number;
    tankLitres: number;
    // Gas bottles the boat carries when it is fully stocked.
    gasBottles: number;
}

export interface ChecklistItem {
    code: string;
    label: string;
    // An item that has to be settled before the boat moves on.
    must: boolean;
    state: ItemState;
    note: string;
}

export interface Checklist {
    side: Side;
    items: ChecklistItem[];
}

// What the gauges said at one end of a hire. A gauge nobody read holds UNREAD.
export interface Reading {
    at: number;
    // Tenths of a litre in the tank, from the dipstick chart.
    fuel: number;
    // The engine counter as it shows: tenths of an hour.
    engine: number;
    // Eighths of the water tank, 0 to 8.
    water: number;
    // Full gas bottles aboard.
    gas: number;
}

export interface DamageMark {
    zone: Zone;
    kind: DamageKind;
    // The longest side, in millimetres.
    size: number;
    note: string;
}

export interface Charge {
    code: ChargeCode;
    pence: number;
    note: string;
}

export interface Settlement {
    chargedPence: number;
    keptPence: number;
    refundPence: number;
    owedPence: number;
}

export interface TimelineEvent {
    at: number;
    kind: EventKind;
    by: string;
    text: string;
}

export interface StageTimes {
    checkingMin: number;
    outMin: number;
    closingMin: number;
}

// A stretch of the wharf kept for one handover.
export interface Slot {
    start: number;
    end: number;
}

export const DAY_MIN = 1440;
export const NOT_YET = -1;
export const UNREAD = -1;

export const ZONES: readonly Zone[] = ["bow", "port", "starboard", "stern", "roof", "cabin"];
export const CHARGE_ORDER: readonly ChargeCode[] = ["fuel", "gas", "late", "damage", "cleaning", "extra"];

export const FUEL_PENCE_PER_LITRE = 168;
export const GAS_BOTTLE_PENCE = 3950;
export const CLEANING_PENCE = 6000;
export const LATE_GRACE_MIN = 20;
export const LATE_STEP_MIN = 30;
export const LATE_STEP_PENCE = 1200;
export const LATE_CAP_PENCE = 15000;
export const WHARF_OPENS_MIN = 8 * 60 + 30;
export const WHARF_SHUTS_MIN = 17 * 60;

const DAMAGE_TOLERANCE_MM = 10;
const ENGINE_FUEL_RATE = 14;
const BIG_BOAT_BERTHS = 6;
const CABIN_PER_CENT = 150;
const WATER_FULL = 8;
const SLOT_MIN = 40;
const BIG_SLOT_MIN = 60;
const RECEIPT_WIDTH = 30;

type Seed = [code: string, label: string, must: boolean];

const OUT_SEEDS: Seed[] = [
    ["KEYS", "Keys and windlasses handed over", true],
    ["GAS", "Gas turned on and bottles checked", true],
    ["SAFETY", "Safety talk given, lifejackets fitted", true],
    ["HELM", "Helm lesson done", true],
    ["WATER", "Water tank filled", false],
    ["INVENTORY", "Inventory agreed with the party", true],
    ["WEED", "Weed hatch shown", false],
];

const BACK_SEEDS: Seed[] = [
    ["KEYS", "Keys and windlasses returned", true],
    ["INVENTORY", "Inventory counted", true],
    ["CLEAN", "Boat left clean", false],
    ["PUMP", "Toilet tank pumped out", true],
    ["BILGE", "Bilge dry", false],
    ["MOORED", "Moored and locked on the wharf", true],
];

const CREW_SEED: Seed = ["CREW", "Second steerer named and shown the controls", true];

// For each kind, steps of [size in mm, pence]. The last step of a kind has no upper end.
const DAMAGE_STEPS: Record<DamageKind, [number, number][]> = {
    scratch: [[50, 0], [300, 4500], [Infinity, 9500]],
    dent: [[20, 0], [120, 6000], [Infinity, 14000]],
    crack: [[10, 3000], [80, 12000], [Infinity, 26000]],
    burn: [[5, 0], [40, 3500], [Infinity, 8000]],
};

function pad2(n: number): string {
    return n < 10 ? `0${n}` : `${n}`;
}

function tenths(n: number): string {
    return `${Math.floor(n / 10)}.${n % 10}`;
}

export function stamp(day: number, minute: number): number {
    return day * DAY_MIN + minute;
}

export function dayOf(at: number): number {
    return Math.floor(at / DAY_MIN);
}

export function minuteOf(at: number): number {
    return at - dayOf(at) * DAY_MIN;
}

function clock(at: number): string {
    const minute = minuteOf(at);
    return `${pad2(Math.floor(minute / 60))}:${pad2(minute % 60)}`;
}

export function formatStamp(at: number): string {
    if (at === NOT_YET) return "--";
    return `day ${dayOf(at)} ${clock(at)}`;
}

export function formatPence(pence: number): string {
    const sign = pence < 0 ? "-" : "";
    const whole = Math.abs(pence);
    return `${sign}£${Math.floor(whole / 100)}.${pad2(whole % 100)}`;
}

export function formatLitres(fuel: number): string {
    return fuel === UNREAD ? "unread" : `${tenths(fuel)} L`;
}

export function formatHours(engine: number): string {
    return engine === UNREAD ? "unread" : `${tenths(engine)} h`;
}

// ---------------------------------------------------------------------------------------------- checklists

export function checklistFor(side: Side, berths: number): Checklist {
    const seeds = (side === "out" ? OUT_SEEDS : BACK_SEEDS).slice();
    if (side === "out" && berths >= BIG_BOAT_BERTHS) {
        // A big boat needs two people who can steer it. The item goes straight after the helm lesson.
        const helm = seeds.findIndex((seed) => seed[0] === "HELM");
        seeds.splice(helm + 1, 0, CREW_SEED);
    }
    const items = seeds.map(([code, label, must]): ChecklistItem => ({ code, label, must, state: "todo", note: "" }));
    return { side, items };
}

// Sets one item of the list. A fault has to say what is wrong, and an item put back to "todo" loses its note.
export function tick(list: Checklist, code: string, state: ItemState, note: string = ""): boolean {
    const wanted = code.trim().toUpperCase();
    const item = list.items.find((each) => each.code === wanted);
    if (item === undefined) return false;
    const said = note.trim();
    if (state === "fault" && said === "") return false;
    item.state = state;
    item.note = state === "todo" ? "" : said;
    return true;
}

// The items that still stop the boat moving on: those that must be settled and are not.
export function outstanding(list: Checklist): ChecklistItem[] {
    return list.items.filter((item) => item.must && (item.state === "todo" || item.state === "fault"));
}

export function isReady(list: Checklist): boolean {
    return outstanding(list).length === 0;
}

export function faults(list: Checklist): ChecklistItem[] {
    return list.items.filter((item) => item.state === "fault");
}

export function faultNotes(list: Checklist): string[] {
    return faults(list).map((item) => `${item.code}: ${item.note}`);
}

export function progress(list: Checklist): string {
    const done = list.items.filter((item) => item.state === "ok" || item.state === "na").length;
    const bad = faults(list).length;
    const tail = bad === 0 ? "" : `, ${bad} ${bad === 1 ? "fault" : "faults"}`;
    return `${done}/${list.items.length}${tail}`;
}

// ---------------------------------------------------------------------------------------------- readings

export function blankReading(): Reading {
    return { at: NOT_YET, fuel: UNREAD, engine: UNREAD, water: UNREAD, gas: UNREAD };
}

// What is wrong with a reading for this boat, in words for the desk. An empty list means it can be kept.
export function readingProblems(reading: Reading, boat: BoatSpec): string[] {
    const problems: string[] = [];
    if (reading.fuel !== UNREAD && (reading.fuel < 0 || reading.fuel > boat.tankLitres * 10)) {
        problems.push(`fuel is not a level a ${boat.tankLitres} litre tank can hold`);
    }
    if (reading.engine !== UNREAD && reading.engine < 0) {
        problems.push("the engine counter cannot be below zero");
    }
    if (reading.water !== UNREAD && (reading.water < 0 || reading.water > WATER_FULL)) {
        problems.push(`water is given in eighths, 0 to ${WATER_FULL}`);
    }
    if (reading.gas !== UNREAD && (reading.gas < 0 || reading.gas > boat.gasBottles)) {
        problems.push(`the boat carries ${boat.gasBottles} gas bottles at most`);
    }
    return problems;
}

// How full the tank is, in eighths, as the gauge on the boat would show it. A part of an eighth is dropped.
export function fuelEighths(reading: Reading, boat: BoatSpec): number {
    if (reading.fuel === UNREAD) return UNREAD;
    return Math.floor((reading.fuel * 8) / (boat.tankLitres * 10));
}

// Fuel the party burned, in the unit of the readings. A tank that came back fuller gives 0: the yard pays
// nothing back for fuel the party bought on the way.
export function fuelUsed(out: Reading, back: Reading): number {
    if (out.fuel === UNREAD || back.fuel === UNREAD) return UNREAD;
    return Math.max(0, out.fuel - back.fuel);
}

// With no dipstick figure the yard goes by the engine counter instead.
export function estimateFuel(out: Reading, back: Reading): number {
    if (out.engine === UNREAD || back.engine === UNREAD) return UNREAD;
    const run = back.engine - out.engine;
    if (run <= 0) return 0;
    // The rate is tenths of a litre for an hour's running, and the counter is in tenths of an hour.
    return Math.round((run * ENGINE_FUEL_RATE) / 10);
}

export function fuelCharge(used: number, pencePerLitre: number = FUEL_PENCE_PER_LITRE): number {
    if (used <= 0) return 0;
    // The pump bills whole litres, and a litre that was started is billed.
    return Math.ceil(used / 10) * pencePerLitre;
}

export function gasUsed(out: Reading, back: Reading): number {
    if (out.gas === UNREAD || back.gas === UNREAD) return 0;
    return Math.max(0, out.gas - back.gas);
}

// ---------------------------------------------------------------------------------------------- lateness

// How late a boat came back, for the charge. A boat back by the end of the grace is not late at all. One back
// after it is late from the time it was due, not from the end of the grace.
export function lateMinutes(dueAt: number, backAt: number): number {
    if (backAt === NOT_YET) return 0;
    if (backAt <= dueAt + LATE_GRACE_MIN) return 0;
    return backAt - dueAt;
}

// The charge for lateness, from the minutes that lateMinutes gives. Each step that was started is charged.
export function lateCharge(lateMin: number): number {
    if (lateMin <= 0) return 0;
    let pence = 0;
    for (let step = 1, from = 0; from < lateMin; step++, from += LATE_STEP_MIN) {
        pence += step > 4 ? 2 * LATE_STEP_PENCE : LATE_STEP_PENCE;
        if (pence >= LATE_CAP_PENCE) return LATE_CAP_PENCE;
    }
    return pence;
}

// ---------------------------------------------------------------------------------------------- damage

export function describeMark(mark: DamageMark): string {
    const note = mark.note.trim();
    return `${mark.kind} on ${mark.zone}, ${mark.size} mm${note === "" ? "" : ` (${note})`}`;
}

export function damageCharge(mark: DamageMark): number {
    if (mark.size <= 0) return 0;
    let pence = 0;
    for (const [under, cost] of DAMAGE_STEPS[mark.kind]) {
        // A mark pays the first step it is under, so one of exactly 50 mm is in the second step.
        if (mark.size < under) {
            pence = cost;
            break;
        }
    }
    // Work inside the cabin means taking the linings out, so it costs half as much again.
    return mark.zone === "cabin" ? Math.round((pence * CABIN_PER_CENT) / 100) : pence;
}

export function sameMark(a: DamageMark, b: DamageMark): boolean {
    return a.zone === b.zone && a.kind === b.kind;
}

// The marks of `after` that the party is answerable for. Each mark of `before` excuses one mark of the same
// zone and kind. A mark that was there and has grown by more than the tolerance is given at the size it grew by.
export function newDamage(before: DamageMark[], after: DamageMark[]): DamageMark[] {
    const unused = before.slice();
    const found: DamageMark[] = [];
    for (const mark of after) {
        const at = unused.findIndex((old) => sameMark(old, mark));
        if (at < 0) {
            found.push({ ...mark });
            continue;
        }
        const old = unused.splice(at, 1)[0];
        const grown = mark.size - old.size;
        if (grown > DAMAGE_TOLERANCE_MM) found.push({ ...mark, size: grown });
    }
    return found;
}

// Puts the marks in the order of a walk round the boat, the largest first within a zone. Sorts the list it is
// given and hands the same list back.
export function sortMarks(marks: DamageMark[]): DamageMark[] {
    return marks.sort((a, b) => ZONES.indexOf(a.zone) - ZONES.indexOf(b.zone) || b.size - a.size);
}

export function worstMark(marks: DamageMark[]): DamageMark | undefined {
    let worst: DamageMark | undefined;
    for (const mark of marks) {
        if (worst === undefined || damageCharge(mark) > damageCharge(worst)) worst = mark;
    }
    return worst;
}

// ---------------------------------------------------------------------------------------------- charges

export function totalPence(charges: Charge[]): number {
    let sum = 0;
    for (const charge of charges) sum += charge.pence;
    return sum;
}

// One line for each code that has a charge, in CHARGE_ORDER, with the lines of a code added up.
export function mergeCharges(charges: Charge[]): Charge[] {
    const merged: Charge[] = [];
    for (const code of CHARGE_ORDER) {
        const same = charges.filter((charge) => charge.code === code);
        if (same.length === 0) continue;
        const note = same.length === 1 ? same[0].note : `${same.length} items`;
        merged.push({ code, pence: totalPence(same), note });
    }
    return merged;
}

// The deposit pays the charges as far as it goes. What it cannot cover is owed on top.
export function settle(depositPence: number, charges: Charge[]): Settlement {
    const chargedPence = totalPence(charges);
    const keptPence = Math.min(chargedPence, depositPence);
    return {
        chargedPence,
        keptPence,
        refundPence: depositPence - keptPence,
        owedPence: chargedPence - keptPence,
    };
}

function leader(label: string, amount: string): string {
    const dots = Math.max(3, RECEIPT_WIDTH - label.length - amount.length);
    return `${label} ${".".repeat(dots)} ${amount}`;
}

// The slip the party is given when the hire is closed: a line for each kind of charge, then the sums.
export function receiptLines(depositPence: number, charges: Charge[]): string[] {
    const lines = mergeCharges(charges).map((charge) => leader(charge.code, formatPence(charge.pence)));
    const result = settle(depositPence, charges);
    lines.push(leader("charged", formatPence(result.chargedPence)));
    lines.push(leader("deposit", formatPence(depositPence)));
    if (result.owedPence > 0) {
        lines.push(leader("to pay", formatPence(result.owedPence)));
    } else {
        lines.push(leader("refund", formatPence(result.refundPence)));
    }
    return lines;
}

// ---------------------------------------------------------------------------------------------- timeline

export function describeEvent(event: TimelineEvent): string {
    const who = event.by === "" ? "" : ` by ${event.by}`;
    const text = event.text === "" ? "" : `: ${event.text}`;
    return `${formatStamp(event.at)} ${event.kind}${who}${text}`;
}

export function eventsOn(events: TimelineEvent[], day: number): TimelineEvent[] {
    return events.filter((event) => dayOf(event.at) === day);
}

// Minutes from the earliest event of the list to the latest, whatever order the list is in.
export function spanOf(events: TimelineEvent[]): number {
    if (events.length === 0) return 0;
    let first = events[0].at;
    let last = events[0].at;
    for (const event of events) {
        if (event.at < first) first = event.at;
        if (event.at > last) last = event.at;
    }
    return last - first;
}

// How long each stage of a hire took, from the times in its events. A stage that has not ended, or never
// began, holds NOT_YET.
export function stageTimes(events: TimelineEvent[]): StageTimes {
    const when = (kind: EventKind): number => {
        const found = events.find((event) => event.kind === kind);
        return found === undefined ? NOT_YET : found.at;
    };
    const between = (from: number, to: number): number => (from === NOT_YET || to === NOT_YET ? NOT_YET : to - from);
    const released = when("released");
    const returned = when("returned");
    return {
        checkingMin: between(when("opened"), released),
        outMin: between(released, returned),
        closingMin: between(returned, when("closed")),
    };
}

// ---------------------------------------------------------------------------------------------- wharf slots

export function slotFor(at: number, berths: number): Slot {
    const length = berths >= BIG_BOAT_BERTHS ? BIG_SLOT_MIN : SLOT_MIN;
    return { start: at, end: at + length };
}

// A slot holds its start and not its end, so one may begin at the minute another ends.
export function slotsClash(a: Slot, b: Slot): boolean {
    return a.start < b.end && b.start < a.end;
}

// The wharf is staffed from WHARF_OPENS_MIN, and a handover may run right up to WHARF_SHUTS_MIN.
export function inWharfHours(slot: Slot): boolean {
    if (dayOf(slot.start) !== dayOf(slot.end)) return false;
    return minuteOf(slot.start) >= WHARF_OPENS_MIN && minuteOf(slot.end) <= WHARF_SHUTS_MIN;
}

// The first time at or after `from`, on the same day, when a slot of that length is clear of the taken ones.
// NOT_YET when the wharf shuts before one fits.
export function nextFree(taken: Slot[], from: number, length: number): number {
    const day = dayOf(from);
    let start = Math.max(from, stamp(day, WHARF_OPENS_MIN));
    const inOrder = taken.slice().sort((a, b) => a.start - b.start);
    for (const slot of inOrder) {
        if (slotsClash(slot, { start, end: start + length })) start = slot.end;
    }
    return start + length <= stamp(day, WHARF_SHUTS_MIN) ? start : NOT_YET;
}

// ---------------------------------------------------------------------------------------------- one handover

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

// ---------------------------------------------------------------------------------------------- the day's work

// Boats that are out and due back on the day, the soonest first.
export function dueBack(handovers: Handover[], day: number): Handover[] {
    return handovers
        .filter((each) => each.phase === "out" && dayOf(each.dueBackAt) === day)
        .sort((a, b) => a.dueBackAt - b.dueBackAt);
}

// Boats still out once their grace has run out, the longest overdue first.
export function overdue(handovers: Handover[], at: number): Handover[] {
    return handovers
        .filter((each) => each.phase === "out" && at > each.dueBackAt + LATE_GRACE_MIN)
        .sort((a, b) => a.dueBackAt - b.dueBackAt);
}

// Minutes the yard has to turn a boat round between two hires. It is negative when the next party is due
// before the boat is free. A boat that is not back yet is taken at the time it is due.
export function turnaround(earlier: Handover, later: Handover): number {
    const free = earlier.backAt === NOT_YET ? earlier.dueBackAt : earlier.backAt;
    return later.dueOutAt - free;
}

// The day's comings and goings for the wharf board, in order of time. At the same minute a return is listed
// before a departure. A hire that was called off is left out.
export function daySheet(handovers: Handover[], day: number): string[] {
    const rows: [at: number, rank: number, line: string][] = [];
    for (const each of handovers) {
        if (each.phase === "void") continue;
        const name = `${each.ref} ${each.boat.name}`;
        if (dayOf(each.dueBackAt) === day) rows.push([each.dueBackAt, 0, `${clock(each.dueBackAt)} back ${name}`]);
        if (dayOf(each.dueOutAt) === day) rows.push([each.dueOutAt, 1, `${clock(each.dueOutAt)} out ${name}`]);
    }
    rows.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    return rows.map((row) => row[2]);
}

// ---------------------------------------------------------------------------------------------- the book

// Every handover of the season, by its reference.
export class HandoverBook {
    private byRef: Map<string, Handover> = new Map();

    get size(): number {
        return this.byRef.size;
    }

    // Refuses a second handover with a reference the book already holds.
    add(handover: Handover): boolean {
        if (this.byRef.has(handover.ref)) return false;
        this.byRef.set(handover.ref, handover);
        return true;
    }

    find(ref: string): Handover | undefined {
        return this.byRef.get(ref.trim().toUpperCase());
    }

    // Only a hire that never began, or was called off, can be taken out of the book.
    remove(ref: string): boolean {
        const found = this.find(ref);
        if (found === undefined) return false;
        if (found.phase !== "booked" && found.phase !== "void") return false;
        return this.byRef.delete(found.ref);
    }

    // The hires of one boat, in the order they are due out.
    forBoat(name: string): Handover[] {
        const wanted = name.trim().toLowerCase();
        return [...this.byRef.values()]
            .filter((each) => each.boat.name.toLowerCase() === wanted)
            .sort((a, b) => a.dueOutAt - b.dueOutAt);
    }

    // Hires that are neither closed nor called off, in the order they were added.
    live(): Handover[] {
        return [...this.byRef.values()].filter((each) => each.phase !== "closed" && each.phase !== "void");
    }

    // Hires still waiting to go out on the day, the earliest first. A boat that has gone needs no slot.
    private waiting(day: number): Handover[] {
        return [...this.byRef.values()]
            .filter((each) => (each.phase === "booked" || each.phase === "checking") && dayOf(each.dueOutAt) === day)
            .sort((a, b) => a.dueOutAt - b.dueOutAt);
    }

    // The wharf slots of the day's departures, the earliest first.
    outSlots(day: number): Slot[] {
        return this.waiting(day).map((each) => slotFor(each.dueOutAt, each.boat.berths));
    }

    // Pairs of hires whose departure slots on the day overlap, each as [the earlier one's ref, the later one's].
    clashes(day: number): [string, string][] {
        const due = this.waiting(day);
        const pairs: [string, string][] = [];
        for (let i = 0; i < due.length; i++) {
            const mine = slotFor(due[i].dueOutAt, due[i].boat.berths);
            for (let j = i + 1; j < due.length; j++) {
                const theirs = slotFor(due[j].dueOutAt, due[j].boat.berths);
                if (slotsClash(mine, theirs)) pairs.push([due[i].ref, due[j].ref]);
            }
        }
        return pairs;
    }

    // A time to offer a new party for its handover: the first clear slot at or after the time asked for.
    offer(wantedAt: number, berths: number): number {
        const slot = slotFor(wantedAt, berths);
        return nextFree(this.outSlots(dayOf(wantedAt)), wantedAt, slot.end - slot.start);
    }

    // Deposits the yard is holding, in pence: those of the live hires.
    held(): number {
        let sum = 0;
        for (const each of this.live()) sum += each.depositPence - Math.min(each.depositPence, totalPence(each.charges()));
        return sum;
    }

    // What the closed hires were charged, by code, in CHARGE_ORDER.
    takings(): Charge[] {
        const all: Charge[] = [];
        for (const each of this.byRef.values()) {
            if (each.phase === "closed") all.push(...each.charges());
        }
        return mergeCharges(all);
    }
}

// The workshop's parts store: what is on the shelves, what is set aside for jobs, deliveries,
// and corrections after a stocktake.
//
// Stock is counted in single units. Suppliers sell by the pack. Money is whole pence.
// A day is a day number on the yard's calendar: 1 on the day the store opened, which was a Monday.

export type MoveKind = "delivery" | "issue" | "return" | "count";

export type Category = "engine" | "electrical" | "gas" | "plumbing" | "hull" | "general";

/** The job id on a movement that belongs to no job. */
export const NO_JOB = "";

/** The bin of a part that has no place on the shelves. */
export const NO_BIN = "";

/** Stands in for a day when the thing has not happened. */
export const NEVER = 0;

/** Lead time in days for a supplier the table does not list. */
export const DEFAULT_LEAD_DAYS = 7;

/** Days of cover for a part that nobody is drawing. */
export const NO_LIMIT = -1;

/** How far back the store looks when it works out how fast a part is used. */
export const USAGE_WEEKS = 4;

const PART_NO_SHAPE = /^[A-Z]{3}-\d{4}$/;

const CATEGORY_OF_PREFIX: Record<string, Category> = {
    ENG: "engine",
    ELE: "electrical",
    GAS: "gas",
    PLU: "plumbing",
    HUL: "hull",
};

// How often each category is counted, in days.
const COUNT_EVERY: Record<Category, number> = {
    engine: 30,
    electrical: 60,
    gas: 14,
    plumbing: 60,
    hull: 90,
    general: 120,
};

// Days from order to delivery.
const LEAD_DAYS: Record<string, number> = {
    "Brindlewick Marine": 3,
    "Pellow & Tarn": 5,
    "Ottermere Gas": 2,
    "Quillfeather Chandlery": 10,
};

export interface Part {
    partNo: string;
    name: string;
    bin: string;
    packSize: number;
    reorderAt: number;
    reorderUpTo: number;
    supplier: string;
}

export interface StockLine {
    onHand: number;
    avgPence: number;
    countedDay: number;
    deliveredDay: number;
}

export interface Hold {
    partNo: string;
    jobId: string;
    units: number;
    day: number;
}

export interface Movement {
    partNo: string;
    kind: MoveKind;
    units: number;
    day: number;
    jobId: string;
    unitPence: number;
}

export interface DeliveryLine {
    partNo: string;
    packs: number;
    packPence: number;
}

export interface CountLine {
    partNo: string;
    counted: number;
}

export interface KitLine {
    partNo: string;
    units: number;
}

export interface ReorderLine {
    partNo: string;
    supplier: string;
    packs: number;
    units: number;
    dueDay: number;
}

export interface PickLine {
    partNo: string;
    bin: string;
    units: number;
}

export interface Variance {
    partNo: string;
    before: number;
    counted: number;
    pence: number;
}

function byText(a: string, b: string): number {
    return a < b ? -1 : a > b ? 1 : 0;
}

// from the first day up to, and not including, the second
function inDays(day: number, fromDay: number, toDay: number): boolean {
    return day >= fromDay && day < toDay;
}

function wholeAndAtLeast(value: number, least: number): boolean {
    return Number.isInteger(value) && value >= least;
}

/** The form a part number is stored in. The counter staff type them any old way. */
export function keyOf(raw: string): string {
    return raw.replace(/\s+/g, "").toUpperCase();
}

export function isPartNo(raw: string): boolean {
    return PART_NO_SHAPE.test(keyOf(raw));
}

export function categoryOf(partNo: string): Category {
    const prefix = keyOf(partNo).slice(0, 3);
    return CATEGORY_OF_PREFIX[prefix] ?? "general";
}

export function packsFor(units: number, packSize: number): number {
    if (units <= 0) {
        return 0;
    }
    return Math.ceil(units / packSize);
}

/** How many packs to order for a part with this much free stock. */
export function reorderPacks(part: Part, free: number): number {
    // a reorder level of 0 marks a part that is bought only when a job asks for it
    if (part.reorderAt === 0 || free > part.reorderAt) {
        return 0;
    }
    return packsFor(part.reorderUpTo - free, part.packSize);
}

export function formatPence(pence: number): string {
    const whole = Math.abs(Math.round(pence));
    const pounds = String(Math.floor(whole / 100)).replace(/\B(?=(\d{3})+$)/g, ",");
    const text = `£${pounds}.${String(whole % 100).padStart(2, "0")}`;
    // the ledger prints a loss in brackets
    return pence < 0 ? `(${text})` : text;
}

/** Shelf order, for a picking list or a count sheet. */
export function sortByBin(parts: Part[]): Part[] {
    parts.sort((a, b) => {
        if (a.bin === NO_BIN || b.bin === NO_BIN) {
            if (a.bin !== b.bin) {
                return a.bin === NO_BIN ? 1 : -1;
            }
            return byText(a.partNo, b.partNo);
        }
        return byText(a.bin, b.bin) || byText(a.partNo, b.partNo);
    });
    return parts;
}

export function shelfLabel(part: Part): string {
    const bin = part.bin === NO_BIN ? "not shelved" : `bin ${part.bin}`;
    return `${part.partNo} ${part.name} (${bin}, packs of ${part.packSize})`;
}

export function deliveryTotal(lines: DeliveryLine[]): number {
    let pence = 0;
    for (const line of lines) {
        pence += line.packs * line.packPence;
    }
    return pence;
}

/** One line for each part of a kit, in the order the parts first appear. */
export function mergeKit(lines: KitLine[]): KitLine[] {
    const merged: KitLine[] = [];
    for (const line of lines) {
        if (line.units < 1) {
            continue;
        }
        const partNo = keyOf(line.partNo);
        const seen = merged.find((m) => m.partNo === partNo);
        if (seen) {
            seen.units += line.units;
        } else {
            merged.push({ partNo, units: line.units });
        }
    }
    return merged;
}

export function leadDaysOf(supplier: string): number {
    return LEAD_DAYS[supplier.trim()] ?? DEFAULT_LEAD_DAYS;
}

/** The day an order placed on orderedDay should arrive. */
export function expectedDay(supplier: string, orderedDay: number): number {
    const day = orderedDay + leadDaysOf(supplier);
    // nobody is at the yard to sign for a delivery on a Sunday
    return day % 7 === 0 ? day + 1 : day;
}

/** Whole days the free stock will last at this rate of use. */
export function daysOfCover(free: number, perWeek: number): number {
    if (perWeek <= 0) {
        return NO_LIMIT;
    }
    if (free <= 0) {
        return 0;
    }
    return Math.max(1, Math.floor((free * 7) / perWeek));
}

export function describeMove(move: Movement): string {
    const units = move.units > 0 ? `+${move.units}` : String(move.units);
    const value = formatPence(move.units * move.unitPence);
    const job = move.jobId === NO_JOB ? "" : ` for ${move.jobId}`;
    return `day ${move.day}: ${move.kind} ${units} ${move.partNo}${job}, ${value}`;
}

export class PartsStore {
    private parts = new Map<string, Part>();
    private stock = new Map<string, StockLine>();
    private holds: Hold[] = [];
    private moves: Movement[] = [];

    /** Puts a new part on the books with nothing on the shelf. Returns its part number as stored. */
    addPart(part: Part): string {
        const partNo = keyOf(part.partNo);
        if (!PART_NO_SHAPE.test(partNo)) {
            throw new RangeError(`not a part number: ${part.partNo}`);
        }
        if (this.parts.has(partNo)) {
            throw new RangeError(`already in the store: ${partNo}`);
        }
        if (!wholeAndAtLeast(part.packSize, 1)) {
            throw new RangeError(`bad pack size for ${partNo}: ${part.packSize}`);
        }
        if (!wholeAndAtLeast(part.reorderAt, 0)) {
            throw new RangeError(`bad reorder level for ${partNo}: ${part.reorderAt}`);
        }
        if (part.reorderAt !== 0 && part.reorderUpTo <= part.reorderAt) {
            throw new RangeError(`${partNo} must reorder up to more than ${part.reorderAt}`);
        }
        this.parts.set(partNo, { ...part, partNo, bin: keyOf(part.bin) });
        this.stock.set(partNo, { onHand: 0, avgPence: 0, countedDay: NEVER, deliveredDay: NEVER });
        return partNo;
    }

    part(partNo: string): Part | undefined {
        const found = this.parts.get(keyOf(partNo));
        return found ? { ...found } : undefined;
    }

    partNos(): string[] {
        return [...this.parts.keys()].sort(byText);
    }

    /** Moves a part to another bin. Returns the bin it was in. */
    shelve(partNo: string, bin: string): string {
        const part = this.known(partNo);
        const was = part.bin;
        part.bin = keyOf(bin);
        return was;
    }

    onHand(partNo: string): number {
        return this.stock.get(keyOf(partNo))?.onHand ?? 0;
    }

    held(partNo: string): number {
        const key = keyOf(partNo);
        let units = 0;
        for (const hold of this.holds) {
            if (hold.partNo === key) {
                units += hold.units;
            }
        }
        return units;
    }

    heldFor(partNo: string, jobId: string): number {
        const key = keyOf(partNo);
        return this.holds.find((h) => h.partNo === key && h.jobId === jobId)?.units ?? 0;
    }

    freeOf(partNo: string): number {
        return this.onHand(partNo) - this.held(partNo);
    }

    avgPence(partNo: string): number {
        return this.stock.get(keyOf(partNo))?.avgPence ?? 0;
    }

    lastCounted(partNo: string): number {
        return this.stock.get(keyOf(partNo))?.countedDay ?? NEVER;
    }

    lastDelivered(partNo: string): number {
        return this.stock.get(keyOf(partNo))?.deliveredDay ?? NEVER;
    }

    /** Takes a delivery onto the shelves. Returns the units added. */
    receive(partNo: string, packs: number, packPence: number, day: number): number {
        if (packPence === 0) {
            const key = keyOf(partNo);
            const free = this.parts.get(key);
            const shelf = this.stock.get(key);
            if (!free || !shelf) {
                return 0;
            }
            if (!wholeAndAtLeast(packs, 1)) {
                throw new RangeError(`bad number of packs for ${key}: ${packs}`);
            }
            const added = packs * free.packSize;
            shelf.onHand += added;
            shelf.deliveredDay = day;
            this.log({ partNo: key, kind: "delivery", units: added, day, jobId: NO_JOB, unitPence: 0 });
            return added;
        }
        const part = this.known(partNo);
        const line = this.lineOf(part.partNo);
        if (!wholeAndAtLeast(packs, 1)) {
            throw new RangeError(`bad number of packs for ${part.partNo}: ${packs}`);
        }
        if (!wholeAndAtLeast(packPence, 0)) {
            throw new RangeError(`bad pack price for ${part.partNo}: ${packPence}`);
        }
        const units = packs * part.packSize;
        // the average of what is on the shelf and what has come in, to the nearest penny
        line.avgPence = Math.round((line.onHand * line.avgPence + packs * packPence) / (line.onHand + units));
        line.onHand += units;
        line.deliveredDay = day;
        const unitPence = Math.round(packPence / part.packSize);
        this.log({ partNo: part.partNo, kind: "delivery", units, day, jobId: NO_JOB, unitPence });
        return units;
    }

    /** Takes a whole delivery note, or none of it. Returns what the note comes to in pence. */
    receiveAll(lines: DeliveryLine[], day: number): number {
        for (const line of lines) {
            this.known(line.partNo);
            if (!wholeAndAtLeast(line.packs, 1) || !wholeAndAtLeast(line.packPence, 0)) {
                throw new RangeError(`bad delivery line for ${line.partNo}`);
            }
        }
        for (const line of lines) {
            this.receive(line.partNo, line.packs, line.packPence, day);
        }
        return deliveryTotal(lines);
    }

    /** Sets units aside for a job. Returns how many it could set aside. */
    setAside(partNo: string, units: number, jobId: string, day: number): number {
        const part = this.known(partNo);
        if (jobId === NO_JOB) {
            throw new RangeError("a hold needs a job");
        }
        if (!wholeAndAtLeast(units, 1)) {
            throw new RangeError(`bad number of units for ${part.partNo}: ${units}`);
        }
        const got = Math.min(units, this.freeOf(part.partNo));
        if (got <= 0) {
            return 0;
        }
        const hold = this.holds.find((h) => h.partNo === part.partNo && h.jobId === jobId);
        if (hold) {
            // one hold for a job and a part: it grows, and keeps the day it was made
            hold.units += got;
        } else {
            this.holds.push({ partNo: part.partNo, jobId, units: got, day });
        }
        return got;
    }

    /** Sets a kit aside for a job. Returns the lines it could not fill, with the units still wanted. */
    setAsideKit(jobId: string, lines: KitLine[], day: number): KitLine[] {
        const kit = mergeKit(lines);
        for (const line of kit) {
            this.known(line.partNo);
        }
        const short: KitLine[] = [];
        for (const line of kit) {
            const got = this.setAside(line.partNo, line.units, jobId, day);
            if (got < line.units) {
                short.push({ partNo: line.partNo, units: line.units - got });
            }
        }
        return short;
    }

    /** Lets go of everything set aside for a job. Returns the units freed. */
    release(jobId: string): number {
        let freed = 0;
        const kept: Hold[] = [];
        for (const hold of this.holds) {
            if (hold.jobId === jobId) {
                freed += hold.units;
            } else {
                kept.push(hold);
            }
        }
        this.holds = kept;
        return freed;
    }

    holdsFor(jobId: string): Hold[] {
        return this.holds.filter((h) => h.jobId === jobId).map((h) => ({ ...h }));
    }

    /** Hands one job's hold on a part to another job. Returns the units moved. */
    moveHold(partNo: string, fromJob: string, toJob: string): number {
        const key = keyOf(partNo);
        const at = this.holds.findIndex((h) => h.partNo === key && h.jobId === fromJob);
        if (at < 0 || toJob === NO_JOB || toJob === fromJob) {
            return 0;
        }
        const [from] = this.holds.splice(at, 1);
        const to = this.holds.find((h) => h.partNo === key && h.jobId === toJob);
        if (to) {
            to.units += from.units;
        } else {
            // the hold keeps its place in the queue, and its day
            this.holds.splice(at, 0, { ...from, jobId: toJob });
        }
        return from.units;
    }

    /** What to fetch for a job, in shelf order. */
    pickList(jobId: string): PickLine[] {
        const parts: Part[] = [];
        for (const hold of this.holds) {
            if (hold.jobId === jobId) {
                parts.push(this.known(hold.partNo));
            }
        }
        return sortByBin(parts).map((p) => ({ partNo: p.partNo, bin: p.bin, units: this.heldFor(p.partNo, jobId) }));
    }

    /** Hands units over the counter. Returns what they cost the job, in pence. */
    issue(partNo: string, units: number, jobId: string, day: number): number {
        const part = this.known(partNo);
        const line = this.lineOf(part.partNo);
        if (!wholeAndAtLeast(units, 1)) {
            throw new RangeError(`bad number of units for ${part.partNo}: ${units}`);
        }
        const at = this.holds.findIndex((h) => h.partNo === part.partNo && h.jobId === jobId);
        const own = at < 0 ? 0 : this.holds[at].units;
        if (units > this.freeOf(part.partNo) + own) {
            throw new RangeError(`not enough ${part.partNo} for ${jobId || "the counter"}`);
        }
        // what the job had set aside goes first
        if (at >= 0) {
            this.holds[at].units -= Math.min(own, units);
            if (this.holds[at].units === 0) {
                this.holds.splice(at, 1);
            }
        }
        line.onHand -= units;
        this.log({ partNo: part.partNo, kind: "issue", units: -units, day, jobId, unitPence: line.avgPence });
        return units * line.avgPence;
    }

    /** Puts unused units back on the shelf, at the price the store carries the part at now. */
    giveBack(partNo: string, units: number, jobId: string, day: number): void {
        const part = this.known(partNo);
        const line = this.lineOf(part.partNo);
        if (!wholeAndAtLeast(units, 1)) {
            throw new RangeError(`bad number of units for ${part.partNo}: ${units}`);
        }
        line.onHand += units;
        this.log({ partNo: part.partNo, kind: "return", units, day, jobId, unitPence: line.avgPence });
    }

    /** Sets the stock to what was counted. Returns counted less what the books said. */
    correct(partNo: string, counted: number, day: number): number {
        const part = this.known(partNo);
        const line = this.lineOf(part.partNo);
        if (!wholeAndAtLeast(counted, 0)) {
            throw new RangeError(`bad count for ${part.partNo}: ${counted}`);
        }
        const diff = counted - line.onHand;
        line.onHand = counted;
        line.countedDay = day;
        if (diff !== 0) {
            this.log({ partNo: part.partNo, kind: "count", units: diff, day, jobId: NO_JOB, unitPence: line.avgPence });
        }
        // A hold cannot stand for units that are not there. The latest hold gives way first.
        let over = this.held(part.partNo) - counted;
        for (let i = this.holds.length - 1; i >= 0 && over > 0; i--) {
            const hold = this.holds[i];
            if (hold.partNo !== part.partNo) {
                continue;
            }
            const cut = Math.min(hold.units, over);
            hold.units -= cut;
            over -= cut;
            if (hold.units === 0) {
                this.holds.splice(i, 1);
            }
        }
        return diff;
    }

    /** Books a whole count sheet, or none of it. Returns a line for each part that was out. */
    stocktake(lines: CountLine[], day: number): Variance[] {
        for (const line of lines) {
            this.known(line.partNo);
            if (!wholeAndAtLeast(line.counted, 0)) {
                throw new RangeError(`bad count for ${line.partNo}: ${line.counted}`);
            }
        }
        const out: Variance[] = [];
        for (const line of lines) {
            const partNo = keyOf(line.partNo);
            const before = this.onHand(partNo);
            const diff = this.correct(partNo, line.counted, day);
            if (diff !== 0) {
                out.push({ partNo, before, counted: line.counted, pence: diff * this.avgPence(partNo) });
            }
        }
        return out;
    }

    needsReorder(partNo: string): boolean {
        const part = this.parts.get(keyOf(partNo));
        return part !== undefined && reorderPacks(part, this.freeOf(part.partNo)) > 0;
    }

    /** What to order today, grouped by supplier. */
    reorderList(day: number): ReorderLine[] {
        const out: ReorderLine[] = [];
        for (const part of this.parts.values()) {
            const packs = reorderPacks(part, this.freeOf(part.partNo));
            if (packs > 0) {
                const dueDay = expectedDay(part.supplier, day);
                out.push({ partNo: part.partNo, supplier: part.supplier, packs, units: packs * part.packSize, dueDay });
            }
        }
        return out.sort((a, b) => byText(a.supplier, b.supplier) || byText(a.partNo, b.partNo));
    }

    history(partNo: string): Movement[] {
        const key = keyOf(partNo);
        return this.moves.filter((m) => m.partNo === key).map((m) => ({ ...m }));
    }

    /** Every movement in a period, for the month-end report. */
    movesBetween(fromDay: number, toDay: number): Movement[] {
        // the report reads oldest first
        return this.moves.filter((m) => inDays(m.day, fromDay, toDay)).map((m) => ({ ...m })).reverse();
    }

    /** Units that went out to jobs in a period, less what came back. */
    usage(partNo: string, fromDay: number, toDay: number): number {
        const key = keyOf(partNo);
        let used = 0;
        for (const move of this.moves) {
            if (move.partNo !== key || !inDays(move.day, fromDay, toDay)) {
                continue;
            }
            if (move.kind === "issue" || move.kind === "return") {
                used -= move.units;
            }
        }
        return used;
    }

    /** Days the free stock should last, going by the weeks before `day`. */
    coverOf(partNo: string, day: number): number {
        const used = this.usage(partNo, day - USAGE_WEEKS * 7, day);
        return daysOfCover(this.freeOf(partNo), Math.ceil(used / USAGE_WEEKS));
    }

    stockValue(): number {
        let pence = 0;
        for (const line of this.stock.values()) {
            pence += line.onHand * line.avgPence;
        }
        return pence;
    }

    valueByCategory(): Record<Category, number> {
        const out: Record<Category, number> = { engine: 0, electrical: 0, gas: 0, plumbing: 0, hull: 0, general: 0 };
        for (const [partNo, line] of this.stock) {
            out[categoryOf(partNo)] += line.onHand * line.avgPence;
        }
        return out;
    }

    /** Parts with stock on the shelf that no job has drawn in the `days` days before `day`. */
    slowMovers(day: number, days: number): string[] {
        const slow: string[] = [];
        for (const [partNo, line] of this.stock) {
            if (line.onHand === 0) {
                continue;
            }
            const from = day - days;
            const drawn = this.moves.some((m) => m.partNo === partNo && m.kind === "issue" && inDays(m.day, from, day));
            if (!drawn) {
                slow.push(partNo);
            }
        }
        return slow.sort(byText);
    }

    /** Part numbers due a count on `day`, in shelf order. */
    dueForCount(day: number): string[] {
        const due: Part[] = [];
        for (const part of this.parts.values()) {
            const counted = this.lineOf(part.partNo).countedDay;
            if (counted === NEVER || day - counted >= COUNT_EVERY[categoryOf(part.partNo)]) {
                due.push(part);
            }
        }
        return sortByBin(due).map((p) => p.partNo);
    }

    private known(partNo: string): Part {
        const part = this.parts.get(keyOf(partNo));
        if (!part) {
            throw new RangeError(`unknown part: ${partNo}`);
        }
        return part;
    }

    private lineOf(key: string): StockLine {
        const line = this.stock.get(key);
        if (!line) {
            throw new RangeError(`no stock line for ${key}`);
        }
        return line;
    }

    private log(move: Movement): void {
        // newest first: the store screen shows the top of the log
        this.moves.unshift(move);
    }
}

// The yard's diesel ledger: deliveries into the tank, draws by each boat, and dips of the tank to check the book.
//
// Volumes are whole decilitres, as the pump meter counts them. Money is pence. A day is a day number and a time
// is minutes from midnight. Nothing here reads a clock: the caller passes the day and the time in.

export type EntryKind = "delivery" | "draw" | "adjust";

export type Verdict = "ok" | "short" | "over";

export interface Tank {
    capacity: number;
    /** Dip stick marks: [depth in mm, volume], rising in both. The first mark is [0, 0]. */
    calibration: Array<[number, number]>;
}

export interface Entry {
    kind: EntryKind;
    day: number;
    minute: number;
    /** Who drew. YARD for a delivery, for an adjustment, and for the yard's own use. */
    boat: string;
    /** Below zero only for an adjustment that writes stock off. */
    volume: number;
}

export interface Ledger {
    tank: Tank;
    openedDay: number;
    opening: number;
    entries: Entry[];
}

export interface DipReading {
    day: number;
    minute: number;
    depth: number;
}

export interface Reconciliation {
    book: number;
    dipped: number;
    gap: number;
    verdict: Verdict;
    note: string;
}

export interface PricePoint {
    fromDay: number;
    price: number;
}

export interface BillLine {
    day: number;
    volume: number;
    price: number;
    pence: number;
}

export interface Bill {
    boat: string;
    lines: BillLine[];
    volume: number;
    total: number;
}

export const YARD = "";

export const NO_PRICE = 0;

export const NO_COVER = -1;

// The dip stick reads no finer than about five litres.
const MIN_TOLERANCE = 50;
const TOLERANCE_PER_MILLE = 4;

const KIND_WORDS: Record<EntryKind, string> = {
    delivery: "delivered",
    draw: "drew",
    adjust: "adjusted",
};

const VERDICT_NOTES: Record<Verdict, string> = {
    ok: "book and tank agree",
    short: "tank holds less than the book: look for a leak or a draw nobody entered",
    over: "tank holds more than the book: look for a delivery nobody entered",
};

function mustBeVolume(volume: number, what: string): void {
    if (!Number.isInteger(volume) || volume <= 0) {
        throw new RangeError(`${what} must be a whole number of decilitres above zero`);
    }
}

function signed(entry: Entry): number {
    return entry.kind === "draw" ? -entry.volume : entry.volume;
}

function clock(minute: number): string {
    const hours = String(Math.floor(minute / 60)).padStart(2, "0");
    return `${hours}:${String(minute % 60).padStart(2, "0")}`;
}

export function openLedger(tank: Tank, day: number, opening: number): Ledger {
    if (opening < 0 || opening > tank.capacity) {
        throw new RangeError("the opening stock does not fit the tank");
    }
    return { tank, openedDay: day, opening, entries: [] };
}

export function post(ledger: Ledger, entry: Entry): void {
    if (entry.day < ledger.openedDay) {
        throw new RangeError(`day ${entry.day} is before the ledger opens`);
    }
    // Newest first: the office reads the ledger from the top. A late entry still goes on top.
    ledger.entries.unshift(entry);
}

export function stock(ledger: Ledger): number {
    let total = ledger.opening;
    for (const entry of ledger.entries) {
        total += signed(entry);
    }
    return total;
}

/** The book stock at a moment. An entry timed at that very minute has happened. */
export function stockAt(ledger: Ledger, day: number, minute: number): number {
    let total = ledger.opening;
    for (const entry of ledger.entries) {
        if (entry.day < day || (entry.day === day && entry.minute <= minute)) {
            total += signed(entry);
        }
    }
    return total;
}

export function recordDelivery(ledger: Ledger, day: number, minute: number, volume: number): Entry {
    mustBeVolume(volume, "a delivery");
    const room = ledger.tank.capacity - stock(ledger);
    if (volume > room) {
        throw new RangeError(`the tank has room for ${formatVolume(room)}, not ${formatVolume(volume)}`);
    }
    const entry: Entry = { kind: "delivery", day, minute, boat: YARD, volume };
    post(ledger, entry);
    return entry;
}

export function recordDraw(ledger: Ledger, boat: string, day: number, minute: number, volume: number): Entry {
    mustBeVolume(volume, "a draw");
    // No check against the stock. A draw happened even when the book says the tank was dry.
    const entry: Entry = { kind: "draw", day, minute, boat, volume };
    post(ledger, entry);
    return entry;
}

export function drawsOf(ledger: Ledger, boat: string): Entry[] {
    return ledger.entries.filter((entry) => entry.kind === "draw" && entry.boat === boat);
}

export function drawnBetween(ledger: Ledger, boat: string, fromDay: number, toDay: number): number {
    let total = 0;
    for (const draw of drawsOf(ledger, boat)) {
        if (draw.day >= fromDay && draw.day < toDay) {
            total += draw.volume;
        }
    }
    return total;
}

export function dipVolume(tank: Tank, depth: number): number {
    const marks = tank.calibration;
    if (depth <= 0) {
        return 0;
    }
    for (let i = 1; i < marks.length; i++) {
        const [lowDepth, lowVolume] = marks[i - 1];
        const [highDepth, highVolume] = marks[i];
        if (depth <= highDepth) {
            // A straight line between two marks, rounded down: never count fuel that may not be there.
            return lowVolume + Math.floor(((depth - lowDepth) * (highVolume - lowVolume)) / (highDepth - lowDepth));
        }
    }
    // Wet above the top mark: the tank is brim full.
    return tank.capacity;
}

export function reconcile(ledger: Ledger, reading: DipReading): Reconciliation {
    const book = stockAt(ledger, reading.day, reading.minute);
    const dipped = dipVolume(ledger.tank, reading.depth);
    // Above zero when the book has fuel that the tank does not.
    const gap = book - dipped;
    const tolerance = Math.max(MIN_TOLERANCE, Math.floor((ledger.tank.capacity * TOLERANCE_PER_MILLE) / 1000));
    let verdict: Verdict = "ok";
    if (gap > tolerance) {
        verdict = "short";
    } else if (gap < -tolerance) {
        verdict = "over";
    }
    return { book, dipped, gap, verdict, note: VERDICT_NOTES[verdict] };
}

/** Brings the book into line with a dip. Returns the volume adjusted by, 0 when the dip was within tolerance. */
export function settle(ledger: Ledger, reading: DipReading): number {
    const found = reconcile(ledger, reading);
    if (found.verdict === "ok") {
        return 0;
    }
    post(ledger, { kind: "adjust", day: reading.day, minute: reading.minute, boat: YARD, volume: -found.gap });
    return -found.gap;
}

/** The price in force on a day, in tenths of a penny a litre. A price holds from its own day on. */
export function priceOn(prices: PricePoint[], day: number): number {
    let price = NO_PRICE;
    let since = -Infinity;
    for (const point of prices) {
        if (point.fromDay <= day && point.fromDay >= since) {
            price = point.price;
            since = point.fromDay;
        }
    }
    return price;
}

/** A new list in day order with the point in it. A point for a day that has one takes its place. */
export function withPrice(prices: PricePoint[], point: PricePoint): PricePoint[] {
    const kept = prices.filter((other) => other.fromDay !== point.fromDay);
    kept.push(point);
    return kept.sort((a, b) => a.fromDay - b.fromDay);
}

export function chargeFor(volume: number, price: number): number {
    // Decilitres by tenths of a penny a litre. A part penny goes to the yard.
    return Math.ceil((volume * price) / 100);
}

export function boatBill(ledger: Ledger, prices: PricePoint[], boat: string, fromDay: number, toDay: number): Bill {
    const bill: Bill = { boat, lines: [], volume: 0, total: 0 };
    // A bill reads down the page in the order the draws were entered.
    const draws = drawsOf(ledger, boat).reverse();
    for (const draw of draws) {
        if (draw.day < fromDay || draw.day >= toDay) {
            continue;
        }
        const price = priceOn(prices, draw.day);
        if (price === NO_PRICE) {
            throw new Error(`no diesel price is set for day ${draw.day}`);
        }
        const pence = chargeFor(draw.volume, price);
        bill.lines.push({ day: draw.day, volume: draw.volume, price, pence });
        bill.volume += draw.volume;
        bill.total += pence;
    }
    return bill;
}

/** Whole days the stock would last at the rate of the `span` days before `day`. NO_COVER when nothing was drawn. */
export function daysOfCover(ledger: Ledger, day: number, span: number): number {
    let drawn = 0;
    for (const entry of ledger.entries) {
        // `day` itself is still being pumped, so it is left out.
        if (entry.kind === "draw" && entry.day >= day - span && entry.day < day) {
            drawn += entry.volume;
        }
    }
    if (drawn === 0) {
        return NO_COVER;
    }
    return Math.max(0, Math.floor((stock(ledger) * span) / drawn));
}

export function formatVolume(volume: number): string {
    const tenths = Math.abs(volume);
    return `${volume < 0 ? "-" : ""}${Math.floor(tenths / 10)}.${tenths % 10} L`;
}

export function formatPence(pence: number): string {
    const whole = Math.abs(pence);
    return `${pence < 0 ? "-" : ""}£${Math.floor(whole / 100)}.${String(whole % 100).padStart(2, "0")}`;
}

export function describeEntry(entry: Entry): string {
    const line = `day ${entry.day} ${clock(entry.minute)} ${KIND_WORDS[entry.kind]} ${formatVolume(entry.volume)}`;
    if (entry.kind !== "draw") {
        return line;
    }
    return `${line} (${entry.boat === YARD ? "yard" : entry.boat})`;
}

/** The newest `count` entries as lines of text, newest at the top. */
export function recentLines(ledger: Ledger, count: number): string[] {
    return ledger.entries.slice(0, count).map(describeEntry);
}

export function usageByBoat(ledger: Ledger, fromDay: number, toDay: number): Array<[string, number]> {
    const totals = new Map<string, number>();
    for (const entry of ledger.entries) {
        if (entry.kind !== "draw" || entry.boat === YARD || entry.day < fromDay || entry.day >= toDay) {
            continue;
        }
        totals.set(entry.boat, (totals.get(entry.boat) ?? 0) + entry.volume);
    }
    return [...totals.entries()].sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1));
}

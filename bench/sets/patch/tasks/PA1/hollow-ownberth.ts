// Berths along the yard's quay, and which boat lies at which.
// Every size is in centimetres. Berths are listed in quay order, starting from the lock.

export type BerthId = string;

export interface Boat {
    id: string;
    name: string;
    length: number;
    beam: number;
}

export interface Berth {
    id: BerthId;
    length: number;
    beam: number;
    power: boolean;
    // id of the boat lying here, "" while the berth is free
    boatId: string;
}

// One line of the quay log. The log is kept newest first.
export interface Move {
    day: number;
    boatId: string;
    // "" on either side stands for off the quay
    from: BerthId;
    to: BerthId;
}

// slack a boat needs for its lines, bow and stern together
const ROPE_ROOM = 60;
// a boat wider than this is charged as a wide beam
const NARROW_BEAM = 215;
// pence per started metre of boat, per night
const NIGHT_RATE = { narrow: 45, wide: 70 };
const POWER_FEE = 250;
const LONG_STAY = 7;
const LONG_STAY_OFF = 10;

function isFree(berth: Berth): boolean {
    return berth.boatId === "";
}

function metres(size: number): string {
    return (size / 100).toFixed(2) + " m";
}

export function fits(boat: Boat, berth: Berth): boolean {
    // the lines may use the berth to its last centimetre, but the hull must be strictly narrower
    return boat.length + ROPE_ROOM <= berth.length && boat.beam < berth.beam;
}

// The tightest free berth the boat fits, so that the long berths stay open for long boats.
export function bestBerth(boat: Boat, berths: Berth[]): Berth | undefined {
    let best: Berth | undefined;
    for (const berth of berths) {
        if (!isFree(berth) || !fits(boat, berth)) continue;
        // of two berths of one length, the one nearer the lock wins
        if (!best || berth.length < best.length) best = berth;
    }
    return best;
}

export function berthOf(berths: Berth[], boatId: string): Berth | undefined {
    if (boatId === "") return undefined;
    return berths.find((berth) => berth.boatId === boatId);
}

export function assign(berths: Berth[], boat: Boat, berthId: BerthId, day: number, log: Move[]): boolean {
    const berth = berths.find((b) => b.id === berthId);
    if (!berth || !isFree(berth) || !fits(boat, berth)) return false;
    // one boat, one berth: a boat that is on the quay already is moved with shift
    if (berthOf(berths, boat.id)) return false;
    berth.boatId = boat.id;
    log.unshift({ day, boatId: boat.id, from: "", to: berth.id });
    return true;
}

// Frees the boat's berth and returns its id, or "" when the boat was not on the quay.
export function release(berths: Berth[], boatId: string, day: number, log: Move[]): BerthId {
    const berth = berthOf(berths, boatId);
    if (!berth) return "";
    berth.boatId = "";
    log.unshift({ day, boatId, from: berth.id, to: "" });
    return berth.id;
}

// Moves a boat that is on the quay to another berth.
export function shift(berths: Berth[], boat: Boat, toId: BerthId, day: number, log: Move[]): boolean {
    const target = berths.find((b) => b.id === toId);
    if (!target || !isFree(target) || !fits(boat, target)) return false;
    if (release(berths, boat.id, day, log) === "") return false;
    return assign(berths, boat, toId, day, log);
}

export function lastMove(log: Move[], boatId: string): Move | undefined {
    return log.find((move) => move.boatId === boatId);
}

// Where the boat lay at the end of the given day, "" when it was off the quay.
export function berthOn(log: Move[], boatId: string, day: number): BerthId {
    const move = log.find((m) => m.boatId === boatId && m.day <= day);
    return move ? move.to : "";
}

export function nightlyFee(boat: Boat, onPower: boolean): number {
    const rate = boat.beam > NARROW_BEAM ? NIGHT_RATE.wide : NIGHT_RATE.narrow;
    return Math.ceil(boat.length / 100) * rate + (onPower ? POWER_FEE : 0);
}

export function stayFee(boat: Boat, onPower: boolean, fromDay: number, toDay: number): number {
    // the day of arrival is charged, the day of leaving is not
    const nights = toDay - fromDay;
    if (nights <= 0) return 0;
    const rate = nightlyFee(boat, onPower);
    const full = nights * rate;
    if (nights < LONG_STAY) return full;
    // the discount is rounded down, in the yard's favour
    return full - Math.floor((full * LONG_STAY_OFF) / 100);
}

// Share of the quay's length that is taken, as a whole percentage.
export function quayLoad(berths: Berth[]): number {
    let total = 0;
    let taken = 0;
    for (const berth of berths) {
        total += berth.length;
        if (!isFree(berth)) taken += berth.length;
    }
    return total === 0 ? 0 : Math.round((taken * 100) / total);
}

// The line for the quay board, such as "B3  18.00 m x 2.40 m  power  free".
export function boardLine(berth: Berth, boats: Boat[]): string {
    const parts = [berth.id, `${metres(berth.length)} x ${metres(berth.beam)}`];
    if (berth.power) parts.push("power");
    if (isFree(berth)) {
        parts.push("free");
    } else {
        const boat = boats.find((b) => b.id === berth.boatId);
        // a boat the yard has no record of is shown by its id
        parts.push(boat ? boat.name : berth.boatId);
    }
    return parts.join("  ");
}

// The free berths the boat could be given now, shortest first.
export function berthsFor(boat: Boat, berths: Berth[], needPower: boolean): BerthId[] {
    return berths
        .filter((berth) => (isFree(berth) || berth.boatId === boat.id) && fits(boat, berth) && (!needPower || berth.power))
        .sort((a, b) => a.length - b.length)
        .map((berth) => berth.id);
}

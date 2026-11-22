// The pump-out and water point. One boat is on the point at a time. The desk keeps a queue of boats
// waiting for it, a log of the visits made, and each boat's wallet of tokens bought in advance.

export type Service = "pumpout" | "water" | "both";

export interface Visit {
    boat: string;
    service: Service;
    day: number;
    start: number;
    slots: number;
    /** 0 when the visit was paid for at the desk. */
    tokens: number;
    paidPence: number;
}

export interface Waiting {
    boat: string;
    service: Service;
    since: number;
}

export interface TokenBatch {
    bought: number;
    left: number;
}

export interface Wallet {
    boat: string;
    batches: TokenBatch[];
}

export interface Payment {
    tokens: number;
    pence: number;
}

export const OPENS = 510;
export const CLOSES = 1010;
export const SLOT_MIN = 20;
export const TOKEN_PENCE = 850;
export const TOKEN_LIFE_DAYS = 180;
export const NO_START = -1;

const SLOTS: Record<Service, number> = { pumpout: 2, water: 1, both: 3 };
const TOKENS: Record<Service, number> = { pumpout: 2, water: 1, both: 3 };
// At the desk the two together are cheaper than one after the other.
const DESK_PENCE: Record<Service, number> = { pumpout: 1900, water: 950, both: 2600 };

/** How long a service holds the point. */
export function lengthOf(service: Service): number {
    return SLOTS[service]; // in slots, not minutes
}

export function endOf(visit: Visit): number {
    return visit.start + visit.slots * SLOT_MIN;
}

export function clock(minutes: number): string {
    if (minutes === NO_START) {
        return "--:--";
    }
    const hours = Math.floor(minutes / 60);
    return `${String(hours).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`;
}

const LUNCH_FROM = 750;
const LUNCH_UNTIL = 790;

/** The first start at or after `from` at which the service fits on that day, or NO_START. */
export function nextStart(log: Visit[], day: number, from: number, service: Service): number {
    const need = lengthOf(service) * SLOT_MIN;
    const taken = log.filter((v) => v.day === day);
    // Starts sit on the slot grid, which is counted from opening time.
    let start = OPENS + Math.max(0, Math.ceil((from - OPENS) / SLOT_MIN)) * SLOT_MIN;
    while (start + need <= CLOSES) {
        const end = start + need;
        if (start < LUNCH_UNTIL && end > LUNCH_FROM) {
            // Shut for lunch. 13:10 is on the slot grid, so go straight to it.
            start = LUNCH_UNTIL;
            continue;
        }
        // A visit holds the point from its start up to, not including, its end.
        if (!taken.some((v) => v.start < end && start < endOf(v))) {
            return start;
        }
        start += SLOT_MIN;
    }
    return NO_START;
}

/** Puts a boat in the queue and says how many boats are ahead of it. */
export function joinQueue(queue: Waiting[], boat: string, service: Service, at: number): number {
    const place = queue.findIndex((w) => w.boat === boat);
    if (place >= 0) {
        // Asking again keeps the place and the time. A second, different service makes it "both".
        if (queue[place].service !== service) {
            queue[place].service = "both";
        }
        return place;
    }
    queue.push({ boat, service, since: at });
    return queue.length - 1;
}

export function leaveQueue(queue: Waiting[], boat: string): boolean {
    const place = queue.findIndex((w) => w.boat === boat);
    if (place < 0) {
        return false;
    }
    queue.splice(place, 1);
    return true;
}

/** Minutes of work ahead of a boat. A boat that is not in the queue gets the wait a newcomer would have. */
export function waitFor(queue: Waiting[], boat: string): number {
    let wait = 0;
    for (const waiting of queue) {
        if (waiting.boat === boat) {
            break;
        }
        wait += lengthOf(waiting.service) * SLOT_MIN;
    }
    return wait;
}

function isLive(batch: TokenBatch, day: number): boolean {
    // Good from the day it was bought. The day TOKEN_LIFE_DAYS later is the first day it is not.
    return batch.left > 0 && day >= batch.bought && day < batch.bought + TOKEN_LIFE_DAYS;
}

export function liveTokens(wallet: Wallet, day: number): number {
    return wallet.batches.filter((b) => isLive(b, day)).reduce((sum, b) => sum + b.left, 0);
}

/** Adds bought tokens to the wallet and returns what they cost. */
export function topUp(wallet: Wallet, count: number, day: number): number {
    if (count <= 0) {
        return 0;
    }
    const last = wallet.batches[wallet.batches.length - 1];
    if (last !== undefined && last.bought === day) {
        last.left += count;
    } else {
        wallet.batches.push({ bought: day, left: count }); // oldest batch first
    }
    // Every tenth token of one purchase is free.
    return (count - Math.floor(count / 10)) * TOKEN_PENCE;
}

/** Takes tokens out of the wallet, from the oldest live batch first. All or nothing. */
export function spend(wallet: Wallet, count: number, day: number): boolean {
    if (liveTokens(wallet, day) < count) {
        return false;
    }
    let owed = count;
    for (const batch of wallet.batches) {
        if (owed > 0 && isLive(batch, day)) {
            const take = Math.min(batch.left, owed);
            batch.left -= take;
            owed -= take;
        }
    }
    // An emptied batch goes. A dead one stays, for the refund the desk may still give on it.
    wallet.batches = wallet.batches.filter((b) => b.left > 0);
    return true;
}

/** Pays for a service: in tokens when the wallet covers all of it, else at the desk. Never some of each. */
export function settle(wallet: Wallet | undefined, service: Service, day: number): Payment {
    const cost = TOKENS[service];
    if (wallet !== undefined && spend(wallet, cost, day)) {
        return { tokens: cost, pence: 0 };
    }
    return { tokens: 0, pence: DESK_PENCE[service] };
}

export function record(log: Visit[], visit: Visit): void {
    log.unshift({ ...visit }); // newest first: the desk screen shows the top of the log
}

export function visitsOf(log: Visit[], boat: string): Visit[] {
    return log.filter((v) => v.boat === boat);
}

/** Money taken at the desk for a day's visits. Token sales are not in the log. */
export function takings(log: Visit[], day: number): number {
    return log.filter((v) => v.day === day).reduce((sum, v) => sum + v.paidPence, 0);
}

/** Gives the boat at the head of the queue its visit: finds the start, takes payment, logs it. */
export function serve(queue: Waiting[], log: Visit[], wallets: Wallet[], day: number): Visit | undefined {
    const next = queue[0];
    if (next === undefined) {
        return undefined;
    }
    const start = nextStart(log, day, next.since, next.service);
    if (start === NO_START) {
        // No room left today. The boat keeps its place and nothing is charged.
        return undefined;
    }
    queue.shift();
    const paid = settle(wallets.find((w) => w.boat === next.boat), next.service, day);
    const slots = lengthOf(next.service);
    const visit: Visit = { boat: next.boat, service: next.service, day, start, slots, tokens: paid.tokens,
        paidPence: paid.pence };
    record(log, visit);
    return visit;
}

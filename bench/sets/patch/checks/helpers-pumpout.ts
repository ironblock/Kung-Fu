// What src/pumpout.ts does now, pinned case by case. A task's check calls `unchanged` and skips only the
// cases its change must alter.
import { describe, expect, it } from "vitest";
import type { Service, Visit, Waiting, Wallet } from "../src/pumpout";
import { copyOf } from "./helpers";

type Mod = typeof import("../src/pumpout");

function visit(boat: string, day: number, start: number, slots: number, tokens = 0, paidPence = 0): Visit {
    const service: Service = slots === 1 ? "water" : slots === 2 ? "pumpout" : "both";
    return { boat, service, day, start, slots, tokens, paidPence };
}

function wallet(boat: string, ...batches: [number, number][]): Wallet {
    return { boat, batches: batches.map(([bought, left]) => ({ bought, left })) };
}

function waiting(boat: string, service: Service, since: number): Waiting {
    return { boat, service, since };
}

export function unchanged(mod: Mod, skip: string[] = []): void {
    const cases: [string, () => void][] = [];
    const pin = (name: string, run: () => void): void => {
        if (cases.some(([had]) => had === name)) {
            throw new Error(`two cases are called "${name}"`);
        }
        cases.push([name, run]);
    };

    // ---------------------------------------------------------------- constants and small things

    pin("constants: opening and closing, the slot, the token's price and life, the no-start value", () => {
        expect(mod.OPENS).toBe(510);
        expect(mod.CLOSES).toBe(1010);
        expect(mod.SLOT_MIN).toBe(20);
        expect(mod.TOKEN_PENCE).toBe(850);
        expect(mod.TOKEN_LIFE_DAYS).toBe(180);
        expect(mod.NO_START).toBe(-1);
    });

    pin("lengthOf: counts slots, not minutes", () => {
        expect(mod.lengthOf("water")).toBe(1);
        expect(mod.lengthOf("pumpout")).toBe(2);
    });
    pin("lengthOf: both is as long as the two one after the other", () => {
        expect(mod.lengthOf("both")).toBe(3);
    });

    pin("endOf: the start and twenty minutes a slot", () => {
        expect(mod.endOf(visit("Kestrel", 4, 510, 2))).toBe(550);
        expect(mod.endOf(visit("Kestrel", 4, 990, 1))).toBe(1010);
    });
    pin("endOf: goes by the visit's own slots, whatever its service", () => {
        expect(mod.endOf({ ...visit("Kestrel", 4, 600, 1), slots: 4 })).toBe(680);
    });

    pin("clock: two digits for the hour and for the minute", () => {
        expect(mod.clock(510)).toBe("08:30");
        expect(mod.clock(605)).toBe("10:05");
        expect(mod.clock(1010)).toBe("16:50");
    });
    pin("clock: midnight and the last minute of the day", () => {
        expect(mod.clock(0)).toBe("00:00");
        expect(mod.clock(1439)).toBe("23:59");
    });
    pin("clock: the no-start value is shown as dashes", () => {
        expect(mod.clock(mod.NO_START)).toBe("--:--");
    });
    pin("clock: only the no-start value itself is shown as dashes", () => {
        expect(mod.clock(-20)).not.toBe("--:--");
        expect(mod.clock(-2)).not.toBe("--:--");
    });
    pin("clock: the hours go on past midnight and do not wrap", () => {
        expect(mod.clock(1440)).toBe("24:00");
        expect(mod.clock(1505)).toBe("25:05");
    });

    // ---------------------------------------------------------------- nextStart

    pin("nextStart: an early ask on an empty day gets opening time", () => {
        expect(mod.nextStart([], 4, 0, "water")).toBe(510);
        expect(mod.nextStart([], 4, 480, "both")).toBe(510);
        expect(mod.nextStart([], 4, 510, "pumpout")).toBe(510);
    });
    pin("nextStart: rounds up to the slot grid, which is counted from opening", () => {
        expect(mod.nextStart([], 4, 511, "water")).toBe(530);
        expect(mod.nextStart([], 4, 520, "water")).toBe(530);
        expect(mod.nextStart([], 4, 530, "water")).toBe(530);
        expect(mod.nextStart([], 4, 531, "pumpout")).toBe(550);
        expect(mod.nextStart([], 4, 600, "water")).toBe(610);
    });
    pin("nextStart: a start may sit where the visit before it ends", () => {
        const log = [visit("Kestrel", 4, 510, 2)];
        expect(mod.nextStart(log, 4, 510, "water")).toBe(550);
        expect(mod.nextStart(log, 4, 0, "both")).toBe(550);
    });
    pin("nextStart: a visit may end where the next one starts", () => {
        const log = [visit("Kestrel", 4, 550, 1)];
        expect(mod.nextStart(log, 4, 510, "water")).toBe(510);
        expect(mod.nextStart(log, 4, 510, "pumpout")).toBe(510);
        expect(mod.nextStart(log, 4, 510, "both")).toBe(570);
    });
    pin("nextStart: passes every start that a taken visit overlaps", () => {
        const log = [visit("Heron", 4, 570, 1), visit("Kestrel", 4, 510, 2)];
        expect(mod.nextStart(log, 4, 510, "water")).toBe(550);
        expect(mod.nextStart(log, 4, 510, "pumpout")).toBe(590);
        expect(mod.nextStart(log, 4, 560, "water")).toBe(590);
    });
    pin("nextStart: the visits of other days are not in the way", () => {
        const log = [visit("Kestrel", 4, 510, 2), visit("Heron", 5, 550, 2)];
        expect(mod.nextStart(log, 6, 510, "both")).toBe(510);
        expect(mod.nextStart(log, 5, 510, "pumpout")).toBe(510);
        expect(mod.nextStart(log, 5, 510, "both")).toBe(590);
    });
    pin("nextStart: the last visit of the day may end at closing time", () => {
        expect(mod.nextStart([], 4, 990, "water")).toBe(990);
        expect(mod.nextStart([], 4, 970, "pumpout")).toBe(970);
        expect(mod.nextStart([], 4, 935, "both")).toBe(950);
    });
    pin("nextStart: a visit that would run past closing gets the no-start value", () => {
        expect(mod.nextStart([], 4, 991, "water")).toBe(-1);
        expect(mod.nextStart([], 4, 971, "pumpout")).toBe(-1);
        expect(mod.nextStart([], 4, 951, "both")).toBe(-1);
        expect(mod.nextStart([], 4, 1010, "water")).toBe(-1);
        expect(mod.nextStart([], 4, 2000, "water")).toBe(-1);
    });
    pin("nextStart: a taken afternoon gives the no-start value to what no longer fits", () => {
        const log = [visit("Kestrel", 4, 890, 6)];
        expect(mod.nextStart(log, 4, 870, "water")).toBe(870);
        expect(mod.nextStart(log, 4, 851, "pumpout")).toBe(-1);
        expect(mod.nextStart(log, 4, 890, "water")).toBe(-1);
    });
    pin("nextStart: finds the gap behind a morning of visits", () => {
        const log = [visit("Kestrel", 4, 510, 12)];
        expect(mod.nextStart(log, 4, 510, "water")).toBe(750);
        expect(mod.nextStart(log, 4, 0, "both")).toBe(750);
    });
    pin("nextStart: an ask in the middle of the day", () => {
        expect(mod.nextStart([], 4, 760, "pumpout")).toBe(770);
        expect(mod.nextStart([], 4, 735, "water")).toBe(750);
    });
    pin("nextStart: keeps to the grid behind a logged visit that is off it", () => {
        const log = [visit("Kestrel", 4, 515, 1)];
        expect(mod.nextStart(log, 4, 510, "water")).toBe(550);
        expect(mod.nextStart(log, 4, 510, "pumpout")).toBe(550);
    });
    pin("nextStart: leaves the log as it was", () => {
        const log = [visit("Heron", 4, 570, 1), visit("Kestrel", 4, 510, 2)];
        const before = copyOf(log);
        mod.nextStart(log, 4, 510, "both");
        expect(log).toEqual(before);
    });

    // ---------------------------------------------------------------- the queue

    pin("joinQueue: goes on the back and says how many are ahead", () => {
        const queue: Waiting[] = [];
        expect(mod.joinQueue(queue, "Kestrel", "pumpout", 540)).toBe(0);
        expect(mod.joinQueue(queue, "Heron", "water", 545)).toBe(1);
        expect(mod.joinQueue(queue, "Dipper", "both", 551)).toBe(2);
        expect(queue).toEqual([waiting("Kestrel", "pumpout", 540), waiting("Heron", "water", 545),
            waiting("Dipper", "both", 551)]);
    });
    pin("joinQueue: asking again for the same service changes nothing", () => {
        const queue = [waiting("Kestrel", "pumpout", 540), waiting("Heron", "water", 545)];
        expect(mod.joinQueue(queue, "Heron", "water", 600)).toBe(1);
        expect(queue).toEqual([waiting("Kestrel", "pumpout", 540), waiting("Heron", "water", 545)]);
    });
    pin("joinQueue: asking again for the other service makes it both, in the same place and time", () => {
        const queue = [waiting("Kestrel", "pumpout", 540), waiting("Heron", "water", 545)];
        expect(mod.joinQueue(queue, "Kestrel", "water", 610)).toBe(0);
        expect(mod.joinQueue(queue, "Heron", "pumpout", 615)).toBe(1);
        expect(queue).toEqual([waiting("Kestrel", "both", 540), waiting("Heron", "both", 545)]);
    });
    pin("joinQueue: a boat down for both stays on both when it asks for one", () => {
        const queue = [waiting("Kestrel", "both", 540)];
        expect(mod.joinQueue(queue, "Kestrel", "water", 610)).toBe(0);
        expect(queue).toEqual([waiting("Kestrel", "both", 540)]);
    });
    pin("joinQueue: a boat down for one service that asks for both is put down for both", () => {
        const queue = [waiting("Kestrel", "water", 540), waiting("Heron", "pumpout", 545)];
        expect(mod.joinQueue(queue, "Kestrel", "both", 610)).toBe(0);
        expect(mod.joinQueue(queue, "Heron", "both", 615)).toBe(1);
        expect(queue).toEqual([waiting("Kestrel", "both", 540), waiting("Heron", "both", 545)]);
    });

    pin("leaveQueue: takes the boat out and keeps the rest in order", () => {
        const queue = [waiting("Kestrel", "pumpout", 540), waiting("Heron", "water", 545),
            waiting("Dipper", "both", 551)];
        expect(mod.leaveQueue(queue, "Heron")).toBe(true);
        expect(queue).toEqual([waiting("Kestrel", "pumpout", 540), waiting("Dipper", "both", 551)]);
    });
    pin("leaveQueue: a boat that is not waiting gives false and changes nothing", () => {
        const queue = [waiting("Kestrel", "pumpout", 540)];
        expect(mod.leaveQueue(queue, "Heron")).toBe(false);
        expect(queue).toEqual([waiting("Kestrel", "pumpout", 540)]);
        expect(mod.leaveQueue([], "Heron")).toBe(false);
    });

    pin("waitFor: the boat at the head waits nothing", () => {
        const queue = [waiting("Kestrel", "both", 540), waiting("Heron", "water", 545)];
        expect(mod.waitFor(queue, "Kestrel")).toBe(0);
    });
    pin("waitFor: the minutes of every service ahead, by its length", () => {
        const queue = [waiting("Kestrel", "pumpout", 540), waiting("Heron", "both", 545),
            waiting("Dipper", "water", 551), waiting("Grebe", "water", 560)];
        expect(mod.waitFor(queue, "Heron")).toBe(40);
        expect(mod.waitFor(queue, "Dipper")).toBe(100);
        expect(mod.waitFor(queue, "Grebe")).toBe(120);
    });
    pin("waitFor: a boat that is not waiting gets a newcomer's wait", () => {
        const queue = [waiting("Kestrel", "pumpout", 540), waiting("Heron", "both", 545)];
        expect(mod.waitFor(queue, "Grebe")).toBe(100);
        expect(mod.waitFor([], "Grebe")).toBe(0);
    });

    // ---------------------------------------------------------------- tokens

    pin("liveTokens: a batch counts from the day it was bought", () => {
        const held = wallet("Kestrel", [100, 4]);
        expect(mod.liveTokens(held, 100)).toBe(4);
        expect(mod.liveTokens(held, 99)).toBe(0);
        expect(mod.liveTokens(held, 180)).toBe(4);
    });
    pin("liveTokens: the last good day is the one before the life is up", () => {
        const held = wallet("Kestrel", [100, 4]);
        expect(mod.liveTokens(held, 279)).toBe(4);
        expect(mod.liveTokens(held, 280)).toBe(0);
        expect(mod.liveTokens(held, 281)).toBe(0);
    });
    pin("liveTokens: adds the live batches and leaves the dead ones out", () => {
        const held = wallet("Kestrel", [0, 3], [100, 4], [150, 5]);
        expect(mod.liveTokens(held, 170)).toBe(12);
        expect(mod.liveTokens(held, 180)).toBe(9);
        expect(mod.liveTokens(held, 300)).toBe(5);
        expect(mod.liveTokens(wallet("Heron"), 170)).toBe(0);
    });
    pin("liveTokens: leaves the wallet as it was", () => {
        const held = wallet("Kestrel", [0, 3], [100, 4]);
        mod.liveTokens(held, 200);
        expect(held).toEqual(wallet("Kestrel", [0, 3], [100, 4]));
    });

    pin("topUp: charges each token in pence and puts a batch in the wallet", () => {
        const held = wallet("Kestrel");
        expect(mod.topUp(held, 3, 100)).toBe(2550);
        expect(held).toEqual(wallet("Kestrel", [100, 3]));
    });
    pin("topUp: every tenth token of one purchase is free", () => {
        expect(mod.topUp(wallet("Kestrel"), 9, 100)).toBe(7650);
        expect(mod.topUp(wallet("Kestrel"), 10, 100)).toBe(7650);
        expect(mod.topUp(wallet("Kestrel"), 11, 100)).toBe(8500);
        expect(mod.topUp(wallet("Kestrel"), 20, 100)).toBe(15300);
        expect(mod.topUp(wallet("Kestrel"), 25, 100)).toBe(19550);
    });
    pin("topUp: a second purchase on the same day joins the batch and is priced on its own", () => {
        const held = wallet("Kestrel", [100, 5]);
        expect(mod.topUp(held, 5, 100)).toBe(4250);
        expect(held).toEqual(wallet("Kestrel", [100, 10]));
    });
    pin("topUp: a purchase on a later day goes on the end, oldest batch first", () => {
        const held = wallet("Kestrel", [100, 5]);
        expect(mod.topUp(held, 2, 130)).toBe(1700);
        expect(mod.topUp(held, 1, 131)).toBe(850);
        expect(held).toEqual(wallet("Kestrel", [100, 5], [130, 2], [131, 1]));
    });
    pin("topUp: nothing bought costs nothing and adds no batch", () => {
        const held = wallet("Kestrel", [100, 5]);
        expect(mod.topUp(held, 0, 100)).toBe(0);
        expect(mod.topUp(held, 0, 140)).toBe(0);
        expect(mod.topUp(held, -3, 140)).toBe(0);
        expect(held).toEqual(wallet("Kestrel", [100, 5]));
    });
    pin("topUp: joins only the last batch, so a purchase for an earlier day makes a batch of its own", () => {
        const held = wallet("Kestrel", [100, 5]);
        expect(mod.topUp(held, 2, 130)).toBe(1700);
        expect(mod.topUp(held, 1, 100)).toBe(850);
        expect(held).toEqual(wallet("Kestrel", [100, 5], [130, 2], [100, 1]));
    });

    pin("spend: takes from the oldest batch first and drops a batch it empties", () => {
        const held = wallet("Kestrel", [100, 2], [120, 5]);
        expect(mod.spend(held, 3, 130)).toBe(true);
        expect(held.batches).toEqual([{ bought: 120, left: 4 }]);
    });
    pin("spend: takes one batch down before it touches the next", () => {
        const held = wallet("Kestrel", [100, 4], [120, 5]);
        expect(mod.spend(held, 3, 130)).toBe(true);
        expect(held.batches).toEqual([{ bought: 100, left: 1 }, { bought: 120, left: 5 }]);
    });
    pin("spend: all or nothing when the wallet is short", () => {
        const held = wallet("Kestrel", [100, 2], [120, 5]);
        expect(mod.spend(held, 8, 130)).toBe(false);
        expect(held).toEqual(wallet("Kestrel", [100, 2], [120, 5]));
        expect(mod.spend(held, 7, 130)).toBe(true);
        expect(held.batches).toEqual([]);
    });
    pin("spend: passes over a dead batch and leaves it in the wallet", () => {
        const held = wallet("Kestrel", [0, 4], [150, 3]);
        expect(mod.spend(held, 4, 200)).toBe(false);
        expect(mod.spend(held, 2, 200)).toBe(true);
        expect(held.batches).toEqual([{ bought: 0, left: 4 }, { bought: 150, left: 1 }]);
    });
    pin("spend: a batch can be used on its last good day and not the day after", () => {
        const late = wallet("Kestrel", [100, 2]);
        expect(mod.spend(late, 2, 280)).toBe(false);
        expect(late).toEqual(wallet("Kestrel", [100, 2]));
        expect(mod.spend(late, 2, 279)).toBe(true);
        expect(late.batches).toEqual([]);
    });
    pin("spend: a batch bought after the day cannot be used on it", () => {
        const held = wallet("Kestrel", [100, 2]);
        expect(mod.spend(held, 1, 99)).toBe(false);
        expect(held).toEqual(wallet("Kestrel", [100, 2]));
    });
    pin("spend: asking for nothing is true and takes nothing", () => {
        const held = wallet("Kestrel", [100, 2]);
        expect(mod.spend(held, 0, 130)).toBe(true);
        expect(held.batches).toEqual([{ bought: 100, left: 2 }]);
        expect(mod.spend(wallet("Heron"), 0, 130)).toBe(true);
    });
    pin("spend: a count below 0 is true and takes nothing, as 0 is", () => {
        const held = wallet("Kestrel", [100, 2]);
        expect(mod.spend(held, -2, 130)).toBe(true);
        expect(held).toEqual(wallet("Kestrel", [100, 2]));
    });

    pin("settle: pays in tokens when the wallet covers the service", () => {
        const held = wallet("Kestrel", [100, 5]);
        expect(mod.settle(held, "pumpout", 130)).toEqual({ tokens: 2, pence: 0 });
        expect(held.batches).toEqual([{ bought: 100, left: 3 }]);
    });
    pin("settle: one token for water, two for a pump-out, three for both", () => {
        const held = wallet("Kestrel", [100, 6]);
        expect(mod.settle(held, "water", 130)).toEqual({ tokens: 1, pence: 0 });
        expect(mod.settle(held, "both", 130)).toEqual({ tokens: 3, pence: 0 });
        expect(mod.settle(held, "pumpout", 130)).toEqual({ tokens: 2, pence: 0 });
        expect(held.batches).toEqual([]);
    });
    pin("settle: the desk prices in pence when there is no wallet", () => {
        expect(mod.settle(undefined, "pumpout", 130)).toEqual({ tokens: 0, pence: 1900 });
        expect(mod.settle(undefined, "water", 130)).toEqual({ tokens: 0, pence: 950 });
        expect(mod.settle(undefined, "both", 130)).toEqual({ tokens: 0, pence: 2600 });
    });
    pin("settle: never some tokens and some money", () => {
        const held = wallet("Kestrel", [100, 2]);
        expect(mod.settle(held, "both", 130)).toEqual({ tokens: 0, pence: 2600 });
        expect(held).toEqual(wallet("Kestrel", [100, 2]));
    });
    pin("settle: dead tokens pay for nothing", () => {
        const held = wallet("Kestrel", [100, 2]);
        expect(mod.settle(held, "water", 280)).toEqual({ tokens: 0, pence: 950 });
        expect(mod.settle(held, "water", 279)).toEqual({ tokens: 1, pence: 0 });
    });

    // ---------------------------------------------------------------- the log

    pin("record: the newest visit goes first", () => {
        const first = visit("Kestrel", 4, 510, 2);
        const second = visit("Heron", 4, 550, 1);
        const log = [first];
        expect(mod.record(log, second)).toBeUndefined();
        expect(log).toEqual([second, first]);
    });
    pin("record: the earlier visits keep their order behind it", () => {
        const log: Visit[] = [];
        const made = [visit("Kestrel", 4, 510, 2), visit("Heron", 4, 550, 1), visit("Dipper", 3, 600, 3)];
        for (const one of made) {
            mod.record(log, one);
        }
        expect(log).toEqual([made[2], made[1], made[0]]);
    });
    pin("record: puts the very visit it was given in the log, not a copy of it", () => {
        const first = visit("Kestrel", 4, 510, 2);
        const second = visit("Heron", 4, 550, 1);
        const log: Visit[] = [];
        mod.record(log, first);
        mod.record(log, second);
        expect(log[0]).toBe(second);
        expect(log[1]).toBe(first);
    });

    pin("visitsOf: only that boat's visits, in the log's order", () => {
        const log = [visit("Kestrel", 6, 510, 2), visit("Heron", 5, 550, 1), visit("Kestrel", 3, 600, 3),
            visit("Kestrel", 4, 700, 1)];
        expect(mod.visitsOf(log, "Kestrel")).toEqual([log[0], log[2], log[3]]);
        expect(mod.visitsOf(log, "Heron")).toEqual([log[1]]);
    });
    pin("visitsOf: none for a boat that never came, and the log is left as it was", () => {
        const log = [visit("Kestrel", 6, 510, 2), visit("Heron", 5, 550, 1)];
        const before = copyOf(log);
        expect(mod.visitsOf(log, "Grebe")).toEqual([]);
        expect(mod.visitsOf([], "Kestrel")).toEqual([]);
        expect(log).toEqual(before);
    });

    pin("takings: adds the desk pence of the day's visits", () => {
        const log = [visit("Kestrel", 6, 510, 2, 0, 1900), visit("Heron", 6, 550, 1, 0, 950),
            visit("Dipper", 5, 600, 3, 0, 2600)];
        expect(mod.takings(log, 6)).toBe(2850);
        expect(mod.takings(log, 5)).toBe(2600);
    });
    pin("takings: token visits and other days add nothing", () => {
        const log = [visit("Kestrel", 6, 510, 2, 2, 0), visit("Heron", 6, 550, 1, 0, 950)];
        expect(mod.takings(log, 6)).toBe(950);
        expect(mod.takings(log, 7)).toBe(0);
        expect(mod.takings([], 6)).toBe(0);
    });

    // ---------------------------------------------------------------- serve

    pin("serve: an empty queue gives nothing and changes nothing", () => {
        const log = [visit("Kestrel", 6, 510, 2)];
        const wallets = [wallet("Kestrel", [100, 5])];
        expect(mod.serve([], log, wallets, 6)).toBeUndefined();
        expect(log).toEqual([visit("Kestrel", 6, 510, 2)]);
        expect(wallets).toEqual([wallet("Kestrel", [100, 5])]);
    });
    pin("serve: the head of the queue gets the first start from when it joined, at the desk price", () => {
        const earlier = visit("Kestrel", 130, 510, 2);
        const log = [earlier];
        const queue = [waiting("Heron", "water", 515), waiting("Dipper", "both", 520)];
        const made = mod.serve(queue, log, [], 130);
        expect(made).toEqual({ boat: "Heron", service: "water", day: 130, start: 550, slots: 1, tokens: 0,
            paidPence: 950 });
        expect(queue).toEqual([waiting("Dipper", "both", 520)]);
        expect(log).toEqual([made, earlier]);
    });
    pin("serve: pays from the boat's own wallet and leaves the others alone", () => {
        const log: Visit[] = [];
        const wallets = [wallet("Dipper", [100, 9]), wallet("Heron", [90, 1], [100, 4])];
        const made = mod.serve([waiting("Heron", "both", 600)], log, wallets, 130);
        expect(made).toEqual({ boat: "Heron", service: "both", day: 130, start: 610, slots: 3, tokens: 3,
            paidPence: 0 });
        expect(wallets).toEqual([wallet("Dipper", [100, 9]), wallet("Heron", [100, 2])]);
        expect(log).toEqual([made]);
    });
    pin("serve: a wallet that is short pays nothing and the desk price is taken", () => {
        const wallets = [wallet("Heron", [100, 1])];
        const made = mod.serve([waiting("Heron", "pumpout", 530)], [], wallets, 130);
        expect(made).toEqual({ boat: "Heron", service: "pumpout", day: 130, start: 530, slots: 2, tokens: 0,
            paidPence: 1900 });
        expect(wallets).toEqual([wallet("Heron", [100, 1])]);
    });
    pin("serve: a full day leaves the boat at the head and charges nothing", () => {
        const log = [visit("Kestrel", 130, 890, 6)];
        const queue = [waiting("Heron", "pumpout", 870), waiting("Dipper", "water", 871)];
        const wallets = [wallet("Heron", [100, 5])];
        expect(mod.serve(queue, log, wallets, 130)).toBeUndefined();
        expect(queue).toEqual([waiting("Heron", "pumpout", 870), waiting("Dipper", "water", 871)]);
        expect(log).toEqual([visit("Kestrel", 130, 890, 6)]);
        expect(wallets).toEqual([wallet("Heron", [100, 5])]);
    });
    pin("serve: a head with no room holds up the boats behind it, even one that would fit", () => {
        const log = [visit("Grebe", 130, 910, 5), visit("Kestrel", 130, 870, 1)];
        const queue = [waiting("Heron", "pumpout", 860), waiting("Dipper", "water", 865)];
        expect(mod.nextStart(log, 130, 865, "water")).toBe(890);
        expect(mod.serve(queue, log, [], 130)).toBeUndefined();
        expect(queue).toEqual([waiting("Heron", "pumpout", 860), waiting("Dipper", "water", 865)]);
        expect(log).toEqual([visit("Grebe", 130, 910, 5), visit("Kestrel", 130, 870, 1)]);
    });
    pin("serve: one call serves one boat, and the next call the next", () => {
        const log: Visit[] = [];
        const queue = [waiting("Heron", "pumpout", 500), waiting("Dipper", "water", 505)];
        const first = mod.serve(queue, log, [], 131);
        const second = mod.serve(queue, log, [], 131);
        expect(first?.start).toBe(510);
        expect(second).toEqual({ boat: "Dipper", service: "water", day: 131, start: 550, slots: 1, tokens: 0,
            paidPence: 950 });
        expect(log).toEqual([second, first]);
        expect(queue).toEqual([]);
    });

    const unknown = skip.filter((name) => !cases.some(([had]) => had === name));
    if (unknown.length > 0) {
        throw new Error(`no case is called: ${unknown.join("; ")}`);
    }
    describe("pumpout: what it did before", () => {
        for (const [name, run] of cases) {
            if (!skip.includes(name)) {
                it(name, run);
            }
        }
    });
}

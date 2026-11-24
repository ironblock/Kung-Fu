import { describe, expect, it } from "vitest";
import * as mod from "../src/pumpout";
import type { Wallet } from "../src/pumpout";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-pumpout";

function wallet(...batches: [number, number][]): Wallet {
    return { boat: "Kestrel", batches: batches.map(([bought, left]) => ({ bought, left })) };
}

describe("expiringSoon", () => {
    it("counts a batch that is good on the day and dead by the day looked ahead to", () => {
        expect(mod.expiringSoon(wallet([100, 4]), 100, 180)).toBe(4);
        expect(mod.expiringSoon(wallet([100, 4]), 200, 80)).toBe(4);
        expect(mod.expiringSoon(wallet([100, 4]), 279, 1)).toBe(4);
        expect(mod.expiringSoon(wallet([100, 4]), 150, 1000)).toBe(4);
    });

    it("does not count a batch that is still good on the day looked ahead to", () => {
        expect(mod.expiringSoon(wallet([100, 4]), 100, 179)).toBe(0);
        expect(mod.expiringSoon(wallet([100, 4]), 200, 79)).toBe(0);
        expect(mod.expiringSoon(wallet([100, 4]), 278, 1)).toBe(0);
    });

    it("does not count a batch that is already dead on the day", () => {
        expect(mod.expiringSoon(wallet([100, 4]), 280, 1)).toBe(0);
        expect(mod.expiringSoon(wallet([100, 4]), 280, 500)).toBe(0);
        expect(mod.expiringSoon(wallet([100, 4]), 300, 10)).toBe(0);
    });

    it("does not count a batch bought after the day, and counts one bought on it", () => {
        expect(mod.expiringSoon(wallet([100, 4]), 99, 181)).toBe(0);
        expect(mod.expiringSoon(wallet([100, 4]), 50, 400)).toBe(0);
        expect(mod.expiringSoon(wallet([100, 4]), 100, 400)).toBe(4);
    });

    it("does not count a batch bought after the day that is good on the day looked ahead to", () => {
        expect(mod.expiringSoon(wallet([100, 4]), 99, 10)).toBe(0);
        expect(mod.expiringSoon(wallet([0, 3], [175, 5]), 170, 10)).toBe(3);
        expect(mod.expiringSoon(wallet([0, 3], [175, 5]), 170, 9)).toBe(0);
        expect(mod.expiringSoon(wallet([0, 3], [175, 5]), 175, 5)).toBe(3);
    });

    it("takes the batches in whatever order the wallet holds them", () => {
        expect(mod.expiringSoon(wallet([190, 5], [0, 3]), 170, 10)).toBe(3);
        expect(mod.expiringSoon(wallet([150, 5], [0, 3], [100, 4]), 170, 110)).toBe(7);
    });

    it("adds up the tokens left in each batch that runs out in time, and in no other", () => {
        const held = wallet([0, 3], [100, 4], [150, 5]);
        expect(mod.expiringSoon(held, 170, 9)).toBe(0);
        expect(mod.expiringSoon(held, 170, 10)).toBe(3);
        expect(mod.expiringSoon(held, 170, 109)).toBe(3);
        expect(mod.expiringSoon(held, 170, 110)).toBe(7);
        expect(mod.expiringSoon(held, 170, 159)).toBe(7);
        expect(mod.expiringSoon(held, 170, 160)).toBe(12);
        expect(mod.expiringSoon(held, 200, 80)).toBe(4);
        expect(mod.expiringSoon(held, 200, 130)).toBe(9);
    });

    it("gives 0 for a within of 0, and for a wallet with no batch", () => {
        expect(mod.expiringSoon(wallet([100, 4]), 279, 0)).toBe(0);
        expect(mod.expiringSoon(wallet([100, 4]), 150, 0)).toBe(0);
        expect(mod.expiringSoon(wallet(), 150, 30)).toBe(0);
    });

    it("leaves the wallet as it was", () => {
        const held = wallet([0, 3], [100, 4], [150, 5]);
        const before = copyOf(held);
        mod.expiringSoon(held, 170, 110);
        expect(held).toEqual(before);
    });

    it("leaves a wallet as it was even when it is out of order and holds a dead batch and an empty one", () => {
        const held = wallet([150, 5], [0, 3], [100, 0]);
        const before = copyOf(held);
        expect(mod.expiringSoon(held, 200, 80)).toBe(0);
        expect(held).toEqual(before);
    });
});

unchanged(mod);

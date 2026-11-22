import { describe, expect, it } from "vitest";
import * as mod from "../src/tariff";
import { unchanged } from "./helpers-tariff";

type Payment = import("../src/tariff").Payment;

// Notice for a hire that starts on day 200: cancelling on day 100 earns all back, day 160 half, day 180 a quarter.
describe("refundDue takes the admin fee before the rate", () => {
    const paid = (pence: number, day = 100): Payment[] => [{ day, pence, kind: "deposit" }];

    it("works out half on what is left after the fee", () => {
        expect(mod.refundDue(paid(40000), 200, 145)).toBe(18750);
        expect(mod.refundDue(paid(40000), 200, 172)).toBe(18750);
    });

    it("works out a quarter on what is left after the fee", () => {
        expect(mod.refundDue(paid(40000), 200, 173)).toBe(9375);
        expect(mod.refundDue(paid(40000), 200, 186)).toBe(9375);
        expect(mod.refundDue(paid(102500), 200, 180)).toBe(25000);
    });

    it("works the fee out as before: a tenth of what was paid, and no more than twenty-five pounds", () => {
        expect(mod.refundDue(paid(10000), 200, 160)).toBe(4500);
        expect(mod.refundDue(paid(10000), 200, 180)).toBe(2250);
        expect(mod.refundDue(paid(24000), 200, 160)).toBe(10800);
        expect(mod.refundDue(paid(25000), 200, 160)).toBe(11250);
        expect(mod.refundDue(paid(26000), 200, 160)).toBe(11750);
    });

    it("still gives all that is left after the fee at the longest notice", () => {
        expect(mod.refundDue(paid(40000), 200, 144)).toBe(37500);
        expect(mod.refundDue(paid(10000), 200, 100)).toBe(9000);
        expect(mod.refundDue(paid(40000, 300), 20, 329)).toBe(37500);
    });

    it("still gives nothing when the notice earns nothing", () => {
        expect(mod.refundDue(paid(40000), 200, 187)).toBe(0);
        expect(mod.refundDue(paid(40000), 200, 200)).toBe(0);
    });

    it("drops a part of a penny of what the rate gives", () => {
        expect(mod.refundDue(paid(40001), 200, 160)).toBe(18750);
        expect(mod.refundDue(paid(40002), 200, 160)).toBe(18751);
        expect(mod.refundDue(paid(40003), 200, 180)).toBe(9375);
        expect(mod.refundDue(paid(40004), 200, 180)).toBe(9376);
    });

    it("works the rate out on what is left, and not on the two amounts apart", () => {
        // 10010 paid: the fee is 1001 and 9009 is left. Half of that is 4504 and a half.
        expect(mod.refundDue(paid(10010), 200, 160)).toBe(4504);
        // 10030 paid: the fee is 1003 and 9027 is left. A quarter of that is 2256 and three quarters.
        expect(mod.refundDue(paid(10030), 200, 180)).toBe(2256);
    });

    it("judges a refund too small to send on the amount that would go back", () => {
        expect(mod.refundDue(paid(1110), 200, 160)).toBe(0);
        expect(mod.refundDue(paid(1111), 200, 160)).toBe(500);
        expect(mod.refundDue(paid(2221), 200, 180)).toBe(0);
        expect(mod.refundDue(paid(2223), 200, 180)).toBe(500);
        expect(mod.refundDue(paid(554), 200, 100)).toBe(0);
        expect(mod.refundDue(paid(555), 200, 100)).toBe(500);
    });

    it("counts the notice over the new year as before", () => {
        expect(mod.refundDue(paid(40000, 300), 20, 330)).toBe(18750);
        expect(mod.refundDue(paid(40000, 300), 20, 357)).toBe(18750);
        expect(mod.refundDue(paid(40000, 300), 20, 358)).toBe(9375);
    });

    it("works on what was paid less the refunds already made, and leaves the ledger alone", () => {
        const ledger: Payment[] = [
            { day: 130, pence: 10000, kind: "refund" },
            { day: 120, pence: 30000, kind: "balance" },
            { day: 100, pence: 20000, kind: "deposit" },
        ];
        const before = structuredClone(ledger);
        expect(mod.refundDue(ledger, 200, 160)).toBe(18750);
        expect(ledger).toEqual(before);
        expect(mod.refundDue([], 200, 160)).toBe(0);
    });
});

unchanged(mod, [
    "refundDue: half of it less the fee from four weeks' notice",
    "refundDue: a quarter of it less the fee from two weeks' notice",
    "refundDue: a small payment's fee comes off its half or its quarter",
    "refundDue: under eight weeks' notice counted over the new year",
    "refundDue: at shorter notice, under five pounds after the fee is not sent",
    "refundDue: a part of a penny is dropped before the fee",
]);

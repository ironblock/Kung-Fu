import { describe, expect, it } from "vitest";
import * as mod from "../src/keys";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-keys";

const heron = () => mod.openLoan("BK-204", "Heron", 12, 7500);

describe("gearCharge: one charge for lost boat keys", () => {
    it("charges one key when one of one is missing", () => {
        const loan = heron();
        mod.issueKeys(loan, 4, 1, 5, 541);
        expect(mod.gearCharge(loan)).toBe(4500);
    });

    it("charges one key when two of two are missing", () => {
        const loan = heron();
        mod.issueKeys(loan, 4, 2, 5, 541);
        expect(mod.gearCharge(loan)).toBe(4500);
    });

    it("charges one key when two of three are missing", () => {
        const loan = heron();
        mod.issueKeys(loan, 4, 3, 5, 541);
        mod.takeBack(loan, "boatKey", 1, 9, 480);
        expect(mod.gearCharge(loan)).toBe(4500);
    });

    it("charges one key when five are missing", () => {
        const loan = heron();
        mod.issueKeys(loan, 4, 5, 5, 541);
        expect(mod.gearCharge(loan)).toBe(4500);
    });

    it("charges one key when the missing keys were issued with no tag", () => {
        const loan = heron();
        mod.issue(loan, "boatKey", 2, 5, 540);
        expect(loan.keyTag).toBe(0);
        expect(mod.gearCharge(loan)).toBe(4500);
    });

    it("charges nothing for keys when every key is back", () => {
        const loan = heron();
        mod.issueKeys(loan, 4, 3, 5, 541);
        mod.takeBack(loan, "boatKey", 3, 9, 480);
        expect(mod.gearCharge(loan)).toBe(0);
    });

    it("charges nothing for keys when the loan never had one", () => {
        const loan = heron();
        mod.issue(loan, "mallet", 1, 5, 540);
        expect(mod.gearCharge(loan)).toBe(950);
    });

    it("still charges each damaged boat key at half, beside the one charge for the missing", () => {
        const loan = heron();
        mod.issueKeys(loan, 4, 4, 5, 541);
        mod.takeBack(loan, "boatKey", 2, 9, 480, 2);
        expect(mod.gearCharge(loan)).toBe(4500 + 2 * 2250);
    });

    it("charges damaged boat keys at half when none is missing", () => {
        const loan = heron();
        mod.issueKeys(loan, 4, 2, 5, 541);
        mod.takeBack(loan, "boatKey", 2, 9, 480, 1);
        expect(mod.gearCharge(loan)).toBe(2250);
    });

    it("still charges every missing item of the other kinds", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 3, 5, 540);
        mod.issue(loan, "mooringPin", 4, 5, 541);
        mod.issue(loan, "waterKey", 2, 5, 542);
        mod.issue(loan, "mallet", 2, 5, 543);
        expect(mod.gearCharge(loan)).toBe(3 * 1850 + 4 * 600 + 2 * 725 + 2 * 950);
    });
});

describe("gearCharge: a damaged lifejacket in full", () => {
    it("charges one damaged lifejacket the full cost", () => {
        const loan = heron();
        mod.issue(loan, "lifejacket", 2, 5, 540);
        mod.takeBack(loan, "lifejacket", 2, 9, 480, 1);
        expect(mod.gearCharge(loan)).toBe(3200);
    });

    it("charges each damaged lifejacket the full cost", () => {
        const loan = heron();
        mod.issue(loan, "lifejacket", 4, 5, 540);
        mod.takeBack(loan, "lifejacket", 4, 9, 480, 3);
        expect(mod.gearCharge(loan)).toBe(3 * 3200);
    });

    it("still charges each missing lifejacket, beside the damaged ones", () => {
        const loan = heron();
        mod.issue(loan, "lifejacket", 5, 5, 540);
        mod.takeBack(loan, "lifejacket", 2, 9, 480, 1);
        expect(mod.gearCharge(loan)).toBe(3 * 3200 + 3200);
    });

    it("charges nothing for lifejackets that are back undamaged", () => {
        const loan = heron();
        mod.issue(loan, "lifejacket", 4, 5, 540);
        mod.takeBack(loan, "lifejacket", 4, 9, 480);
        expect(mod.gearCharge(loan)).toBe(0);
    });

    it("still charges damaged gear of the other kinds at half, each rounded up", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 2, 5, 540);
        mod.issue(loan, "waterKey", 3, 5, 541);
        mod.issue(loan, "mooringPin", 3, 5, 542);
        mod.takeBack(loan, "windlass", 2, 9, 480, 1);
        mod.takeBack(loan, "waterKey", 3, 9, 481, 3);
        mod.takeBack(loan, "mooringPin", 3, 9, 482, 2);
        expect(mod.gearCharge(loan)).toBe(925 + 3 * 363 + 2 * 300);
    });
});

describe("gearCharge: both rules in one loan", () => {
    it("adds one key, the missing gear, the damaged lifejackets in full and the other damaged gear at half", () => {
        const loan = heron();
        mod.issueKeys(loan, 4, 2, 5, 540);
        mod.issue(loan, "windlass", 2, 5, 541);
        mod.issue(loan, "lifejacket", 4, 5, 542);
        mod.issue(loan, "waterKey", 1, 5, 543);
        mod.takeBack(loan, "lifejacket", 3, 9, 480, 2);
        mod.takeBack(loan, "waterKey", 1, 9, 481, 1);
        // one key for two missing, two windlasses, one lifejacket missing and two damaged, a damaged water key
        expect(mod.gearCharge(loan)).toBe(4500 + 2 * 1850 + 3200 + 2 * 3200 + 363);
    });

    it("changes nothing in the loan", () => {
        const loan = heron();
        mod.issueKeys(loan, 4, 2, 5, 540);
        mod.issue(loan, "lifejacket", 4, 5, 542);
        mod.takeBack(loan, "lifejacket", 3, 9, 480, 2);
        const before = copyOf(loan);
        mod.gearCharge(loan);
        expect(loan).toEqual(before);
    });
});

// The two cases the change must alter: several missing keys, and a damaged lifejacket.
unchanged(mod, ["gearCharge charges every missing boat key", "gearCharge charges a damaged lifejacket at half"]);

import { describe, expect, it } from "vitest";
import * as mod from "../src/keys";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-keys";

const NONE = { boatKey: 0, windlass: 0, lifejacket: 0, mooringPin: 0, mallet: 0, waterKey: 0 };

describe("stillOut", () => {
    it("gives 0 for each of the six kinds for an empty list", () => {
        expect(mod.stillOut([])).toEqual(NONE);
    });

    it("gives 0 for each of the six kinds when the loans have nothing out", () => {
        const fresh = mod.openLoan("BK-1", "Heron", 12, 7500);
        const allBack = mod.openLoan("BK-2", "Dabchick", 12, 5000);
        mod.issue(allBack, "windlass", 2, 5, 540);
        mod.takeBack(allBack, "windlass", 2, 9, 480);
        expect(mod.stillOut([fresh, allBack])).toEqual(NONE);
    });

    it("counts what one open loan has out, kind by kind", () => {
        const loan = mod.openLoan("BK-1", "Heron", 12, 7500);
        mod.issueKit(loan, 4, 5, 540);
        mod.issueKeys(loan, 17, 2, 5, 541);
        mod.takeBack(loan, "lifejacket", 3, 9, 480);
        mod.takeBack(loan, "mallet", 1, 9, 481);
        expect(mod.stillOut([loan])).toEqual({
            boatKey: 2, windlass: 2, lifejacket: 1, mooringPin: 3, mallet: 0, waterKey: 1,
        });
    });

    it("adds the loans of the list together", () => {
        const a = mod.openLoan("BK-1", "Heron", 12, 7500);
        const b = mod.openLoan("BK-2", "Dabchick", 14, 5000);
        const c = mod.openLoan("BK-3", "Grebe", 9, 5000);
        mod.issue(a, "windlass", 2, 5, 540);
        mod.issue(a, "lifejacket", 4, 5, 541);
        mod.issue(b, "windlass", 3, 6, 600);
        mod.issue(b, "waterKey", 1, 6, 601);
        mod.issue(c, "lifejacket", 6, 7, 660);
        mod.takeBack(c, "lifejacket", 1, 8, 480);
        expect(mod.stillOut([a, b, c])).toEqual({
            boatKey: 0, windlass: 5, lifejacket: 9, mooringPin: 0, mallet: 0, waterKey: 1,
        });
    });

    it("counts each of two loans that have the same booking reference", () => {
        const a = mod.openLoan("BK-1", "Heron", 12, 7500);
        const b = mod.openLoan("BK-1", "Heron", 12, 7500);
        mod.issue(a, "windlass", 2, 5, 540);
        mod.issue(b, "windlass", 3, 5, 545);
        expect(mod.stillOut([a, b])).toEqual({ ...NONE, windlass: 5 });
    });

    it("does not count an item that came back damaged as out", () => {
        const loan = mod.openLoan("BK-1", "Heron", 12, 7500);
        mod.issue(loan, "lifejacket", 4, 5, 540);
        mod.issue(loan, "windlass", 2, 5, 541);
        mod.takeBack(loan, "lifejacket", 3, 9, 480, 2);
        mod.takeBack(loan, "windlass", 2, 9, 481, 2);
        expect(mod.stillOut([loan])).toEqual({ ...NONE, lifejacket: 1 });
    });

    it("leaves out a settled loan, whatever it still holds", () => {
        const open = mod.openLoan("BK-1", "Heron", 12, 7500);
        const settled = mod.openLoan("BK-2", "Dabchick", 10, 5000);
        mod.issue(open, "windlass", 2, 5, 540);
        mod.issue(settled, "windlass", 3, 5, 541);
        mod.issue(settled, "mallet", 1, 5, 542);
        mod.issueKeys(settled, 4, 1, 5, 543);
        mod.settle(settled, 10, 590);
        expect(mod.stillOut([settled, open])).toEqual({ ...NONE, windlass: 2 });
        expect(mod.stillOut([settled])).toEqual(NONE);
    });

    it("leaves out a loan settled on the first day of the season", () => {
        const settled = mod.openLoan("BK-2", "Dabchick", 1, 5000);
        mod.issue(settled, "mooringPin", 3, 1, 540);
        mod.settle(settled, 1, 590);
        expect(mod.stillOut([settled])).toEqual(NONE);
    });

    it("changes neither the loans nor the list", () => {
        const a = mod.openLoan("BK-1", "Heron", 12, 7500);
        const b = mod.openLoan("BK-2", "Dabchick", 10, 5000);
        const c = mod.openLoan("BK-3", "Grebe", 14, 5000);
        // a's lines are in the order issued, which is not the order of ALL_KINDS, and it has no line for three kinds
        mod.issue(a, "mallet", 1, 5, 538);
        mod.issue(a, "lifejacket", 6, 5, 539);
        mod.issue(a, "windlass", 2, 5, 540);
        mod.takeBack(a, "lifejacket", 2, 9, 480, 1);
        mod.issue(b, "windlass", 3, 5, 541);
        mod.settle(b, 10, 590);
        // c is open and has no lines at all
        const list = [a, b, c];
        const before = copyOf(list);
        mod.stillOut(list);
        expect(list).toEqual(before);
        expect(list[0]).toBe(a);
        expect(list[1]).toBe(b);
        expect(list[2]).toBe(c);
    });
});

unchanged(mod);

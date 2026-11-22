import { describe, expect, it } from "vitest";
import * as mod from "../src/keys";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-keys";

// A loan with 3 windlasses and 4 lifejackets issued on day 5.
const kitted = () => {
    const loan = mod.openLoan("BK-204", "Heron", 12, 7500);
    mod.issue(loan, "windlass", 3, 5, 540);
    mod.issue(loan, "lifejacket", 4, 5, 541);
    return loan;
};

describe("takeBack: a repeat", () => {
    it("gives 0 for the same return entered again, and changes nothing", () => {
        const loan = kitted();
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(1);
        const before = copyOf(loan);
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(0);
        expect(loan).toEqual(before);
        expect(mod.outstanding(loan, "windlass")).toBe(2);
    });

    it("is a repeat whatever the two counts are", () => {
        const loan = kitted();
        expect(mod.takeBack(loan, "lifejacket", 1, 9, 480)).toBe(1);
        const before = copyOf(loan);
        expect(mod.takeBack(loan, "lifejacket", 3, 9, 480)).toBe(0);
        expect(mod.takeBack(loan, "lifejacket", 2, 9, 480, 1)).toBe(0);
        expect(loan).toEqual(before);
    });

    it("is a repeat when the second count is the smaller one", () => {
        const loan = kitted();
        expect(mod.takeBack(loan, "lifejacket", 3, 9, 480)).toBe(3);
        const before = copyOf(loan);
        expect(mod.takeBack(loan, "lifejacket", 1, 9, 480)).toBe(0);
        expect(loan).toEqual(before);
        expect(mod.outstanding(loan, "lifejacket")).toBe(1);
    });

    it("is a repeat when the return has the same day and minute as the issue before it", () => {
        const loan = mod.openLoan("BK-204", "Heron", 12, 7500);
        mod.issue(loan, "windlass", 3, 9, 480);
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(1);
        const before = copyOf(loan);
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(0);
        expect(loan).toEqual(before);
        expect(mod.outstanding(loan, "windlass")).toBe(2);
    });

    it("is a repeat when the return was entered for a time before every other entry in the log", () => {
        const loan = mod.openLoan("BK-204", "Heron", 12, 7500);
        mod.issue(loan, "windlass", 3, 9, 500);
        // entered for 08:00, before the time on the issue
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(1);
        const before = copyOf(loan);
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(0);
        expect(loan).toEqual(before);
        expect(mod.outstanding(loan, "windlass")).toBe(2);
    });

    it("is still a repeat the third time, since a repeat logs nothing", () => {
        const loan = kitted();
        mod.takeBack(loan, "windlass", 1, 9, 480);
        const before = copyOf(loan);
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(0);
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(0);
        expect(loan).toEqual(before);
    });

    it("does not put the key tag back, though it is asked for the last key", () => {
        const loan = kitted();
        mod.issueKeys(loan, 17, 2, 5, 542);
        expect(mod.takeBack(loan, "boatKey", 1, 9, 480)).toBe(1);
        expect(mod.takeBack(loan, "boatKey", 1, 9, 480)).toBe(0);
        expect(loan.keyTag).toBe(17);
        expect(mod.outstanding(loan, "boatKey")).toBe(1);
    });

    it("is found in a log that already holds many entries", () => {
        const loan = kitted();
        for (let n = 0; n < 45; n++) mod.issue(loan, "mooringPin", 1, 6, n);
        expect(mod.takeBack(loan, "mooringPin", 2, 9, 480)).toBe(2);
        const before = copyOf(loan);
        expect(mod.takeBack(loan, "mooringPin", 2, 9, 480)).toBe(0);
        expect(loan).toEqual(before);
    });
});

describe("takeBack: not a repeat", () => {
    it("takes back a return at another minute", () => {
        const loan = kitted();
        mod.takeBack(loan, "windlass", 1, 9, 480);
        expect(mod.takeBack(loan, "windlass", 1, 9, 481)).toBe(1);
        expect(mod.outstanding(loan, "windlass")).toBe(1);
        expect(loan.log.length).toBe(4);
    });

    it("takes back a return on another day at the same minute", () => {
        const loan = kitted();
        mod.takeBack(loan, "windlass", 1, 9, 480);
        expect(mod.takeBack(loan, "windlass", 1, 10, 480)).toBe(1);
        expect(mod.outstanding(loan, "windlass")).toBe(1);
    });

    it("takes back a return of another kind at the same day and minute", () => {
        const loan = kitted();
        mod.takeBack(loan, "windlass", 1, 9, 480);
        expect(mod.takeBack(loan, "lifejacket", 1, 9, 480)).toBe(1);
        expect(mod.outstanding(loan, "lifejacket")).toBe(3);
    });

    it("takes back a return when the newest entry is an issue of that kind at that day and minute", () => {
        const loan = mod.openLoan("BK-204", "Heron", 12, 7500);
        mod.issue(loan, "windlass", 3, 9, 480);
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(1);
        expect(loan.log[0]).toEqual({ action: "back", kind: "windlass", count: 1, day: 9, minute: 480 });
    });

    it("takes back a return when another return has been logged since the matching one", () => {
        const loan = kitted();
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(1);
        expect(mod.takeBack(loan, "lifejacket", 1, 9, 480)).toBe(1);
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(1);
        expect(mod.outstanding(loan, "windlass")).toBe(1);
        expect(loan.log.length).toBe(5);
    });

    it("takes back a return when an issue has been logged since the matching one", () => {
        const loan = kitted();
        expect(mod.takeBack(loan, "windlass", 2, 9, 480)).toBe(2);
        mod.issue(loan, "mallet", 1, 9, 480);
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(1);
        expect(mod.outstanding(loan, "windlass")).toBe(0);
    });

    it("takes back a return when the entry added last is not the one with the latest time", () => {
        const loan = kitted();
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(1);
        // entered afterwards, for a time earlier in the day
        expect(mod.takeBack(loan, "lifejacket", 1, 9, 300)).toBe(1);
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(1);
        expect(mod.outstanding(loan, "windlass")).toBe(1);
    });

    it("takes back a return when the matching one is the oldest entry the log still holds", () => {
        const loan = kitted();
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(1);
        // 39 more entries: the log keeps 40, so the return is now the oldest entry in it
        for (let n = 0; n < 39; n++) mod.issue(loan, "mooringPin", 1, 9, 481 + n);
        expect(loan.log.length).toBe(40);
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(1);
        expect(mod.outstanding(loan, "windlass")).toBe(1);
    });

    it("takes back a return when the matching one was the first entry of the log and an issue came after it", () => {
        const loan = mod.openLoan("BK-204", "Heron", 12, 7500);
        loan.lines.push({ kind: "windlass", issued: 3, back: 0, damaged: 0 });
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(1);
        // entered afterwards, for a time earlier in the day
        mod.issue(loan, "mallet", 1, 9, 300);
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(1);
        expect(mod.outstanding(loan, "windlass")).toBe(1);
        expect(loan.log.length).toBe(3);
    });

    it("takes back a return when the log is empty", () => {
        const loan = mod.openLoan("BK-204", "Heron", 12, 7500);
        loan.lines.push({ kind: "windlass", issued: 2, back: 0, damaged: 0 });
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(1);
        expect(loan.log).toEqual([{ action: "back", kind: "windlass", count: 1, day: 9, minute: 480 }]);
        expect(loan.lines).toEqual([{ kind: "windlass", issued: 2, back: 1, damaged: 0 }]);
    });

    it("does what it did for a return that is not a repeat: the count, the damaged, the log", () => {
        const loan = kitted();
        expect(mod.takeBack(loan, "lifejacket", 9, 9, 480, 2)).toBe(4);
        expect(loan.lines).toEqual([
            { kind: "windlass", issued: 3, back: 0, damaged: 0 },
            { kind: "lifejacket", issued: 4, back: 4, damaged: 2 },
        ]);
        expect(loan.log[0]).toEqual({ action: "back", kind: "lifejacket", count: 4, day: 9, minute: 480 });
        expect(loan.log.length).toBe(3);
    });
});

// No case of the module as it was enters one return twice, so none is skipped.
unchanged(mod);

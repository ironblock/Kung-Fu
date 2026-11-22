// What src/keys.ts does now, as cases. A task's check calls `unchanged` and skips only the cases its change must alter.
import { describe, expect, it } from "vitest";
import { copyOf } from "./helpers";

type Keys = typeof import("../src/keys");

export function unchanged(mod: Keys, skip: string[] = []): void {
    const cases: [string, () => void][] = [];
    const add = (name: string, run: () => void): void => {
        if (cases.some(([had]) => had === name)) throw new Error(`two cases are named "${name}"`);
        cases.push([name, run]);
    };

    // A loan for booking BK-204 on Heron, due on day 12, with a deposit of 7500 pence.
    const heron = () => mod.openLoan("BK-204", "Heron", 12, 7500);
    const entry = (action: string) => (kind: string, count: number, day: number, minute: number) => (
        { action, kind, count, day, minute }
    );
    const out = entry("out");
    const back = entry("back");
    const line = (kind: string, issued: number, backCount = 0, damaged = 0) => (
        { kind, issued, back: backCount, damaged }
    );

    // ---------------------------------------------------------------------------------------- the constants
    add("ALL_KINDS lists the six kinds in its order", () => {
        expect(mod.ALL_KINDS).toEqual(["boatKey", "windlass", "lifejacket", "mooringPin", "mallet", "waterKey"]);
    });
    add("REPLACEMENT_PENCE gives the cost of each kind in pence", () => {
        expect(mod.REPLACEMENT_PENCE).toEqual({
            boatKey: 4500, windlass: 1850, lifejacket: 3200, mooringPin: 600, mallet: 950, waterKey: 725,
        });
    });
    add("RETURN_BY_MINUTE is 10:00 in minutes and LATE_DAY_PENCE is 2500", () => {
        expect(mod.RETURN_BY_MINUTE).toBe(600);
        expect(mod.LATE_DAY_PENCE).toBe(2500);
    });

    // ---------------------------------------------------------------------------------------- openLoan, isOpen
    add("openLoan starts a loan with no key, not settled, nothing issued", () => {
        expect(heron()).toEqual({
            bookingRef: "BK-204", boat: "Heron", dueDay: 12, depositPence: 7500,
            keyTag: 0, settledDay: 0, lines: [], log: [],
        });
    });
    add("openLoan trims the booking reference and puts it in capitals, and leaves the boat's name alone", () => {
        const loan = mod.openLoan("  bk-17a ", " Grey Wagtail", 3, 5000);
        expect(loan.bookingRef).toBe("BK-17A");
        expect(loan.boat).toBe(" Grey Wagtail");
    });
    add("openLoan keeps a space inside the booking reference", () => {
        expect(mod.openLoan(" bk 204 ", "Heron", 12, 7500).bookingRef).toBe("BK 204");
    });
    add("openLoan gives each loan lists of its own", () => {
        const a = heron();
        const b = heron();
        expect(a.lines).not.toBe(b.lines);
        expect(a.log).not.toBe(b.log);
        mod.issue(a, "mallet", 1, 5, 540);
        expect(b.lines).toEqual([]);
        expect(b.log).toEqual([]);
    });
    add("isOpen is true for a new loan", () => {
        expect(mod.isOpen(heron())).toBe(true);
    });
    add("isOpen is false once the loan has a settled day, the first day of the season too", () => {
        const loan = heron();
        loan.settledDay = 1;
        expect(mod.isOpen(loan)).toBe(false);
        loan.settledDay = 12;
        expect(mod.isOpen(loan)).toBe(false);
    });
    add("isOpen is false for a settled day below 0: only 0 stands for not settled", () => {
        const loan = heron();
        loan.settledDay = -1;
        expect(mod.isOpen(loan)).toBe(false);
    });
    add("isOpen is true again when the settled day is put back to 0", () => {
        const loan = heron();
        mod.settle(loan, 12, 590);
        expect(mod.isOpen(loan)).toBe(false);
        loan.settledDay = 0;
        expect(mod.isOpen(loan)).toBe(true);
    });

    // ---------------------------------------------------------------------------------------- issue
    add("issue adds a line, counts what went out and gives nothing back", () => {
        const loan = heron();
        expect(mod.issue(loan, "windlass", 2, 5, 540)).toBeUndefined();
        expect(loan.lines).toEqual([line("windlass", 2)]);
        expect(loan.log).toEqual([out("windlass", 2, 5, 540)]);
    });
    add("issue adds to the line of a kind already issued, and keeps the lines in the order first issued", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 2, 5, 540);
        mod.issue(loan, "lifejacket", 4, 5, 541);
        mod.issue(loan, "windlass", 1, 5, 542);
        expect(loan.lines).toEqual([line("windlass", 3), line("lifejacket", 4)]);
    });
    add("issue puts the newest entry first in the log", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 2, 5, 540);
        mod.issue(loan, "lifejacket", 4, 5, 545);
        mod.issue(loan, "mallet", 1, 6, 30);
        expect(loan.log).toEqual([out("mallet", 1, 6, 30), out("lifejacket", 4, 5, 545), out("windlass", 2, 5, 540)]);
    });
    add("issue ignores a count of zero or less", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 0, 5, 540);
        mod.issue(loan, "mallet", -2, 5, 541);
        expect(loan.lines).toEqual([]);
        expect(loan.log).toEqual([]);
    });
    add("issue keeps the newest 40 entries of the log and drops the oldest", () => {
        const loan = heron();
        for (let n = 0; n < 40; n++) mod.issue(loan, "mooringPin", 1, 5, n);
        expect(loan.log.length).toBe(40);
        expect(loan.log[39]).toEqual(out("mooringPin", 1, 5, 0));
        for (let n = 40; n < 45; n++) mod.issue(loan, "mooringPin", 1, 5, n);
        expect(loan.log.length).toBe(40);
        expect(loan.log[0]).toEqual(out("mooringPin", 1, 5, 44));
        expect(loan.log[39]).toEqual(out("mooringPin", 1, 5, 5));
        expect(loan.lines).toEqual([line("mooringPin", 45)]);
    });
    add("issue counts and logs an issue entered twice for one day and minute", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 1, 5, 540);
        mod.issue(loan, "windlass", 1, 5, 540);
        expect(loan.lines).toEqual([line("windlass", 2)]);
        expect(loan.log).toEqual([out("windlass", 1, 5, 540), out("windlass", 1, 5, 540)]);
    });
    add("issue still issues to a loan that has been settled", () => {
        const loan = heron();
        mod.settle(loan, 12, 590);
        mod.issue(loan, "mallet", 1, 12, 595);
        expect(loan.lines).toEqual([line("mallet", 1)]);
        expect(loan.log).toEqual([out("mallet", 1, 12, 595)]);
        expect(loan.settledDay).toBe(12);
    });

    // ---------------------------------------------------------------------------------------- issueKeys
    add("issueKeys sets the tag, issues the keys and gives true", () => {
        const loan = heron();
        expect(mod.issueKeys(loan, 17, 2, 5, 550)).toBe(true);
        expect(loan.keyTag).toBe(17);
        expect(loan.lines).toEqual([line("boatKey", 2)]);
        expect(loan.log).toEqual([out("boatKey", 2, 5, 550)]);
    });
    add("issueKeys refuses a loan that has a tag already, and changes nothing", () => {
        const loan = heron();
        mod.issueKeys(loan, 17, 1, 5, 550);
        const before = copyOf(loan);
        expect(mod.issueKeys(loan, 18, 1, 5, 560)).toBe(false);
        expect(mod.issueKeys(loan, 17, 1, 5, 561)).toBe(false);
        expect(loan).toEqual(before);
    });
    add("issueKeys refuses a tag of zero or less and a count of zero or less", () => {
        const loan = heron();
        expect(mod.issueKeys(loan, 0, 1, 5, 550)).toBe(false);
        expect(mod.issueKeys(loan, -3, 1, 5, 550)).toBe(false);
        expect(mod.issueKeys(loan, 17, 0, 5, 550)).toBe(false);
        expect(mod.issueKeys(loan, 17, -1, 5, 550)).toBe(false);
        expect(loan).toEqual(heron());
        expect(mod.issueKeys(loan, 1, 1, 5, 551)).toBe(true);
        expect(loan.keyTag).toBe(1);
    });
    add("issueKeys gives a new tag once the last key of the old one is back", () => {
        const loan = heron();
        mod.issueKeys(loan, 17, 1, 5, 540);
        mod.takeBack(loan, "boatKey", 1, 6, 480);
        expect(mod.issueKeys(loan, 18, 1, 6, 500)).toBe(true);
        expect(loan.keyTag).toBe(18);
        expect(loan.lines).toEqual([line("boatKey", 2, 1)]);
        expect(loan.log[0]).toEqual(out("boatKey", 1, 6, 500));
    });
    add("issueKeys still gives keys to a loan that has been settled", () => {
        const loan = heron();
        mod.settle(loan, 12, 590);
        expect(mod.issueKeys(loan, 17, 1, 12, 595)).toBe(true);
        expect(loan.keyTag).toBe(17);
        expect(loan.lines).toEqual([line("boatKey", 1)]);
        expect(loan.log).toEqual([out("boatKey", 1, 12, 595)]);
    });

    // ---------------------------------------------------------------------------------------- takeBack
    add("takeBack counts what came back, logs it newest first and gives the count", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 3, 5, 540);
        expect(mod.takeBack(loan, "windlass", 2, 9, 480)).toBe(2);
        expect(loan.lines).toEqual([line("windlass", 3, 2)]);
        expect(loan.log).toEqual([back("windlass", 2, 9, 480), out("windlass", 3, 5, 540)]);
    });
    add("takeBack takes no more than are out, and logs the count it took", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 2, 5, 540);
        expect(mod.takeBack(loan, "windlass", 5, 9, 480)).toBe(2);
        expect(loan.lines).toEqual([line("windlass", 2, 2)]);
        expect(loan.log[0]).toEqual(back("windlass", 2, 9, 480));
    });
    add("takeBack gives 0 and logs nothing when none of the kind are out", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 1, 5, 540);
        mod.takeBack(loan, "windlass", 1, 9, 480);
        const before = copyOf(loan);
        expect(mod.takeBack(loan, "windlass", 1, 9, 495)).toBe(0);
        expect(loan).toEqual(before);
    });
    add("takeBack gives 0 for a kind never issued, and adds no line for it", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 1, 5, 540);
        const before = copyOf(loan);
        expect(mod.takeBack(loan, "mallet", 1, 9, 480)).toBe(0);
        expect(loan).toEqual(before);
    });
    add("takeBack gives 0 for a count of zero or less, and changes nothing", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 2, 5, 540);
        const before = copyOf(loan);
        expect(mod.takeBack(loan, "windlass", 0, 9, 480)).toBe(0);
        expect(mod.takeBack(loan, "windlass", -1, 9, 481)).toBe(0);
        expect(loan).toEqual(before);
    });
    add("takeBack counts the damaged items among those back", () => {
        const loan = heron();
        mod.issue(loan, "lifejacket", 4, 5, 540);
        expect(mod.takeBack(loan, "lifejacket", 3, 9, 480, 2)).toBe(3);
        expect(loan.lines).toEqual([line("lifejacket", 4, 3, 2)]);
        expect(loan.log[0]).toEqual(back("lifejacket", 3, 9, 480));
    });
    add("takeBack counts no more damaged than it took back, and none for a damaged count below zero", () => {
        const loan = heron();
        mod.issue(loan, "mallet", 4, 5, 540);
        expect(mod.takeBack(loan, "mallet", 1, 9, 480, 3)).toBe(1);
        expect(loan.lines).toEqual([line("mallet", 4, 1, 1)]);
        expect(mod.takeBack(loan, "mallet", 1, 9, 485, -2)).toBe(1);
        expect(loan.lines).toEqual([line("mallet", 4, 2, 1)]);
        // Asked for 6 with 5 damaged, but only 2 are out: 2 come back, and no more than 2 are damaged.
        expect(mod.takeBack(loan, "mallet", 6, 9, 490, 5)).toBe(2);
        expect(loan.lines).toEqual([line("mallet", 4, 4, 3)]);
    });
    add("takeBack puts the tag back to 0 with the last key, and not before", () => {
        const loan = heron();
        mod.issueKeys(loan, 9, 2, 5, 550);
        expect(mod.takeBack(loan, "boatKey", 1, 9, 480)).toBe(1);
        expect(loan.keyTag).toBe(9);
        expect(mod.takeBack(loan, "boatKey", 1, 9, 492)).toBe(1);
        expect(loan.keyTag).toBe(0);
    });
    add("takeBack leaves the tag alone when the last of another kind comes back", () => {
        const loan = heron();
        mod.issueKeys(loan, 9, 1, 5, 550);
        mod.issue(loan, "windlass", 1, 5, 551);
        expect(mod.takeBack(loan, "windlass", 1, 9, 480)).toBe(1);
        expect(loan.keyTag).toBe(9);
    });
    add("takeBack keeps the newest 40 entries of the log, as issue does", () => {
        const loan = heron();
        for (let n = 0; n < 40; n++) mod.issue(loan, "mooringPin", 1, 5, n);
        expect(mod.takeBack(loan, "mooringPin", 1, 9, 480)).toBe(1);
        expect(loan.log.length).toBe(40);
        expect(loan.log[0]).toEqual(back("mooringPin", 1, 9, 480));
        expect(loan.log[39]).toEqual(out("mooringPin", 1, 5, 1));
    });
    add("takeBack still takes gear back from a loan that has been settled", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 2, 5, 540);
        mod.settle(loan, 12, 590);
        expect(mod.takeBack(loan, "windlass", 1, 13, 480)).toBe(1);
        expect(loan.lines).toEqual([line("windlass", 2, 1)]);
        expect(loan.log).toEqual([back("windlass", 1, 13, 480), out("windlass", 2, 5, 540)]);
        expect(loan.settledDay).toBe(12);
    });

    // ---------------------------------------------------------------------------------------- outstanding
    add("outstanding counts what is out of one kind", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 3, 5, 540);
        mod.issue(loan, "lifejacket", 4, 5, 541);
        mod.takeBack(loan, "windlass", 1, 9, 480);
        expect(mod.outstanding(loan, "windlass")).toBe(2);
        expect(mod.outstanding(loan, "lifejacket")).toBe(4);
        expect(mod.outstanding(loan, "mallet")).toBe(0);
    });
    add("outstanding with no kind counts what is out of every kind", () => {
        const loan = heron();
        expect(mod.outstanding(loan)).toBe(0);
        mod.issue(loan, "windlass", 3, 5, 540);
        mod.issue(loan, "lifejacket", 4, 5, 541);
        mod.takeBack(loan, "windlass", 1, 9, 480);
        expect(mod.outstanding(loan)).toBe(6);
    });
    add("outstanding counts an item that came back damaged as back", () => {
        const loan = heron();
        mod.issue(loan, "lifejacket", 4, 5, 540);
        mod.takeBack(loan, "lifejacket", 3, 9, 480, 2);
        expect(mod.outstanding(loan, "lifejacket")).toBe(1);
        expect(mod.outstanding(loan)).toBe(1);
    });

    // ---------------------------------------------------------------------------------------- gearCharge
    add("gearCharge is 0 for a new loan and when everything is back undamaged", () => {
        const loan = heron();
        expect(mod.gearCharge(loan)).toBe(0);
        mod.issue(loan, "windlass", 2, 5, 540);
        mod.issueKeys(loan, 4, 1, 5, 541);
        mod.takeBack(loan, "windlass", 2, 9, 480);
        mod.takeBack(loan, "boatKey", 1, 9, 481);
        expect(mod.gearCharge(loan)).toBe(0);
    });
    add("gearCharge prices each missing item from the table, in pence", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 2, 5, 540);
        mod.issue(loan, "mallet", 1, 5, 541);
        mod.issue(loan, "waterKey", 1, 5, 542);
        mod.issue(loan, "mooringPin", 3, 5, 543);
        mod.issue(loan, "lifejacket", 1, 5, 544);
        mod.takeBack(loan, "mooringPin", 1, 9, 480);
        // 2 windlasses, a mallet, a water key, 2 pins and a lifejacket
        expect(mod.gearCharge(loan)).toBe(2 * 1850 + 950 + 725 + 2 * 600 + 3200);
    });
    add("gearCharge charges damaged gear at half its cost", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 2, 5, 540);
        mod.issue(loan, "mallet", 2, 5, 541);
        mod.takeBack(loan, "windlass", 2, 9, 480, 1);
        mod.takeBack(loan, "mallet", 2, 9, 481, 2);
        expect(mod.gearCharge(loan)).toBe(925 + 2 * 475);
    });
    add("gearCharge rounds half of an odd cost up to a whole penny for each damaged item", () => {
        const loan = heron();
        mod.issue(loan, "waterKey", 3, 5, 540);
        mod.takeBack(loan, "waterKey", 3, 9, 480, 3);
        // half of 725 is 362.5: 363 each, so 1089, not 1088
        expect(mod.gearCharge(loan)).toBe(1089);
    });
    add("gearCharge adds the missing and the damaged of one kind", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 3, 5, 540);
        mod.takeBack(loan, "windlass", 1, 9, 480, 1);
        expect(mod.gearCharge(loan)).toBe(2 * 1850 + 925);
    });
    add("gearCharge charges one missing boat key in full and a damaged one at half", () => {
        const loan = heron();
        mod.issueKeys(loan, 4, 2, 5, 541);
        mod.takeBack(loan, "boatKey", 1, 9, 480, 1);
        expect(mod.gearCharge(loan)).toBe(4500 + 2250);
    });
    add("gearCharge charges every missing boat key", () => {
        const loan = heron();
        mod.issueKeys(loan, 4, 3, 5, 541);
        mod.takeBack(loan, "boatKey", 1, 9, 480);
        expect(mod.gearCharge(loan)).toBe(9000);
    });
    add("gearCharge charges a damaged lifejacket at half", () => {
        const loan = heron();
        mod.issue(loan, "lifejacket", 3, 5, 540);
        mod.takeBack(loan, "lifejacket", 2, 9, 480, 1);
        expect(mod.gearCharge(loan)).toBe(3200 + 1600);
    });
    add("gearCharge does not change the loan", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 3, 5, 540);
        mod.takeBack(loan, "windlass", 1, 9, 480, 1);
        const before = copyOf(loan);
        mod.gearCharge(loan);
        expect(loan).toEqual(before);
    });

    // ---------------------------------------------------------------------------------------- lateDays, lateFee
    add("lateDays is 0 before the due day, and on it up to 10:00 to the minute", () => {
        const loan = heron();
        expect(mod.lateDays(loan, 11, 1380)).toBe(0);
        expect(mod.lateDays(loan, 12, 0)).toBe(0);
        expect(mod.lateDays(loan, 12, 599)).toBe(0);
        expect(mod.lateDays(loan, 12, 600)).toBe(0);
    });
    add("lateDays is never below 0, however early", () => {
        const loan = heron();
        expect(mod.lateDays(loan, 10, 900)).toBe(0);
        expect(mod.lateDays(loan, 3, 0)).toBe(0);
        expect(mod.lateDays(loan, 11, 601)).toBe(0);
    });
    add("lateDays is 1 from the minute after 10:00 on the due day to 10:00 on the next", () => {
        const loan = heron();
        expect(mod.lateDays(loan, 12, 601)).toBe(1);
        expect(mod.lateDays(loan, 12, 1439)).toBe(1);
        expect(mod.lateDays(loan, 13, 0)).toBe(1);
        expect(mod.lateDays(loan, 13, 600)).toBe(1);
    });
    add("lateDays counts one more day for each 10:00 passed, with no upper limit", () => {
        const loan = heron();
        expect(mod.lateDays(loan, 13, 601)).toBe(2);
        expect(mod.lateDays(loan, 15, 600)).toBe(3);
        expect(mod.lateDays(loan, 15, 601)).toBe(4);
        expect(mod.lateDays(loan, 20, 700)).toBe(9);
    });
    add("lateFee is 0 when the gear is back on time", () => {
        const loan = heron();
        expect(mod.lateFee(loan, 11, 900)).toBe(0);
        expect(mod.lateFee(loan, 12, 600)).toBe(0);
    });
    add("lateFee charges 2500 pence for each late day", () => {
        const loan = heron();
        expect(mod.lateFee(loan, 12, 601)).toBe(2500);
        expect(mod.lateFee(loan, 13, 600)).toBe(2500);
        expect(mod.lateFee(loan, 13, 601)).toBe(5000);
    });
    add("lateFee charges for three late days at most", () => {
        const loan = heron();
        expect(mod.lateFee(loan, 14, 601)).toBe(7500);
        expect(mod.lateFee(loan, 15, 601)).toBe(7500);
        expect(mod.lateFee(loan, 20, 700)).toBe(7500);
    });
    add("lateFee is charged whether or not gear is still out", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 1, 5, 540);
        expect(mod.lateFee(loan, 12, 601)).toBe(2500);
        mod.takeBack(loan, "windlass", 1, 12, 601);
        expect(mod.lateFee(loan, 12, 601)).toBe(2500);
    });

    // ---------------------------------------------------------------------------------------- settle
    add("settle refunds the whole deposit when all is back on time", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 2, 5, 540);
        mod.takeBack(loan, "windlass", 2, 12, 590);
        expect(mod.settle(loan, 12, 590)).toEqual({
            gearPence: 0, latePence: 0, keptPence: 0, refundPence: 7500, owedPence: 0,
        });
    });
    add("settle keeps the late fee when all is back, but late", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 2, 5, 540);
        mod.takeBack(loan, "windlass", 2, 12, 660);
        expect(mod.settle(loan, 12, 660)).toEqual({
            gearPence: 0, latePence: 2500, keptPence: 2500, refundPence: 5000, owedPence: 0,
        });
    });
    add("settle keeps the gear charge and the late fee out of the deposit", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 2, 5, 540);
        mod.takeBack(loan, "windlass", 1, 12, 640);
        expect(mod.settle(loan, 12, 640)).toEqual({
            gearPence: 1850, latePence: 2500, keptPence: 4350, refundPence: 3150, owedPence: 0,
        });
    });
    add("settle keeps no more than the deposit, and says what is still owed", () => {
        const loan = mod.openLoan("BK-31", "Dabchick", 12, 5000);
        mod.issue(loan, "windlass", 2, 5, 540);
        mod.issue(loan, "mallet", 1, 5, 541);
        expect(mod.settle(loan, 16, 900)).toEqual({
            gearPence: 4650, latePence: 7500, keptPence: 5000, refundPence: 0, owedPence: 7150,
        });
    });
    add("settle keeps all of a deposit that the charges exactly use up, with nothing owed", () => {
        const loan = mod.openLoan("BK-32", "Dabchick", 12, 4350);
        mod.issue(loan, "windlass", 1, 5, 540);
        expect(mod.settle(loan, 12, 601)).toEqual({
            gearPence: 1850, latePence: 2500, keptPence: 4350, refundPence: 0, owedPence: 0,
        });
    });
    add("settle marks the loan settled on that day and changes nothing else in it", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 2, 5, 540);
        mod.issueKeys(loan, 6, 1, 5, 541);
        const before = copyOf(loan);
        mod.settle(loan, 13, 480);
        expect(loan.settledDay).toBe(13);
        expect(mod.isOpen(loan)).toBe(false);
        expect({ ...loan, settledDay: 0 }).toEqual(before);
    });
    add("settle run again keeps the first settled day, and works the sums for the new time", () => {
        const loan = heron();
        mod.issue(loan, "mallet", 1, 5, 540);
        mod.settle(loan, 12, 590);
        expect(mod.settle(loan, 14, 700)).toEqual({
            gearPence: 950, latePence: 7500, keptPence: 7500, refundPence: 0, owedPence: 950,
        });
        expect(loan.settledDay).toBe(12);
    });

    // ---------------------------------------------------------------------------------------- jacketSize, depositFor
    add("jacketSize puts a weight that is exactly a limit in the next size up", () => {
        expect(mod.jacketSize(15)).toBe("child");
        expect(mod.jacketSize(30)).toBe("junior");
        expect(mod.jacketSize(40)).toBe("adult");
        expect(mod.jacketSize(70)).toBe("large");
    });
    add("jacketSize puts a weight just under a limit in that size", () => {
        expect(mod.jacketSize(14.9)).toBe("infant");
        expect(mod.jacketSize(29.9)).toBe("child");
        expect(mod.jacketSize(39.9)).toBe("junior");
        expect(mod.jacketSize(69.9)).toBe("adult");
    });
    add("jacketSize gives infant for the lightest and large for the heaviest", () => {
        expect(mod.jacketSize(0)).toBe("infant");
        expect(mod.jacketSize(4)).toBe("infant");
        expect(mod.jacketSize(55)).toBe("adult");
        expect(mod.jacketSize(130)).toBe("large");
    });
    add("depositFor steps up after 4 berths and after 8, not at them", () => {
        expect(mod.depositFor(4)).toBe(5000);
        expect(mod.depositFor(5)).toBe(7500);
        expect(mod.depositFor(8)).toBe(7500);
        expect(mod.depositFor(9)).toBe(10000);
    });
    add("depositFor covers the smallest and the largest boats", () => {
        expect(mod.depositFor(1)).toBe(5000);
        expect(mod.depositFor(2)).toBe(5000);
        expect(mod.depositFor(6)).toBe(7500);
        expect(mod.depositFor(12)).toBe(10000);
    });

    // ---------------------------------------------------------------------------------------- standardKit, issueKit
    add("standardKit for a boat of up to 6 berths", () => {
        expect(mod.standardKit(4)).toEqual([
            line("windlass", 2), line("lifejacket", 4), line("mooringPin", 3), line("mallet", 1), line("waterKey", 1),
        ]);
        expect(mod.standardKit(6)).toEqual([
            line("windlass", 2), line("lifejacket", 6), line("mooringPin", 3), line("mallet", 1), line("waterKey", 1),
        ]);
    });
    add("standardKit for a boat of more than 6 berths", () => {
        expect(mod.standardKit(7)).toEqual([
            line("windlass", 3), line("lifejacket", 7), line("mooringPin", 4), line("mallet", 1), line("waterKey", 1),
        ]);
        expect(mod.standardKit(10)).toEqual([
            line("windlass", 3), line("lifejacket", 10), line("mooringPin", 4), line("mallet", 1), line("waterKey", 1),
        ]);
    });
    add("standardKit for the smallest boats still has two windlasses and three pins", () => {
        expect(mod.standardKit(2)).toEqual([
            line("windlass", 2), line("lifejacket", 2), line("mooringPin", 3), line("mallet", 1), line("waterKey", 1),
        ]);
        expect(mod.standardKit(1)).toEqual([
            line("windlass", 2), line("lifejacket", 1), line("mooringPin", 3), line("mallet", 1), line("waterKey", 1),
        ]);
    });
    add("standardKit holds no boat key, and gives new lines each time", () => {
        const first = mod.standardKit(4);
        expect(first.some((l) => l.kind === "boatKey")).toBe(false);
        first[0].issued = 99;
        expect(mod.standardKit(4)[0]).toEqual(line("windlass", 2));
    });
    add("issueKit issues the standard kit, a log entry for each kind, the last kind at the top", () => {
        const loan = heron();
        expect(mod.issueKit(loan, 4, 5, 555)).toBeUndefined();
        expect(loan.lines).toEqual(mod.standardKit(4));
        expect(loan.log).toEqual([
            out("waterKey", 1, 5, 555), out("mallet", 1, 5, 555), out("mooringPin", 3, 5, 555),
            out("lifejacket", 4, 5, 555), out("windlass", 2, 5, 555),
        ]);
    });
    add("issueKit adds to what the loan already holds", () => {
        const loan = heron();
        mod.issue(loan, "mallet", 1, 5, 540);
        mod.issue(loan, "windlass", 1, 5, 541);
        mod.issueKit(loan, 8, 5, 555);
        expect(loan.lines).toEqual([
            line("mallet", 2), line("windlass", 4), line("lifejacket", 8), line("mooringPin", 4), line("waterKey", 1),
        ]);
        expect(loan.log.length).toBe(7);
    });
    add("issueKit issues no key and leaves the tag alone", () => {
        const loan = heron();
        mod.issueKit(loan, 6, 5, 555);
        expect(loan.keyTag).toBe(0);
        expect(mod.outstanding(loan, "boatKey")).toBe(0);
        expect(mod.outstanding(loan)).toBe(13);
    });

    // ---------------------------------------------------------------------------------------- keyHolder
    add("keyHolder finds the open loan that has the tag", () => {
        const a = heron();
        const b = mod.openLoan("BK-31", "Dabchick", 14, 5000);
        mod.issueKeys(a, 17, 1, 5, 550);
        mod.issueKeys(b, 4, 1, 5, 551);
        expect(mod.keyHolder([a, b], 4)).toBe(b);
        expect(mod.keyHolder([a, b], 17)).toBe(a);
    });
    add("keyHolder passes over a settled loan that never gave its keys back", () => {
        const a = heron();
        const b = mod.openLoan("BK-31", "Dabchick", 14, 5000);
        mod.issueKeys(a, 17, 1, 5, 550);
        mod.settle(a, 12, 590);
        expect(mod.keyHolder([a, b], 17)).toBeUndefined();
        mod.issueKeys(b, 17, 1, 13, 700);
        expect(mod.keyHolder([a, b], 17)).toBe(b);
    });
    add("keyHolder gives undefined for tag 0, which no loan holds, and for a tag nobody has", () => {
        const a = heron();
        const b = mod.openLoan("BK-31", "Dabchick", 14, 5000);
        mod.issueKeys(b, 4, 1, 5, 551);
        expect(mod.keyHolder([a, b], 0)).toBeUndefined();
        expect(mod.keyHolder([a, b], 99)).toBeUndefined();
        expect(mod.keyHolder([], 4)).toBeUndefined();
    });
    add("keyHolder gives the first loan in the list when two open loans have one tag", () => {
        const a = mod.openLoan("BK-A", "Heron", 12, 7500);
        const b = mod.openLoan("BK-B", "Dabchick", 14, 5000);
        mod.issueKeys(a, 17, 1, 5, 550);
        mod.issueKeys(b, 17, 1, 5, 551);
        expect(mod.keyHolder([a, b], 17)).toBe(a);
        expect(mod.keyHolder([b, a], 17)).toBe(b);
    });

    // ---------------------------------------------------------------------------------------- overdueLoans
    const yard = () => {
        const a = mod.openLoan("BK-A", "Heron", 12, 7500);
        const b = mod.openLoan("BK-B", "Dabchick", 10, 5000);
        const c = mod.openLoan("BK-C", "Grebe", 11, 5000);
        const d = mod.openLoan("BK-D", "Coot", 9, 5000);
        const e = mod.openLoan("BK-E", "Teal", 14, 5000);
        for (const loan of [a, b, c, d, e]) mod.issue(loan, "windlass", 2, 5, 540);
        return { a, b, c, d, e };
    };
    add("overdueLoans lists open loans with gear out after the return hour", () => {
        const { a, b, c, d, e } = yard();
        mod.takeBack(c, "windlass", 2, 11, 500);
        mod.settle(d, 9, 590);
        expect(mod.overdueLoans([a, b, c, d, e], 12, 601)).toEqual([b, a]);
    });
    add("overdueLoans leaves out a loan at 10:00 on its due day, and takes it a minute later", () => {
        const { a, b, e } = yard();
        expect(mod.overdueLoans([a, b, e], 12, 600)).toEqual([b]);
        expect(mod.overdueLoans([a, b, e], 12, 601)).toEqual([b, a]);
        expect(mod.overdueLoans([a, b, e], 14, 601)).toEqual([b, a, e]);
    });
    add("overdueLoans puts the longest overdue first, gives the same loans, and leaves its list as it was", () => {
        const { a, b, c } = yard();
        const list = [a, b, c];
        const late = mod.overdueLoans(list, 13, 0);
        expect(late.length).toBe(3);
        expect(late[0]).toBe(b);
        expect(late[1]).toBe(c);
        expect(late[2]).toBe(a);
        expect(late).not.toBe(list);
        expect(list[0]).toBe(a);
        expect(list[1]).toBe(b);
        expect(list[2]).toBe(c);
    });
    add("overdueLoans keeps loans due on one day in the order given", () => {
        const { a, b, c } = yard();
        const b2 = mod.openLoan("BK-B2", "Smew", 10, 5000);
        mod.issue(b2, "mallet", 1, 5, 540);
        const late = mod.overdueLoans([a, b2, c, b], 13, 0);
        expect(late.map((loan) => loan.bookingRef)).toEqual(["BK-B2", "BK-B", "BK-C", "BK-A"]);
    });

    // ---------------------------------------------------------------------------------------- formatPence
    add("formatPence writes pounds, a point and two digits of pence", () => {
        expect(mod.formatPence(1250)).toBe("£12.50");
        expect(mod.formatPence(4500)).toBe("£45.00");
        expect(mod.formatPence(725)).toBe("£7.25");
        expect(mod.formatPence(123456)).toBe("£1234.56");
    });
    add("formatPence pads amounts under a pound", () => {
        expect(mod.formatPence(5)).toBe("£0.05");
        expect(mod.formatPence(0)).toBe("£0.00");
        expect(mod.formatPence(60)).toBe("£0.60");
    });
    add("formatPence puts a minus sign before the pound sign", () => {
        expect(mod.formatPence(-305)).toBe("-£3.05");
        expect(mod.formatPence(-5)).toBe("-£0.05");
    });

    // ---------------------------------------------------------------------------------------- summary
    add("summary of a new loan says 0 out and no more", () => {
        expect(mod.summary(mod.openLoan("bk-204", "Heron", 12, 7500))).toBe("BK-204 Heron: 0 out");
    });
    add("summary counts what is out and what is damaged, over every kind", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 2, 5, 540);
        mod.issue(loan, "lifejacket", 4, 5, 541);
        expect(mod.summary(loan)).toBe("BK-204 Heron: 6 out");
        mod.takeBack(loan, "lifejacket", 3, 9, 480, 1);
        mod.takeBack(loan, "windlass", 1, 9, 481, 1);
        expect(mod.summary(loan)).toBe("BK-204 Heron: 2 out, 2 damaged");
    });
    add("summary counts a damaged item of a kind that has nothing still out", () => {
        const loan = heron();
        mod.issue(loan, "mallet", 1, 5, 540);
        mod.takeBack(loan, "mallet", 1, 9, 480, 1);
        expect(mod.summary(loan)).toBe("BK-204 Heron: 0 out, 1 damaged");
    });
    add("summary names the key tag while the loan has one", () => {
        const loan = heron();
        mod.issueKeys(loan, 17, 1, 5, 550);
        expect(mod.summary(loan)).toBe("BK-204 Heron: 1 out, key 17");
        mod.takeBack(loan, "boatKey", 1, 9, 480);
        expect(mod.summary(loan)).toBe("BK-204 Heron: 0 out");
    });
    add("summary ends with settled once the loan is closed", () => {
        const loan = heron();
        mod.issueKeys(loan, 17, 1, 5, 550);
        mod.issue(loan, "mallet", 2, 5, 551);
        mod.takeBack(loan, "mallet", 1, 9, 480, 1);
        mod.settle(loan, 12, 590);
        expect(mod.summary(loan)).toBe("BK-204 Heron: 2 out, 1 damaged, key 17, settled");
    });

    // ---------------------------------------------------------------------------------------- receiptLines
    add("receiptLines for a clean return: the loan, what is kept and the refund", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 2, 5, 540);
        mod.takeBack(loan, "windlass", 2, 12, 590);
        const settlement = { gearPence: 0, latePence: 0, keptPence: 0, refundPence: 7500, owedPence: 0 };
        expect(mod.receiptLines(loan, settlement)).toEqual(["Loan BK-204", "Kept £0.00", "Refund £75.00"]);
    });
    add("receiptLines lists gear in the order of ALL_KINDS, missing before damaged within a kind", () => {
        const loan = heron();
        mod.issue(loan, "lifejacket", 4, 5, 540);
        mod.issue(loan, "windlass", 3, 5, 541);
        mod.issue(loan, "mallet", 1, 5, 542);
        mod.issueKeys(loan, 17, 1, 5, 543);
        mod.takeBack(loan, "lifejacket", 4, 12, 590, 2);
        mod.takeBack(loan, "windlass", 2, 12, 591, 1);
        mod.takeBack(loan, "mallet", 1, 12, 592);
        const settlement = { gearPence: 9999, latePence: 0, keptPence: 7500, refundPence: 0, owedPence: 0 };
        expect(mod.receiptLines(loan, settlement)).toEqual([
            "Loan BK-204",
            "boatKey x1 not returned",
            "windlass x1 not returned",
            "windlass x1 damaged",
            "lifejacket x2 damaged",
            "Kept £75.00",
            "Refund £0.00",
        ]);
    });
    add("receiptLines adds the late return before what is kept, and what is still owed at the end", () => {
        const loan = heron();
        mod.issue(loan, "mallet", 1, 5, 540);
        const settlement = { gearPence: 950, latePence: 7500, keptPence: 7500, refundPence: 0, owedPence: 950 };
        expect(mod.receiptLines(loan, settlement)).toEqual([
            "Loan BK-204",
            "mallet x1 not returned",
            "Late return £75.00",
            "Kept £75.00",
            "Refund £0.00",
            "Still owed £9.50",
        ]);
    });
    add("receiptLines reads the sums from the settlement it is given, and changes neither argument", () => {
        const loan = heron();
        mod.issue(loan, "windlass", 1, 5, 540);
        const settlement = { gearPence: 1, latePence: 2500, keptPence: 305, refundPence: 7195, owedPence: 0 };
        const before = [copyOf(loan), copyOf(settlement)];
        expect(mod.receiptLines(loan, settlement)).toEqual([
            "Loan BK-204", "windlass x1 not returned", "Late return £25.00", "Kept £3.05", "Refund £71.95",
        ]);
        expect([loan, settlement]).toEqual(before);
    });

    const unknown = skip.filter((name) => !cases.some(([had]) => had === name));
    if (unknown.length) throw new Error(`skip names no case: ${unknown.join("; ")}`);

    describe("src/keys.ts as it was", () => {
        for (const [name, run] of cases) {
            if (!skip.includes(name)) it(name, run);
        }
    });
}

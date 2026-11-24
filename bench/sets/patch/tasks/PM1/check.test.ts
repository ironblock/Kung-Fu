import { describe, expect, it } from "vitest";
import * as mod from "../src/invoices";
import { copyOf } from "./helpers";
import { HIRE, MON, STANDARD_GROSS, flat, standard, unchanged } from "./helpers-invoices";

type Inv = InstanceType<typeof mod.Invoice>;

/** The new method, reached so that a file without it fails each case and still loads. */
function writeOff(invoice: Inv, day: number): number {
    return (invoice as unknown as { writeOff(day: number): number }).writeOff(day);
}

describe("Invoice.writeOff", () => {
    it("credits all that an open invoice owes, and returns it", () => {
        const invoice = standard(mod, 1001, "Ada Moss");
        expect(writeOff(invoice, MON + 40)).toBe(STANDARD_GROSS);
        expect(invoice.creditedPence()).toBe(STANDARD_GROSS);
        expect(invoice.owedPence()).toBe(0);
        expect(invoice.status()).toBe("paid");
    });

    it("raises one note, dated the day given, with the reason `written off`", () => {
        const invoice = flat(mod, 1007, "Ada Moss", 8000);
        expect(writeOff(invoice, MON + 40)).toBe(8000);
        const notes = invoice.creditList();
        expect(notes).toHaveLength(1);
        expect(notes[0].day).toBe(MON + 40);
        expect(notes[0].pence).toBe(8000);
        expect(notes[0].reason).toBe("written off");
    });

    it("writes off only what is left after payments and earlier credit notes", () => {
        const invoice = standard(mod, 1001, "Ada Moss");
        invoice.pay(MON + 1, 50000, "card", "C-1");
        invoice.credit(MON + 2, 3000, "berth not used");
        expect(writeOff(invoice, MON + 60)).toBe(56824);
        expect(invoice.paidPence()).toBe(50000);
        expect(invoice.creditedPence()).toBe(59824);
        expect(invoice.owedPence()).toBe(0);
        expect(invoice.paymentList()).toHaveLength(1);
        expect(invoice.creditList().map((note) => note.pence)).toEqual([3000, 56824]);
    });

    it("the note is the one `credit` raises, numbered and kept like the invoice's other notes", () => {
        const one = flat(mod, 1007, "Ada Moss", 8000);
        const twin = flat(mod, 1007, "Ada Moss", 8000);
        for (const invoice of [one, twin]) {
            invoice.pay(MON + 1, 2500);
            invoice.credit(MON + 2, 500, "goodwill");
        }
        expect(writeOff(one, MON + 50)).toBe(5000);
        twin.credit(MON + 50, 5000, "written off");
        expect(one.creditList()).toEqual(twin.creditList());
        expect(one.statementLines(MON + 50)).toEqual(twin.statementLines(MON + 50));
    });

    it("the first note of an invoice is numbered as `credit` numbers a first note", () => {
        const one = flat(mod, 1012, "Bo Tran", 700);
        const twin = flat(mod, 1012, "Bo Tran", 700);
        writeOff(one, MON + 3);
        twin.credit(MON + 3, 700, "written off");
        expect(one.creditList()).toEqual(twin.creditList());
    });

    it("raises no note and returns 0 for an invoice paid in full", () => {
        const invoice = flat(mod, 1007, "Ada Moss", 8000);
        invoice.pay(MON + 1, 8000);
        expect(writeOff(invoice, MON + 40)).toBe(0);
        expect(invoice.creditList()).toEqual([]);
        expect(invoice.status()).toBe("paid");
    });

    it("raises no further note and returns 0 for an invoice credited in full", () => {
        const invoice = flat(mod, 1007, "Ada Moss", 8000);
        invoice.credit(MON + 1, 8000, "goodwill");
        expect(writeOff(invoice, MON + 40)).toBe(0);
        expect(invoice.creditList()).toHaveLength(1);
    });

    it("a second write-off raises nothing and returns 0", () => {
        const invoice = flat(mod, 1007, "Ada Moss", 8000);
        expect(writeOff(invoice, MON + 40)).toBe(8000);
        expect(writeOff(invoice, MON + 41)).toBe(0);
        expect(invoice.creditList()).toHaveLength(1);
        expect(invoice.creditedPence()).toBe(8000);
    });

    it("returns 0 for a draft, raises no note, and leaves it a draft", () => {
        const draft = new mod.Invoice(1001, "Ada Moss");
        draft.addLine(copyOf(HIRE));
        expect(writeOff(draft, MON)).toBe(0);
        expect(draft.creditList()).toEqual([]);
        expect(draft.status()).toBe("draft");
        draft.issue(MON);
        expect(draft.owedPence()).toBe(100800);
    });

    it("returns 0 for a void invoice, raises no note, and leaves it void", () => {
        const gone = standard(mod, 1001, "Ada Moss");
        gone.cancel();
        expect(writeOff(gone, MON + 5)).toBe(0);
        expect(gone.creditList()).toEqual([]);
        expect(gone.status()).toBe("void");
    });
});

unchanged(mod);

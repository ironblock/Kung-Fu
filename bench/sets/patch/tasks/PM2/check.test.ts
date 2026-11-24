import { describe, expect, it } from "vitest";
import * as mod from "../src/invoices";
import { copyOf } from "./helpers";
import { HIRE, MON, flat, unchanged } from "./helpers-invoices";

describe("Invoice.pay refuses a reference the invoice already has", () => {
    it("the second payment with a reference is not recorded, and all its pence come back", () => {
        const invoice = flat(mod, 1001, "Ada Moss", 8000);
        expect(invoice.pay(MON + 1, 1000, "transfer", "BACS-17")).toBe(0);
        expect(invoice.pay(MON + 2, 1000, "transfer", "BACS-17")).toBe(1000);
        expect(invoice.paymentList()).toEqual([{ day: MON + 1, pence: 1000, method: "transfer", ref: "BACS-17" }]);
        expect(invoice.paidPence()).toBe(1000);
        expect(invoice.owedPence()).toBe(7000);
    });

    it("it is refused whatever its day, its amount or its method", () => {
        const invoice = flat(mod, 1001, "Ada Moss", 8000);
        invoice.pay(MON + 1, 1000, "transfer", "BACS-17");
        expect(invoice.pay(MON + 9, 250, "card", "BACS-17")).toBe(250);
        expect(invoice.pay(MON + 1, 99999, "cheque", "BACS-17")).toBe(99999);
        expect(invoice.paymentList()).toHaveLength(1);
        expect(invoice.paidPence()).toBe(1000);
    });

    it("letter case does not count, whichever came first", () => {
        const upper = flat(mod, 1001, "Ada Moss", 8000);
        upper.pay(MON + 1, 1000, "transfer", "BACS-17");
        expect(upper.pay(MON + 2, 1000, "transfer", "bacs-17")).toBe(1000);
        expect(upper.pay(MON + 2, 1000, "transfer", "Bacs-17")).toBe(1000);
        const lower = flat(mod, 1002, "Ada Moss", 8000);
        lower.pay(MON + 1, 1000, "transfer", "chq 0042a");
        expect(lower.pay(MON + 2, 1000, "cheque", "CHQ 0042A")).toBe(1000);
        expect(upper.paidPence()).toBe(1000);
        expect(lower.paidPence()).toBe(1000);
    });

    it("a reference is recorded exactly as it was given", () => {
        const invoice = flat(mod, 1001, "Ada Moss", 8000);
        invoice.pay(MON + 1, 1000, "transfer", "Bacs-17");
        invoice.pay(MON + 2, 500, "card", "C-881x");
        invoice.pay(MON + 3, 1000, "transfer", "BACS-17");
        invoice.pay(MON + 4, 200, "cheque", " Chq 0042 ");
        expect(invoice.paymentList().map((payment) => payment.ref)).toEqual([" Chq 0042 ", "C-881x", "Bacs-17"]);
    });

    it("a reference that only looks like an earlier one is taken", () => {
        const invoice = flat(mod, 1001, "Ada Moss", 8000);
        expect(invoice.pay(MON + 1, 100, "transfer", "BACS-17")).toBe(0);
        expect(invoice.pay(MON + 2, 100, "transfer", "BACS-1")).toBe(0);
        expect(invoice.pay(MON + 3, 100, "transfer", "BACS-171")).toBe(0);
        expect(invoice.pay(MON + 4, 100, "transfer", "BACS17")).toBe(0);
        expect(invoice.pay(MON + 5, 100, "transfer", "ACS-17")).toBe(0);
        expect(invoice.pay(MON + 6, 100, "transfer", "BACS.17")).toBe(0);
        expect(invoice.pay(MON + 7, 100, "transfer", "BACS(17")).toBe(0);
        expect(invoice.pay(MON + 8, 100, "transfer", "BACS-17*")).toBe(0);
        expect(invoice.paidPence()).toBe(800);
    });

    it("a space before or after a reference makes it another reference", () => {
        const invoice = flat(mod, 1001, "Ada Moss", 8000);
        expect(invoice.pay(MON + 1, 100, "transfer", "BACS-17")).toBe(0);
        expect(invoice.pay(MON + 2, 100, "transfer", "BACS-17 ")).toBe(0);
        expect(invoice.pay(MON + 3, 100, "transfer", " BACS-17")).toBe(0);
        expect(invoice.pay(MON + 4, 100, "transfer", " bacs-17 ")).toBe(0);
        expect(invoice.pay(MON + 5, 100, "transfer", " Bacs-17 ")).toBe(100);
        expect(invoice.pay(MON + 6, 100, "transfer", "bacs-17 ")).toBe(100);
        expect(invoice.paidPence()).toBe(400);
    });

    it("an accent on a letter makes it another reference", () => {
        const invoice = flat(mod, 1001, "Ada Moss", 8000);
        expect(invoice.pay(MON + 1, 100, "transfer", "REF-17")).toBe(0);
        expect(invoice.pay(MON + 2, 100, "transfer", "RÉF-17")).toBe(0);
        expect(invoice.pay(MON + 3, 100, "transfer", "réf-17")).toBe(100);
        expect(invoice.pay(MON + 4, 100, "transfer", "ref-17")).toBe(100);
        expect(invoice.paidPence()).toBe(200);
    });

    it("payments with an empty reference are never refused", () => {
        const invoice = flat(mod, 1001, "Ada Moss", 8000);
        expect(invoice.pay(MON + 1, 100)).toBe(0);
        expect(invoice.pay(MON + 2, 100)).toBe(0);
        expect(invoice.pay(MON + 3, 100, "cash", "")).toBe(0);
        expect(invoice.pay(MON + 4, 100, "cash", "TILL-3")).toBe(0);
        expect(invoice.pay(MON + 5, 100, "cash", "")).toBe(0);
        expect(invoice.paymentList()).toHaveLength(5);
        expect(invoice.paidPence()).toBe(500);
    });

    it("an earlier reference is still matched after later payments", () => {
        const invoice = flat(mod, 1001, "Ada Moss", 8000);
        invoice.pay(MON + 1, 100, "transfer", "BACS-17");
        invoice.pay(MON + 2, 100, "card", "C-881");
        invoice.pay(MON + 3, 100, "cash");
        expect(invoice.pay(MON + 4, 100, "transfer", "bacs-17")).toBe(100);
        expect(invoice.pay(MON + 4, 100, "card", "c-881")).toBe(100);
        expect(invoice.paymentList()).toHaveLength(3);
    });

    it("a refused payment leaves nothing behind: another reference is taken after it", () => {
        const invoice = flat(mod, 1001, "Ada Moss", 8000);
        invoice.pay(MON + 1, 100, "transfer", "BACS-17");
        expect(invoice.pay(MON + 2, 200, "transfer", "BACS-17")).toBe(200);
        expect(invoice.pay(MON + 3, 300, "transfer", "BACS-18")).toBe(0);
        expect(invoice.paymentList().map((payment) => payment.pence)).toEqual([300, 100]);
        expect(invoice.lastPaymentDay()).toBe(MON + 3);
    });

    it("the same reference on another invoice is taken", () => {
        const one = flat(mod, 1001, "Ada Moss", 8000);
        const two = flat(mod, 1002, "Ada Moss", 8000);
        expect(one.pay(MON + 1, 100, "transfer", "BACS-17")).toBe(0);
        expect(two.pay(MON + 1, 100, "transfer", "BACS-17")).toBe(0);
        expect(two.paidPence()).toBe(100);
    });

    it("a payment that is too large is still trimmed, and its reference then counts", () => {
        const invoice = flat(mod, 1001, "Ada Moss", 8000);
        invoice.pay(MON + 1, 7000, "transfer", "BACS-17");
        expect(invoice.pay(MON + 2, 2500, "card", "C-881")).toBe(1500);
        expect(invoice.paymentList()[0]).toEqual({ day: MON + 2, pence: 1000, method: "card", ref: "C-881" });
    });

    it("a call that throws RangeError for its pence still throws, with a reference used before", () => {
        const invoice = flat(mod, 1001, "Ada Moss", 8000);
        invoice.pay(MON + 1, 100, "transfer", "BACS-17");
        expect(() => invoice.pay(MON + 2, 0, "transfer", "BACS-17")).toThrow(RangeError);
        expect(() => invoice.pay(MON + 2, -100, "transfer", "bacs-17")).toThrow(RangeError);
        expect(() => invoice.pay(MON + 2, 10.5, "transfer", "BACS-17")).toThrow(RangeError);
        expect(invoice.paymentList()).toHaveLength(1);
    });

    it("a draft still throws when it is paid with a reference", () => {
        const draft = new mod.Invoice(1001, "Ada Moss");
        draft.addLine(copyOf(HIRE));
        expect(() => draft.pay(MON, 100, "card", "C-881")).toThrow();
    });

    it("a call that throws records nothing, so its reference is taken after it", () => {
        const invoice = flat(mod, 1001, "Ada Moss", 8000);
        expect(() => invoice.pay(MON + 1, 0, "transfer", "X-1")).toThrow(RangeError);
        expect(() => invoice.pay(MON + 1, 2.5, "transfer", "Y-2")).toThrow(RangeError);
        expect(invoice.pay(MON + 2, 100, "transfer", "X-1")).toBe(0);
        expect(invoice.pay(MON + 2, 100, "transfer", "y-2")).toBe(0);
        expect(invoice.paymentList().map((payment) => payment.ref)).toEqual(["y-2", "X-1"]);
        const draft = new mod.Invoice(1002, "Ada Moss");
        draft.addLine(copyOf(HIRE));
        expect(() => draft.pay(MON, 100, "card", "C-881")).toThrow();
        draft.issue(MON);
        expect(draft.pay(MON + 1, 100, "card", "C-881")).toBe(0);
        expect(draft.paidPence()).toBe(100);
    });
});

unchanged(mod, ["pay: the same reference twice on one invoice is taken twice"]);

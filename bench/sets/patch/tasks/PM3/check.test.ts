import { describe, expect, it } from "vitest";
import * as mod from "../src/invoices";
import { MON, flat, standard, unchanged } from "./helpers-invoices";

describe("Invoice.statementLines shows each payment", () => {
    it("one payment: its line stands directly above the Paid line", () => {
        const invoice = flat(mod, 1002, "Ada Moss", 80000);
        invoice.pay(MON + 7, 25000, "card", "C-4");
        expect(invoice.statementLines(MON + 10)).toEqual([
            "Invoice 1002  issued 2026-03-02  due 2026-03-16",
            "  Damage: lost windlass  1 x £800.00  £800.00",
            "  Net £800.00  Tax £0.00  Total £800.00",
            "  Payment  2026-03-09  £250.00  card",
            "  Paid £250.00",
            "  Owed £550.00",
        ]);
    });

    it("two payments recorded in the order of their days: the first is the top one", () => {
        const invoice = flat(mod, 1002, "Ada Moss", 80000);
        invoice.pay(MON + 1, 10000, "cash");
        invoice.pay(MON + 7, 25000, "transfer", "BACS-17");
        expect(invoice.statementLines(MON + 10)).toEqual([
            "Invoice 1002  issued 2026-03-02  due 2026-03-16",
            "  Damage: lost windlass  1 x £800.00  £800.00",
            "  Net £800.00  Tax £0.00  Total £800.00",
            "  Payment  2026-03-03  £100.00  cash",
            "  Payment  2026-03-09  £250.00  transfer",
            "  Paid £350.00",
            "  Owed £450.00",
        ]);
    });

    it("the payment recorded first is the top one, whatever days the payments carry", () => {
        const invoice = flat(mod, 1002, "Ada Moss", 500000);
        invoice.pay(MON + 9, 10000, "cheque", "000417");
        invoice.pay(MON + 2, 123456, "transfer", "BACS-17");
        invoice.pay(MON + 5, 250, "cash");
        invoice.pay(MON + 5, 1, "card", "C-4");
        expect(invoice.statementLines(MON + 10)).toEqual([
            "Invoice 1002  issued 2026-03-02  due 2026-03-16",
            "  Damage: lost windlass  1 x £5,000.00  £5,000.00",
            "  Net £5,000.00  Tax £0.00  Total £5,000.00",
            "  Payment  2026-03-11  £100.00  cheque",
            "  Payment  2026-03-04  £1,234.56  transfer",
            "  Payment  2026-03-07  £2.50  cash",
            "  Payment  2026-03-07  £0.01  card",
            "  Paid £1,337.07",
            "  Owed £3,662.93",
        ]);
    });

    it("credit notes stay above the payments, and the lines under Paid stay as they were", () => {
        const invoice = standard(mod, 1001, "Ada Moss");
        invoice.credit(MON + 3, 3000, "berth not used");
        invoice.pay(MON + 5, 50000, "card", "C-881");
        expect(invoice.statementLines(MON + 44)).toEqual([
            "Invoice 1001  issued 2026-03-02  due 2026-03-16",
            "  Hire: Kingfisher, 7 nights  7 x £120.00  £840.00",
            "  Mooring: visitor berth  2 x £15.00  £30.00",
            "  Fuel: diesel  42.50 x £1.35  £57.38",
            "  Net £927.38  Tax £170.86  Total £1,098.24",
            "  Credit CN1001-1  2026-03-05  -£30.00  berth not used",
            "  Payment  2026-03-07  £500.00  card",
            "  Paid £500.00",
            "  Owed £568.24  (30 days late)",
            "  Late fee if unpaid £23.52",
        ]);
    });

    it("a payment that was too large shows what was taken of it", () => {
        const invoice = flat(mod, 1002, "Ada Moss", 8000);
        invoice.pay(MON + 20, 3000);
        invoice.pay(MON + 21, 9000, "cheque");
        expect(invoice.statementLines(MON + 60)).toEqual([
            "Invoice 1002  issued 2026-03-02  due 2026-03-16",
            "  Damage: lost windlass  1 x £80.00  £80.00",
            "  Net £80.00  Tax £0.00  Total £80.00",
            "  Payment  2026-03-22  £30.00  transfer",
            "  Payment  2026-03-23  £50.00  cheque",
            "  Paid £80.00",
            "  Owed £0.00",
        ]);
    });

    it("a payment dated after the day of the statement has its line too", () => {
        const invoice = flat(mod, 1002, "Ada Moss", 80000);
        invoice.pay(MON + 20, 5000, "card", "C-7");
        invoice.pay(MON + 1, 10000, "cash");
        expect(invoice.statementLines(MON + 10)).toEqual([
            "Invoice 1002  issued 2026-03-02  due 2026-03-16",
            "  Damage: lost windlass  1 x £800.00  £800.00",
            "  Net £800.00  Tax £0.00  Total £800.00",
            "  Payment  2026-03-22  £50.00  card",
            "  Payment  2026-03-03  £100.00  cash",
            "  Paid £150.00",
            "  Owed £650.00",
        ]);
    });

    it("an invoice with no payment has no such line", () => {
        const invoice = flat(mod, 1002, "Ada Moss", 8000);
        invoice.credit(MON + 3, 1000, "goodwill");
        expect(invoice.statementLines(MON + 5)).toEqual([
            "Invoice 1002  issued 2026-03-02  due 2026-03-16",
            "  Damage: lost windlass  1 x £80.00  £80.00",
            "  Net £80.00  Tax £0.00  Total £80.00",
            "  Credit CN1002-1  2026-03-05  -£10.00  goodwill",
            "  Owed £70.00",
        ]);
    });

    it("the hirer's statement carries the same lines", () => {
        const first = flat(mod, 1001, "Ada Moss", 8000, MON, 2);
        first.pay(MON + 2, 1500, "cash");
        first.pay(MON + 1, 1000, "cheque", "000418");
        const second = flat(mod, 1002, "Ada Moss", 500, MON, 3);
        second.pay(MON + 2, 500, "card", "C-12");
        expect(mod.statement("Ada Moss", [first, second], MON + 3)).toBe([
            "Statement for Ada Moss at 2026-03-05",
            "",
            "Invoice 1001  issued 2026-03-02  due 2026-03-04",
            "  Damage: lost windlass  1 x £80.00  £80.00",
            "  Net £80.00  Tax £0.00  Total £80.00",
            "  Payment  2026-03-04  £15.00  cash",
            "  Payment  2026-03-03  £10.00  cheque",
            "  Paid £25.00",
            "  Owed £55.00  (1 day late)",
            "",
            "Invoice 1002  issued 2026-03-02  due 2026-03-05",
            "  Damage: lost windlass  1 x £5.00  £5.00",
            "  Net £5.00  Tax £0.00  Total £5.00",
            "  Payment  2026-03-04  £5.00  card",
            "  Paid £5.00",
            "  Owed £0.00",
            "",
            "Total owed £55.00",
            "Overdue £55.00 on 1 of 2",
        ].join("\n"));
    });
});

unchanged(mod, [
    "statementLines: a part-paid invoice, thirty days late",
    "statementLines: an invoice paid in full is not late",
    "statement: a part-paid invoice and one paid in full",
]);

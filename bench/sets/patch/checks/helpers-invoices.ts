// What src/invoices.ts does now, pinned case by case. A task's check calls `unchanged` and skips, by name,
// only the cases its change must alter.
import { describe, expect, it } from "vitest";
import { copyOf } from "./helpers";

type Mod = typeof import("../src/invoices");
type Line = import("../src/invoices").InvoiceLine;
type Inv = import("../src/invoices").Invoice;

/** 2 March 2026, a Monday. */
export const MON = 9557;

export const HIRE: Line = { kind: "hire", label: "Kingfisher, 7 nights", qty: 700, unitPence: 12000 };
export const FUEL: Line = { kind: "fuel", label: "diesel", qty: 4250, unitPence: 135 };
export const BERTH: Line = { kind: "mooring", label: "visitor berth", qty: 200, unitPence: 1500 };

/** What the three lines above come to, tax included. */
export const STANDARD_GROSS = 109824;

/** An issued invoice of the three lines above, added out of their printed order. */
export function standard(mod: Mod, number: number, hirer: string, issued: number = MON, terms?: number): Inv {
    const invoice = new mod.Invoice(number, hirer, terms);
    invoice.addLine(copyOf(FUEL));
    invoice.addLine(copyOf(HIRE));
    invoice.addLine(copyOf(BERTH));
    invoice.issue(issued);
    return invoice;
}

/** An issued invoice of one line that carries no tax, so that `pence` is all it comes to. */
export function flat(mod: Mod, number: number, hirer: string, pence: number, issued = MON, terms?: number): Inv {
    const invoice = new mod.Invoice(number, hirer, terms);
    invoice.addLine({ kind: "damage", label: "lost windlass", qty: 100, unitPence: pence });
    invoice.issue(issued);
    return invoice;
}

/** Every day of 2000 to 2101, which holds a century that is not a leap year, and of 2399 and 2400, which end an era. */
function calendarDays(): number[] {
    const at = (year: number): number => (Date.UTC(year, 0, 1) - Date.UTC(2000, 0, 1)) / 86400000;
    const days: number[] = [];
    for (let day = 0; day < at(2102); day++) days.push(day);
    for (let day = at(2399); day < at(2401); day++) days.push(day);
    return days;
}

export function unchanged(mod: Mod, skip: string[] = []): void {
    const names: string[] = [];
    const pin = (name: string, body: () => void): void => {
        names.push(name);
        if (!skip.includes(name)) it(name, body);
    };

    describe("unchanged", () => {
        // ------------------------------------------------------------------------------------- constants
        pin("constants: NO_DAY is -1 and terms default to 14 days", () => {
            expect(mod.NO_DAY).toBe(-1);
            expect(mod.DEFAULT_TERMS_DAYS).toBe(14);
        });
        pin("constants: 40 lines at most, and numbers start at 1001", () => {
            expect(mod.MAX_LINES).toBe(40);
            expect(mod.FIRST_NUMBER).toBe(1001);
        });

        // ----------------------------------------------------------------------------------------- money
        pin("formatPence: pounds, a point and two places", () => {
            expect(mod.formatPence(0)).toBe("£0.00");
            expect(mod.formatPence(5)).toBe("£0.05");
            expect(mod.formatPence(99999)).toBe("£999.99");
        });
        pin("formatPence: a comma at each thousand", () => {
            expect(mod.formatPence(100000)).toBe("£1,000.00");
            expect(mod.formatPence(123456)).toBe("£1,234.56");
            expect(mod.formatPence(100000000)).toBe("£1,000,000.00");
        });
        pin("formatPence: the minus sign stands before the pound sign", () => {
            expect(mod.formatPence(-1250)).toBe("-£12.50");
            expect(mod.formatPence(-123456)).toBe("-£1,234.56");
        });
        pin("formatPence: two places for every count of pence from 1 to 99", () => {
            for (let pence = 1; pence <= 99; pence++) {
                expect(mod.formatPence(pence)).toBe("£0." + (pence < 10 ? "0" : "") + pence);
            }
            expect(mod.formatPence(109)).toBe("£1.09");
            expect(mod.formatPence(-9)).toBe("-£0.09");
        });
        pin("formatPence: a comma at each thousand, for every count of digits in the pounds", () => {
            expect(mod.formatPence(1234567)).toBe("£12,345.67");
            expect(mod.formatPence(12345678)).toBe("£123,456.78");
            expect(mod.formatPence(123456789)).toBe("£1,234,567.89");
            expect(mod.formatPence(1234567890)).toBe("£12,345,678.90");
            expect(mod.formatPence(-12345678)).toBe("-£123,456.78");
        });
        pin("parsePence: whole pounds, one place and two places", () => {
            expect(mod.parsePence("12")).toBe(1200);
            expect(mod.parsePence("12.5")).toBe(1250);
            expect(mod.parsePence("0.07")).toBe(7);
        });
        pin("parsePence: a pound sign, commas and outer spaces are allowed", () => {
            expect(mod.parsePence("£1,250.00")).toBe(125000);
            expect(mod.parsePence("  £3 ")).toBe(300);
        });
        pin("parsePence: NaN for what is not an amount", () => {
            for (const text of ["", "abc", "12.345", "-3", ".5", "1.2.3", "12p"]) {
                expect(mod.parsePence(text), text).toBeNaN();
            }
        });
        pin("parsePence: every comma is dropped, and a pound sign is allowed only at the front", () => {
            expect(mod.parsePence("1,000,000")).toBe(100000000);
            expect(mod.parsePence("£1,234,567.89")).toBe(123456789);
            for (const text of ["3£", "1£2", "££3"]) expect(mod.parsePence(text), text).toBeNaN();
        });
        pin("parsePence: NaN for a space inside the amount, and for a point with no figure after it", () => {
            for (const text of ["1 250", "£ 12", "12 .50", "12.", "£12."]) {
                expect(mod.parsePence(text), text).toBeNaN();
            }
        });
        pin("parseLine: a quantity becomes hundredths and a price becomes pence", () => {
            expect(mod.parseLine("fuel; diesel; 42.5; 1.35")).toEqual(FUEL);
            expect(mod.parseLine("Hire ;  Kingfisher, 7 nights ; 7 ; £120")).toEqual(HIRE);
        });
        pin("parseLine: an empty label and a price of nothing are allowed", () => {
            expect(mod.parseLine("sundry; ; 1; 0")).toEqual({ kind: "sundry", label: "", qty: 100, unitPence: 0 });
        });
        pin("parseLine: null when it does not read", () => {
            expect(mod.parseLine("fuel; diesel; 0; 1.35")).toBeNull();
            expect(mod.parseLine("boat; diesel; 1; 1.35")).toBeNull();
            expect(mod.parseLine("fuel; diesel; 1.234; 1.35")).toBeNull();
            expect(mod.parseLine("fuel; diesel; 1; lots")).toBeNull();
            expect(mod.parseLine("fuel; diesel; 1")).toBeNull();
            expect(mod.parseLine("fuel; diesel; £2; 1.35")).toBeNull();
        });
        pin("parseLine: null for more than four parts, and for a quantity with a point and no figure after it", () => {
            expect(mod.parseLine("fuel; diesel; 1; 1.35; extra")).toBeNull();
            expect(mod.parseLine("fuel; diesel; 1; 1.35;")).toBeNull();
            expect(mod.parseLine("fuel; diesel; 1.; 1.35")).toBeNull();
            expect(mod.parseLine("fuel; diesel; 1; 1.")).toBeNull();
        });

        // ------------------------------------------------------------------------------------------ days
        pin("dayOf: 1 January 2000 is day 0, and months run from 1", () => {
            expect(mod.dayOf(2000, 1, 1)).toBe(0);
            expect(mod.dayOf(2000, 3, 1)).toBe(60);
            expect(mod.dayOf(2000, 12, 31)).toBe(365);
        });
        pin("dayOf: later years and a leap day", () => {
            expect(mod.dayOf(2024, 2, 29)).toBe(8825);
            expect(mod.dayOf(2026, 3, 2)).toBe(MON);
        });
        pin("isoDay: year, month and date with two digits each", () => {
            expect(mod.isoDay(0)).toBe("2000-01-01");
            expect(mod.isoDay(8825)).toBe("2024-02-29");
            expect(mod.isoDay(MON)).toBe("2026-03-02");
            expect(mod.isoDay(MON + 304)).toBe("2026-12-31");
        });
        pin("isoDay: a dash for no day", () => {
            expect(mod.isoDay(mod.NO_DAY)).toBe("-");
            expect(mod.isoDay(-40)).toBe("-");
        });
        pin("isoDay: every day of 2000 to 2101 and of 2399 to 2400, as the calendar has it", () => {
            for (const day of calendarDays()) {
                const want = new Date(Date.UTC(2000, 0, 1) + day * 86400000).toISOString().slice(0, 10);
                if (mod.isoDay(day) !== want) expect(mod.isoDay(day), `day ${day}`).toBe(want);
            }
            expect(mod.isoDay(9748)).toBe("2026-09-09");
        });
        pin("dayOf: every day of 2000 to 2101 and of 2399 to 2400, as the calendar has it", () => {
            for (const day of calendarDays()) {
                const when = new Date(Date.UTC(2000, 0, 1) + day * 86400000);
                const got = mod.dayOf(when.getUTCFullYear(), when.getUTCMonth() + 1, when.getUTCDate());
                if (got !== day) expect(got, when.toISOString().slice(0, 10)).toBe(day);
            }
            expect(mod.dayOf(2100, 3, 1)).toBe(36584);
        });
        pin("dayOfIso: reads a day, with spaces around it", () => {
            expect(mod.dayOfIso("2026-03-02")).toBe(MON);
            expect(mod.dayOfIso(" 2000-01-01 ")).toBe(0);
        });
        pin("dayOfIso: NO_DAY for what is not a day of the calendar", () => {
            for (const text of ["2026-02-30", "2026-3-2", "1999-12-31", "", "2026-13-01", "02/03/2026"]) {
                expect(mod.dayOfIso(text), text).toBe(-1);
            }
        });

        // ------------------------------------------------------------------------------------------- tax
        pin("taxRate: tenths of a percent for the standard and the reduced band", () => {
            expect(mod.taxRate("hire")).toBe(200);
            expect(mod.taxRate("pumpout")).toBe(200);
            expect(mod.taxRate("sundry")).toBe(200);
            expect(mod.taxRate("fuel")).toBe(50);
        });
        pin("taxRate: nothing on moorings and damage", () => {
            expect(mod.taxRate("mooring")).toBe(0);
            expect(mod.taxRate("damage")).toBe(0);
        });
        pin("lineNet: quantity in hundredths times the unit price", () => {
            expect(mod.lineNet(HIRE)).toBe(84000);
            expect(mod.lineNet(BERTH)).toBe(3000);
            expect(mod.lineNet({ kind: "sundry", label: "", qty: 100, unitPence: 0 })).toBe(0);
        });
        pin("lineNet: half a penny goes up, and less than half goes down", () => {
            expect(mod.lineNet(FUEL)).toBe(5738);
            expect(mod.lineNet({ kind: "sundry", label: "", qty: 150, unitPence: 333 })).toBe(500);
            expect(mod.lineNet({ kind: "sundry", label: "", qty: 1, unitPence: 50 })).toBe(1);
            expect(mod.lineNet({ kind: "sundry", label: "", qty: 1, unitPence: 49 })).toBe(0);
        });
        pin("taxSummary: a row for each band that has a line, standard first", () => {
            expect(mod.taxSummary([BERTH, FUEL, HIRE])).toEqual([
                { band: "standard", netPence: 84000, taxPence: 16800 },
                { band: "reduced", netPence: 5738, taxPence: 286 },
                { band: "exempt", netPence: 3000, taxPence: 0 },
            ]);
        });
        pin("taxSummary: no row for a band with no line, and none for no lines", () => {
            expect(mod.taxSummary([BERTH])).toEqual([{ band: "exempt", netPence: 3000, taxPence: 0 }]);
            expect(mod.taxSummary([])).toEqual([]);
        });
        pin("taxSummary: a band whose lines come to nothing still has its row", () => {
            expect(mod.taxSummary([{ kind: "sundry", label: "", qty: 100, unitPence: 0 }])).toEqual(
                [{ band: "standard", netPence: 0, taxPence: 0 }]);
            expect(mod.taxSummary([BERTH, { kind: "fuel", label: "", qty: 100, unitPence: 0 }])).toEqual([
                { band: "reduced", netPence: 0, taxPence: 0 },
                { band: "exempt", netPence: 3000, taxPence: 0 },
            ]);
        });
        pin("taxSummary: tax on the band's net and not line by line, a part of a penny dropped", () => {
            const odd: Line = { kind: "pumpout", label: "", qty: 100, unitPence: 333 };
            expect(mod.taxSummary([odd, { ...odd, kind: "sundry" }])).toEqual([
                { band: "standard", netPence: 666, taxPence: 133 },
            ]);
            expect(mod.taxSummary([{ kind: "sundry", label: "", qty: 100, unitPence: 9 }])[0].taxPence).toBe(1);
            expect(mod.taxSummary([{ kind: "fuel", label: "", qty: 100, unitPence: 39 }])[0].taxPence).toBe(1);
        });
        pin("totalsOf: net, tax and the two together", () => {
            expect(mod.totalsOf([FUEL, HIRE, BERTH])).toEqual({ netPence: 92738, taxPence: 17086, grossPence: 109824 });
        });
        pin("totalsOf: nothing for no lines", () => {
            expect(mod.totalsOf([])).toEqual({ netPence: 0, taxPence: 0, grossPence: 0 });
        });
        pin("taxWithin: the tax inside an amount, by the kind's rate", () => {
            expect(mod.taxWithin(12000, "hire")).toBe(2000);
            expect(mod.taxWithin(105, "fuel")).toBe(5);
            expect(mod.taxWithin(5000, "mooring")).toBe(0);
        });
        pin("taxWithin: a part of a penny goes to the net", () => {
            expect(mod.taxWithin(100, "hire")).toBe(16);
            expect(mod.taxWithin(1000, "fuel")).toBe(47);
            expect(mod.taxWithin(1, "sundry")).toBe(0);
        });

        // ----------------------------------------------------------------------------------------- lines
        pin("describeLine: the kind and label, the quantity, the price and the net", () => {
            expect(mod.describeLine(FUEL)).toBe("Fuel: diesel  42.50 x £1.35  £57.38");
            expect(mod.describeLine(HIRE)).toBe("Hire: Kingfisher, 7 nights  7 x £120.00  £840.00");
        });
        pin("describeLine: no colon without a label, and parts of a unit with two places", () => {
            expect(mod.describeLine({ kind: "pumpout", label: "", qty: 100, unitPence: 1800 })).toBe(
                "Pump-out  1 x £18.00  £18.00");
            expect(mod.describeLine({ kind: "sundry", label: "rope", qty: 105, unitPence: 200 })).toBe(
                "Sundry: rope  1.05 x £2.00  £2.10");
            expect(mod.describeLine({ kind: "damage", label: "fender", qty: 1200, unitPence: 2500 })).toBe(
                "Damage: fender  12 x £25.00  £300.00");
        });
        pin("describeLine: a part of a unit under a tenth, and a large quantity with a part", () => {
            expect(mod.describeLine({ kind: "fuel", label: "diesel", qty: 9950, unitPence: 100 })).toBe(
                "Fuel: diesel  99.50 x £1.00  £99.50");
            expect(mod.describeLine({ kind: "sundry", label: "rope", qty: 109, unitPence: 100 })).toBe(
                "Sundry: rope  1.09 x £1.00  £1.09");
            expect(mod.describeLine({ kind: "hire", label: "", qty: 2, unitPence: 100000 })).toBe(
                "Hire  0.02 x £1,000.00  £20.00");
        });
        pin("sortLines: by kind as an invoice prints, then by label", () => {
            const lines: Line[] = [
                { kind: "sundry", label: "rope", qty: 100, unitPence: 1 },
                { kind: "fuel", label: "gas", qty: 100, unitPence: 2 },
                { kind: "damage", label: "fender", qty: 100, unitPence: 3 },
                { kind: "fuel", label: "diesel", qty: 100, unitPence: 4 },
                { kind: "pumpout", label: "", qty: 100, unitPence: 5 },
                { kind: "mooring", label: "berth", qty: 100, unitPence: 6 },
                { kind: "hire", label: "Kingfisher", qty: 100, unitPence: 7 },
            ];
            expect(mod.sortLines(lines).map((line) => line.unitPence)).toEqual([7, 6, 4, 2, 5, 3, 1]);
        });
        pin("sortLines: labels by their characters, capitals before small letters, in whatever order they come", () => {
            const make = (label: string, unitPence: number): Line => ({ kind: "sundry", label, qty: 100, unitPence });
            const mixed = [make("aft cabin", 1), make("Zander", 2), make("rope", 3), make("", 4), make("Bilge", 5),
                make("rope", 6)];
            expect(mod.sortLines(mixed).map((line) => line.unitPence)).toEqual([4, 5, 2, 1, 3, 6]);
            const back = [make("rope", 1), make("gas", 2), make("diesel", 3), make("anchor", 4)];
            expect(mod.sortLines(back).map((line) => line.label)).toEqual(["anchor", "diesel", "gas", "rope"]);
            const forth = [make("anchor", 1), make("diesel", 2), make("gas", 3), make("rope", 4)];
            expect(mod.sortLines(forth).map((line) => line.label)).toEqual(["anchor", "diesel", "gas", "rope"]);
            const two = [make("diesel", 1), make("gas", 2)];
            expect(mod.sortLines(two).map((line) => line.label)).toEqual(["diesel", "gas"]);
        });
        pin("sortLines: sorts the array it is given and returns that array", () => {
            const lines: Line[] = [copyOf(FUEL), copyOf(HIRE)];
            const back = mod.sortLines(lines);
            expect(back).toBe(lines);
            expect(lines.map((line) => line.kind)).toEqual(["hire", "fuel"]);
        });
        pin("sortLines: lines of one kind and label keep their order", () => {
            const lines: Line[] = [
                { kind: "fuel", label: "diesel", qty: 300, unitPence: 135 },
                { kind: "hire", label: "Kingfisher", qty: 100, unitPence: 1 },
                { kind: "fuel", label: "diesel", qty: 100, unitPence: 140 },
                { kind: "fuel", label: "diesel", qty: 200, unitPence: 130 },
            ];
            expect(mod.sortLines(lines).map((line) => line.qty)).toEqual([100, 300, 100, 200]);
        });
        pin("mergeLines: one kind, label and price become one line where the first stood", () => {
            const lines: Line[] = [
                { kind: "fuel", label: "diesel", qty: 1000, unitPence: 135 },
                { kind: "hire", label: "Kingfisher", qty: 300, unitPence: 12000 },
                { kind: "fuel", label: "diesel", qty: 250, unitPence: 135 },
                { kind: "hire", label: "Kingfisher", qty: 400, unitPence: 12000 },
            ];
            expect(mod.mergeLines(lines)).toEqual([
                { kind: "fuel", label: "diesel", qty: 1250, unitPence: 135 },
                { kind: "hire", label: "Kingfisher", qty: 700, unitPence: 12000 },
            ]);
        });
        pin("mergeLines: another price, label or kind stays a line of its own", () => {
            const lines: Line[] = [
                { kind: "fuel", label: "diesel", qty: 100, unitPence: 135 },
                { kind: "fuel", label: "diesel", qty: 100, unitPence: 140 },
                { kind: "fuel", label: "Diesel", qty: 100, unitPence: 135 },
                { kind: "sundry", label: "diesel", qty: 100, unitPence: 135 },
            ];
            expect(mod.mergeLines(lines)).toEqual(lines);
        });
        pin("mergeLines: leaves the list and the lines it is given as they were", () => {
            const lines: Line[] = [
                { kind: "fuel", label: "diesel", qty: 1000, unitPence: 135 },
                { kind: "fuel", label: "diesel", qty: 250, unitPence: 135 },
            ];
            const before = copyOf(lines);
            const merged = mod.mergeLines(lines);
            expect(lines).toEqual(before);
            merged[0].qty = 1;
            expect(lines).toEqual(before);
        });

        // ------------------------------------------------------------------- late fees, parts, reminders
        pin("lateFee: nothing through the seventh day late, and nothing when nothing is owed", () => {
            expect(mod.lateFee(10000, 0)).toBe(0);
            expect(mod.lateFee(10000, 7)).toBe(0);
            expect(mod.lateFee(0, 90)).toBe(0);
            expect(mod.lateFee(-500, 90)).toBe(0);
        });
        pin("lateFee: a flat fifteen pounds from the eighth day", () => {
            expect(mod.lateFee(10000, 8)).toBe(1500);
            expect(mod.lateFee(10000, 29)).toBe(1500);
            expect(mod.lateFee(1, 8)).toBe(1500);
        });
        pin("lateFee: and one and a half percent of what is owed for each whole 30 days", () => {
            expect(mod.lateFee(10000, 30)).toBe(1650);
            expect(mod.lateFee(10000, 59)).toBe(1650);
            expect(mod.lateFee(10000, 60)).toBe(1800);
            expect(mod.lateFee(3333, 30)).toBe(1549);
        });
        pin("lateFee: the share for several lots of 30 days is worked out once, a part of a penny dropped", () => {
            expect(mod.lateFee(3333, 60)).toBe(1599);
            expect(mod.lateFee(3333, 90)).toBe(1649);
            expect(mod.lateFee(101, 120)).toBe(1506);
        });
        pin("instalments: equal parts, the odd pence on the first", () => {
            expect(mod.instalments(1000, 3)).toEqual([334, 333, 333]);
            expect(mod.instalments(1003, 4)).toEqual([253, 250, 250, 250]);
            expect(mod.instalments(900, 3)).toEqual([300, 300, 300]);
        });
        pin("instalments: one part, and more parts than pence", () => {
            expect(mod.instalments(5, 1)).toEqual([5]);
            expect(mod.instalments(2, 3)).toEqual([2, 0, 0]);
        });
        pin("instalments: throws RangeError for no parts or part of a part", () => {
            expect(() => mod.instalments(1000, 0)).toThrow(RangeError);
            expect(() => mod.instalments(1000, 2.5)).toThrow(RangeError);
        });
        pin("reminderLevel: none through three days late, a nudge from four", () => {
            expect(mod.reminderLevel(0)).toBe("none");
            expect(mod.reminderLevel(3)).toBe("none");
            expect(mod.reminderLevel(4)).toBe("nudge");
            expect(mod.reminderLevel(14)).toBe("nudge");
        });
        pin("reminderLevel: firm from fifteen, final from twenty-nine", () => {
            expect(mod.reminderLevel(15)).toBe("firm");
            expect(mod.reminderLevel(28)).toBe("firm");
            expect(mod.reminderLevel(29)).toBe("final");
            expect(mod.reminderLevel(400)).toBe("final");
        });

        // ------------------------------------------------------------------------- the invoice: a draft
        pin("Invoice: keeps its number, the hirer's name trimmed, and its terms", () => {
            const invoice = new mod.Invoice(1001, "  Ada Moss ");
            expect(invoice.number).toBe(1001);
            expect(invoice.hirer).toBe("Ada Moss");
            expect(invoice.termsDays).toBe(14);
            expect(new mod.Invoice(1002, "Ada Moss", 0).termsDays).toBe(0);
        });
        pin("Invoice: throws RangeError for a number under 1001 or not whole, and for bad terms", () => {
            expect(() => new mod.Invoice(1000, "Ada Moss")).toThrow(RangeError);
            expect(() => new mod.Invoice(1001.5, "Ada Moss")).toThrow(RangeError);
            expect(() => new mod.Invoice(1001, "Ada Moss", -1)).toThrow(RangeError);
            expect(() => new mod.Invoice(1001, "Ada Moss", 7.5)).toThrow(RangeError);
        });
        pin("addLine: returns how many lines there are now", () => {
            const invoice = new mod.Invoice(1001, "Ada Moss");
            expect(invoice.addLine(copyOf(FUEL))).toBe(1);
            expect(invoice.addLine(copyOf(HIRE))).toBe(2);
            expect(invoice.addLine(copyOf(FUEL))).toBe(3);
        });
        pin("addLine: keeps a copy, with the label trimmed", () => {
            const invoice = new mod.Invoice(1001, "Ada Moss");
            const line: Line = { kind: "sundry", label: "  rope ", qty: 100, unitPence: 450 };
            invoice.addLine(line);
            expect(line.label).toBe("  rope ");
            line.qty = 900;
            expect(invoice.lineList()).toEqual([{ kind: "sundry", label: "rope", qty: 100, unitPence: 450 }]);
        });
        pin("addLine: throws RangeError for a quantity or a price that will not do", () => {
            const invoice = new mod.Invoice(1001, "Ada Moss");
            expect(() => invoice.addLine({ ...FUEL, qty: 0 })).toThrow(RangeError);
            expect(() => invoice.addLine({ ...FUEL, qty: 1.5 })).toThrow(RangeError);
            expect(() => invoice.addLine({ ...FUEL, unitPence: -1 })).toThrow(RangeError);
            expect(() => invoice.addLine({ ...FUEL, unitPence: 1.5 })).toThrow(RangeError);
            expect(invoice.addLine({ ...FUEL, unitPence: 0 })).toBe(1);
        });
        pin("addLine: a quantity below 0 throws RangeError, and one hundredth of a unit goes in", () => {
            const invoice = new mod.Invoice(1001, "Ada Moss");
            expect(() => invoice.addLine({ ...FUEL, qty: -100 })).toThrow(RangeError);
            expect(() => invoice.addLine({ ...FUEL, qty: -1 })).toThrow(RangeError);
            expect(invoice.addLine({ ...FUEL, qty: 1 })).toBe(1);
            expect(invoice.addLine({ ...FUEL, qty: 2 })).toBe(2);
            expect(invoice.lineList()).toEqual([{ ...FUEL, qty: 1 }, { ...FUEL, qty: 2 }]);
        });
        pin("addLine: the fortieth line goes in and the forty-first throws RangeError", () => {
            const invoice = new mod.Invoice(1001, "Ada Moss");
            for (let n = 1; n <= 40; n++) expect(invoice.addLine({ ...FUEL, label: "can " + n })).toBe(n);
            expect(() => invoice.addLine({ ...FUEL, label: "can 41" })).toThrow(RangeError);
            expect(invoice.lineList()).toHaveLength(40);
        });
        pin("addLine: throws once the invoice is issued, and when it is void", () => {
            const issued = standard(mod, 1001, "Ada Moss");
            expect(() => issued.addLine(copyOf(FUEL))).toThrow();
            expect(issued.lineList()).toHaveLength(3);
            const gone = new mod.Invoice(1002, "Ada Moss");
            gone.cancel();
            expect(() => gone.addLine(copyOf(FUEL))).toThrow();
        });
        pin("removeLine: counts from 0 and says true", () => {
            const invoice = new mod.Invoice(1001, "Ada Moss");
            invoice.addLine(copyOf(FUEL));
            invoice.addLine(copyOf(HIRE));
            invoice.addLine(copyOf(BERTH));
            expect(invoice.removeLine(0)).toBe(true);
            expect(invoice.lineList()).toEqual([HIRE, BERTH]);
            expect(invoice.removeLine(1)).toBe(true);
            expect(invoice.lineList()).toEqual([HIRE]);
        });
        pin("removeLine: false when there is no such line", () => {
            const invoice = new mod.Invoice(1001, "Ada Moss");
            invoice.addLine(copyOf(FUEL));
            expect(invoice.removeLine(1)).toBe(false);
            expect(invoice.removeLine(-1)).toBe(false);
            expect(invoice.removeLine(0.5)).toBe(false);
            expect(invoice.lineList()).toEqual([FUEL]);
        });
        pin("removeLine: throws once the invoice is issued", () => {
            const issued = standard(mod, 1001, "Ada Moss");
            expect(() => issued.removeLine(0)).toThrow();
            expect(issued.lineList()).toHaveLength(3);
        });
        pin("removeLine: throws on a void invoice, and keeps its lines", () => {
            const gone = new mod.Invoice(1002, "Ada Moss");
            gone.addLine(copyOf(HIRE));
            gone.cancel();
            expect(() => gone.removeLine(0)).toThrow();
            expect(() => gone.removeLine(5)).toThrow();
            expect(gone.lineList()).toEqual([HIRE]);
        });
        pin("lineList: a draft's lines in the order they were added, not merged", () => {
            const invoice = new mod.Invoice(1001, "Ada Moss");
            invoice.addLine(copyOf(FUEL));
            invoice.addLine(copyOf(HIRE));
            invoice.addLine(copyOf(FUEL));
            expect(invoice.lineList()).toEqual([FUEL, HIRE, FUEL]);
        });
        pin("lineList: copies, so a caller cannot change the invoice through them", () => {
            const invoice = standard(mod, 1001, "Ada Moss");
            const lines = invoice.lineList();
            lines[0].qty = 1;
            lines.pop();
            expect(invoice.lineList()).toEqual([HIRE, BERTH, FUEL]);
            expect(invoice.totals().grossPence).toBe(STANDARD_GROSS);
        });

        // ------------------------------------------------------------------------ the invoice: issuing
        pin("issue: merges the lines and puts them in printed order", () => {
            const invoice = new mod.Invoice(1001, "Ada Moss");
            invoice.addLine({ kind: "fuel", label: "diesel", qty: 4000, unitPence: 135 });
            invoice.addLine(copyOf(BERTH));
            invoice.addLine({ kind: "fuel", label: "diesel", qty: 250, unitPence: 135 });
            invoice.addLine(copyOf(HIRE));
            invoice.issue(MON);
            expect(invoice.lineList()).toEqual([HIRE, BERTH, FUEL]);
        });
        pin("issue: throws with no lines, and throws the second time", () => {
            const empty = new mod.Invoice(1001, "Ada Moss");
            expect(() => empty.issue(MON)).toThrow();
            expect(empty.status()).toBe("draft");
            const invoice = standard(mod, 1002, "Ada Moss");
            expect(() => invoice.issue(MON + 1)).toThrow();
            expect(invoice.issuedDay()).toBe(MON);
        });
        pin("issue: throws on a void invoice, which stays void and unissued", () => {
            const gone = new mod.Invoice(1002, "Ada Moss");
            gone.addLine(copyOf(HIRE));
            gone.cancel();
            expect(() => gone.issue(MON)).toThrow();
            expect(gone.status()).toBe("void");
            expect(gone.issuedDay()).toBe(-1);
            expect(gone.dueDay()).toBe(-1);
        });
        pin("issue: throws RangeError for a day that is not a whole day from 0 on", () => {
            const invoice = new mod.Invoice(1001, "Ada Moss");
            invoice.addLine(copyOf(HIRE));
            expect(() => invoice.issue(-1)).toThrow(RangeError);
            expect(() => invoice.issue(12.5)).toThrow(RangeError);
            expect(invoice.status()).toBe("draft");
            invoice.issue(0);
            expect(invoice.issuedDay()).toBe(0);
        });
        pin("issuedDay: NO_DAY for a draft, then the day of issue", () => {
            const invoice = new mod.Invoice(1001, "Ada Moss");
            invoice.addLine(copyOf(HIRE));
            expect(invoice.issuedDay()).toBe(-1);
            invoice.issue(MON + 2);
            expect(invoice.issuedDay()).toBe(MON + 2);
        });
        pin("dueDay: NO_DAY for a draft, and the issue day plus the terms", () => {
            const draft = new mod.Invoice(1001, "Ada Moss");
            draft.addLine(copyOf(HIRE));
            expect(draft.dueDay()).toBe(-1);
            expect(standard(mod, 1002, "Ada Moss").dueDay()).toBe(MON + 14);
            expect(standard(mod, 1003, "Ada Moss", MON, 11).dueDay()).toBe(MON + 11);
            expect(standard(mod, 1004, "Ada Moss", MON, 0).dueDay()).toBe(MON);
        });
        pin("dueDay: a Saturday or a Sunday moves to the Monday after", () => {
            expect(standard(mod, 1001, "Ada Moss", MON, 12).dueDay()).toBe(MON + 14);
            expect(standard(mod, 1002, "Ada Moss", MON, 13).dueDay()).toBe(MON + 14);
            expect(standard(mod, 1003, "Ada Moss", MON + 5, 0).dueDay()).toBe(MON + 7);
            expect(standard(mod, 1004, "Ada Moss", MON + 4, 0).dueDay()).toBe(MON + 4);
        });
        pin("totals: of the invoice's lines", () => {
            expect(standard(mod, 1001, "Ada Moss").totals()).toEqual(
                { netPence: 92738, taxPence: 17086, grossPence: STANDARD_GROSS });
        });
        pin("totals: a draft has them too, and they move with its lines", () => {
            const invoice = new mod.Invoice(1001, "Ada Moss");
            expect(invoice.totals()).toEqual({ netPence: 0, taxPence: 0, grossPence: 0 });
            invoice.addLine(copyOf(HIRE));
            expect(invoice.totals()).toEqual({ netPence: 84000, taxPence: 16800, grossPence: 100800 });
        });

        // ----------------------------------------------------------------------- the invoice: payments
        pin("pay: a part payment is taken whole and 0 comes back", () => {
            const invoice = standard(mod, 1001, "Ada Moss");
            expect(invoice.pay(MON + 3, 50000, "card", "C-881")).toBe(0);
            expect(invoice.paymentList()).toEqual([{ day: MON + 3, pence: 50000, method: "card", ref: "C-881" }]);
            expect(invoice.owedPence()).toBe(59824);
        });
        pin("pay: takes no more than is owed and gives back the rest", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            expect(invoice.pay(MON + 1, 5000)).toBe(0);
            expect(invoice.pay(MON + 2, 5000, "cash")).toBe(2000);
            expect(invoice.paymentList()[0]).toEqual({ day: MON + 2, pence: 3000, method: "cash", ref: "" });
            expect(invoice.paidPence()).toBe(8000);
            expect(invoice.owedPence()).toBe(0);
        });
        pin("pay: a payment to an invoice that owes nothing comes back whole and is not kept", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            invoice.pay(MON + 1, 8000);
            expect(invoice.pay(MON + 2, 700)).toBe(700);
            expect(invoice.paymentList()).toHaveLength(1);
        });
        pin("pay: by transfer and with no reference unless told", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            invoice.pay(MON + 1, 100);
            expect(invoice.paymentList()).toEqual([{ day: MON + 1, pence: 100, method: "transfer", ref: "" }]);
        });
        pin("pay: throws RangeError unless the pence are whole and above 0", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            expect(() => invoice.pay(MON, 0)).toThrow(RangeError);
            expect(() => invoice.pay(MON, -100)).toThrow(RangeError);
            expect(() => invoice.pay(MON, 10.5)).toThrow(RangeError);
            expect(invoice.paymentList()).toEqual([]);
        });
        pin("pay: throws on a draft and on a void invoice", () => {
            const draft = new mod.Invoice(1001, "Ada Moss");
            draft.addLine(copyOf(HIRE));
            expect(() => draft.pay(MON, 100)).toThrow();
            const gone = flat(mod, 1002, "Ada Moss", 8000);
            gone.cancel();
            expect(() => gone.pay(MON, 100)).toThrow();
            expect(gone.paymentList()).toEqual([]);
        });
        pin("pay: the same reference twice on one invoice is taken twice", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            expect(invoice.pay(MON + 1, 1000, "transfer", "BACS-17")).toBe(0);
            expect(invoice.pay(MON + 2, 1000, "transfer", "BACS-17")).toBe(0);
            expect(invoice.paidPence()).toBe(2000);
        });
        pin("paymentList: the payment recorded last is first, whatever the days", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            invoice.pay(MON + 5, 100, "card", "a");
            invoice.pay(MON + 2, 200, "cash", "b");
            invoice.pay(MON + 9, 300, "cheque", "c");
            expect(invoice.paymentList().map((payment) => payment.ref)).toEqual(["c", "b", "a"]);
            expect(invoice.paymentList().map((payment) => payment.pence)).toEqual([300, 200, 100]);
        });
        pin("paymentList: empty at first, and copies after", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            expect(invoice.paymentList()).toEqual([]);
            invoice.pay(MON + 1, 100);
            const list = invoice.paymentList();
            list[0].pence = 7000;
            list.pop();
            expect(invoice.paymentList()).toEqual([{ day: MON + 1, pence: 100, method: "transfer", ref: "" }]);
            expect(invoice.paidPence()).toBe(100);
        });
        pin("lastPaymentDay: NO_DAY while there is no payment", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            expect(invoice.lastPaymentDay()).toBe(-1);
            invoice.credit(MON + 1, 500, "goodwill");
            expect(invoice.lastPaymentDay()).toBe(-1);
        });
        pin("lastPaymentDay: the day of the payment recorded last, not the latest day", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            invoice.pay(MON + 5, 100);
            expect(invoice.lastPaymentDay()).toBe(MON + 5);
            invoice.pay(MON + 2, 200);
            expect(invoice.lastPaymentDay()).toBe(MON + 2);
        });

        // ------------------------------------------------------------------- the invoice: credit notes
        pin("credit: a note numbered after the invoice, counting from 1", () => {
            const invoice = standard(mod, 1004, "Ada Moss");
            expect(invoice.credit(MON + 3, 3000, "berth not used")).toEqual(
                { id: "CN1004-1", day: MON + 3, pence: 3000, reason: "berth not used" });
            expect(invoice.credit(MON + 4, 500, "  goodwill ")).toEqual(
                { id: "CN1004-2", day: MON + 4, pence: 500, reason: "goodwill" });
            expect(invoice.owedPence()).toBe(STANDARD_GROSS - 3500);
        });
        pin("credit: all that is owed may be credited, and a penny more throws RangeError", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            invoice.pay(MON + 1, 3000);
            expect(() => invoice.credit(MON + 2, 5001, "too much")).toThrow(RangeError);
            expect(invoice.creditList()).toEqual([]);
            expect(invoice.credit(MON + 2, 5000, "the rest").pence).toBe(5000);
            expect(invoice.owedPence()).toBe(0);
        });
        pin("credit: throws RangeError unless the pence are whole and above 0", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            expect(() => invoice.credit(MON, 0, "nothing")).toThrow(RangeError);
            expect(() => invoice.credit(MON, -5, "less")).toThrow(RangeError);
            expect(() => invoice.credit(MON, 2.5, "part")).toThrow(RangeError);
            expect(invoice.creditList()).toEqual([]);
        });
        pin("credit: throws on a draft and on a void invoice", () => {
            const draft = new mod.Invoice(1001, "Ada Moss");
            draft.addLine(copyOf(HIRE));
            expect(() => draft.credit(MON, 100, "early")).toThrow();
            const gone = flat(mod, 1002, "Ada Moss", 8000);
            gone.cancel();
            expect(() => gone.credit(MON, 100, "late")).toThrow();
        });
        pin("credit: a note for a single penny", () => {
            const invoice = standard(mod, 1003, "Ada Moss");
            expect(invoice.credit(MON, 1, "a penny")).toEqual(
                { id: "CN1003-1", day: MON, pence: 1, reason: "a penny" });
            expect(invoice.owedPence()).toBe(STANDARD_GROSS - 1);
            const last = flat(mod, 1004, "Ada Moss", 1);
            expect(last.credit(MON + 1, 1, "the last penny").pence).toBe(1);
            expect(last.owedPence()).toBe(0);
        });
        pin("credit: the note handed back is a copy", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            const note = invoice.credit(MON, 1000, "goodwill");
            note.pence = 8000;
            expect(invoice.creditedPence()).toBe(1000);
        });
        pin("creditList: the note raised first is first", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            invoice.credit(MON + 6, 100, "one");
            invoice.credit(MON + 2, 200, "two");
            expect(invoice.creditList().map((note) => note.id)).toEqual(["CN1001-1", "CN1001-2"]);
            expect(invoice.creditList().map((note) => note.reason)).toEqual(["one", "two"]);
        });
        pin("creditList: empty at first, and copies after", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            expect(invoice.creditList()).toEqual([]);
            invoice.credit(MON, 100, "one");
            const list = invoice.creditList();
            list[0].pence = 9;
            list.pop();
            expect(invoice.creditList()).toEqual([{ id: "CN1001-1", day: MON, pence: 100, reason: "one" }]);
        });

        // ------------------------------------------------------------ the invoice: what is paid and owed
        pin("paidPence: 0 at first, then the sum of what was taken", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            expect(invoice.paidPence()).toBe(0);
            invoice.pay(MON, 1200);
            invoice.pay(MON, 300);
            expect(invoice.paidPence()).toBe(1500);
        });
        pin("paidPence: counts what was taken, not what was offered", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            invoice.pay(MON, 9500);
            expect(invoice.paidPence()).toBe(8000);
        });
        pin("creditedPence: 0 at first, then the sum of the notes", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            expect(invoice.creditedPence()).toBe(0);
            invoice.credit(MON, 1200, "one");
            invoice.credit(MON, 300, "two");
            expect(invoice.creditedPence()).toBe(1500);
        });
        pin("creditedPence: payments are not credits", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            invoice.pay(MON, 1200);
            expect(invoice.creditedPence()).toBe(0);
        });
        pin("owedPence: the gross less payments and credit notes", () => {
            const invoice = standard(mod, 1001, "Ada Moss");
            expect(invoice.owedPence()).toBe(STANDARD_GROSS);
            invoice.pay(MON + 1, 50000);
            invoice.credit(MON + 2, 3000, "berth not used");
            expect(invoice.owedPence()).toBe(56824);
        });
        pin("owedPence: 0 for a draft and for a void invoice", () => {
            const draft = new mod.Invoice(1001, "Ada Moss");
            draft.addLine(copyOf(HIRE));
            expect(draft.owedPence()).toBe(0);
            const gone = standard(mod, 1002, "Ada Moss");
            gone.cancel();
            expect(gone.owedPence()).toBe(0);
        });
        pin("status: draft, then open, then part-paid, then paid", () => {
            const invoice = new mod.Invoice(1001, "Ada Moss");
            invoice.addLine({ kind: "damage", label: "fender", qty: 100, unitPence: 8000 });
            expect(invoice.status()).toBe("draft");
            invoice.issue(MON);
            expect(invoice.status()).toBe("open");
            invoice.pay(MON + 1, 1);
            expect(invoice.status()).toBe("part-paid");
            invoice.pay(MON + 2, 7999);
            expect(invoice.status()).toBe("paid");
        });
        pin("status: a credit note alone makes it part-paid, and paid when it covers all", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            invoice.credit(MON, 1000, "goodwill");
            expect(invoice.status()).toBe("part-paid");
            invoice.credit(MON, 7000, "the rest");
            expect(invoice.status()).toBe("paid");
        });
        pin("status: an issued invoice that comes to nothing is paid at once", () => {
            const invoice = new mod.Invoice(1001, "Ada Moss");
            invoice.addLine({ kind: "sundry", label: "", qty: 100, unitPence: 0 });
            expect(invoice.status()).toBe("draft");
            invoice.issue(MON);
            expect(invoice.owedPence()).toBe(0);
            expect(invoice.status()).toBe("paid");
        });
        pin("status: void after cancel, whatever it was", () => {
            const draft = new mod.Invoice(1001, "Ada Moss");
            draft.cancel();
            expect(draft.status()).toBe("void");
            const credited = flat(mod, 1002, "Ada Moss", 8000);
            credited.credit(MON, 1000, "goodwill");
            credited.cancel();
            expect(credited.status()).toBe("void");
        });

        // -------------------------------------------------------------------------- the invoice: late
        pin("daysLate: 0 through the due day, then one for each day after", () => {
            const invoice = standard(mod, 1001, "Ada Moss");
            expect(invoice.daysLate(MON)).toBe(0);
            expect(invoice.daysLate(MON + 14)).toBe(0);
            expect(invoice.daysLate(MON + 15)).toBe(1);
            expect(invoice.daysLate(MON + 44)).toBe(30);
        });
        pin("daysLate: counted from the due day as moved off a weekend", () => {
            const invoice = standard(mod, 1001, "Ada Moss", MON, 12);
            expect(invoice.daysLate(MON + 13)).toBe(0);
            expect(invoice.daysLate(MON + 14)).toBe(0);
            expect(invoice.daysLate(MON + 16)).toBe(2);
        });
        pin("daysLate: 0 once nothing is owed, and for a draft", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            invoice.pay(MON + 1, 8000);
            expect(invoice.daysLate(MON + 90)).toBe(0);
            const draft = new mod.Invoice(1002, "Ada Moss");
            draft.addLine(copyOf(HIRE));
            expect(draft.daysLate(MON + 90)).toBe(0);
        });
        pin("isOverdue: not on the due day, and from the day after", () => {
            const invoice = standard(mod, 1001, "Ada Moss");
            expect(invoice.isOverdue(MON + 14)).toBe(false);
            expect(invoice.isOverdue(MON + 15)).toBe(true);
        });
        pin("isOverdue: never once nothing is owed, nor when void", () => {
            const paid = flat(mod, 1001, "Ada Moss", 8000);
            paid.credit(MON + 1, 8000, "written down");
            expect(paid.isOverdue(MON + 90)).toBe(false);
            const gone = flat(mod, 1002, "Ada Moss", 8000);
            gone.cancel();
            expect(gone.isOverdue(MON + 90)).toBe(false);
        });
        pin("cancel: voids an invoice that has taken no money, and says true", () => {
            const open = standard(mod, 1001, "Ada Moss");
            expect(open.cancel()).toBe(true);
            expect(open.status()).toBe("void");
            expect(open.cancel()).toBe(true);
            const credited = flat(mod, 1002, "Ada Moss", 8000);
            credited.credit(MON, 1000, "goodwill");
            expect(credited.cancel()).toBe(true);
        });
        pin("cancel: says false and changes nothing once a payment is in", () => {
            const invoice = flat(mod, 1001, "Ada Moss", 8000);
            invoice.pay(MON + 1, 1);
            expect(invoice.cancel()).toBe(false);
            expect(invoice.status()).toBe("part-paid");
            expect(invoice.owedPence()).toBe(7999);
        });

        // ---------------------------------------------------------------- the invoice: its statement
        pin("statementLines: an open invoice on its due day", () => {
            expect(standard(mod, 1001, "Ada Moss").statementLines(MON + 14)).toEqual([
                "Invoice 1001  issued 2026-03-02  due 2026-03-16",
                "  Hire: Kingfisher, 7 nights  7 x £120.00  £840.00",
                "  Mooring: visitor berth  2 x £15.00  £30.00",
                "  Fuel: diesel  42.50 x £1.35  £57.38",
                "  Net £927.38  Tax £170.86  Total £1,098.24",
                "  Owed £1,098.24",
            ]);
        });
        pin("statementLines: one day late, seven days late, and the fee from the eighth", () => {
            const invoice = flat(mod, 1002, "Ada Moss", 8000);
            const head = [
                "Invoice 1002  issued 2026-03-02  due 2026-03-16",
                "  Damage: lost windlass  1 x £80.00  £80.00",
                "  Net £80.00  Tax £0.00  Total £80.00",
            ];
            expect(invoice.statementLines(MON + 15)).toEqual([...head, "  Owed £80.00  (1 day late)"]);
            expect(invoice.statementLines(MON + 21)).toEqual([...head, "  Owed £80.00  (7 days late)"]);
            expect(invoice.statementLines(MON + 22)).toEqual(
                [...head, "  Owed £80.00  (8 days late)", "  Late fee if unpaid £15.00"]);
        });
        pin("statementLines: credit notes, each with its id, day, amount and reason", () => {
            const invoice = flat(mod, 1002, "Ada Moss", 8000);
            invoice.credit(MON + 3, 1000, "goodwill");
            invoice.credit(MON + 1, 250, "found again");
            expect(invoice.statementLines(MON + 5)).toEqual([
                "Invoice 1002  issued 2026-03-02  due 2026-03-16",
                "  Damage: lost windlass  1 x £80.00  £80.00",
                "  Net £80.00  Tax £0.00  Total £80.00",
                "  Credit CN1002-1  2026-03-05  -£10.00  goodwill",
                "  Credit CN1002-2  2026-03-03  -£2.50  found again",
                "  Owed £67.50",
            ]);
        });
        pin("statementLines: a part-paid invoice, thirty days late", () => {
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
                "  Paid £500.00",
                "  Owed £568.24  (30 days late)",
                "  Late fee if unpaid £23.52",
            ]);
        });
        pin("statementLines: a draft has no days and owes nothing", () => {
            const draft = new mod.Invoice(1003, "Ada Moss");
            draft.addLine({ kind: "damage", label: "lost windlass", qty: 100, unitPence: 8000 });
            expect(draft.statementLines(MON + 30)).toEqual([
                "Invoice 1003  issued -  due -",
                "  Damage: lost windlass  1 x £80.00  £80.00",
                "  Net £80.00  Tax £0.00  Total £80.00",
                "  Owed £0.00",
            ]);
        });
        pin("statementLines: leaves the invoice as it was, and gives the same lines a second time", () => {
            const invoice = flat(mod, 1002, "Ada Moss", 8000);
            invoice.pay(MON + 5, 1000, "card", "a");
            invoice.pay(MON + 2, 2000, "cash", "b");
            invoice.pay(MON + 9, 3000, "cheque", "c");
            invoice.credit(MON + 3, 500, "goodwill");
            invoice.credit(MON + 1, 250, "found again");
            const payments = invoice.paymentList();
            const notes = invoice.creditList();
            const first = invoice.statementLines(MON + 40);
            expect(invoice.paymentList()).toEqual(payments);
            expect(invoice.lastPaymentDay()).toBe(MON + 9);
            expect(invoice.creditList()).toEqual(notes);
            expect(invoice.lineList()).toEqual([{ kind: "damage", label: "lost windlass", qty: 100, unitPence: 8000 }]);
            expect(invoice.owedPence()).toBe(1250);
            expect(invoice.statementLines(MON + 40)).toEqual(first);
        });
        pin("statementLines: an invoice paid in full is not late", () => {
            const invoice = flat(mod, 1002, "Ada Moss", 8000);
            invoice.pay(MON + 20, 3000);
            invoice.pay(MON + 21, 5000);
            expect(invoice.statementLines(MON + 60)).toEqual([
                "Invoice 1002  issued 2026-03-02  due 2026-03-16",
                "  Damage: lost windlass  1 x £80.00  £80.00",
                "  Net £80.00  Tax £0.00  Total £80.00",
                "  Paid £80.00",
                "  Owed £0.00",
            ]);
        });

        // -------------------------------------------------------------------------- lists of invoices
        pin("nextNumber: 1001 for an empty list", () => {
            expect(mod.nextNumber([])).toBe(1001);
        });
        pin("nextNumber: one more than the highest, wherever it stands", () => {
            const list = [1001, 1005, 1003].map((number) => new mod.Invoice(number, "Ada Moss"));
            expect(mod.nextNumber(list)).toBe(1006);
        });
        pin("nextNumber: void invoices count, as their numbers are spent", () => {
            const gone = new mod.Invoice(1009, "Ada Moss");
            gone.cancel();
            expect(mod.nextNumber([standard(mod, 1003, "Ada Moss"), gone])).toBe(1010);
            const issued = standard(mod, 1012, "Bo Tran");
            issued.cancel();
            expect(mod.nextNumber([issued])).toBe(1013);
        });
        pin("invoicesOf: the hirer's invoices by number, case and outer spaces aside", () => {
            const list = [
                standard(mod, 1003, "Ada Moss"),
                standard(mod, 1002, "Bo Tran"),
                standard(mod, 1001, "ada moss"),
            ];
            expect(mod.invoicesOf("  ADA MOSS ", list).map((invoice) => invoice.number)).toEqual([1001, 1003]);
            expect(list.map((invoice) => invoice.number)).toEqual([1003, 1002, 1001]);
            expect(mod.invoicesOf("Cy Platt", list)).toEqual([]);
        });
        pin("invoicesOf: leaves out drafts and void invoices, and keeps paid ones", () => {
            const draft = new mod.Invoice(1001, "Ada Moss");
            draft.addLine(copyOf(HIRE));
            const gone = standard(mod, 1002, "Ada Moss");
            gone.cancel();
            const paid = flat(mod, 1003, "Ada Moss", 8000);
            paid.pay(MON, 8000);
            const open = standard(mod, 1004, "Ada Moss");
            expect(mod.invoicesOf("Ada Moss", [open, paid, gone, draft]).map((invoice) => invoice.number)).toEqual(
                [1003, 1004]);
        });
        pin("owedBy: what the hirer's invoices still owe together", () => {
            const first = flat(mod, 1001, "Ada Moss", 8000);
            first.pay(MON, 3000);
            const list = [first, flat(mod, 1002, "Bo Tran", 700), flat(mod, 1003, "ada moss ", 150)];
            expect(mod.owedBy("Ada Moss", list)).toBe(5150);
            expect(mod.owedBy("Bo Tran", list)).toBe(700);
        });
        pin("owedBy: 0 for a hirer with no invoices or with drafts only", () => {
            const draft = new mod.Invoice(1001, "Ada Moss");
            draft.addLine(copyOf(HIRE));
            expect(mod.owedBy("Ada Moss", [draft])).toBe(0);
            expect(mod.owedBy("Cy Platt", [flat(mod, 1002, "Bo Tran", 700)])).toBe(0);
        });
        pin("overdue: the one that fell due first is first, and then by number", () => {
            const list = [
                flat(mod, 1004, "Ada Moss", 100, MON, 7),
                flat(mod, 1003, "Bo Tran", 100, MON, 2),
                flat(mod, 1002, "Ada Moss", 100, MON, 7),
                flat(mod, 1001, "Cy Platt", 100, MON, 21),
            ];
            expect(mod.overdue(list, MON + 30).map((invoice) => invoice.number)).toEqual([1003, 1002, 1004, 1001]);
            expect(list.map((invoice) => invoice.number)).toEqual([1004, 1003, 1002, 1001]);
        });
        pin("overdue: not the ones due today or later, nor the ones that owe nothing", () => {
            const paid = flat(mod, 1001, "Ada Moss", 100, MON, 2);
            paid.pay(MON + 1, 100);
            const list = [paid, flat(mod, 1002, "Ada Moss", 100, MON, 7), flat(mod, 1003, "Ada Moss", 100, MON, 8)];
            expect(mod.overdue(list, MON + 8).map((invoice) => invoice.number)).toEqual([1002]);
            expect(mod.overdue(list, MON + 7)).toEqual([]);
        });
        pin("ageing: due today is not due yet, and 30 days late is in the first band", () => {
            // a Thursday, so that none of the four due days is moved off a weekend
            const today = MON + 101;
            const list = [
                flat(mod, 1001, "Ada Moss", 1, today, 0),
                flat(mod, 1002, "Ada Moss", 20, today - 1, 0),
                flat(mod, 1003, "Ada Moss", 300, today - 30, 0),
                flat(mod, 1004, "Ada Moss", 4000, today - 31, 0),
            ];
            expect(list.map((invoice) => invoice.daysLate(today))).toEqual([0, 1, 30, 31]);
            expect(mod.ageing(list, today)).toEqual({ notDue: 1, to30: 320, to60: 4000, older: 0 });
        });
        pin("ageing: 60 days late is in the second band, and 61 in the last", () => {
            const today = MON + 103;
            const list = [
                flat(mod, 1005, "Ada Moss", 50000, today - 60, 0),
                flat(mod, 1006, "Ada Moss", 600000, today - 61, 0),
                flat(mod, 1007, "Bo Tran", 7000000, today - 200, 0),
            ];
            expect(list.map((invoice) => invoice.daysLate(today))).toEqual([60, 61, 200]);
            expect(mod.ageing(list, today)).toEqual({ notDue: 0, to30: 0, to60: 50000, older: 7600000 });
        });
        pin("ageing: only what is still owed, and nothing for drafts or an empty list", () => {
            const part = flat(mod, 1001, "Ada Moss", 8000, MON, 0);
            part.pay(MON + 1, 3000);
            const paid = flat(mod, 1002, "Ada Moss", 8000, MON, 0);
            paid.pay(MON + 1, 8000);
            const draft = new mod.Invoice(1003, "Ada Moss");
            draft.addLine(copyOf(HIRE));
            const early = flat(mod, 1004, "Ada Moss", 900, MON, 21);
            early.pay(MON + 1, 250);
            early.credit(MON + 2, 50, "goodwill");
            expect(mod.ageing([part, paid, draft, early], MON + 10)).toEqual(
                { notDue: 600, to30: 5000, to60: 0, older: 0 });
            expect(mod.ageing([], MON)).toEqual({ notDue: 0, to30: 0, to60: 0, older: 0 });
        });
        pin("ageing: each band adds up every invoice in it", () => {
            // a Thursday, and every due day below falls on a weekday
            const today = MON + 101;
            const list = [
                flat(mod, 1001, "Ada Moss", 100, today, 0),
                flat(mod, 1002, "Ada Moss", 2000, today, 5),
                flat(mod, 1003, "Ada Moss", 30000, today - 10, 0),
                flat(mod, 1004, "Ada Moss", 400000, today - 20, 0),
                flat(mod, 1005, "Ada Moss", 5, today - 45, 0),
                flat(mod, 1006, "Ada Moss", 60, today - 50, 0),
                flat(mod, 1007, "Ada Moss", 7, today - 90, 0),
                flat(mod, 1008, "Ada Moss", 80, today - 100, 0),
            ];
            expect(list.map((invoice) => invoice.daysLate(today))).toEqual([0, 0, 10, 20, 45, 50, 90, 100]);
            expect(mod.ageing(list, today)).toEqual({ notDue: 2100, to30: 430000, to60: 65, older: 87 });
        });
        pin("allocate: the invoice due first is paid first, whatever the order of the list", () => {
            const late = flat(mod, 1001, "Ada Moss", 5000, MON, 21);
            const soon = flat(mod, 1002, "Ada Moss", 5000, MON, 7);
            const list = [late, soon];
            expect(mod.allocate(list, MON + 3, 6000, "card", "C-9")).toBe(0);
            expect(soon.owedPence()).toBe(0);
            expect(late.owedPence()).toBe(4000);
            expect(soon.paymentList()).toEqual([{ day: MON + 3, pence: 5000, method: "card", ref: "C-9" }]);
            expect(late.paymentList()).toEqual([{ day: MON + 3, pence: 1000, method: "card", ref: "C-9" }]);
            expect(list[0]).toBe(late);
        });
        pin("allocate: invoices due the same day are paid by number", () => {
            const b = flat(mod, 1005, "Ada Moss", 5000);
            const a = flat(mod, 1004, "Ada Moss", 5000);
            expect(mod.allocate([b, a], MON + 3, 100)).toBe(0);
            expect(a.paidPence()).toBe(100);
            expect(b.paidPence()).toBe(0);
            expect(a.paymentList()[0]).toEqual({ day: MON + 3, pence: 100, method: "transfer", ref: "" });
        });
        pin("allocate: gives back what is left when every invoice is settled", () => {
            const a = flat(mod, 1001, "Ada Moss", 5000);
            const paid = flat(mod, 1002, "Ada Moss", 300);
            paid.pay(MON, 300);
            const draft = new mod.Invoice(1003, "Ada Moss");
            draft.addLine(copyOf(HIRE));
            expect(mod.allocate([draft, paid, a], MON + 3, 5600)).toBe(600);
            expect(paid.paymentList()).toHaveLength(1);
            expect(mod.allocate([draft, paid, a], MON + 4, 50)).toBe(50);
            expect(mod.allocate([], MON + 4, 50)).toBe(50);
        });
        pin("allocate: a single penny, and an invoice that owes a single penny", () => {
            const penny = flat(mod, 1001, "Ada Moss", 1, MON, 2);
            const more = flat(mod, 1002, "Ada Moss", 500, MON, 9);
            expect(mod.allocate([more, penny], MON + 1, 1)).toBe(0);
            expect(penny.owedPence()).toBe(0);
            expect(more.owedPence()).toBe(500);
            const again = flat(mod, 1003, "Ada Moss", 1, MON, 2);
            expect(mod.allocate([more, again], MON + 1, 502)).toBe(1);
            expect(again.paymentList()).toEqual([{ day: MON + 1, pence: 1, method: "transfer", ref: "" }]);
            expect(more.owedPence()).toBe(0);
        });
        pin("allocate: throws RangeError unless the pence are whole and above 0", () => {
            expect(() => mod.allocate([], MON, 0)).toThrow(RangeError);
            expect(() => mod.allocate([], MON, -1)).toThrow(RangeError);
            expect(() => mod.allocate([flat(mod, 1001, "Ada Moss", 5000)], MON, 1.5)).toThrow(RangeError);
        });
        pin("accountSummary: counts and sums over the hirer's invoices", () => {
            const first = standard(mod, 1001, "Ada Moss", MON, 7);
            first.credit(MON + 3, 3000, "berth not used");
            first.pay(MON + 9, 50000);
            const second = flat(mod, 1002, "ada moss", 8000, MON + 20);
            second.pay(MON + 4, 1000);
            const other = flat(mod, 1003, "Bo Tran", 700);
            expect(mod.accountSummary(" Ada Moss ", [second, other, first], MON + 10)).toEqual({
                hirer: "Ada Moss",
                count: 2,
                billedPence: 117824,
                paidPence: 51000,
                creditedPence: 3000,
                owedPence: 63824,
                overduePence: 56824,
                oldestDueDay: MON + 7,
                lastPaidDay: MON + 9,
            });
        });
        pin("accountSummary: NO_DAY for both days when nothing is owed and nothing was paid", () => {
            const credited = flat(mod, 1001, "Ada Moss", 8000);
            credited.credit(MON + 1, 8000, "written down");
            expect(mod.accountSummary("Ada Moss", [credited], MON + 40)).toEqual({
                hirer: "Ada Moss",
                count: 1,
                billedPence: 8000,
                paidPence: 0,
                creditedPence: 8000,
                owedPence: 0,
                overduePence: 0,
                oldestDueDay: -1,
                lastPaidDay: -1,
            });
            expect(mod.accountSummary("Cy Platt", [credited], MON).count).toBe(0);
        });
        pin("accountSummary: the oldest due day is among invoices still owed on only", () => {
            const paid = flat(mod, 1001, "Ada Moss", 8000, MON, 2);
            paid.pay(MON + 1, 8000);
            const open = flat(mod, 1002, "Ada Moss", 8000, MON, 9);
            const summary = mod.accountSummary("Ada Moss", [paid, open], MON + 3);
            expect(summary.oldestDueDay).toBe(MON + 9);
            expect(summary.lastPaidDay).toBe(MON + 1);
            expect(summary.overduePence).toBe(0);
        });
        pin("accountSummary: what is overdue adds up every overdue invoice", () => {
            const first = flat(mod, 1001, "Ada Moss", 8000, MON, 2);
            first.pay(MON + 1, 1500);
            const second = flat(mod, 1002, "Ada Moss", 700, MON, 3);
            const third = flat(mod, 1003, "Ada Moss", 90, MON, 30);
            const summary = mod.accountSummary("Ada Moss", [third, first, second], MON + 10);
            expect(summary.overduePence).toBe(7200);
            expect(summary.owedPence).toBe(7290);
            expect(summary.oldestDueDay).toBe(MON + 2);
        });
        pin("accountSummary: the last paid day is the day of the payment each invoice recorded last", () => {
            const first = flat(mod, 1001, "Ada Moss", 8000);
            first.pay(MON + 9, 1000);
            first.pay(MON + 2, 500);
            expect(mod.accountSummary("Ada Moss", [first], MON + 10).lastPaidDay).toBe(MON + 2);
            const second = flat(mod, 1002, "Ada Moss", 8000);
            second.pay(MON + 4, 100);
            expect(mod.accountSummary("Ada Moss", [first, second], MON + 10).lastPaidDay).toBe(MON + 4);
        });
        pin("accountSummary: an invoice that owes a single penny is still owed on", () => {
            const penny = flat(mod, 1001, "Ada Moss", 1, MON, 2);
            const later = flat(mod, 1002, "Ada Moss", 8000, MON, 9);
            const summary = mod.accountSummary("Ada Moss", [later, penny], MON + 3);
            expect(summary.oldestDueDay).toBe(MON + 2);
            expect(summary.owedPence).toBe(8001);
            expect(summary.overduePence).toBe(1);
        });
        pin("reminderText: nothing through three days late, and a nudge from the fourth", () => {
            const invoice = flat(mod, 1002, "Ada Moss", 8000);
            expect(mod.reminderText(invoice, MON + 14)).toBe("");
            expect(mod.reminderText(invoice, MON + 17)).toBe("");
            expect(mod.reminderText(invoice, MON + 18)).toBe(
                "Invoice 1002 for £80.00 was due on 2026-03-16. Please pay it when you next can.");
        });
        pin("reminderText: firm from the fifteenth day, with what is still owed", () => {
            const invoice = flat(mod, 1002, "Ada Moss", 8000);
            invoice.pay(MON + 1, 2550);
            expect(mod.reminderText(invoice, MON + 28)).toBe(
                "Invoice 1002 for £54.50 was due on 2026-03-16. Please pay it when you next can.");
            expect(mod.reminderText(invoice, MON + 29)).toBe(
                "Invoice 1002 for £54.50 was due on 2026-03-16. Please pay it within 7 days.");
        });
        pin("reminderText: final from the twenty-ninth day, with the late fee", () => {
            const invoice = flat(mod, 1002, "Ada Moss", 8000);
            expect(mod.reminderText(invoice, MON + 42)).toBe(
                "Invoice 1002 for £80.00 was due on 2026-03-16. Please pay it within 7 days.");
            expect(mod.reminderText(invoice, MON + 43)).toBe(
                "Invoice 1002 for £80.00 was due on 2026-03-16. A late fee of £15.00 now applies.");
            expect(mod.reminderText(invoice, MON + 44)).toBe(
                "Invoice 1002 for £80.00 was due on 2026-03-16. A late fee of £16.20 now applies.");
        });
        pin("statement: a hirer with nothing to show", () => {
            expect(mod.statement(" Cy Platt ", [flat(mod, 1001, "Bo Tran", 700)], MON)).toBe(
                "Statement for Cy Platt at 2026-03-02\n\nTotal owed £0.00");
        });
        pin("statement: invoices by number with a blank line before each, then the total", () => {
            const list = [
                flat(mod, 1003, "ada moss", 8000, MON + 1),
                flat(mod, 1002, "Bo Tran", 700),
                standard(mod, 1001, "Ada Moss"),
            ];
            expect(mod.statement("Ada Moss", list, MON + 14)).toBe([
                "Statement for Ada Moss at 2026-03-16",
                "",
                "Invoice 1001  issued 2026-03-02  due 2026-03-16",
                "  Hire: Kingfisher, 7 nights  7 x £120.00  £840.00",
                "  Mooring: visitor berth  2 x £15.00  £30.00",
                "  Fuel: diesel  42.50 x £1.35  £57.38",
                "  Net £927.38  Tax £170.86  Total £1,098.24",
                "  Owed £1,098.24",
                "",
                "Invoice 1003  issued 2026-03-03  due 2026-03-17",
                "  Damage: lost windlass  1 x £80.00  £80.00",
                "  Net £80.00  Tax £0.00  Total £80.00",
                "  Owed £80.00",
                "",
                "Total owed £1,178.24",
            ].join("\n"));
        });
        pin("statement: the overdue line counts the overdue invoices among those shown", () => {
            const gone = flat(mod, 1004, "Ada Moss", 999);
            gone.cancel();
            const list = [
                flat(mod, 1001, "Ada Moss", 8000, MON, 2),
                flat(mod, 1002, "Ada Moss", 500, MON, 3),
                flat(mod, 1003, "Ada Moss", 70, MON, 4),
                gone,
            ];
            expect(mod.statement("Ada Moss", list, MON + 4)).toBe([
                "Statement for Ada Moss at 2026-03-06",
                "",
                "Invoice 1001  issued 2026-03-02  due 2026-03-04",
                "  Damage: lost windlass  1 x £80.00  £80.00",
                "  Net £80.00  Tax £0.00  Total £80.00",
                "  Owed £80.00  (2 days late)",
                "",
                "Invoice 1002  issued 2026-03-02  due 2026-03-05",
                "  Damage: lost windlass  1 x £5.00  £5.00",
                "  Net £5.00  Tax £0.00  Total £5.00",
                "  Owed £5.00  (1 day late)",
                "",
                "Invoice 1003  issued 2026-03-02  due 2026-03-06",
                "  Damage: lost windlass  1 x £0.70  £0.70",
                "  Net £0.70  Tax £0.00  Total £0.70",
                "  Owed £0.70",
                "",
                "Total owed £85.70",
                "Overdue £85.00 on 2 of 3",
            ].join("\n"));
        });
        pin("statement: a part-paid invoice and one paid in full", () => {
            const first = flat(mod, 1001, "Ada Moss", 8000, MON, 2);
            first.pay(MON + 1, 2500, "cash");
            const second = flat(mod, 1002, "Ada Moss", 500, MON, 3);
            second.pay(MON + 2, 500, "card", "C-12");
            expect(mod.statement("Ada Moss", [first, second], MON + 3)).toBe([
                "Statement for Ada Moss at 2026-03-05",
                "",
                "Invoice 1001  issued 2026-03-02  due 2026-03-04",
                "  Damage: lost windlass  1 x £80.00  £80.00",
                "  Net £80.00  Tax £0.00  Total £80.00",
                "  Paid £25.00",
                "  Owed £55.00  (1 day late)",
                "",
                "Invoice 1002  issued 2026-03-02  due 2026-03-05",
                "  Damage: lost windlass  1 x £5.00  £5.00",
                "  Net £5.00  Tax £0.00  Total £5.00",
                "  Paid £5.00",
                "  Owed £0.00",
                "",
                "Total owed £55.00",
                "Overdue £55.00 on 1 of 2",
            ].join("\n"));
        });

        // A name in `skip` that is no case's name would skip nothing and say nothing.
        const strangers = skip.filter((name) => !names.includes(name));
        it("every skipped name is the name of a case", () => {
            expect(strangers).toEqual([]);
        });
        it("no two cases share a name", () => {
            expect(new Set(names).size).toBe(names.length);
        });
    });
}

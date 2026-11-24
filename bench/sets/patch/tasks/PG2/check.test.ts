import { describe, expect, it } from "vitest";
import * as mod from "../src/bookings";
import type { Boat } from "../src/bookings";
import { unchanged } from "./helpers-bookings";

const HERON: Boat = { id: "heron", name: "Heron", boatClass: "narrow", berths: 4 };
const AVOCET: Boat = { id: "avocet", name: "Avocet", boatClass: "narrow", berths: 6 };
const KESTREL: Boat = { id: "kestrel", name: "Kestrel", boatClass: "wide", berths: 8 };
const TEAL: Boat = { id: "teal", name: "Teal", boatClass: "cruiser", berths: 2 };

const S = (day: number, minute = 0): number => day * 1440 + minute;

// Before any discount: Heron for the 14 nights from day 70 comes to 138300, Kestrel for the 14 from day 72 to
// 207800, Heron for the 21 from day 70 to 207450, Avocet for the 18 from day 72 to 188700, Teal for the 15 from
// day 72 to 118800.
describe("hireCharge, with the second step", () => {
    it("a fortnight gets 15 per cent off, the discount rounded up to the whole pound", () => {
        expect(mod.hireCharge(HERON, 70, 84)).toBe(117500);
        expect(mod.hireCharge(KESTREL, 72, 86)).toBe(176600);
    });

    it("longer hires get 15 per cent off too", () => {
        expect(mod.hireCharge(HERON, 70, 91)).toBe(176250);
        expect(mod.hireCharge(AVOCET, 72, 90)).toBe(160300);
        expect(mod.hireCharge(TEAL, 72, 87)).toBe(100900);
    });

    it("thirteen nights still get a tenth off", () => {
        expect(mod.hireCharge(HERON, 70, 83)).toBe(114550);
        expect(mod.hireCharge(KESTREL, 72, 85)).toBe(174200);
    });

    it("seven nights still get a tenth off, and six none", () => {
        expect(mod.hireCharge(HERON, 70, 77)).toBe(62150);
        expect(mod.hireCharge(KESTREL, 70, 77)).toBe(93500);
        expect(mod.hireCharge(HERON, 70, 76)).toBe(58200);
    });

    it("a fortnight is quoted and booked at the new charge", () => {
        expect(mod.quoteFor(HERON, 70, 84)).toEqual({
            nights: 14,
            chargePence: 117500,
            depositPence: 29400,
            balancePence: 88100,
            balanceDueDay: 42,
        });
        const book = new mod.BookingBook([HERON, KESTREL]);
        const placed = book.place({ boatId: "kestrel", party: "Adeyemi", partySize: 6, fromDay: 72, toDay: 86 }, S(40, 600));
        expect(placed.ok && placed.booking.chargePence).toBe(176600);
        expect(placed.ok && placed.booking.depositPence).toBe(44200);
    });
});

unchanged(mod, ["hireCharge: a fortnight gets a tenth off", "hireCharge: three weeks get a tenth off"]);

import { describe, expect, it } from "vitest";
import * as mod from "../src/stoppages";
import type { Notice } from "../src/stoppages";
import { closure, network, registerOf, restriction, unchanged } from "./helpers-stoppages";

/** The day the line gives as the last, or NaN when the line gives none. */
function lastDayIn(line: string): number {
    const found = /, last day (-?\d+) \(/.exec(line);
    return found === null ? Number.NaN : Number(found[1]);
}

describe("describe, with the last day", () => {
    it("a dated closure says its last day after its first day", () => {
        expect(mod.describe(network(), closure("S-104", "s1", 120, 133))).toBe(
            "S-104 Hollin Flight: closed from day 120, last day 132 (planned works)",
        );
        expect(mod.describe(network(), closure("S-7", "s6", 3, 10, "event"))).toBe(
            "S-7 Garth Branch: closed from day 3, last day 9 (event on the water)",
        );
    });

    it("a dated restriction gets the same addition", () => {
        expect(mod.describe(network(), restriction("S-221", "s2", 40, 61, 570, 900))).toBe(
            "S-221 Marrow Cut: passage 09:30 to 15:00 from day 40, last day 60 (low water)",
        );
        expect(mod.describe(network(), restriction("S-222", "s4", 0, 2, 5, 1440))).toBe(
            "S-222 Withy Arm: passage 00:05 to 24:00 from day 0, last day 1 (low water)",
        );
    });

    it("a notice whose days are all below zero still has an end date", () => {
        expect(mod.describe(network(), closure("S-9", "s5", -10, -3, "breach"))).toBe(
            "S-9 Pennel Loop: closed from day -10, last day -4 (breach)",
        );
    });

    it("a notice of one day starts and ends on the same day", () => {
        expect(mod.describe(network(), closure("S-8", "s4", 50, 51, "ice"))).toBe(
            "S-8 Withy Arm: closed from day 50, last day 50 (ice)",
        );
    });

    it("the day it gives is the last on which the notice is in force", () => {
        const notices: Notice[] = [
            closure("S-104", "s1", 120, 133),
            closure("S-8", "s4", 50, 51, "ice"),
            restriction("S-221", "s2", 0, 9, 570, 900),
            closure("S-9", "s5", -4, 2, "breach"),
            closure("S-10", "s5", -10, -3, "breach"),
            restriction("S-222", "s4", 0, 2, 5, 1440),
        ];
        for (const notice of notices) {
            const last = lastDayIn(mod.describe(network(), notice));
            expect(Number.isNaN(last)).toBe(false);
            expect(mod.inForce(notice, last)).toBe(true);
            expect(mod.inForce(notice, last + 1)).toBe(false);
        }
    });

    it("a notice that was lifted says the last day it was in force", () => {
        const notice = closure("S-300", "s4", 77, mod.OPEN_ENDED, "breach");
        const register = registerOf(mod, notice);
        expect(mod.lift(register, "S-300", 90)).toBe(true);
        const line = mod.describe(network(), register.notices[0]);
        expect(line).toBe("S-300 Withy Arm: closed from day 77, last day 89 (breach)");
        expect(mod.isClosed(register, "s4", 89)).toBe(true);
        expect(mod.isClosed(register, "s4", 90)).toBe(false);
    });

    it("a notice with no end date keeps its line", () => {
        expect(mod.describe(network(), closure("S-300", "s4", 77, mod.OPEN_ENDED, "breach"))).toBe(
            "S-300 Withy Arm: closed from day 77 until further notice (breach)",
        );
        expect(mod.describe(network(), restriction("S-301", "s5", 8, mod.OPEN_ENDED, 420, 1125))).toBe(
            "S-301 Pennel Loop: passage 07:00 to 18:45 from day 8 until further notice (low water)",
        );
    });
});

unchanged(mod, ["describe: a dated closure", "describe: a dated restriction"]);

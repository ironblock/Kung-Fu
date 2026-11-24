import { describe, expect, it } from "vitest";
import * as mod from "../src/stoppages";
import { closure, refs, registerOf, restriction, unchanged } from "./helpers-stoppages";

describe("issue, when a notice is issued again", () => {
    it("puts the notice it is given where the old one stood, and the old one is gone", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), closure("N2", "s2", 5, 8), closure("N3", "s4", 1, 2));
        const again = closure("N1", "s1", 12, 30);
        expect(mod.issue(register, again)).toBeUndefined();
        expect(register.notices).toEqual([
            closure("N3", "s4", 1, 2),
            closure("N2", "s2", 5, 8),
            closure("N1", "s1", 12, 30),
        ]);
        expect(register.notices[2]).toBe(again);
    });

    it("keeps the place of a notice in the middle, and of the one on top", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), closure("N2", "s2", 5, 8), closure("N3", "s4", 1, 2));
        const middle = restriction("N2", "s2", 5, 9, 600, 700);
        mod.issue(register, middle);
        expect(refs(register.notices)).toEqual(["N3", "N2", "N1"]);
        expect(register.notices[1]).toBe(middle);
        const top = closure("N3", "s4", 1, mod.OPEN_ENDED);
        mod.issue(register, top);
        expect(register.notices).toEqual([
            closure("N3", "s4", 1, mod.OPEN_ENDED),
            restriction("N2", "s2", 5, 9, 600, 700),
            closure("N1", "s1", 10, 20),
        ]);
        expect(register.notices[0]).toBe(top);
    });

    it("a corrected notice does not overrule the notices issued after it", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 30), restriction("N2", "s1", 15, 20, 600, 700));
        const corrected = closure("N1", "s1", 10, 40);
        mod.issue(register, corrected);
        expect(refs(register.notices)).toEqual(["N2", "N1"]);
        expect(mod.isClosed(register, "s1", 12)).toBe(true);
        expect(mod.isClosed(register, "s1", 16)).toBe(false);
        expect(mod.passage(register, "s1", 16)).toEqual([600, 700]);
        expect(mod.isClosed(register, "s1", 35)).toBe(true);
        expect(mod.noticeOn(register, "s1", 35)).toBe(corrected);
    });

    it("takes the old notice's place whatever stretch the new one is for", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), closure("N2", "s2", 5, 8));
        const moved = closure("N1", "s4", 10, 20);
        mod.issue(register, moved);
        expect(register.notices).toEqual([closure("N2", "s2", 5, 8), closure("N1", "s4", 10, 20)]);
        expect(register.notices[1]).toBe(moved);
        expect(mod.isClosed(register, "s1", 12)).toBe(false);
        expect(mod.isClosed(register, "s4", 12)).toBe(true);
    });

    it("a notice under a reference not on the register still goes on top", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), closure("N2", "s2", 5, 8));
        mod.issue(register, closure("N1", "s1", 11, 20));
        const fresh = closure("N3", "s1", 1, 2);
        mod.issue(register, fresh);
        expect(refs(register.notices)).toEqual(["N3", "N2", "N1"]);
        expect(register.notices[0]).toBe(fresh);
    });

    it("a reissue it refuses is refused as before, and the register is left as it was", () => {
        const register = registerOf(
            mod,
            closure("N1", "s1", 10, 20),
            restriction("N2", "s2", 5, 9, 600, 700),
            closure("N3", "s4", 1, 2),
        );
        const before = [
            closure("N3", "s4", 1, 2),
            restriction("N2", "s2", 5, 9, 600, 700),
            closure("N1", "s1", 10, 20),
        ];
        expect(() => mod.issue(register, closure("N1", "s1", 10, 10))).toThrow(RangeError);
        expect(() => mod.issue(register, closure("N1", "s1", 10, 9))).toThrow(RangeError);
        expect(() => mod.issue(register, restriction("N2", "s2", 5, 9, 700, 700))).toThrow(RangeError);
        expect(() => mod.issue(register, restriction("N2", "s2", 5, 9, 700, 650))).toThrow(RangeError);
        expect(() => mod.issue(register, restriction("N3", "s4", 1, 2, 600, 600))).toThrow(RangeError);
        expect(register.notices).toEqual(before);
    });

    it("a reissue it takes now, open-ended or from before day 0, it still takes", () => {
        const register = registerOf(mod, closure("N1", "s1", 10, 20), closure("N2", "s2", 5, 8));
        mod.issue(register, closure("N1", "s1", -5, mod.OPEN_ENDED));
        mod.issue(register, closure("N2", "s2", -5, 3));
        expect(register.notices).toEqual([closure("N2", "s2", -5, 3), closure("N1", "s1", -5, mod.OPEN_ENDED)]);
    });
});

unchanged(mod, ["issue: a notice issued again under its reference replaces the old one and goes on top"]);

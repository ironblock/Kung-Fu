import { describe, expect, it } from "vitest";
import * as mod from "../src/tides";
import { unchanged } from "./helpers-tides";

interface Win {
    opens: number;
    closes: number;
    depth: number;
}

function w(opens: number, closes: number, depth = 60): Win {
    return { opens, closes, depth };
}

describe("closeFor drops a piece too short to lock through", () => {
    it("drops a short piece before the closure and counts its minutes as lost", () => {
        const day = [w(480, 690)];
        expect(mod.closeFor(day, 491, 600)).toBe(120);
        expect(day).toEqual([w(600, 690)]);
    });

    it("drops a short piece after the closure and counts its minutes as lost", () => {
        const day = [w(480, 690)];
        expect(mod.closeFor(day, 600, 679)).toBe(90);
        expect(day).toEqual([w(480, 600)]);
    });

    it("keeps a piece of exactly 12 minutes before the closure", () => {
        const day = [w(480, 690)];
        expect(mod.closeFor(day, 492, 600)).toBe(108);
        expect(day).toEqual([w(480, 492), w(600, 690)]);
    });

    it("keeps a piece of exactly 12 minutes after the closure", () => {
        const day = [w(480, 690)];
        expect(mod.closeFor(day, 600, 678)).toBe(78);
        expect(day).toEqual([w(480, 600), w(678, 690)]);
    });

    it("drops a piece of one minute", () => {
        const day = [w(480, 690)];
        expect(mod.closeFor(day, 481, 600)).toBe(120);
        expect(day).toEqual([w(600, 690)]);
        const other = [w(480, 690)];
        expect(mod.closeFor(other, 600, 689)).toBe(90);
        expect(other).toEqual([w(480, 600)]);
    });

    it("takes the whole window out when both pieces are short", () => {
        const day = [w(100, 300), w(480, 690), w(780, 990)];
        expect(mod.closeFor(day, 485, 680)).toBe(210);
        expect(day).toEqual([w(100, 300), w(780, 990)]);
    });

    it("keeps one piece and drops the other", () => {
        const day = [w(480, 690, 70)];
        expect(mod.closeFor(day, 500, 685)).toBe(190);
        expect(day).toEqual([w(480, 500, 70)]);
    });

    it("judges each window the closure cuts on its own", () => {
        const day = [w(480, 690), w(780, 990, 45)];
        // 5 minutes are left of the first window and 150 of the second.
        expect(mod.closeFor(day, 485, 840)).toBe(205 + 5 + 60);
        expect(day).toEqual([w(840, 990, 45)]);
        const other = [w(480, 690), w(780, 990, 45)];
        // 120 minutes are left of the first window and 11 of the second.
        expect(mod.closeFor(other, 600, 979)).toBe(90 + 199 + 11);
        expect(other).toEqual([w(480, 600)]);
    });

    it("leaves a short window the closure does not touch", () => {
        const day = [w(100, 105), w(480, 690), w(700, 711), w(1000, 1003)];
        expect(mod.closeFor(day, 540, 600)).toBe(60);
        expect(day).toEqual([w(100, 105), w(480, 540), w(600, 690), w(700, 711), w(1000, 1003)]);
    });

    it("leaves a short window that only meets the closure", () => {
        const day = [w(590, 600), w(700, 708)];
        expect(mod.closeFor(day, 600, 700)).toBe(0);
        expect(day).toEqual([w(590, 600), w(700, 708)]);
    });

    it("drops what is left of a short window the closure cuts", () => {
        const day = [w(590, 600), w(700, 900)];
        expect(mod.closeFor(day, 595, 650)).toBe(10);
        expect(day).toEqual([w(700, 900)]);
    });

    it("still leaves the window it cuts as it was, and puts what is kept in the list as a new one", () => {
        const first = w(480, 690, 70);
        const day = [first];
        expect(mod.closeFor(day, 485, 600)).toBe(120);
        expect(day).toEqual([w(600, 690, 70)]);
        expect(first).toEqual(w(480, 690, 70));
        const second = w(480, 690, 70);
        const other = [second];
        expect(mod.closeFor(other, 600, 685)).toBe(90);
        expect(other).toEqual([w(480, 600, 70)]);
        expect(second).toEqual(w(480, 690, 70));
    });
});

unchanged(mod, ["closeFor keeps a piece of a few minutes"]);

import { describe, expect, it } from "vitest";
import * as mod from "../src/tides";
import { copyOf } from "./helpers";
import { unchanged } from "./helpers-tides";

interface Win {
    opens: number;
    closes: number;
    depth: number;
}

function w(opens: number, closes: number, depth = 60): Win {
    return { opens, closes, depth };
}

function openMinutes(windows: Win[], from: number, to: number): number {
    return (mod as unknown as { openMinutes: (windows: Win[], from: number, to: number) => number })
        .openMinutes(windows, from, to);
}

describe("openMinutes", () => {
    it("counts a whole window that lies inside the stretch", () => {
        expect(openMinutes([w(480, 690)], 0, 1440)).toBe(210);
        expect(openMinutes([w(480, 690)], 480, 690)).toBe(210);
    });

    it("cuts a window that opens before the stretch starts", () => {
        expect(openMinutes([w(480, 690)], 600, 1440)).toBe(90);
    });

    it("cuts a window that closes after the stretch ends", () => {
        expect(openMinutes([w(480, 690)], 0, 540)).toBe(60);
    });

    it("counts only the stretch when it lies inside one window", () => {
        expect(openMinutes([w(480, 690)], 500, 600)).toBe(100);
    });

    it("counts nothing for a window wholly outside the stretch", () => {
        expect(openMinutes([w(480, 690)], 0, 400)).toBe(0);
        expect(openMinutes([w(480, 690)], 700, 720)).toBe(0);
    });

    it("counts nothing for a window that only meets the stretch at one end", () => {
        expect(openMinutes([w(480, 690)], 0, 480)).toBe(0);
        expect(openMinutes([w(480, 690)], 690, 800)).toBe(0);
    });

    it("counts to the minute at each end of a window", () => {
        expect(openMinutes([w(480, 690)], 479, 481)).toBe(1);
        expect(openMinutes([w(480, 690)], 689, 691)).toBe(1);
        expect(openMinutes([w(480, 690)], 689, 690)).toBe(1);
    });

    it("adds up several windows", () => {
        expect(openMinutes([w(100, 200), w(480, 690), w(780, 990)], 0, 1440)).toBe(520);
        expect(openMinutes([w(100, 200), w(480, 690), w(780, 990)], 150, 800)).toBe(280);
    });

    it("takes the windows in any order", () => {
        expect(openMinutes([w(780, 990), w(480, 690), w(100, 200)], 150, 800)).toBe(280);
        expect(openMinutes([w(780, 990), w(480, 690)], 500, 600)).toBe(100);
        expect(openMinutes([w(480, 690), w(100, 200)], 0, 300)).toBe(100);
    });

    it("counts a window listed after one that lies outside the stretch", () => {
        expect(openMinutes([w(100, 200), w(480, 690)], 300, 800)).toBe(210);
        expect(openMinutes([w(100, 200), w(480, 690)], 200, 800)).toBe(210);
        expect(openMinutes([w(780, 990), w(480, 690)], 0, 700)).toBe(210);
        expect(openMinutes([w(780, 990), w(480, 690)], 0, 780)).toBe(210);
    });

    it("is 0 when the stretch does not run forward", () => {
        expect(openMinutes([w(480, 690)], 600, 600)).toBe(0);
        expect(openMinutes([w(480, 690)], 650, 600)).toBe(0);
        expect(openMinutes([w(480, 690), w(780, 990)], 1440, 0)).toBe(0);
        expect(openMinutes([w(480, 690), w(780, 990)], 800, 500)).toBe(0);
    });

    it("is 0 when there are no windows", () => {
        expect(openMinutes([], 0, 1440)).toBe(0);
    });

    it("leaves the list and its windows as they were", () => {
        const day = [w(780, 990, 45), w(480, 690), w(100, 200, 30)];
        const before = copyOf(day);
        const first = day[0];
        openMinutes(day, 150, 800);
        expect(day).toEqual(before);
        expect(day[0]).toBe(first);
    });
});

unchanged(mod);

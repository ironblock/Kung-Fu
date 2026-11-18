import { describe, expect, it } from "vitest";
import { createAnimationManager, getAnimationGroups, updateAnimationManager } from "@babylonjs/lite";
import { fadeIn } from "../src/fade-in";

describe("AP1 fade-in", () => {
    it("fades alpha from 0 to 1 at a steady rate, then holds 1 and reports the fade over", () => {
        const manager = createAnimationManager();
        const panel = { alpha: 0.3 };
        const group = fadeIn(manager, panel, 400);
        expect(getAnimationGroups(manager)).toContain(group);

        for (let step = 1; step <= 3; step++) {
            updateAnimationManager(manager, 100);
            expect(panel.alpha).toBeCloseTo(0.25 * step, 4);
            expect(group.isPlaying).toBe(true);
        }
        updateAnimationManager(manager, 100);
        expect(panel.alpha).toBeCloseTo(1, 5);

        for (let step = 0; step < 12; step++) {
            updateAnimationManager(manager, 100);
            expect(panel.alpha).toBeCloseTo(1, 5);
        }
        expect(group.isPlaying).toBe(false);
    });

    it("keeps each fade to its own duration when two run at once", () => {
        const manager = createAnimationManager();
        const slow = { alpha: 1 };
        const fast = { alpha: 0.5 };
        const slowGroup = fadeIn(manager, slow, 1000);

        for (let step = 1; step <= 5; step++) {
            updateAnimationManager(manager, 50);
            expect(slow.alpha).toBeCloseTo(0.05 * step, 4);
        }

        const fastGroup = fadeIn(manager, fast, 200);
        const expectedSlow = [0.3, 0.35, 0.4, 0.45, 0.5, 0.55];
        const expectedFast = [0.25, 0.5, 0.75, 1, 1, 1];
        for (let step = 0; step < expectedSlow.length; step++) {
            updateAnimationManager(manager, 50);
            expect(slow.alpha).toBeCloseTo(expectedSlow[step]!, 4);
            expect(fast.alpha).toBeCloseTo(expectedFast[step]!, 4);
        }
        expect(fastGroup.isPlaying).toBe(false);
        expect(slowGroup.isPlaying).toBe(true);

        for (let step = 0; step < 30; step++) {
            updateAnimationManager(manager, 50);
            expect(fast.alpha).toBeCloseTo(1, 5);
        }
        expect(slow.alpha).toBeCloseTo(1, 5);
        expect(slowGroup.isPlaying).toBe(false);
    });
});

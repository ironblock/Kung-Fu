import { describe, expect, it } from "vitest";
import { createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { startHover } from "../src/hover";

/** Height above rest of a full-strength bob, `seconds` after it started. */
function lift(seconds: number): number {
    const phase = seconds % 1;
    return phase <= 0.5 ? phase : 1 - phase;
}

describe("AP3 hover strength", () => {
    it("bobs 0.5 above the rest height at full strength and scales the bob with the strength, keeping its rhythm", () => {
        const manager = createAnimationManager();
        const node = { position: { y: 2 } };
        const setStrength = startHover(manager, node);

        let seconds = 0;
        const step = (strength: number, count: number): void => {
            for (let i = 0; i < count; i++) {
                updateAnimationManager(manager, 100);
                seconds += 0.1;
                expect(node.position.y).toBeCloseTo(2 + strength * lift(seconds), 4);
            }
        };

        step(1, 5);
        setStrength(0.5);
        step(0.5, 7);
        setStrength(0.2);
        step(0.2, 4);
        setStrength(0);
        step(0, 6);
        setStrength(1);
        step(1, 3);
    });

    it("works below zero and with several pickups on one manager", () => {
        const manager = createAnimationManager();
        const low = { position: { y: -3 } };
        const lowStrength = startHover(manager, low);
        lowStrength(0.4);

        let lowSeconds = 0;
        for (let i = 0; i < 3; i++) {
            updateAnimationManager(manager, 50);
            lowSeconds += 0.05;
            expect(low.position.y).toBeCloseTo(-3 + 0.4 * lift(lowSeconds), 4);
        }

        const high = { position: { y: 7 } };
        const highStrength = startHover(manager, high);
        let highSeconds = 0;
        for (let i = 0; i < 16; i++) {
            if (i === 8) {
                highStrength(0.75);
                lowStrength(1);
            }
            updateAnimationManager(manager, 50);
            lowSeconds += 0.05;
            highSeconds += 0.05;
            expect(low.position.y).toBeCloseTo(-3 + (i < 8 ? 0.4 : 1) * lift(lowSeconds), 4);
            expect(high.position.y).toBeCloseTo(7 + (i < 8 ? 1 : 0.75) * lift(highSeconds), 4);
        }
    });
});

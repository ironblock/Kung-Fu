import { describe, expect, it } from "vitest";
import { createAnimationManager, updateAnimationManager } from "@babylonjs/lite";
import { startBeacon } from "../src/beacon";

/** Full-strength intensity `seconds` after the beacon started. */
function flash(seconds: number, period: number): number {
    const phase = seconds % period;
    if (phase <= 0.1) return phase / 0.1;
    if (phase <= 0.2) return (0.2 - phase) / 0.1;
    return 0;
}

describe("AP5 beacon", () => {
    it("flashes once per period, at the strength asked, without shifting the rhythm", () => {
        const manager = createAnimationManager();
        const lamp = { intensity: 0 };
        const setStrength = startBeacon(manager, lamp, 1);

        let seconds = 0;
        const run = (strength: number, count: number): void => {
            for (let i = 0; i < count; i++) {
                updateAnimationManager(manager, 50);
                seconds += 0.05;
                expect(lamp.intensity).toBeCloseTo(strength * flash(seconds, 1), 4);
            }
        };

        run(1, 22);
        setStrength(0.5);
        run(0.5, 24);
        setStrength(0.8);
        run(0.8, 25);
        setStrength(1);
        run(1, 10);
    });

    it("keeps each beacon on its own period and strength on one manager", () => {
        const manager = createAnimationManager();
        const red = { intensity: 0 };
        const blue = { intensity: 0 };
        const setRed = startBeacon(manager, red, 0.75);
        setRed(0.6);
        startBeacon(manager, blue, 2);

        let seconds = 0;
        for (let i = 0; i < 50; i++) {
            updateAnimationManager(manager, 40);
            seconds += 0.04;
            expect(red.intensity).toBeCloseTo(0.6 * flash(seconds, 0.75), 4);
            expect(blue.intensity).toBeCloseTo(flash(seconds, 2), 4);
        }
    });
});

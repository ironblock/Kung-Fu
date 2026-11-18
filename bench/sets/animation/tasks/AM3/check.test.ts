// Check for AM3. The reader never sees this file.
import { describe, expect, it } from "vitest";
import {
    addAnimationTask,
    createAnimationManager,
    createAnimationTask,
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    crossFadeAnimationGroups,
    enablePropertyAnimationBlending,
    setAnimationWeight,
    updateAnimationManager,
} from "@babylonjs/lite";
import { skipAhead } from "../src/skip-ahead";

/** x goes from 0 to 100 over one second, once. */
const ramp = () => createPropertyAnimationClip("ramp", [{ path: "x", keys: [{ time: 0, value: 0 }, { time: 1, value: 100 }] }]);
/** y held at a fixed value, looping. */
const holdY = (name: string, y: number) => createPropertyAnimationClip(name, [{ path: "y", keys: [{ time: 0, value: y }, { time: 2, value: y }] }]);

describe("AM3 skipAhead", () => {
    it("moves clips and fades by exactly ms on a manager with a fixed step, and keeps the step", () => {
        const manager = createAnimationManager({ fixedDeltaMs: 20 });
        const target = { x: 0, y: 0 };
        createPropertyAnimationGroup(manager, target, ramp(), { loop: false });
        const calm = createPropertyAnimationGroup(manager, target, holdY("calm", 10));
        const tense = createPropertyAnimationGroup(manager, target, holdY("tense", 30));
        enablePropertyAnimationBlending(manager);
        setAnimationWeight(tense, 0);
        crossFadeAnimationGroups(manager, calm, tense, { durationMs: 1000 });

        skipAhead(manager, 510);
        expect(target.x).toBeCloseTo(51, 3);
        // Fade at 510 of 1000 ms: 0.49 * 10 + 0.51 * 30.
        expect(target.y).toBeCloseTo(20.2, 3);
        expect(tense.weight).toBeCloseTo(0.51, 5);
        expect(manager.fixedDeltaMs).toBe(20);

        // A later frame still takes the fixed step, whatever delta the loop passes.
        updateAnimationManager(manager, 7);
        expect(target.x).toBeCloseTo(53, 3);
        expect(target.y).toBeCloseTo(20.6, 3);

        skipAhead(manager, 33);
        expect(target.x).toBeCloseTo(56.3, 3);
        expect(target.y).toBeCloseTo(21.26, 3);

        updateAnimationManager(manager, 1000);
        expect(target.x).toBeCloseTo(58.3, 3);
    });

    it("moves a manager with no fixed step by exactly ms", () => {
        const manager = createAnimationManager();
        const target = { x: 0 };
        createPropertyAnimationGroup(manager, target, ramp(), { loop: false });
        skipAhead(manager, 250);
        expect(target.x).toBeCloseTo(25, 3);
        expect(manager.fixedDeltaMs).toBe(0);
        updateAnimationManager(manager, 10);
        expect(target.x).toBeCloseTo(26, 3);
    });

    for (const fixedDeltaMs of [20, 0]) {
        it(`moves a plain task on the manager by exactly ms too (fixed step ${fixedDeltaMs})`, () => {
            const manager = createAnimationManager({ fixedDeltaMs });
            const target = { x: 0 };
            createPropertyAnimationGroup(manager, target, ramp(), { loop: false });
            // A timer of the cutscene: it sums the time it is given.
            let clock = 0;
            addAnimationTask(manager, createAnimationTask((_manager, deltaMs) => (clock += deltaMs)));

            skipAhead(manager, 510);
            expect(clock).toBeCloseTo(510, 6);
            expect(target.x).toBeCloseTo(51, 3);

            updateAnimationManager(manager, 7);
            const step = fixedDeltaMs > 0 ? fixedDeltaMs : 7;
            expect(clock).toBeCloseTo(510 + step, 6);
            expect(target.x).toBeCloseTo((510 + step) / 10, 3);
        });
    }
});

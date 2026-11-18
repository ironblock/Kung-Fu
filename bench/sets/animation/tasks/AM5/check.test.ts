// Check for AM5. The reader never sees this file.
import { describe, expect, it } from "vitest";
import {
    addAnimationTask,
    createAnimationTask,
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    enablePropertyAnimationBlending,
    setAnimationWeight,
    updateAnimationManager,
} from "@babylonjs/lite";
import { createWatchedManager } from "../src/watched-manager";

const ramp = () => createPropertyAnimationClip("ramp", [{ path: "x", keys: [{ time: 0, value: 0 }, { time: 1, value: 100 }] }], { frameRate: 30 });
const holdX = (x: number) => createPropertyAnimationClip("hold", [{ path: "x", keys: [{ time: 0, value: x }, { time: 2, value: x }] }]);

describe("AM5 createWatchedManager", () => {
    it("calls onStep once per update with the step", () => {
        const steps: number[] = [];
        const manager = createWatchedManager((stepMs) => steps.push(stepMs));
        updateAnimationManager(manager, 16);
        expect(steps).toEqual([16]);
        updateAnimationManager(manager, 33);
        expect(steps).toEqual([16, 33]);
    });

    it("is an ordinary manager for clips and tasks added later, blending included", () => {
        const steps: number[] = [];
        const manager = createWatchedManager((stepMs) => steps.push(stepMs));
        const target = { x: 0 };
        const ramping = createPropertyAnimationGroup(manager, target, ramp(), { loop: false });
        updateAnimationManager(manager, 100);
        expect(target.x).toBeCloseTo(10, 4);

        let taskRuns = 0;
        addAnimationTask(manager, createAnimationTask(() => taskRuns++));
        updateAnimationManager(manager, 50);
        expect(target.x).toBeCloseTo(15, 4);
        expect(taskRuns).toBe(1);

        const holding = createPropertyAnimationGroup(manager, target, holdX(50));
        enablePropertyAnimationBlending(manager);
        setAnimationWeight(ramping, 0.5);
        setAnimationWeight(holding, 0.5);
        updateAnimationManager(manager, 100);
        // 0.5 * 25 + 0.5 * 50
        expect(target.x).toBeCloseTo(37.5, 4);
        expect(taskRuns).toBe(2);
        expect(steps).toEqual([100, 50, 100]);

        updateAnimationManager(manager, 20);
        expect(steps).toEqual([100, 50, 100, 20]);
    });

    it("reports only its own updates", () => {
        const first: number[] = [];
        const second: number[] = [];
        const a = createWatchedManager((stepMs) => first.push(stepMs));
        const b = createWatchedManager((stepMs) => second.push(stepMs));
        updateAnimationManager(a, 7);
        updateAnimationManager(b, 9);
        updateAnimationManager(a, 11);
        expect(first).toEqual([7, 11]);
        expect(second).toEqual([9]);
    });
});

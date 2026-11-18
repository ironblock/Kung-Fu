// Check for AM1. The reader never sees this file.
import { describe, expect, it } from "vitest";
import {
    createAnimationManager,
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    enablePropertyAnimationBlending,
    getAnimationGroups,
    updateAnimationManager,
} from "@babylonjs/lite";
import { handOver } from "../src/hand-over";

/** A looping clip that holds x and y at fixed values for three seconds. */
function hold(name: string, x: number, y: number) {
    return createPropertyAnimationClip(name, [
        { path: "x", keys: [{ time: 0, value: x }, { time: 3, value: x }] },
        { path: "y", keys: [{ time: 0, value: y }, { time: 3, value: y }] },
    ]);
}

function setUp() {
    const manager = createAnimationManager();
    const target = { x: 0, y: 0 };
    const walk = createPropertyAnimationGroup(manager, target, hold("walk", 10, 4));
    const run = createPropertyAnimationGroup(manager, target, hold("run", 30, -4));
    enablePropertyAnimationBlending(manager);
    // One ordinary frame before the hand-over.
    updateAnimationManager(manager, 100);
    return { manager, target, walk, run };
}

describe("AM1 handOver", () => {
    it("shows the outgoing clip alone on the next frame, then hands over linearly", () => {
        const { manager, target, walk, run } = setUp();
        handOver(manager, walk, run, 800);

        updateAnimationManager(manager, 0);
        expect(target.x).toBeCloseTo(10, 4);
        expect(target.y).toBeCloseTo(4, 4);

        // Share of `run`: 0.25, 0.5, 0.75, 1 after 200, 400, 600, 800 ms.
        const expected = [
            [15, 2],
            [20, 0],
            [25, -2],
            [30, -4],
        ];
        for (const [x, y] of expected) {
            updateAnimationManager(manager, 200);
            expect(target.x).toBeCloseTo(x!, 4);
            expect(target.y).toBeCloseTo(y!, 4);
        }

        updateAnimationManager(manager, 300);
        expect(target.x).toBeCloseTo(30, 4);
        expect(target.y).toBeCloseTo(-4, 4);
    });

    it("keeps both groups playing on the manager", () => {
        const { manager, walk, run } = setUp();
        const walkTime = walk.currentTime;
        handOver(manager, walk, run, 800);
        for (let i = 0; i < 6; i++) {
            updateAnimationManager(manager, 200);
        }
        expect(getAnimationGroups(manager)).toContain(walk);
        expect(getAnimationGroups(manager)).toContain(run);
        expect(walk.isPlaying).toBe(true);
        expect(run.isPlaying).toBe(true);
        expect(walk.currentTime).toBeCloseTo(walkTime + 1.2, 3);
    });

    it("hands back the other way on a second call", () => {
        const { manager, target, walk, run } = setUp();
        handOver(manager, walk, run, 800);
        updateAnimationManager(manager, 1000);
        expect(target.x).toBeCloseTo(30, 4);

        handOver(manager, run, walk, 400);
        updateAnimationManager(manager, 0);
        expect(target.x).toBeCloseTo(30, 4);
        updateAnimationManager(manager, 100);
        expect(target.x).toBeCloseTo(25, 4);
        expect(target.y).toBeCloseTo(-2, 4);
        updateAnimationManager(manager, 300);
        expect(target.x).toBeCloseTo(10, 4);
        expect(target.y).toBeCloseTo(4, 4);
    });
});

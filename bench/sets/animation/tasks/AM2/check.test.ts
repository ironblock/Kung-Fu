// Check for AM2. The reader never sees this file.
import { describe, expect, it } from "vitest";
import {
    createAnimationManager,
    createPropertyAnimationClip,
    createPropertyAnimationGroup,
    enablePropertyAnimationBlending,
    fadeAnimationWeight,
    setAnimationWeight,
    updateAnimationManager,
} from "@babylonjs/lite";
import { setShareNow } from "../src/set-share";

/** A looping clip that holds `x` at a fixed value. */
function hold(name: string, x: number) {
    return createPropertyAnimationClip(name, [{ path: "x", keys: [{ time: 0, value: x }, { time: 2, value: x }] }]);
}

function setUp() {
    const manager = createAnimationManager();
    const target = { x: 0 };
    const a = createPropertyAnimationGroup(manager, target, hold("a", 10));
    const b = createPropertyAnimationGroup(manager, target, hold("b", 30));
    enablePropertyAnimationBlending(manager);
    setAnimationWeight(b, 0.5);
    updateAnimationManager(manager, 100);
    return { manager, target, a, b };
}

describe("AM2 setShareNow", () => {
    it("takes over from a fade that is under way, at once and for good", () => {
        const { manager, target, a } = setUp();
        expect(target.x).toBeCloseTo(25, 4);

        fadeAnimationWeight(manager, a, { to: 0, durationMs: 1000 });
        updateAnimationManager(manager, 250);
        expect(target.x).toBeCloseTo(22.5, 4);

        setShareNow(manager, a, 0.4);
        expect(a.weight).toBeCloseTo(0.4, 6);

        // The very next frame, even one of no length, is mixed at 0.4: 0.4 * 10 + 0.5 * 30.
        updateAnimationManager(manager, 0);
        expect(target.x).toBeCloseTo(19, 4);

        // Later frames keep it, also past the time the old fade would have ended.
        updateAnimationManager(manager, 250);
        expect(target.x).toBeCloseTo(19, 4);
        updateAnimationManager(manager, 1000);
        expect(target.x).toBeCloseTo(19, 4);
        expect(a.weight).toBeCloseTo(0.4, 6);
    });

    it("leaves later fades of the group working", () => {
        const { manager, target, a } = setUp();
        fadeAnimationWeight(manager, a, { to: 0, durationMs: 1000 });
        updateAnimationManager(manager, 250);
        setShareNow(manager, a, 0.4);
        updateAnimationManager(manager, 100);

        fadeAnimationWeight(manager, a, { to: 1, durationMs: 600 });
        updateAnimationManager(manager, 300);
        expect(a.weight).toBeCloseTo(0.7, 6);
        expect(target.x).toBeCloseTo(22, 4);
        updateAnimationManager(manager, 300);
        expect(target.x).toBeCloseTo(25, 4);
    });

    it("works on a group with no fade, and on a fade-in cut short at zero", () => {
        const { manager, target, b } = setUp();
        setShareNow(manager, b, 0.2);
        expect(b.weight).toBeCloseTo(0.2, 6);
        updateAnimationManager(manager, 16);
        expect(target.x).toBeCloseTo(16, 4);

        fadeAnimationWeight(manager, b, { to: 1, durationMs: 1000 });
        updateAnimationManager(manager, 500);
        expect(target.x).toBeCloseTo(28, 4);
        setShareNow(manager, b, 0);
        updateAnimationManager(manager, 500);
        expect(target.x).toBeCloseTo(10, 4);
        updateAnimationManager(manager, 500);
        expect(target.x).toBeCloseTo(10, 4);
    });

    it("leaves the fades of other groups going", () => {
        const { manager, target, a, b } = setUp();
        fadeAnimationWeight(manager, a, { to: 0, durationMs: 1000 });
        fadeAnimationWeight(manager, b, { to: 1, durationMs: 1000 });
        updateAnimationManager(manager, 250);
        // a at 0.75, b at 0.625: 7.5 + 18.75.
        expect(target.x).toBeCloseTo(26.25, 4);

        setShareNow(manager, a, 0.4);
        updateAnimationManager(manager, 250);
        expect(b.weight).toBeCloseTo(0.75, 6);
        expect(target.x).toBeCloseTo(26.5, 4);
        updateAnimationManager(manager, 500);
        expect(b.weight).toBeCloseTo(1, 6);
        expect(a.weight).toBeCloseTo(0.4, 6);
        // 0.4 * 10 + 1 * 30.
        expect(target.x).toBeCloseTo(34, 4);
    });

    it("holds the share even where the old fade passes through it", () => {
        const { manager, target, a } = setUp();
        fadeAnimationWeight(manager, a, { to: 0, durationMs: 1000 });
        updateAnimationManager(manager, 100);
        setShareNow(manager, a, 0.5);
        // The old fade would be at exactly 0.5 after 400 ms more, then at 0.25.
        updateAnimationManager(manager, 400);
        expect(target.x).toBeCloseTo(20, 4);
        updateAnimationManager(manager, 250);
        expect(a.weight).toBeCloseTo(0.5, 6);
        expect(target.x).toBeCloseTo(20, 4);
    });

    it("does not let the old fade come back when another group starts a fade", () => {
        const { manager, target, a, b } = setUp();
        fadeAnimationWeight(manager, a, { to: 0, durationMs: 1000 });
        updateAnimationManager(manager, 250);
        setShareNow(manager, a, 0.4);
        updateAnimationManager(manager, 100);

        fadeAnimationWeight(manager, b, { to: 1, durationMs: 1000 });
        updateAnimationManager(manager, 500);
        expect(a.weight).toBeCloseTo(0.4, 6);
        expect(b.weight).toBeCloseTo(0.75, 6);
        // 0.4 * 10 + 0.75 * 30.
        expect(target.x).toBeCloseTo(26.5, 4);
    });

    it("does not step the manager itself, even one with a fixed step", () => {
        const manager = createAnimationManager({ fixedDeltaMs: 20 });
        const target = { x: 0 };
        const a = createPropertyAnimationGroup(manager, target, hold("a", 10));
        const b = createPropertyAnimationGroup(manager, target, hold("b", 30));
        enablePropertyAnimationBlending(manager);
        setAnimationWeight(b, 0.5);
        fadeAnimationWeight(manager, a, { to: 0, durationMs: 1000 });
        updateAnimationManager(manager, 16);
        updateAnimationManager(manager, 16);
        // Two fixed steps of 20 ms.
        expect(a.currentTime).toBeCloseTo(0.04, 6);

        setShareNow(manager, a, 0.4);
        setShareNow(manager, a, 0.3);
        expect(a.currentTime).toBeCloseTo(0.04, 6);
        expect(b.currentTime).toBeCloseTo(0.04, 6);

        updateAnimationManager(manager, 16);
        expect(a.currentTime).toBeCloseTo(0.06, 6);
        expect(b.currentTime).toBeCloseTo(0.06, 6);
        // 0.3 * 10 + 0.5 * 30.
        expect(target.x).toBeCloseTo(18, 4);
    });
});

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
});

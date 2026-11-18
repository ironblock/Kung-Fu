// Note: easing output is not clamped; easing is skipped on step tracks, before the first key and from the last key on.
import { expect, it } from "vitest";
import { createAnimationManager, createBackEase, createPropertyAnimationClip, createPropertyAnimationGroup, elasticEase, updateAnimationManager } from "@babylonjs/lite";

it("overshoots", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("b", [{ path: "v", easing: createBackEase(), keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    updateAnimationManager(manager, 200);
    expect(target.v).toBeLessThan(0);
    expect(elasticEase(0.5)).toBeLessThan(0);
});

it("where easing is skipped", () => {
    const manager = createAnimationManager();
    const never = () => -100;
    const step = { v: 0 };
    const lin = { v: 0 };
    createPropertyAnimationGroup(manager, step, createPropertyAnimationClip("s", [{ path: "v", interpolation: "step", easing: never, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }, { time: 2, value: 20 }] }]));
    createPropertyAnimationGroup(manager, lin, createPropertyAnimationClip("l", [{ path: "v", easing: never, keys: [{ time: 0.5, value: 0 }, { time: 1, value: 10 }] }]), { loop: false });
    updateAnimationManager(manager, 250);
    expect(step.v).toBe(0);
    expect(lin.v).toBe(0);
    updateAnimationManager(manager, 500);
    expect(step.v).toBe(0);
    expect(lin.v).toBe(-1000);
    updateAnimationManager(manager, 250);
    expect(step.v).toBe(10);
    expect(lin.v).toBe(10);
});

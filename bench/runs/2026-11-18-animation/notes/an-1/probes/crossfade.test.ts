// Note: crossFadeAnimationGroups only changes weights; it does not play toGroup or stop fromGroup; durationMs 0 throws.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, crossFadeAnimationGroups, enablePropertyAnimationBlending, fadeAnimationWeight, pauseAnimation, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const ramp = (to: number) => createPropertyAnimationClip("r" + to, [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: to }] }]);

it("weights only", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: 0 };
    const from = createPropertyAnimationGroup(manager, target, ramp(10));
    const to = createPropertyAnimationGroup(manager, target, ramp(20));
    pauseAnimation(to);
    setAnimationWeight(to, 0);
    crossFadeAnimationGroups(manager, from, to, { durationMs: 1000 });
    updateAnimationManager(manager, 500);
    expect(from.weight).toBe(0.5);
    expect(to.weight).toBe(0.5);
    expect(to.isPlaying).toBe(false);
    expect(to.currentTime).toBe(0);
    expect(target.v).toBe(2.5);
    updateAnimationManager(manager, 500);
    expect(from.weight).toBe(0);
    expect(from.isPlaying).toBe(true);
    expect(from.currentTime).toBe(0);
    expect(to.currentTime).toBe(0);
    expect(() => crossFadeAnimationGroups(manager, to, from, { durationMs: 0 })).toThrow();
    expect(() => fadeAnimationWeight(manager, from, { to: 1, durationMs: 0 })).toThrow();
    expect(() => fadeAnimationWeight(manager, from, { to: 1.5, durationMs: 10 })).toThrow();
});

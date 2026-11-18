import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationGroup, enablePropertyAnimationBlending, pauseAnimation, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { constClip, rampClip } from "./_lib";

it("with property blending, all-zero weights write nothing, and a paused weighted group still writes each update", () => {
    const manager = createAnimationManager();
    const target = { value: 0 };
    const a = createPropertyAnimationGroup(manager, target, constClip("a", 10));
    const b = createPropertyAnimationGroup(manager, target, constClip("b", 20));
    enablePropertyAnimationBlending(manager);
    setAnimationWeight(a, 0);
    setAnimationWeight(b, 0);
    target.value = 77;
    updateAnimationManager(manager, 100);
    expect(target.value).toBe(77);
    expect(a.currentTime).toBeCloseTo(0.1);

    const m2 = createAnimationManager();
    const t2 = { value: 0 };
    const g = createPropertyAnimationGroup(m2, t2, rampClip());
    enablePropertyAnimationBlending(m2);
    setAnimationWeight(g, 0.5);
    updateAnimationManager(m2, 400);
    pauseAnimation(g);
    t2.value = 99;
    updateAnimationManager(m2, 400);
    expect(t2.value).toBeCloseTo(2);
    expect(g.currentTime).toBeCloseTo(0.4);
});

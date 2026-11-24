import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationGroup, enablePropertyAnimationBlending, fadeAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { constClip, thrown } from "./_lib";

it("fadeAnimationWeight sets from at once, moves weight linearly by each step before groups run, and a new fade replaces the old", () => {
    const manager = createAnimationManager();
    const target = { value: 0 };
    const g = createPropertyAnimationGroup(manager, target, constClip("a", 10));
    enablePropertyAnimationBlending(manager);
    g.weight = 0.4;
    fadeAnimationWeight(manager, g, { to: 1, durationMs: 1000 });
    expect(g.weight).toBe(0.4);
    updateAnimationManager(manager, 500);
    expect(g.weight).toBeCloseTo(0.7);
    expect(target.value).toBeCloseTo(7);
    fadeAnimationWeight(manager, g, { from: 0.2, to: 0, durationMs: 100 });
    expect(g.weight).toBe(0.2);
    updateAnimationManager(manager, 50);
    expect(g.weight).toBeCloseTo(0.1);
    updateAnimationManager(manager, 500);
    expect(g.weight).toBe(0);
    expect(thrown(() => fadeAnimationWeight(manager, g, { to: 1, durationMs: 0 }))).toMatch(/finite positive/);

    const fixed = createAnimationManager({ fixedDeltaMs: 100 });
    const h = createPropertyAnimationGroup(fixed, { value: 0 }, constClip("b", 1));
    fadeAnimationWeight(fixed, h, { to: 0, durationMs: 1000 });
    updateAnimationManager(fixed, 900);
    expect(h.weight).toBeCloseTo(0.9);
});

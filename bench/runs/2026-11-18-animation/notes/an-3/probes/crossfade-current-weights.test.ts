import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationGroup, crossFadeAnimationGroups, enablePropertyAnimationBlending, pauseAnimation, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";
import { constClip } from "./_lib";

it("crossFadeAnimationGroups fades from the current weights and neither plays nor stops the groups", () => {
    const manager = createAnimationManager();
    const target = { value: 0 };
    const from = createPropertyAnimationGroup(manager, target, constClip("from", 10));
    const to = createPropertyAnimationGroup(manager, target, constClip("to", 20));
    pauseAnimation(to);
    enablePropertyAnimationBlending(manager);
    crossFadeAnimationGroups(manager, from, to, { durationMs: 1000 });
    updateAnimationManager(manager, 500);
    expect(from.weight).toBeCloseTo(0.5);
    expect(to.weight).toBe(1);
    expect(target.value).toBe(25);
    expect(to.isPlaying).toBe(false);
    updateAnimationManager(manager, 500);
    expect(from.weight).toBe(0);
    expect(from.isPlaying).toBe(true);

    const m2 = createAnimationManager();
    const t2 = { value: 0 };
    const c = createPropertyAnimationGroup(m2, t2, constClip("c", 10));
    const d = createPropertyAnimationGroup(m2, t2, constClip("d", 20));
    enablePropertyAnimationBlending(m2);
    setAnimationWeight(d, 0);
    crossFadeAnimationGroups(m2, c, d, { durationMs: 1000 });
    updateAnimationManager(m2, 250);
    expect(c.weight).toBeCloseTo(0.75);
    expect(d.weight).toBeCloseTo(0.25);
    expect(t2.value).toBeCloseTo(12.5);
});

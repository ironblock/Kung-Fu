import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, crossFadeAnimationGroups, enablePropertyAnimationBlending, getAnimationGroups, pauseAnimation, updateAnimationManager } from "@babylonjs/lite";

const hold = (v: number) => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);

test("cross-fades under property blending: to a paused group at weight 0, and to a new group", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const walk = createPropertyAnimationGroup(manager, { v: 0 }, hold(10));
    const run = createPropertyAnimationGroup(manager, { v: 0 }, hold(20));
    run.weight = 0;
    pauseAnimation(run);
    crossFadeAnimationGroups(manager, walk, run, { durationMs: 1000 });
    updateAnimationManager(manager, 250);
    expect([walk.weight, run.weight]).toEqual([0.75, 0.25]);
    updateAnimationManager(manager, 1000);
    expect([walk.weight, run.weight]).toEqual([0, 1]);
    expect([walk.isPlaying, run.isPlaying]).toEqual([true, false]);
    expect(getAnimationGroups(manager)).toEqual([walk, run]);
    const a = createPropertyAnimationGroup(manager, { v: 0 }, hold(1));
    const b = createPropertyAnimationGroup(manager, { v: 0 }, hold(2));
    crossFadeAnimationGroups(manager, a, b, { durationMs: 1000 });
    updateAnimationManager(manager, 250);
    expect([a.weight, b.weight]).toEqual([0.75, 1]);
});

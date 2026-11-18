import { expect, it } from "vitest";
import { createNullEngine, createSceneContext, getAnimationGroups, stepScene, updateAnimationManager } from "@babylonjs/lite";
import { makeScene, tick } from "#helpers";
import { rampGroup } from "./_lib";

it("a property group is playing and attached at once, but only updateAnimationManager moves it", () => {
    const { manager, target, group } = rampGroup();
    expect(group.isPlaying).toBe(true);
    expect(getAnimationGroups(manager)).toEqual([group]);
    expect(target.value).toBe(-1);

    const scene = makeScene();
    tick(scene, 5, 100);
    const engine = createNullEngine();
    const scene2 = createSceneContext(engine, { defaultRenderTask: false });
    stepScene(engine, scene2, 100);
    expect(target.value).toBe(-1);
    expect(group.currentTime).toBe(0);

    updateAnimationManager(manager, 250);
    expect(target.value).toBeCloseTo(2.5);
});

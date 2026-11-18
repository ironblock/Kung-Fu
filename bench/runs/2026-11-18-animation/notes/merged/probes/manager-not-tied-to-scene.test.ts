// Note: a manager is not driven by any scene; onBeforeRender + updateAnimationManager drives it.
import { expect, it } from "vitest";
import { addAnimationTask, createAnimationManager, createAnimationTask, createNullEngine, createPropertyAnimationClip, createPropertyAnimationGroup, createSceneContext, onBeforeRender, updateAnimationManager } from "@babylonjs/lite";
import { tick } from "../helpers.js";

it("a manager made with the scene's engine does not move with the scene", () => {
    const engine = createNullEngine();
    const scene = createSceneContext(engine, { defaultRenderTask: false });
    const manager = createAnimationManager({ engine });
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const group = createPropertyAnimationGroup(manager, target, clip);
    let taskRuns = 0;
    addAnimationTask(manager, createAnimationTask(() => taskRuns++));
    tick(scene, 10, 50);
    expect(target.v).toBe(0);
    expect(group.currentTime).toBe(0);
    expect(taskRuns).toBe(0);

    onBeforeRender(scene, (deltaMs) => updateAnimationManager(manager, deltaMs));
    tick(scene, 1, 500);
    expect(group.currentTime).toBe(0.5);
    expect(target.v).toBe(5);
    expect(taskRuns).toBe(1);
});

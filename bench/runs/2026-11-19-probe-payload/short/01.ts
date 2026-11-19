import { expect, test } from "vitest";
import { addAnimationTask, createAnimationManager, createAnimationTask, createNullEngine, createPropertyAnimationClip, createPropertyAnimationGroup, createSceneContext, onBeforeRender, stepScene, updateAnimationManager } from "@babylonjs/lite";

test("a manager made with the scene's engine; the scene stepped before and after onBeforeRender", () => {
    const engine = createNullEngine();
    const scene = createSceneContext(engine, { defaultRenderTask: false });
    const manager = createAnimationManager({ engine });
    const target = { v: 0 };
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);
    const group = createPropertyAnimationGroup(manager, target, clip);
    let taskRuns = 0;
    addAnimationTask(manager, createAnimationTask(() => taskRuns++));
    stepScene(engine, scene, 500);
    expect(group.currentTime).toBe(0);
    expect(target.v).toBe(0);
    expect(taskRuns).toBe(0);
    onBeforeRender(scene, (d) => updateAnimationManager(manager, d));
    stepScene(engine, scene, 500);
    expect(group.currentTime).toBe(0.5);
    expect(target.v).toBe(5);
    expect(taskRuns).toBe(1);
});

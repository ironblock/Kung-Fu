// b-56. Line 422: "`AnimationManager` is a standalone owner for generic animation tasks. It has no scene dependency and can be driven three ways:"
// Checked: a manager made with no scene and no options owns and runs a generic task and a property
// group. The three ways are b-57, b-58 and b-59.
import { addAnimationTask, createAnimationManager, createAnimationTask, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("a manager with no scene runs generic tasks and groups", () => {
    const manager = createAnimationManager();
    const steps: number[] = [];
    addAnimationTask(manager, createAnimationTask((_m, dt) => steps.push(dt)));
    const target = { v: -1 };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    updateAnimationManager(manager, 400);
    expect(steps).toEqual([400]);
    expect(target.v).toBe(4);
});

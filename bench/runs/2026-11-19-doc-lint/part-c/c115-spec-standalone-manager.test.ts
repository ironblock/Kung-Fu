// c-115. Line 745: "**Standalone manager**: Verify `updateAnimationManager()` works without a scene or engine for manual
// property clips"
// Checked: a manager made with no options drives a property group with no scene in the process.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("no scene, no engine", () => {
    const manager = createAnimationManager();
    expect(manager.engine).toBeUndefined();
    const target = { v: -1 };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    updateAnimationManager(manager, 300);
    expect(target.v).toBeCloseTo(3, 5);
});

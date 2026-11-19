// c-19. Line 575: "Manual property weights are optional and live outside the default direct evaluator."
// Checked: with no mixer enabled, a property group of weight 0.5 still writes its full sampled value.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

test("the default evaluator ignores weight", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 10 }, { time: 1, value: 10 }] }]));
    setAnimationWeight(group, 0.5);
    updateAnimationManager(manager, 100);
    expect(target.v).toBe(10);
});

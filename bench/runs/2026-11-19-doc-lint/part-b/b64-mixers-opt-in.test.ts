// b-64. Line 435: "Weighted animation mixers remain animation-group-specific opt-ins."
// Checked: a weight below 1 does nothing until a mixer is enabled on the manager.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

test("weights only mix once enablePropertyAnimationBlending is called", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 10 }, { time: 1, value: 10 }] }]));
    setAnimationWeight(group, 0.5);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(10);
    enablePropertyAnimationBlending(manager);
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(5);
});

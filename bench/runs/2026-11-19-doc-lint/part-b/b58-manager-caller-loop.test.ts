// b-58. Line 427: "updateAnimationManager(manager, 16.667); // caller-owned loop"
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("each caller call advances the manager by the given milliseconds", () => {
    const manager = createAnimationManager();
    const group = createPropertyAnimationGroup(manager, { v: 0 }, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]));
    updateAnimationManager(manager, 16.667);
    expect(group.currentTime).toBeCloseTo(0.016667, 12);
    for (let i = 0; i < 9; i++) {
        updateAnimationManager(manager, 16.667);
    }
    expect(group.currentTime).toBeCloseTo(0.16667, 9);
});

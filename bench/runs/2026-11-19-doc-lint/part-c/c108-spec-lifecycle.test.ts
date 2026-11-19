// c-108. Line 738: "**AnimationGroup lifecycle**: play → tick → verify time advances; pause → tick → verify time frozen;
// stop → verify reset to 0"
// Checked on a property group driven by a manager.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, pauseAnimation, playAnimation, stopAnimation, updateAnimationManager } from "@babylonjs/lite";

test("play, pause, stop", () => {
    const manager = createAnimationManager();
    const g = createPropertyAnimationGroup(manager, { v: 0 }, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]));
    pauseAnimation(g);
    playAnimation(g);
    updateAnimationManager(manager, 200);
    expect(g.currentTime).toBeCloseTo(0.2, 6);
    pauseAnimation(g);
    updateAnimationManager(manager, 200);
    expect(g.currentTime).toBeCloseTo(0.2, 6);
    stopAnimation(g);
    expect(g.currentTime).toBe(0);
});

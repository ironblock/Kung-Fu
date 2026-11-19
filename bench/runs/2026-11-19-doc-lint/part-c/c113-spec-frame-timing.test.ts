// c-113. Line 743: "**Manual scalar animation**: Verify `position.x` keyframes reproduce Babylon frame-rate timing"
// Read as: a key at frame f plays at f / frameRate seconds. Checked: at 30 fps, keys at frames 0 and 30 (0 and 10);
// after 0.5 s position.x is 5, after 1 s it is 10 (non-looping). Babylon.js itself is not run.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("frame / frameRate timing", () => {
    const manager = createAnimationManager();
    const target = { position: { x: -1 } };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "position.x", frameRate: 30, keys: [{ frame: 0, value: 0 }, { frame: 30, value: 10 }] }]), { loop: false });
    updateAnimationManager(manager, 500);
    expect(target.position.x).toBeCloseTo(5, 5);
    updateAnimationManager(manager, 500);
    expect(target.position.x).toBe(10);
});

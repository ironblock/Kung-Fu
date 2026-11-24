// c-13. Lines 559-562: "Their leaf owner/property pair is re-resolved before each write so replacing an intermediate
// object during playback (for example assigning a new `position` while animating `position.x`) redirects subsequent
// writes to the replacement"
// Checked with the sentence's own example, on the default (unweighted) evaluator.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("a new position object receives later writes of position.x", () => {
    const manager = createAnimationManager();
    const target = { position: { x: -1, y: 0, z: 0 } };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "position.x", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    updateAnimationManager(manager, 200);
    const old = target.position;
    expect(old.x).toBe(2);
    target.position = { x: -1, y: 0, z: 0 };
    updateAnimationManager(manager, 200);
    expect(target.position.x).toBe(4);
    expect(old.x).toBe(2);
});

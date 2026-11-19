// c-17. Line 569: "invalid paths throw immediately during `createPropertyAnimationGroup()` so typos never fail silently."
// Checked: four typos, each in a different place (first segment, leaf, vector component, empty segment), each throws
// from createPropertyAnimationGroup.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup } from "@babylonjs/lite";

test.each(["positon.x", "position.q", "alhpa", "position..x"])("typo %s throws", (path) => {
    const target = { position: { x: 0, y: 0, z: 0 }, alpha: 1 };
    const clip = createPropertyAnimationClip("c", [{ path, keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]);
    expect(() => createPropertyAnimationGroup(createAnimationManager(), target, clip)).toThrow();
});

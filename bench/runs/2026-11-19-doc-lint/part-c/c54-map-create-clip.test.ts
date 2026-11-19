// c-54. Line 626 (map row): `new Animation(name, "position.x", frameRate, FLOAT, CYCLE)` corresponds to
// `createPropertyAnimationClip(name, [{ path: "position.x", frameRate, keys }])`.
// Checked: the call in that shape is accepted; a group made from it animates position.x at that frame rate, and loops
// (CYCLE) with no option given.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("createPropertyAnimationClip(name, [{ path, frameRate, keys }])", () => {
    const clip = createPropertyAnimationClip("slide", [{ path: "position.x", frameRate: 30, keys: [{ frame: 0, value: 0 }, { frame: 30, value: 10 }] }]);
    expect(clip.name).toBe("slide");
    expect(clip.duration).toBe(1);
    const manager = createAnimationManager();
    const target = { position: { x: -1 } };
    const g = createPropertyAnimationGroup(manager, target, clip);
    expect(g.loopAnimation).toBe(true);
    updateAnimationManager(manager, 1250);
    expect(target.position.x).toBeCloseTo(2.5, 5);
});

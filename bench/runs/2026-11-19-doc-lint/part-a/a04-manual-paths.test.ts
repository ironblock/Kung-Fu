// a-04, line 7: "Supports skeletal joint transforms, morph target weights, KHR_animation_pointer channels, and manual tracks bound to object property paths such as `position.x`, `position`, `rotationQuaternion`, or `scaling`."
// This probe takes the fourth item: manual tracks on each of the four example paths.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const node = () => ({ position: { x: 0, y: 0, z: 0 }, rotationQuaternion: { x: 0, y: 0, z: 0, w: 1 }, scaling: { x: 1, y: 1, z: 1 } });

test("tracks on position.x, position, rotationQuaternion and scaling all write their targets", () => {
    const manager = createAnimationManager();
    const a = node();
    const b = node();
    const clipA = createPropertyAnimationClip("a", [
        { path: "position.x", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] },
        { path: "rotationQuaternion", keys: [{ time: 0, value: [0, 0, 0, 1] }, { time: 1, value: [0, 1, 0, 0] }] },
        { path: "scaling", keys: [{ time: 0, value: [1, 1, 1] }, { time: 1, value: [3, 3, 3] }] },
    ]);
    const clipB = createPropertyAnimationClip("b", [{ path: "position", keys: [{ time: 0, value: [0, 0, 0] }, { time: 1, value: [2, 4, 6] }] }]);
    createPropertyAnimationGroup(manager, a, clipA);
    createPropertyAnimationGroup(manager, b, clipB);
    updateAnimationManager(manager, 500);
    expect(a.position.x).toBeCloseTo(5);
    expect(a.rotationQuaternion.y).toBeCloseTo(Math.SQRT1_2);
    expect(a.rotationQuaternion.w).toBeCloseTo(Math.SQRT1_2);
    expect(a.scaling).toEqual({ x: 2, y: 2, z: 2 });
    expect(b.position).toEqual({ x: 1, y: 2, z: 3 });
});

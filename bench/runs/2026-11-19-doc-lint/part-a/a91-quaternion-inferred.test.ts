// a-91, line 104: "/** Forces quaternion-aware interpolation for vec4 tracks. Inferred for `rotationQuaternion` paths. */"
// This probe takes the second sentence: a track on `rotationQuaternion` slerps with no `quaternion` option.
// A nested path ending in rotationQuaternion is also checked, as the plain reading of "rotationQuaternion paths" covers it.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("rotationQuaternion paths slerp without the option", () => {
    const unit = () => ({ x: 0, y: 0, z: 0, w: 1 });
    const target = { rotationQuaternion: unit(), child: { rotationQuaternion: unit() } };
    const keys = [{ time: 0, value: [0, 0, 0, 1] }, { time: 1, value: [0, 1, 0, 0] }];
    const clip = createPropertyAnimationClip("c", [
        { path: "rotationQuaternion", keys },
        { path: "child.rotationQuaternion", keys },
    ]);
    expect(clip.tracks.map((t) => t.quaternion)).toEqual([true, true]);
    const manager = createAnimationManager();
    createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 500);
    expect(target.rotationQuaternion.y).toBeCloseTo(Math.SQRT1_2, 5);
    expect(target.child.rotationQuaternion.w).toBeCloseTo(Math.SQRT1_2, 5);
});

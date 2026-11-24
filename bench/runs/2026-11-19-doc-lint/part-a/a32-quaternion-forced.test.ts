// a-32, line 104: "/** Forces quaternion-aware interpolation for vec4 tracks. Inferred for `rotationQuaternion` paths. */"
// This probe takes the first sentence: `quaternion: true` on a vec4 track whose path is not rotationQuaternion.
// From (0,0,0,1) to (0,1,0,0), half way: slerp gives y = w = sqrt(1/2); per-component lerp gives 0.5.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("quaternion: true makes a vec4 track slerp", () => {
    const target = { q: { x: 0, y: 0, z: 0, w: 1 } };
    const clip = createPropertyAnimationClip("c", [{ path: "q", quaternion: true, keys: [{ time: 0, value: [0, 0, 0, 1] }, { time: 1, value: [0, 1, 0, 0] }] }]);
    expect(clip.tracks[0]!.quaternion).toBe(true);
    const manager = createAnimationManager();
    createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 500);
    expect(target.q.y).toBeCloseTo(Math.SQRT1_2, 5);
    expect(target.q.w).toBeCloseTo(Math.SQRT1_2, 5);
});

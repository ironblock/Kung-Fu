// Note: a 4-value track slerps only with quaternion: true or a path that is or ends with rotationQuaternion; otherwise each component lerps alone, unnormalized.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const keys = [{ time: 0, value: [0, 0, 0, 1] }, { time: 1, value: [0, 1, 0, 0] }];

it("slerp vs lerp", () => {
    const manager = createAnimationManager();
    const plain = { q: { x: 0, y: 0, z: 0, w: 1 } };
    const named = { a: { rotationQuaternion: { x: 0, y: 0, z: 0, w: 1 } } };
    const flagged = { q: { x: 0, y: 0, z: 0, w: 1 } };
    const plainClip = createPropertyAnimationClip("p", [{ path: "q", keys }]);
    const namedClip = createPropertyAnimationClip("n", [{ path: "a.rotationQuaternion", keys }]);
    const flaggedClip = createPropertyAnimationClip("f", [{ path: "q", keys, quaternion: true }]);
    expect([plainClip.tracks[0]!.quaternion, namedClip.tracks[0]!.quaternion, flaggedClip.tracks[0]!.quaternion]).toEqual([false, true, true]);
    createPropertyAnimationGroup(manager, plain, plainClip);
    createPropertyAnimationGroup(manager, named, namedClip);
    createPropertyAnimationGroup(manager, flagged, flaggedClip);
    updateAnimationManager(manager, 500);
    expect(plain.q).toEqual({ x: 0, y: 0.5, z: 0, w: 0.5 });
    expect(named.a.rotationQuaternion.y).toBeCloseTo(Math.SQRT1_2, 6);
    expect(named.a.rotationQuaternion.w).toBeCloseTo(Math.SQRT1_2, 6);
    expect(flagged.q.y).toBeCloseTo(Math.SQRT1_2, 6);
});

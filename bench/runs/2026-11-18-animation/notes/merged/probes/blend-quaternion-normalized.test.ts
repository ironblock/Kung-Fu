import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

it("under property blending a quaternion sum is normalized, so a weight above 0 on a lone quaternion track has no effect", () => {
    const s = Math.SQRT1_2;
    for (const weight of [0.25, 0.75]) {
        const manager = createAnimationManager();
        const target = { rotationQuaternion: { x: 0, y: 0, z: 0, w: 1 } };
        const clip = createPropertyAnimationClip("c", [{ path: "rotationQuaternion", keys: [{ time: 0, value: [0, s, 0, s] }, { time: 1, value: [0, s, 0, s] }] }]);
        const g = createPropertyAnimationGroup(manager, target, clip);
        enablePropertyAnimationBlending(manager);
        setAnimationWeight(g, weight);
        updateAnimationManager(manager, 100);
        expect(target.rotationQuaternion.y).toBeCloseTo(s);
        expect(target.rotationQuaternion.w).toBeCloseTo(s);
    }
});

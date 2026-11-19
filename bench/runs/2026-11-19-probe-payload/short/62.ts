import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

test("one rotationQuaternion track at weight 0.25 under enablePropertyAnimationBlending", () => {
    const s = Math.SQRT1_2;
    const manager = createAnimationManager();
    const target = { rotationQuaternion: { x: 0, y: 0, z: 0, w: 1 } };
    const clip = createPropertyAnimationClip("c", [{ path: "rotationQuaternion", keys: [{ time: 0, value: [0, s, 0, s] }, { time: 1, value: [0, s, 0, s] }] }]);
    const g = createPropertyAnimationGroup(manager, target, clip);
    enablePropertyAnimationBlending(manager);
    setAnimationWeight(g, 0.25);
    updateAnimationManager(manager, 100);
    expect(target.rotationQuaternion).toEqual({ x: 0, y: 0.7071067690849304, z: 0, w: 0.7071067690849304 });
});

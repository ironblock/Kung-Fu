import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

it("only rotationQuaternion paths or quaternion: true are slerped; other 4-number tracks lerp per component", () => {
    const manager = createAnimationManager();
    const unit = () => ({ x: 0, y: 0, z: 0, w: 1 });
    const target = { rotationQuaternion: unit(), node: { rotationQuaternion: unit() }, q: unit(), q2: unit() };
    const keys = [{ time: 0, value: [0, 0, 0, 1] }, { time: 1, value: [0, 1, 0, 0] }];
    const clip = createPropertyAnimationClip("c", [
        { path: "rotationQuaternion", keys },
        { path: "node.rotationQuaternion", keys },
        { path: "q", keys },
        { path: "q2", keys, quaternion: true },
    ]);
    expect(clip.tracks.map((t) => t.quaternion)).toEqual([true, true, false, true]);
    createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 500);
    expect(target.rotationQuaternion.y).toBeCloseTo(Math.SQRT1_2);
    expect(target.node.rotationQuaternion.w).toBeCloseTo(Math.SQRT1_2);
    expect(target.q2.y).toBeCloseTo(Math.SQRT1_2);
    expect(target.q).toEqual({ x: 0, y: 0.5, z: 0, w: 0.5 });
});

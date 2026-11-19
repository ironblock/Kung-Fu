// c-15. Line 565: "vector/quaternion paths (`position`, `scaling`, `rotationQuaternion`) call `.set(...)` when the
// target object exposes a setter method;"
// Checked: each of the three properties has a `set` method; each is called once per update with the sampled components.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

function settable() {
    const v = { x: 0, y: 0, z: 0, w: 0, calls: [] as number[][], set: (...a: number[]) => void v.calls.push(a) };
    return v;
}

test("set(...) is called with the components", () => {
    const target = { position: settable(), scaling: settable(), rotationQuaternion: settable() };
    const clip = createPropertyAnimationClip("c", [
        { path: "position", keys: [{ time: 0, value: [1, 2, 3] }, { time: 1, value: [1, 2, 3] }] },
        { path: "scaling", keys: [{ time: 0, value: [2, 2, 2] }, { time: 1, value: [2, 2, 2] }] },
        { path: "rotationQuaternion", keys: [{ time: 0, value: [0, 0, 0, 1] }, { time: 1, value: [0, 0, 0, 1] }] },
    ]);
    const manager = createAnimationManager();
    createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 100);
    expect(target.position.calls).toEqual([[1, 2, 3]]);
    expect(target.scaling.calls).toEqual([[2, 2, 2]]);
    expect(target.rotationQuaternion.calls).toEqual([[0, 0, 0, 1]]);
});

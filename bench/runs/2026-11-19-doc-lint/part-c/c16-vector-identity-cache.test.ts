// c-16. Lines 566-568: "vector/quaternion writers cache the current property object but compare its identity on every
// write, rebuilding the component/setter writer only when application code replaces that object during playback;"
// Checked: (1) replacing the property object sends later writes to the new object, through its `set`;
// (2) adding a `set` method to the same object (no replacement) does not change the writer: components are still
// assigned and the new `set` is never called.
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const ramp = () => createPropertyAnimationClip("c", [{ path: "position", keys: [{ time: 0, value: [0, 0, 0] }, { time: 1, value: [10, 20, 30] }] }]);

test("a replaced object is detected and gets its own writer", () => {
    const manager = createAnimationManager();
    const target: { position: { x: number; y: number; z: number; set?: (...a: number[]) => void } } = { position: { x: 0, y: 0, z: 0 } };
    createPropertyAnimationGroup(manager, target, ramp());
    updateAnimationManager(manager, 100);
    const old = target.position;
    expect(old).toMatchObject({ x: 1, y: 2, z: 3 });
    const calls: number[][] = [];
    target.position = { x: 0, y: 0, z: 0, set: (...a: number[]) => void calls.push(a) };
    updateAnimationManager(manager, 100);
    expect(calls.length).toBe(1);
    expect(calls[0]![0]).toBeCloseTo(2);
    expect(old).toMatchObject({ x: 1, y: 2, z: 3 });
});

test("the same object is not re-examined", () => {
    const manager = createAnimationManager();
    const position: { x: number; y: number; z: number; set?: (...a: number[]) => void } = { x: 0, y: 0, z: 0 };
    createPropertyAnimationGroup(manager, { position }, ramp());
    let setCalls = 0;
    position.set = () => void setCalls++;
    updateAnimationManager(manager, 500);
    expect(setCalls).toBe(0);
    expect(position).toMatchObject({ x: 5, y: 10, z: 15 });
});

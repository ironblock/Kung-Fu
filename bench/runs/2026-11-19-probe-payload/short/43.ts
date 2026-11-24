import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const clip = (path: string, value: number | number[]) => createPropertyAnimationClip("c", [{ path, keys: [{ time: 0, value }, { time: 1, value }] }]);

test("3-number keys on { r, g, b } and on an array, 5-number keys on an object with set(), a number key on an object", () => {
    const manager = createAnimationManager();
    expect(() => createPropertyAnimationGroup(manager, { color: { r: 0, g: 0, b: 0 } }, clip("color", [1, 2, 3]))).toThrow(/component "x"/);
    expect(() => createPropertyAnimationGroup(manager, { arr: [0, 0, 0] }, clip("arr", [1, 2, 3]))).toThrow(/component "x"/);
    expect(() => createPropertyAnimationGroup(manager, { m: { x: 0, set() {} } }, clip("m", [1, 2, 3, 4, 5]))).toThrow(/unsupported vector size 5/);
    const target: { position: unknown } = { position: { x: 1, y: 2, z: 3 } };
    createPropertyAnimationGroup(manager, target, clip("position", 7));
    updateAnimationManager(manager, 16);
    expect(target.position).toBe(7);
});

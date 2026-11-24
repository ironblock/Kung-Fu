// Note: an {r,g,b} object or an array without set() throws at group creation, as do values longer than 4; a scalar key replaces the property with a number.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const keys3 = [{ time: 0, value: [1, 2, 3] }, { time: 1, value: [1, 2, 3] }];

it("rejects shapes it cannot write", () => {
    const manager = createAnimationManager();
    expect(() => createPropertyAnimationGroup(manager, { color: { r: 0, g: 0, b: 0 } }, createPropertyAnimationClip("c", [{ path: "color", keys: keys3 }]))).toThrow(/component "x"/);
    expect(() => createPropertyAnimationGroup(manager, { arr: [0, 0, 0] }, createPropertyAnimationClip("a", [{ path: "arr", keys: keys3 }]))).toThrow(/component "x"/);
    const five = [{ time: 0, value: [1, 2, 3, 4, 5] }, { time: 1, value: [1, 2, 3, 4, 5] }];
    expect(() => createPropertyAnimationGroup(manager, { m: { x: 0, set() {} } }, createPropertyAnimationClip("m", [{ path: "m", keys: five }]))).toThrow(/unsupported vector size 5/);
});

it("a scalar key replaces an object property", () => {
    const manager = createAnimationManager();
    const target: { position: unknown } = { position: { x: 1, y: 2, z: 3 } };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("s", [{ path: "position", keys: [{ time: 0, value: 7 }, { time: 1, value: 7 }] }]));
    updateAnimationManager(manager, 16);
    expect(target.position).toBe(7);
});

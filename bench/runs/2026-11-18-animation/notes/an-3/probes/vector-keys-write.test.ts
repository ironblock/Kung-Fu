import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, createTransformNode, updateAnimationManager } from "@babylonjs/lite";
import { thrown } from "./_lib";

it("array keys call set(...) on the property's value when it has set, else write x, y, z, w; r, g, b alone throws", () => {
    const manager = createAnimationManager();
    const calls: number[][] = [];
    const target = { position: { x: 0, y: 0, z: 0, set: (x: number, y: number, z: number) => calls.push([x, y, z]) }, v2: { x: 0, y: 0 } };
    const clip = createPropertyAnimationClip("c", [
        { path: "position", keys: [{ time: 0, value: [0, 0, 0] }, { time: 1, value: [10, 20, 30] }] },
        { path: "v2", keys: [{ time: 0, value: [0, 0] }, { time: 1, value: [1, 2] }] },
    ]);
    createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 500);
    expect(calls).toEqual([[5, 10, 15]]);
    expect(target.position.x).toBe(0);
    expect(target.v2).toEqual({ x: 0.5, y: 1 });

    const color = createPropertyAnimationClip("c", [{ path: "color", keys: [{ time: 0, value: [0, 0, 0] }, { time: 1, value: [1, 1, 1] }] }]);
    expect(thrown(() => createPropertyAnimationGroup(manager, { color: { r: 0, g: 0, b: 0 } }, color))).toMatch(/could not resolve component "x"/);
    const red = createPropertyAnimationClip("c", [{ path: "color.r", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]);
    const lamp = { color: { r: 0, g: 0, b: 0 } };
    createPropertyAnimationGroup(manager, lamp, red);
    updateAnimationManager(manager, 250);
    expect(lamp.color.r).toBeCloseTo(0.25);

    const node = createTransformNode("n");
    createPropertyAnimationGroup(manager, node, createPropertyAnimationClip("c", [{ path: "position", keys: [{ time: 0, value: [0, 0, 0] }, { time: 1, value: [2, 4, 6] }] }]));
    updateAnimationManager(manager, 500);
    expect([node.position.x, node.position.y, node.position.z]).toEqual([1, 2, 3]);
});

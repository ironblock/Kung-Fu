// Note: dotted paths; every part must exist at group creation or it throws; an array value calls set(...) if present, else writes x, y, z, w.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, createTransformNode, updateAnimationManager } from "@babylonjs/lite";

const vec = createPropertyAnimationClip("p", [{ path: "position", keys: [{ time: 0, value: [1, 2, 3] }, { time: 1, value: [1, 2, 3] }] }]);

it("uses set() when present", () => {
    const manager = createAnimationManager();
    const calls: number[][] = [];
    const target = { position: { x: 0, y: 0, z: 0, set: (...a: number[]) => calls.push(a) } };
    createPropertyAnimationGroup(manager, target, vec);
    updateAnimationManager(manager, 16);
    expect(calls).toEqual([[1, 2, 3]]);
    expect(target.position.x).toBe(0);
});

it("writes x, y, z otherwise", () => {
    const manager = createAnimationManager();
    const target = { position: { x: 0, y: 0, z: 0 } };
    createPropertyAnimationGroup(manager, target, vec);
    updateAnimationManager(manager, 16);
    expect(target.position).toEqual({ x: 1, y: 2, z: 3 });
});

it("works on a scene node", () => {
    const manager = createAnimationManager();
    const node = createTransformNode("n");
    createPropertyAnimationGroup(manager, node, vec);
    createPropertyAnimationGroup(manager, node, createPropertyAnimationClip("x", [{ path: "scaling.x", keys: [{ time: 0, value: 1 }, { time: 1, value: 3 }] }]));
    updateAnimationManager(manager, 500);
    expect([node.position.x, node.position.y, node.position.z]).toEqual([1, 2, 3]);
    expect(node.scaling.x).toBe(2);
});

it("throws at creation when a part is missing", () => {
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("x", [{ path: "position.x", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] }]);
    expect(() => createPropertyAnimationGroup(manager, {}, clip)).toThrow(/could not resolve "position"/);
    expect(() => createPropertyAnimationGroup(manager, { position: {} }, clip)).toThrow(/could not resolve "x"/);
});

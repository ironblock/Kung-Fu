import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("tracks of size 1, 3 and 4 on a number, an object with set, and a plain {x, y, z, w}", () => {
    const manager = createAnimationManager();
    const calls: number[][] = [];
    const target = { position: { x: 0 }, scaling: { x: 0, set: (...v: number[]) => calls.push(v) }, color: { x: 0, y: 0, z: 0, w: 0 } };
    const hold = (path: string, value: number | number[]) => ({ path, keys: [{ time: 0, value }, { time: 1, value }] });
    const clip = createPropertyAnimationClip("c", [hold("position.x", 7), hold("scaling", [1, 2, 3]), hold("color", [1, 2, 3, 4])]);
    createPropertyAnimationGroup(manager, target, clip);
    updateAnimationManager(manager, 0);
    expect(target.position.x).toBe(7);
    expect(calls).toEqual([[1, 2, 3]]);
    expect(target.scaling.x).toBe(0);
    expect(target.color).toEqual({ x: 1, y: 2, z: 3, w: 4 });
});

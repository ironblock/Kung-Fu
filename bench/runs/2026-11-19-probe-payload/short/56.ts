import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager, vec3 } from "@babylonjs/lite";

test("keys whose values are { x, y, z } objects, and vec3 objects, on a position", () => {
    for (const value of [(n: number) => ({ x: n, y: n, z: n }), (n: number) => vec3(n, n, n)]) {
        const keys = [{ time: 0, value: value(1) }, { time: 1, value: value(2) }] as never;
        const manager = createAnimationManager();
        const target = { position: { x: 0, y: 0, z: 0 } };
        expect(() => {
            createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "position", keys }]));
            updateAnimationManager(manager, 500);
        }).not.toThrow();
        expect(target.position).toEqual({ x: 0, y: 0, z: 0 });
    }
});

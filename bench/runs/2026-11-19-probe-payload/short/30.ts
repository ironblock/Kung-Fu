import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const ramp = (path: string) => createPropertyAnimationClip("c", [{ path, keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);

test("a path a.b.c on { a: {} }; then position.x with target.position replaced, then removed", () => {
    const manager = createAnimationManager();
    expect(() => createPropertyAnimationGroup(manager, { a: {} }, ramp("a.b.c"))).toThrow(/could not resolve "b"/);
    const target: { position?: { x: number } } = { position: { x: 0 } };
    createPropertyAnimationGroup(manager, target, ramp("position.x"));
    const old = target.position!;
    target.position = { x: -1 };
    updateAnimationManager(manager, 500);
    expect(target.position.x).toBe(5);
    expect(old.x).toBe(0);
    target.position = undefined;
    expect(() => updateAnimationManager(manager, 100)).toThrow(/position\.x/);
});

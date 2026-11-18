// Note: the path is resolved again at every write; a replaced object gets later writes; a deleted part makes updateAnimationManager throw.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

it("follows replaced objects", () => {
    const manager = createAnimationManager();
    const target: { position?: { x: number } } = { position: { x: 0 } };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "position.x", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    updateAnimationManager(manager, 100);
    const old = target.position!;
    target.position = { x: -1 };
    updateAnimationManager(manager, 100);
    expect(old.x).toBe(1);
    expect(target.position.x).toBe(2);
    delete target.position;
    expect(() => updateAnimationManager(manager, 100)).toThrow(/could not resolve "position"/);
});

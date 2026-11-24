import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("one clip with paths 'a.position.x' and 'b.alpha', bound to two holders { a, b }", () => {
    const clip = createPropertyAnimationClip("c", [
        { path: "a.position.x", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] },
        { path: "b.alpha", keys: [{ time: 0, value: 0 }, { time: 1, value: 1 }] },
    ]);
    const manager = createAnimationManager();
    const one = { a: { position: { x: 0 } }, b: { alpha: 0 } };
    const two = { a: { position: { x: 0 } }, b: { alpha: 0 } };
    createPropertyAnimationGroup(manager, one, clip);
    updateAnimationManager(manager, 500);
    createPropertyAnimationGroup(manager, two, clip);
    updateAnimationManager(manager, 250);
    expect(one).toEqual({ a: { position: { x: 7.5 } }, b: { alpha: 0.75 } });
    expect(two).toEqual({ a: { position: { x: 2.5 } }, b: { alpha: 0.25 } });
});

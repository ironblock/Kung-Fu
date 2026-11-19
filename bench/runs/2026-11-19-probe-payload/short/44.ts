import { expect, test } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, setAnimationWeight, updateAnimationManager } from "@babylonjs/lite";

const hold = (path: string, v: number) => createPropertyAnimationClip("c", [{ path, keys: [{ time: 0, value: v }, { time: 1, value: v }] }]);

test("under enablePropertyAnimationBlending: 10 at weight 1 with 20 at weight 0.5 on one property; 10 then 20, both weight 1, on another", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { mixed: 0, plain: 0 };
    createPropertyAnimationGroup(manager, target, hold("mixed", 10));
    setAnimationWeight(createPropertyAnimationGroup(manager, target, hold("mixed", 20)), 0.5);
    createPropertyAnimationGroup(manager, target, hold("plain", 10));
    createPropertyAnimationGroup(manager, target, hold("plain", 20));
    updateAnimationManager(manager, 0);
    expect(target).toEqual({ mixed: 20, plain: 20 });
});

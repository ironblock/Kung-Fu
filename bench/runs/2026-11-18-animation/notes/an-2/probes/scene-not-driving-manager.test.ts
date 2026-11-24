import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, onBeforeRender, updateAnimationManager } from "@babylonjs/lite";
import { makeScene, tick } from "../../app/checks/helpers.ts";

test("a scene's frames do not update an AnimationManager; hooking updateAnimationManager into onBeforeRender does", () => {
    const scene = makeScene();
    const manager = createAnimationManager();
    const target = { v: -1 };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]));
    tick(scene, 5, 16);
    expect(target.v).toBe(-1);
    onBeforeRender(scene, (dt) => updateAnimationManager(manager, dt));
    tick(scene, 5, 20);
    expect(target.v).toBeCloseTo(1, 5);
});

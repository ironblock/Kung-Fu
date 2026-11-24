import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, enablePropertyAnimationBlending, pauseAnimation, setAnimationWeight, stopAnimation, updateAnimationManager } from "@babylonjs/lite";

const ramp = () => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);

test("in the mix, a property whose only groups have weight 0 is not written, but their time still advances", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: -1 };
    const a = createPropertyAnimationGroup(manager, target, ramp());
    setAnimationWeight(a, 0);
    updateAnimationManager(manager, 500);
    expect(target.v).toBe(-1);
    expect(a.currentTime).toBe(0.5);
});

test("in the mix, a paused group with weight below 1 still writes its weighted value each update", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: -1 };
    const a = createPropertyAnimationGroup(manager, target, ramp());
    setAnimationWeight(a, 0.5);
    updateAnimationManager(manager, 500);
    expect(target.v).toBe(2.5);
    pauseAnimation(a);
    target.v = 99;
    updateAnimationManager(manager, 500);
    expect(a.currentTime).toBe(0.5);
    expect(target.v).toBe(2.5);
});

test("a stopped group takes no part in the mix", () => {
    const manager = createAnimationManager();
    enablePropertyAnimationBlending(manager);
    const target = { v: -1 };
    const a = createPropertyAnimationGroup(manager, target, ramp());
    setAnimationWeight(a, 0.5);
    stopAnimation(a);
    updateAnimationManager(manager, 500);
    expect(target.v).toBe(-1);
});

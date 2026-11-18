import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const clip = () => createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 4, value: 40 }] }]);

test("writing currentTime seeks: the next update adds its delta to the new time", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip());
    group.currentTime = 2;
    expect(target.v).toBe(-1);
    updateAnimationManager(manager, 500);
    expect(group.currentTime).toBe(2.5);
    expect(target.v).toBe(25);
});

test("speedRatio and loopAnimation written on the group are used from the next update", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip());
    group.speedRatio = 2;
    updateAnimationManager(manager, 1000);
    expect(group.currentTime).toBe(2);
    group.loopAnimation = false;
    updateAnimationManager(manager, 5000);
    expect(group.currentTime).toBe(4);
    expect(group.isPlaying).toBe(false);
    expect(target.v).toBe(40);
});

test("setting isPlaying = false directly pauses like pauseAnimation", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, clip());
    group.isPlaying = false;
    updateAnimationManager(manager, 1000);
    expect(group.currentTime).toBe(0);
    expect(target.v).toBe(-1);
});

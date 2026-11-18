import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

test("currentTime is a running sum of deltaMs / 1000: ten 100 ms updates give 0.9999999999999999, so a 1 s non-looping group has not ended", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    const group = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]), { loop: false });
    for (let i = 0; i < 10; i++) {
        updateAnimationManager(manager, 100);
    }
    expect(group.currentTime).toBe(0.9999999999999999);
    expect(group.isPlaying).toBe(true);
    expect(target.v).toBe(10);
    updateAnimationManager(manager, 100);
    expect(group.isPlaying).toBe(false);
});

test("one 1000 ms update ends it at once", () => {
    const manager = createAnimationManager();
    const group = createPropertyAnimationGroup(manager, { v: 0 }, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]), { loop: false });
    updateAnimationManager(manager, 1000);
    expect(group.isPlaying).toBe(false);
});

// b-13. Line 315: "STEP segments never invoke easing."
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, updateAnimationManager } from "@babylonjs/lite";

test("a STEP track never calls its easing callback", () => {
    let calls = 0;
    const easing = () => {
        calls++;
        return 0.5;
    };
    const target = { v: -1 };
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("c", [{ path: "v", interpolation: "step", easing, keys: [{ time: 0, value: 1 }, { time: 1, value: 2 }, { time: 2, value: 3 }] }], { frameRate: 4 });
    const group = createPropertyAnimationGroup(manager, target, clip);
    for (let i = 0; i < 12; i++) {
        updateAnimationManager(manager, 170);
    }
    goToFrame(group, 3);
    expect(target.v).toBe(1);
    goToFrame(group, 6);
    expect(target.v).toBe(2);
    expect(calls).toBe(0);
});

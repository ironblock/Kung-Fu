// Note: assigning group.currentTime is a seek that the next update advances from and writes; isPlaying = true on a finished group does not restart it.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

it("seek by assignment", () => {
    const manager = createAnimationManager();
    const target = { v: 0 };
    const group = createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]), { loop: false });
    group.currentTime = 0.5;
    updateAnimationManager(manager, 0);
    expect(target.v).toBe(5);
    updateAnimationManager(manager, 2000);
    expect(group.isPlaying).toBe(false);
    group.currentTime = 0.2;
    group.isPlaying = true;
    target.v = -1;
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBe(0.2);
    expect(target.v).toBe(-1);
});

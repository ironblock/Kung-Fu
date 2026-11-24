// Note: "step" holds each key's value until the next key's time and switches exactly at it.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

it("switches at the key time", () => {
    const manager = createAnimationManager();
    const target = { v: -1 };
    createPropertyAnimationGroup(manager, target, createPropertyAnimationClip("s", [{ path: "v", interpolation: "step", frameRate: 10, keys: [{ frame: 0, value: 0 }, { frame: 3, value: 10 }, { frame: 6, value: 20 }] }]), { loop: false });
    updateAnimationManager(manager, 299);
    expect(target.v).toBe(0);
    updateAnimationManager(manager, 1);
    expect(target.v).toBe(10);
    updateAnimationManager(manager, 300);
    expect(target.v).toBe(20);
});

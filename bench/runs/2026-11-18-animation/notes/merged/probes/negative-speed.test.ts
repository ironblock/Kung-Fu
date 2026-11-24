// Note: a negative speedRatio plays backward; a looping group wraps; a non-looping one clamps at fromTime and keeps isPlaying true.
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, updateAnimationManager } from "@babylonjs/lite";

const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ time: 0, value: 0 }, { time: 1, value: 10 }] }]);

it("backward", () => {
    const manager = createAnimationManager();
    const looped = { v: 0 };
    const a = createPropertyAnimationGroup(manager, looped, clip, { speedRatio: -1 });
    updateAnimationManager(manager, 250);
    expect(a.currentTime).toBe(0.75);
    expect(looped.v).toBe(7.5);

    const once = { v: 0 };
    const b = createPropertyAnimationGroup(manager, once, clip, { loop: false });
    updateAnimationManager(manager, 500);
    b.speedRatio = -1;
    updateAnimationManager(manager, 2000);
    expect(b.currentTime).toBe(0);
    expect(once.v).toBe(0);
    expect(b.isPlaying).toBe(true);
});

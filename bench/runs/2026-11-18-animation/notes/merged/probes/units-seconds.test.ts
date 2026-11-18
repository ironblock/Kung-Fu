// Note: currentTime and duration are seconds; deltaMs moves currentTime by deltaMs/1000*speedRatio; goToFrame uses frame/frameRate (60 default).
import { expect, it } from "vitest";
import { createAnimationManager, createPropertyAnimationClip, createPropertyAnimationGroup, goToFrame, updateAnimationManager } from "@babylonjs/lite";

it("time is in seconds", () => {
    const manager = createAnimationManager();
    const clip = createPropertyAnimationClip("c", [{ path: "v", keys: [{ frame: 0, value: 0 }, { frame: 120, value: 10 }] }]);
    expect(clip.frameRate).toBe(60);
    expect(clip.duration).toBe(2);
    const group = createPropertyAnimationGroup(manager, { v: 0 }, clip);
    expect(group.duration).toBe(2);
    updateAnimationManager(manager, 250);
    expect(group.currentTime).toBe(0.25);
    group.speedRatio = 2;
    updateAnimationManager(manager, 250);
    expect(group.currentTime).toBe(0.75);
    goToFrame(group, 30);
    expect(group.currentTime).toBe(0.5);
});

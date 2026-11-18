import { expect, it } from "vitest";
import { addAnimationGroup, createAnimationGroups, createAnimationManager, goToFrame, playAnimation, updateAnimationManager } from "@babylonjs/lite";
import { rampGroup } from "./_lib";
import { gltfData } from "./_gltf";

it("goToFrame sets currentTime to frame / frameRate, pauses the group, and property groups write at once", () => {
    const { manager, target, group } = rampGroup();
    updateAnimationManager(manager, 100);
    expect(group.frameRate).toBe(60);
    goToFrame(group, 30);
    expect(group.currentTime).toBe(0.5);
    expect(group.isPlaying).toBe(false);
    expect(target.value).toBe(5);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBe(0.5);
    playAnimation(group);
    updateAnimationManager(manager, 100);
    expect(group.currentTime).toBeCloseTo(0.6);
    expect(target.value).toBeCloseTo(6);

    const { data, targets } = gltfData(1);
    const [g] = createAnimationGroups(data);
    const m = createAnimationManager();
    addAnimationGroup(m, g!);
    goToFrame(g!, 15);
    expect(g!.isPlaying).toBe(false);
    expect(g!.currentTime).toBe(0.25);
    expect(targets[0]!.p[0]).toBeCloseTo(2.5);
});

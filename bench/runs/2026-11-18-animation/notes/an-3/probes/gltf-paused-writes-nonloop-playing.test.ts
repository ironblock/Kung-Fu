import { expect, it } from "vitest";
import { addAnimationGroup, createAnimationGroups, createAnimationManager, pauseAnimation, updateAnimationManager } from "@babylonjs/lite";
import { gltfData } from "./_gltf";

it("a paused glTF group writes its pose on every update; a non-looping one ends with isPlaying still true", () => {
    const { data, targets } = gltfData(1);
    const [group] = createAnimationGroups(data);
    const manager = createAnimationManager();
    addAnimationGroup(manager, group!);
    updateAnimationManager(manager, 250);
    pauseAnimation(group!);
    targets[0]!.p = [99, 0, 0];
    updateAnimationManager(manager, 250);
    expect(group!.currentTime).toBe(0.25);
    expect(targets[0]!.p[0]).toBeCloseTo(2.5);

    const second = gltfData(1);
    const [once] = createAnimationGroups(second.data);
    once!.loopAnimation = false;
    const m2 = createAnimationManager();
    addAnimationGroup(m2, once!);
    updateAnimationManager(m2, 1500);
    expect(once!.currentTime).toBe(1);
    expect(once!.isPlaying).toBe(true);
    expect(second.targets[0]!.p[0]).toBe(10);
});

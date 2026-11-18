import { expect, it } from "vitest";
import { addAnimationGroup, createAnimationGroups, createAnimationManager, playAnimation, stopAnimation, updateAnimationManager } from "@babylonjs/lite";
import { rampGroup } from "./_lib";
import { gltfData } from "./_gltf";

it("stopAnimation resets currentTime to fromTime and writes nothing; isPlaying = true does not resume it; playAnimation does", () => {
    const { manager, target, group } = rampGroup();
    updateAnimationManager(manager, 300);
    stopAnimation(group);
    expect(group.currentTime).toBe(0);
    expect(group.isPlaying).toBe(false);
    expect(target.value).toBeCloseTo(3);
    group.isPlaying = true;
    updateAnimationManager(manager, 300);
    expect(group.currentTime).toBe(0);
    expect(target.value).toBeCloseTo(3);
    playAnimation(group);
    updateAnimationManager(manager, 200);
    expect(target.value).toBeCloseTo(2);

    const ranged = rampGroup({ fromTime: 0.4 });
    updateAnimationManager(ranged.manager, 300);
    stopAnimation(ranged.group);
    expect(ranged.group.currentTime).toBe(0.4);

    const { data, targets } = gltfData(1);
    const [g] = createAnimationGroups(data);
    const m = createAnimationManager();
    addAnimationGroup(m, g!);
    updateAnimationManager(m, 300);
    stopAnimation(g!);
    const writes = targets[0]!.writes;
    updateAnimationManager(m, 300);
    expect(targets[0]!.writes).toBe(writes);
    expect(targets[0]!.p[0]).toBeCloseTo(3);
    expect(g!.currentTime).toBe(0);
});

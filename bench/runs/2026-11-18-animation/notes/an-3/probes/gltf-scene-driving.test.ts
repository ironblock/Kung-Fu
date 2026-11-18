import { expect, it } from "vitest";
import { addAnimationGroup, addToScene, createAnimationGroups, createAnimationManager } from "@babylonjs/lite";
import type { AssetContainer } from "@babylonjs/lite";
import { makeScene, tick } from "#helpers";
import { gltfData } from "./_gltf";

it("scene frames drive glTF groups only when added through addToScene in a container; a manager owner makes the scene skip them", () => {
    const pushed = gltfData(1);
    const pushedGroups = createAnimationGroups(pushed.data);
    const scene = makeScene();
    scene.animationGroups.push(...pushedGroups);
    tick(scene, 1, 250);
    expect(pushedGroups[0]!.currentTime).toBe(0);
    expect(pushed.targets[0]!.writes).toBe(0);

    const { data, targets } = gltfData(1);
    const groups = createAnimationGroups(data);
    addToScene(scene, { entities: [], animationGroups: groups } as unknown as AssetContainer);
    expect(scene.animationGroups).toContain(groups[0]);
    tick(scene, 1, 250);
    expect(groups[0]!.currentTime).toBe(0.25);
    expect(targets[0]!.p[0]).toBeCloseTo(2.5);

    addAnimationGroup(createAnimationManager(), groups[0]!);
    tick(scene, 1, 250);
    expect(groups[0]!.currentTime).toBe(0.25);
});

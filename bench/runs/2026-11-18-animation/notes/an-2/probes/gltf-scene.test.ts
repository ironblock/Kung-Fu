import { addAnimationGroup, addToScene, createAnimationGroups, createAnimationManager } from "@babylonjs/lite";
import type { AssetContainer } from "@babylonjs/lite";
import { makeScene, tick } from "../../app/checks/helpers.ts";
import { gltfData, recorder } from "./gltf-fixture.ts";

test("addToScene of a container ticks its groups each frame; a group attached to a manager is skipped by the scene", () => {
    const scene = makeScene();
    const targets = [recorder(), recorder()];
    const groups = createAnimationGroups(gltfData(targets));
    addToScene(scene, { entities: [], animationGroups: groups } as unknown as AssetContainer);
    expect(scene.animationGroups).toEqual(groups);
    tick(scene, 1, 250);
    expect(groups[0]!.currentTime).toBe(0.25);
    expect(targets[0]!.p).toEqual([2.5, 0, 0]);

    const manager = createAnimationManager();
    addAnimationGroup(manager, groups[0]!);
    tick(scene, 1, 250);
    expect(groups[0]!.currentTime).toBe(0.25);
});

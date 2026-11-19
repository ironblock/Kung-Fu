// c-72. Line 644 (map row): `scene.animationGroups` corresponds to `scene.animationGroups`.
// Checked: a Lite scene has an animationGroups array, and groups of a container added to the scene appear in it.
import { addToScene, createAnimationGroups, createNullEngine, createSceneContext } from "@babylonjs/lite";
import type { AssetContainer } from "@babylonjs/lite";
import { gltf, moveClip, rest } from "./_fx";

test("scene.animationGroups", () => {
    const scene = createSceneContext(createNullEngine(), { defaultRenderTask: false });
    expect(scene.animationGroups).toEqual([]);
    const groups = createAnimationGroups(gltf([moveClip("a", 0, 1)], [rest()]));
    addToScene(scene, { entities: [], animationGroups: groups } as unknown as AssetContainer);
    expect(scene.animationGroups).toEqual(groups);
});

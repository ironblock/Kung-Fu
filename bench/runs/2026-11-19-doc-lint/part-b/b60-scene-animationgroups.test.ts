// b-60. Line 431: "A scene may still own loaded animation groups through `scene.animationGroups`."
// A loaded asset is stood in for by a container with no entities and hand-made glTF groups.
// Checked: added to a headless scene, the groups are listed in scene.animationGroups and the scene's
// frames drive them, with no AnimationManager.
import { addToScene, createAnimationGroups, createNullEngine, createSceneContext, stepScene } from "@babylonjs/lite";
import type { AssetContainer } from "@babylonjs/lite";
import { gltf, moveClip, nodeRecorder, rest } from "./_fx";

test("scene.animationGroups holds a loaded container's groups and scene frames play them", () => {
    const engine = createNullEngine();
    const scene = createSceneContext(engine, { defaultRenderTask: false });
    const node = nodeRecorder();
    const groups = createAnimationGroups(gltf([moveClip("m", 0, 10)], [rest()], { targets: [node] }));
    addToScene(scene, { entities: [], animationGroups: groups } as unknown as AssetContainer);
    expect(scene.animationGroups).toContain(groups[0]);
    stepScene(engine, scene, 250);
    expect(groups[0]!.currentTime).toBe(0.25);
    expect(node.p).toEqual([2.5, 0, 0]);
});

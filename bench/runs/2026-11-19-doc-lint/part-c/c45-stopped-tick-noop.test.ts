// c-45. Line 616: STOPPED: "`tickAnimation()` returns immediately."
// tickAnimation is not exported; checked through the two public drivers. A stopped glTF group on a manager, and one on
// a scene (added in a container), neither advance nor write nor upload on later updates.
import { addAnimationGroup, addToScene, createAnimationGroups, createAnimationManager, createNullEngine, createSceneContext, stepScene, stopAnimation, updateAnimationManager } from "@babylonjs/lite";
import type { AssetContainer } from "@babylonjs/lite";
import { gltf, moveClip, nodeRecorder, recordingEngine, rest, skeleton } from "./_fx";

test("a stopped group is skipped by the manager", () => {
    const rec = recordingEngine();
    const node = nodeRecorder();
    const [g] = createAnimationGroups(gltf([moveClip("a", 0, 10)], [rest()], { targets: [node], skeletons: [skeleton(0)] }));
    const manager = createAnimationManager({ engine: rec.engine });
    addAnimationGroup(manager, g!);
    stopAnimation(g!);
    updateAnimationManager(manager, 250);
    expect(g!.currentTime).toBe(0);
    expect(node.writes).toBe(0);
    expect(rec.calls).toEqual([]);
});

test("a stopped group is skipped by the scene", () => {
    const engine = createNullEngine();
    const scene = createSceneContext(engine, { defaultRenderTask: false });
    const node = nodeRecorder();
    const groups = createAnimationGroups(gltf([moveClip("a", 0, 10)], [rest()], { targets: [node] }));
    addToScene(scene, { entities: [], animationGroups: groups } as unknown as AssetContainer);
    stopAnimation(groups[0]!);
    stepScene(engine, scene, 250);
    expect(groups[0]!.currentTime).toBe(0);
    expect(node.writes).toBe(0);
});

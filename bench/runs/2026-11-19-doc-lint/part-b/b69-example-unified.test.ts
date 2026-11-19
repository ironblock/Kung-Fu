// b-69. Lines 469-481: "Unified glTF + manual animation ownership:" and the code under it.
// No network: the loaded asset is stood in for by hand-made glTF groups and no entities; the engine
// is a null engine and the scene a headless scene. The rest of the code is as written. Checked: one
// manager, driven from the scene's onBeforeRender, plays both the glTF group and the camera's property
// group, each advanced once per scene frame.
import { addAnimationGroups, addToScene, createAnimationGroups, createAnimationManager, createNullEngine, createPropertyAnimationClip, createPropertyAnimationGroup, createSceneContext, onBeforeRender, stepScene, updateAnimationManager } from "@babylonjs/lite";
import { gltf, moveClip, nodeRecorder, rest } from "./_fx";

test("one manager, ticked from onBeforeRender, plays glTF and manual groups together", () => {
    const engine = createNullEngine();
    const scene = createSceneContext(engine, { defaultRenderTask: false });
    const node = nodeRecorder();
    const shark = { entities: [] as never[], animationGroups: createAnimationGroups(gltf([moveClip("swim", 0, 10, 2)], [rest()], { targets: [node] })) };
    for (const entity of shark.entities) {
        addToScene(scene, entity);
    }
    const camera = { fov: 0 };
    const cameraClip = createPropertyAnimationClip("cam", [{ path: "fov", keys: [{ time: 0, value: 0 }, { time: 2, value: 2 }] }]);

    const manager = createAnimationManager({ engine });
    addAnimationGroups(manager, shark.animationGroups ?? []);
    const cam = createPropertyAnimationGroup(manager, camera, cameraClip, { loop: true });
    onBeforeRender(scene, (deltaMs) => updateAnimationManager(manager, deltaMs));

    stepScene(engine, scene, 250);
    stepScene(engine, scene, 250);
    expect(shark.animationGroups[0]!.currentTime).toBe(0.5);
    expect(node.p).toEqual([2.5, 0, 0]);
    expect(cam.currentTime).toBe(0.5);
    expect(camera.fov).toBe(0.5);
});

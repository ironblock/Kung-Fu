import { expect, test } from "vitest";
import { addAnimationGroup, addToScene, createAnimationGroups, createAnimationManager, createNullEngine, createSceneContext, stepScene } from "@babylonjs/lite";
import type { AssetContainer, GltfAnimationData } from "@babylonjs/lite";

// A glTF group moving node "a" along x from 0 to 10 over 1 s; t.x is the last x written.
function gltf() {
    const t = { x: -1, position: { set: (x: number) => { t.x = x; } }, rotationQuaternion: { set() {} }, scaling: { set() {} } };
    const node = { parentIdx: -1, tx: 0, ty: 0, tz: 0, rx: 0, ry: 0, rz: 0, rw: 1, sx: 1, sy: 1, sz: 1 };
    const clip = { name: "walk", duration: 1, channels: [{ samplerIdx: 0, nodeIdx: 0, path: 0 }],
        samplers: [{ input: new Float32Array([0, 1]), output: new Float32Array([0, 0, 0, 10, 0, 0]), interpolation: 0 }] };
    const data = { clips: [clip], nodes: [node], skeletons: [], morphBindings: [], nodeTargets: [t], excludedNodeIndices: new Set(), nodeNames: ["a"] };
    return { t, group: createAnimationGroups(data as unknown as GltfAnimationData)[0]! };
}

test("glTF groups pushed into scene.animationGroups, added by addToScene, then added to a manager; scene stepped 250 ms each time", () => {
    const engine = createNullEngine();
    const scene = createSceneContext(engine, { defaultRenderTask: false });
    const pushed = gltf();
    scene.animationGroups.push(pushed.group);
    stepScene(engine, scene, 250);
    expect(pushed.group.currentTime).toBe(0);
    expect(pushed.t.x).toBe(-1);
    const added = gltf();
    addToScene(scene, { entities: [], animationGroups: [added.group] } as unknown as AssetContainer);
    stepScene(engine, scene, 250);
    expect(added.group.currentTime).toBe(0.25);
    expect(added.t.x).toBe(2.5);
    addAnimationGroup(createAnimationManager(), added.group);
    stepScene(engine, scene, 250);
    expect(added.group.currentTime).toBe(0.25);
});

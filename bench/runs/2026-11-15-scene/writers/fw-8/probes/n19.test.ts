// n19: setMeshVisible writes the value down the whole subtree; a hidden light still lights.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createBox, createPointLight, createSceneContext, createTransformNode, setMeshVisible, setParent } from "@babylonjs/lite";
import { ensureSceneLightState, refreshSceneLightsUBO } from "../../babylon-lite/packages/babylon-lite/src/render/scene-lights-ubo";
import { describe, expect, it } from "vitest";

describe("n19 setMeshVisible", () => {
    it("cascades to every descendant and overwrites their own values", () => {
        const { engine } = makeGpuEngine();
        const root = createTransformNode("root");
        const a = createBox(engine);
        const b = createBox(engine);
        setParent(a, root);
        setParent(b, a);
        expect(a.visible).toBeUndefined();
        setMeshVisible(b, false);
        setMeshVisible(root, true);
        expect(b.visible).toBe(true);
        setMeshVisible(root, false);
        expect([root.visible, a.visible, b.visible]).toEqual([false, false, false]);
        setMeshVisible(b, true);
        expect(a.visible).toBe(false);
        expect(b.visible).toBe(true);
    });

    it("a hidden light is still written into the lights uniform", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const root = createTransformNode("root");
        const light = createPointLight([0, 2, 0], 2);
        setParent(light, root);
        addToScene(scene, root);
        const state = ensureSceneLightState(engine, scene);
        setMeshVisible(root, false);
        expect(light.visible).toBe(false);
        refreshSceneLightsUBO(engine, scene);
        expect(new Uint32Array(state._scratch.buffer)[0]).toBe(1);
        expect(state._scratch[4 + 4]).toBe(2);
    });
});

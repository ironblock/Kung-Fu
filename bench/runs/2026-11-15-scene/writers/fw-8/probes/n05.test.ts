// n05: addToScene does not dedupe.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createBox, createDirectionalLight, createSceneContext, removeFromScene } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n05 adding twice", () => {
    it("lists a mesh twice; one removal takes out one entry", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const box = createBox(engine);
        addToScene(scene, box);
        addToScene(scene, box);
        expect(scene.meshes).toEqual([box, box]);
        removeFromScene(scene, box);
        expect(scene.meshes).toEqual([box]);
    });

    it("lists a light twice; one removal takes out one entry", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        addToScene(scene, light);
        addToScene(scene, light);
        expect(scene.lights).toEqual([light, light]);
        removeFromScene(scene, light);
        expect(scene.lights).toEqual([light]);
    });
});

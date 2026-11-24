// n31: removing a light clears light.shadowGenerator and drops the generator from scene.shadowGenerators;
// the generator's shadow-map textures are not destroyed by it.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createDirectionalLight, createPcfDirectionalShadowGenerator, createSceneContext, removeFromScene, waitForGpuResourceRetirements } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n31 removing a shadow-casting light", () => {
    it("clears light.shadowGenerator", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        light.shadowGenerator = sg;
        addToScene(scene, light);
        removeFromScene(scene, light);
        expect(light.shadowGenerator).toBeUndefined();
        expect(scene.lights).toHaveLength(0);
    });

    it("removeFromScene(generator) alone also unlinks it from its light, which stays in the scene", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        light.shadowGenerator = sg;
        addToScene(scene, light);
        removeFromScene(scene, sg);
        expect(light.shadowGenerator).toBeUndefined();
        expect(scene.lights).toContain(light);
    });

    it("removing the light drops the generator from scene.shadowGenerators but destroys none of its textures", async () => {
        const { engine, device } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        const before = device.textures.length;
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        const made = device.textures.slice(before);
        light.shadowGenerator = sg;
        addToScene(scene, light);
        addToScene(scene, sg);
        removeFromScene(scene, light);
        await waitForGpuResourceRetirements(engine);
        expect(scene.shadowGenerators).not.toContain(sg);
        expect(made.length).toBeGreaterThan(0);
        expect(made.some((t) => t.destroyed)).toBe(false);
    });
});

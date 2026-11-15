// n09: addToScene(shadowGenerator) does nothing; the generator is not set on its light.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createBox, createDirectionalLight, createEsmDirectionalShadowGenerator, createPcfDirectionalShadowGenerator, createSceneContext, setShadowTaskCasterMeshes } from "@babylonjs/lite";
import { createShadowTask } from "../../babylon-lite/packages/babylon-lite/src/frame-graph/shadow-task";
import { describe, expect, it } from "vitest";

describe("n09 shadow generators and the scene", () => {
    it("PCF: creating and adding a generator leaves light.shadowGenerator and scene.shadowGenerators empty", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        addToScene(scene, light);
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        addToScene(scene, sg);
        expect(light.shadowGenerator).toBeUndefined();
        expect(scene.shadowGenerators).toHaveLength(0);
    });

    it("ESM: same", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        addToScene(scene, light);
        const sg = createEsmDirectionalShadowGenerator(engine, light);
        addToScene(scene, sg);
        expect(light.shadowGenerator).toBeUndefined();
        expect(scene.shadowGenerators).toHaveLength(0);
    });

    it("a generator listed in scene.shadowGenerators but not on light.shadowGenerator is never rendered", async () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        addToScene(scene, light);
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        let calls = 0;
        sg._ensureShadowTaskState = (_e, _s, casterMeshes) => {
            calls++;
            return { _task: { record() {}, dispose() {} }, _casterMeshes: casterMeshes };
        };
        sg._renderShadowMap = () => 1;
        const task = createShadowTask(engine, scene);
        scene.shadowGenerators.push(sg);
        setShadowTaskCasterMeshes(sg, [createBox(engine)]);
        await new Promise((r) => setTimeout(r, 10));
        expect(task.execute()).toBe(0);
        light.shadowGenerator = sg;
        expect(task.execute()).toBe(1);
        expect(calls).toBe(1);
    });
});

import { attachDevice } from "./scene-helpers";
import {
    addToScene,
    createBox,
    createDirectionalLight,
    createNullEngine,
    createPcfDirectionalShadowGenerator,
    createSceneContext,
    setShadowTaskCasterMeshes,
} from "@babylonjs/lite";
import type { ShadowGenerator } from "@babylonjs/lite";
import { createShadowTask } from "../../babylon-lite/packages/babylon-lite/src/frame-graph/shadow-task.ts";
import { describe, expect, it } from "vitest";

function spy(sg: ShadowGenerator): { ensure: number; render: number } {
    const calls = { ensure: 0, render: 0 };
    sg._preloadShadowTask = async () => {};
    sg._ensureShadowTaskState = () => {
        calls.ensure++;
        return { _task: { record() {}, dispose() {} }, _casterMeshes: [] };
    };
    sg._renderShadowMap = () => {
        calls.render++;
        return 1;
    };
    return calls;
}

describe("n02: a shadow generator works only through light.shadowGenerator plus caster meshes", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("is skipped while not set on its light, even with casters given", async () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        addToScene(scene, light);
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        const calls = spy(sg);
        setShadowTaskCasterMeshes(sg, [createBox(engine)]);
        await Promise.resolve();
        const task = createShadowTask(engine, scene);
        task.execute!();
        expect(calls.render).toBe(0);
        expect(light.shadowGenerator).toBeUndefined();
    });

    it("is skipped when set on the light but given no casters", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        addToScene(scene, light);
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        const calls = spy(sg);
        light.shadowGenerator = sg;
        const task = createShadowTask(engine, scene);
        task.execute!();
        expect(calls.render).toBe(0);
    });

    it("renders once set on a light in scene.lights and given casters", async () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        addToScene(scene, light);
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        const calls = spy(sg);
        light.shadowGenerator = sg;
        const task = createShadowTask(engine, scene);
        setShadowTaskCasterMeshes(sg, [createBox(engine)]);
        await new Promise((r) => setTimeout(r, 0));
        task.execute!();
        expect(calls.render).toBe(1);
    });

    it("is skipped when its light is not in scene.lights", async () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        const calls = spy(sg);
        light.shadowGenerator = sg;
        const task = createShadowTask(engine, scene);
        setShadowTaskCasterMeshes(sg, [createBox(engine)]);
        await new Promise((r) => setTimeout(r, 0));
        task.execute!();
        expect(calls.render).toBe(0);
    });

    it("addToScene(scene, generator) does not list it in scene.shadowGenerators or link the light", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        addToScene(scene, light);
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        addToScene(scene, sg);
        expect(scene.shadowGenerators).toHaveLength(0);
        expect(light.shadowGenerator).toBeUndefined();
    });

    it("setShadowTaskCasterMeshes(sg, []) counts as given: the task renders it with an empty list", async () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        addToScene(scene, light);
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        const calls = spy(sg);
        light.shadowGenerator = sg;
        const task = createShadowTask(engine, scene);
        setShadowTaskCasterMeshes(sg, []);
        await new Promise((r) => setTimeout(r, 0));
        task.execute!();
        expect(calls.render).toBe(1);
    });
});

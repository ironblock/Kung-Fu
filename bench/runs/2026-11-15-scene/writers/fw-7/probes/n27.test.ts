import { attachDevice } from "./scene-helpers";
import { addToScene, createDirectionalLight, createNullEngine, createPcfDirectionalShadowGenerator, createSceneContext, disposeScene, rebuildSceneRenderables, registerScene, removeFromScene, waitForGpuResourceRetirements } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n27: removing a light, or its generator, unlinks light.shadowGenerator", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("removeFromScene(light) clears light.shadowGenerator, and re-adding the light does not restore it", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        addToScene(scene, light);
        light.shadowGenerator = createPcfDirectionalShadowGenerator(engine, light);
        removeFromScene(scene, light);
        expect(light.shadowGenerator).toBeUndefined();
        addToScene(scene, light);
        expect(scene.lights).toContain(light);
        expect(light.shadowGenerator).toBeUndefined();
    });

    it("removeFromScene(generator) also clears its light's link but keeps the light", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        addToScene(scene, light);
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        light.shadowGenerator = sg;
        removeFromScene(scene, sg);
        expect(light.shadowGenerator).toBeUndefined();
        expect(scene.lights).toContain(light);
    });

    it("the generator's task state is not disposed at removal; it waits in the scene's pending retirements until disposeScene", async () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        addToScene(scene, light);
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        light.shadowGenerator = sg;
        let disposed = 0;
        (sg as unknown as { _shadowTaskState: unknown })._shadowTaskState = { _task: { record() {}, dispose: () => disposed++ }, _casterMeshes: [] };
        removeFromScene(scene, light);
        await new Promise((r) => setTimeout(r, 0));
        expect(disposed).toBe(0);
        expect((scene as unknown as { _pendingTopologyRetirements: unknown[] })._pendingTopologyRetirements).toHaveLength(1);
        disposeScene(scene);
        await new Promise((r) => setTimeout(r, 0));
        expect(disposed).toBe(1);
    });

    it("on a registered scene, rebuildSceneRenderables is what disposes it", async () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createDirectionalLight([0, -1, 0]);
        addToScene(scene, light);
        await registerScene(scene);
        const sg = createPcfDirectionalShadowGenerator(engine, light);
        light.shadowGenerator = sg;
        let disposed = 0;
        (sg as unknown as { _shadowTaskState: unknown })._shadowTaskState = { _task: { record() {}, dispose: () => disposed++ }, _casterMeshes: [] };
        removeFromScene(scene, light);
        await waitForGpuResourceRetirements(engine);
        expect(disposed).toBe(0);
        await rebuildSceneRenderables(scene);
        await waitForGpuResourceRetirements(engine);
        expect(disposed).toBe(1);
    });
});

// n10: a generator renders nothing until setShadowTaskCasterMeshes names its casters.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createBox, createDirectionalLight, createPcfDirectionalShadowGenerator, createSceneContext, setShadowTaskCasterMeshes } from "@babylonjs/lite";
import { createShadowTask } from "../../babylon-lite/packages/babylon-lite/src/frame-graph/shadow-task";
import { describe, expect, it } from "vitest";

function setup() {
    const { engine } = makeGpuEngine();
    const scene = createSceneContext(engine, { defaultRenderTask: false });
    const light = createDirectionalLight([0, -1, 0]);
    const sg = createPcfDirectionalShadowGenerator(engine, light);
    light.shadowGenerator = sg;
    addToScene(scene, light);
    const box = createBox(engine);
    box.receiveShadows = true;
    addToScene(scene, box);
    const casters: (readonly unknown[])[] = [];
    // Keep the scheduler real; only replace the GPU work it would call.
    sg._ensureShadowTaskState = (_e, _s, casterMeshes) => {
        casters.push(casterMeshes);
        return { _task: { record() {}, dispose() {} }, _casterMeshes: casterMeshes };
    };
    sg._renderShadowMap = () => 1;
    const task = createShadowTask(engine, scene);
    return { engine, scene, sg, box, casters, task };
}

describe("n10 shadow casters", () => {
    it("with no caster list the shadow task skips the generator, even with a receiving mesh in the scene", () => {
        const { casters, task } = setup();
        expect(task.execute()).toBe(0);
        expect(casters).toHaveLength(0);
    });

    it("after setShadowTaskCasterMeshes the generator renders exactly those meshes", async () => {
        const { sg, box, casters, task } = setup();
        setShadowTaskCasterMeshes(sg, [box]);
        await new Promise((r) => setTimeout(r, 10));
        expect(task.execute()).toBe(1);
        expect(casters[0]).toEqual([box]);
    });
});

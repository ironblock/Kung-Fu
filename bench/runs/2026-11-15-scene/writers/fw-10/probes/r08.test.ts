// r08: turn a mesh that is already drawing into thin instances, or give its instances colors, after registerScene.
// What a mesh draws as is fixed when its renderable is built.
import { makeGpuScene, frame } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import {
    addToScene,
    createBox,
    createStandardMaterial,
    markMeshRenderableDirty,
    rebuildSceneRenderables,
    registerScene,
    setThinInstanceColors,
    setThinInstances,
} from "@babylonjs/lite";

const T = (x: number): number[] => [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, 0, 0, 1];
const frames = async (g: ReturnType<typeof makeGpuScene>): Promise<void> => {
    for (let i = 0; i < 8; i++) {
        frame(g.engine, g.scene);
        await new Promise((r) => setTimeout(r, 5));
    }
};

async function running(withInstances: boolean) {
    const g = makeGpuScene({ renderTask: true });
    const box = createBox(g.engine, 1);
    box.material = createStandardMaterial();
    if (withInstances) setThinInstances(box, new Float32Array([...T(0), ...T(2)]), 2);
    addToScene(g.scene, box);
    await registerScene(g.scene);
    await frames(g);
    return { g, box };
}

describe("r08 thin instances on a running scene", () => {
    it("set before registerScene: the instance buffer is created", async () => {
        const { box } = await running(true);
        expect(box.thinInstances!._gpuBuffer).toBeTruthy();
    });

    it("without markMeshRenderableDirty after setThinInstances on a built mesh: no instance buffer is ever made", async () => {
        const { g, box } = await running(false);
        setThinInstances(box, new Float32Array([...T(0), ...T(2)]), 2);
        await frames(g);
        expect(box.thinInstances!._gpuBuffer).toBeNull();
        markMeshRenderableDirty(box);
        await frames(g);
        expect(box.thinInstances!._gpuBuffer).toBeTruthy();
    });

    it("rebuildSceneRenderables also picks the instances up", async () => {
        const { g, box } = await running(false);
        setThinInstances(box, new Float32Array([...T(0), ...T(2)]), 2);
        await rebuildSceneRenderables(g.scene);
        await frames(g);
        expect(box.thinInstances!._gpuBuffer).toBeTruthy();
    });

    it("a new mesh that already has instances, added after registerScene, gets its buffer", async () => {
        const { g } = await running(false);
        const late = createBox(g.engine, 1);
        late.material = createStandardMaterial();
        setThinInstances(late, new Float32Array([...T(0), ...T(2)]), 2);
        addToScene(g.scene, late);
        await frames(g);
        expect(late.thinInstances!._gpuBuffer).toBeTruthy();
    });

    it("without markMeshRenderableDirty after the first setThinInstanceColors on a built mesh: colors are never uploaded", async () => {
        const { g, box } = await running(true);
        setThinInstanceColors(box, new Float32Array([1, 0, 0, 1, 0, 1, 0, 1]));
        await frames(g);
        expect(box.thinInstances!._colorGpuBuffer).toBeNull();
        markMeshRenderableDirty(box);
        await frames(g);
        expect(box.thinInstances!._colorGpuBuffer).toBeTruthy();
    });
});

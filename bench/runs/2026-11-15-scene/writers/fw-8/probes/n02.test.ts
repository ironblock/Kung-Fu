// n02: re-adding right after removal does not throw, but the queued disposal still runs; a clone keeps shared buffers.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, cloneTransformNode, createBox, createSceneContext, removeFromScene, waitForGpuResourceRetirements } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n02 re-adding a just-removed mesh", () => {
    it("is accepted, yet the mesh is disposed while it sits in the scene", async () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const box = createBox(engine);
        addToScene(scene, box);
        removeFromScene(scene, box);
        expect(() => addToScene(scene, box)).not.toThrow();
        await waitForGpuResourceRetirements(engine);
        expect(scene.meshes).toContain(box);
        expect(box._disposed).toBe(true);
        expect((box._gpu.indexBuffer as unknown as { destroyed: boolean }).destroyed).toBe(true);
    });

    it("with a cloneTransformNode clone sharing the geometry, the re-added mesh still ends disposed but its buffers stay alive", async () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const box = createBox(engine);
        cloneTransformNode(box as never);
        addToScene(scene, box);
        removeFromScene(scene, box);
        expect(() => addToScene(scene, box)).not.toThrow();
        await waitForGpuResourceRetirements(engine);
        expect(scene.meshes).toContain(box);
        expect(box._disposed).toBe(true);
        expect((box._gpu.indexBuffer as unknown as { destroyed: boolean }).destroyed).toBe(false);
    });
});

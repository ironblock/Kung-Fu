// n01: removeFromScene disposes a mesh leaving its last scene; afterwards addToScene throws; buffers a clone shares survive.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, cloneTransformNode, createBox, createSceneContext, removeFromScene, waitForGpuResourceRetirements } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n01 removing a mesh from its last scene disposes it", () => {
    it("destroys its buffers once retirements drain, and addToScene then throws", async () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const box = createBox(engine);
        addToScene(scene, box);
        removeFromScene(scene, box);
        await waitForGpuResourceRetirements(engine);
        expect((box._gpu.positionBuffer as unknown as { destroyed: boolean }).destroyed).toBe(true);
        expect(() => addToScene(scene, box)).toThrow(/disposed/);
        const other = createSceneContext(engine, { defaultRenderTask: false });
        expect(() => addToScene(other, box)).toThrow(/disposed/);
    });

    it("a mesh still held by another scene is not disposed and can be added back", async () => {
        const { engine } = makeGpuEngine();
        const a = createSceneContext(engine, { defaultRenderTask: false });
        const b = createSceneContext(engine, { defaultRenderTask: false });
        const box = createBox(engine);
        addToScene(a, box);
        addToScene(b, box);
        removeFromScene(a, box);
        await waitForGpuResourceRetirements(engine);
        expect((box._gpu.positionBuffer as unknown as { destroyed: boolean }).destroyed).toBe(false);
        expect(() => addToScene(a, box)).not.toThrow();
    });

    it("a cloneTransformNode clone sharing the geometry keeps the buffers alive, though addToScene still throws", async () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const box = createBox(engine);
        const clone = cloneTransformNode(box as never) as typeof box;
        addToScene(scene, box);
        removeFromScene(scene, box);
        await waitForGpuResourceRetirements(engine);
        expect(box._disposed).toBe(true);
        expect((box._gpu.positionBuffer as unknown as { destroyed: boolean }).destroyed).toBe(false);
        expect(() => addToScene(scene, box)).toThrow(/disposed/);
        // once the clone leaves its last scene too, the shared buffers go
        addToScene(scene, clone);
        removeFromScene(scene, clone);
        await waitForGpuResourceRetirements(engine);
        expect((box._gpu.positionBuffer as unknown as { destroyed: boolean }).destroyed).toBe(true);
    });
});

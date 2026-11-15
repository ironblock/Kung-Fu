import { attachDevice } from "./scene-helpers";
import { addToScene, createBox, createFreeCamera, createNullEngine, createPointLight, createSceneContext, disposeScene, waitForGpuResourceRetirements } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n33: disposeScene empties the scene and disposes meshes it held last", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("lists are emptied, camera null; a mesh only in that scene cannot be added elsewhere", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const box = createBox(engine);
        addToScene(scene, box);
        addToScene(scene, createPointLight([0, 0, 0]));
        addToScene(scene, createFreeCamera({ x: 0, y: 0, z: -5 }, { x: 0, y: 0, z: 0 }));
        disposeScene(scene);
        expect(scene.meshes).toHaveLength(0);
        expect(scene.lights).toHaveLength(0);
        expect(scene.camera).toBeNull();
        expect(box._disposed).toBe(true);
        expect(() => addToScene(createSceneContext(engine, { defaultRenderTask: false }), box)).toThrow(/disposed/);
    });

    it("a mesh also held by another scene survives", async () => {
        const a = createSceneContext(engine, { defaultRenderTask: false });
        const b = createSceneContext(engine, { defaultRenderTask: false });
        const box = createBox(engine);
        addToScene(a, box);
        addToScene(b, box);
        disposeScene(a);
        await waitForGpuResourceRetirements(engine);
        expect(box._disposed).toBeFalsy();
        expect(b.meshes).toContain(box);
    });
});

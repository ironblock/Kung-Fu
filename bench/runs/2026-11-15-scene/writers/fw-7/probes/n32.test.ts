import { attachDevice } from "./scene-helpers";
import { addToScene, createBox, createNullEngine, createSceneContext } from "@babylonjs/lite";
import type { Material } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n32: a mesh with material null is accepted by addToScene but joins no build group", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("listed in scene.meshes, no group, nothing queued", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const box = createBox(engine);
        expect(() => addToScene(scene, box)).not.toThrow();
        expect(scene.meshes).toContain(box);
        expect(scene._groups.size).toBe(0);
        expect(scene._materialSwapQueue).toHaveLength(0);
    });

    it("assigning mesh.material after addToScene queues the mesh for a (re)build", () => {
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const box = createBox(engine);
        addToScene(scene, box);
        box.material = {} as Material;
        expect(scene._materialSwapQueue).toContain(box);
    });
});

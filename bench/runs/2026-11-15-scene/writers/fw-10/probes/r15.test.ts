// r15: copies of a mesh that can be added and removed on their own: cloneTransformNode.
import { makeGpuScene, endFrame } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import { addToScene, cloneTransformNode, createBox, createStandardMaterial, removeFromScene } from "@babylonjs/lite";
import type { Mesh } from "@babylonjs/lite";

describe("r15 cloning meshes", () => {
    it("the clone shares geometry and material, is named <name>_clone, and is not in the scene until added", () => {
        const { engine, scene } = makeGpuScene();
        const crate = createBox(engine, 1);
        crate.name = "crate";
        crate.material = createStandardMaterial();
        crate.position.set(1, 2, 3);
        addToScene(scene, crate);
        const copy = cloneTransformNode(crate) as Mesh;
        expect(copy.name).toBe("crate_clone");
        expect(copy._gpu).toBe(crate._gpu);
        expect(copy.material).toBe(crate.material);
        expect([copy.position.x, copy.position.y, copy.position.z]).toEqual([1, 2, 3]);
        expect(scene.meshes).not.toContain(copy);
        addToScene(scene, copy);
        expect(scene.meshes).toContain(copy);
    });

    it("removing the original retires only the original; the clone's buffers survive", async () => {
        const { engine, scene } = makeGpuScene();
        const crate = createBox(engine, 1);
        crate.material = createStandardMaterial();
        const copy = cloneTransformNode(crate) as Mesh;
        addToScene(scene, crate);
        addToScene(scene, copy);
        removeFromScene(scene, crate);
        await endFrame(engine);
        expect(crate._disposed).toBe(true);
        expect(copy._disposed).toBeFalsy();
        expect((copy._gpu.positionBuffer as unknown as { destroyed: boolean }).destroyed).toBe(false);
        removeFromScene(scene, copy);
        await endFrame(engine);
        expect((copy._gpu.positionBuffer as unknown as { destroyed: boolean }).destroyed).toBe(true);
    });

    it("without cloning before the original is removed: cloning a retired mesh throws", async () => {
        const { engine, scene } = makeGpuScene();
        const crate = createBox(engine, 1);
        crate.material = createStandardMaterial();
        addToScene(scene, crate);
        removeFromScene(scene, crate);
        await endFrame(engine);
        expect(() => cloneTransformNode(crate)).toThrow(/cannot be cloned/);
    });
});

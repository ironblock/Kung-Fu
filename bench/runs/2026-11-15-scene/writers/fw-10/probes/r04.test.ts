// r04: take a mesh out for a while. removeFromScene retires a mesh for good; setMeshVisible hides it.
import { makeGpuScene, endFrame } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import { addToScene, createBox, createDefaultCamera, createSceneContext, createStandardMaterial, removeFromScene, setMeshVisible } from "@babylonjs/lite";

function boxIn(engine: Parameters<typeof createBox>[0], x = 0) {
    const box = createBox(engine, 1);
    box.material = createStandardMaterial();
    box.position.set(x, 0, 0);
    return box;
}

describe("r04 hide instead of remove", () => {
    it("setMeshVisible(mesh, false) keeps the mesh in the scene, flags it and its children, and re-showing works", async () => {
        const { engine, scene } = makeGpuScene();
        const box = boxIn(engine);
        const child = boxIn(engine);
        box.children.push(child);
        addToScene(scene, box);
        setMeshVisible(box, false);
        expect(scene.meshes).toContain(box);
        expect(box.visible).toBe(false);
        expect(child.visible).toBe(false);
        await endFrame(engine);
        setMeshVisible(box, true);
        expect(box.visible).toBe(true);
        expect(child.visible).toBe(true);
    });

    it("a hidden mesh is left out of createDefaultCamera's framing", () => {
        const { engine, scene } = makeGpuScene();
        const a = boxIn(engine, 0);
        const far = boxIn(engine, 100);
        addToScene(scene, a);
        addToScene(scene, far);
        setMeshVisible(far, false);
        const cam = createDefaultCamera(scene);
        expect(cam.target.x).toBeCloseTo(0);
    });

    it("writing mesh.visible directly does not reach the children", () => {
        const { engine, scene } = makeGpuScene();
        const box = boxIn(engine);
        const child = boxIn(engine);
        box.children.push(child);
        addToScene(scene, box);
        (box as { visible?: boolean }).visible = false;
        expect(child.visible).not.toBe(false);
    });

    it("without it (removeFromScene instead): children go too, and after the next frame the mesh cannot be added back", async () => {
        const { engine, scene } = makeGpuScene();
        const box = boxIn(engine);
        const child = boxIn(engine);
        box.children.push(child);
        addToScene(scene, box);
        expect(scene.meshes).toEqual([box, child]);
        removeFromScene(scene, box);
        expect(scene.meshes).toEqual([]);
        expect(child.parent).toBeNull();
        await endFrame(engine);
        expect(box._disposed).toBe(true);
        expect(() => addToScene(scene, box)).toThrow(/cannot be added/);
        expect(() => addToScene(scene, child)).toThrow(/cannot be added/);
    });

    it("a mesh held by a second scene is not retired when one scene drops it", async () => {
        const { engine, scene } = makeGpuScene();
        const other = createSceneContext(engine, { defaultRenderTask: false });
        const box = boxIn(engine);
        addToScene(scene, box);
        addToScene(other, box);
        removeFromScene(scene, box);
        await endFrame(engine);
        expect(box._disposed).toBeFalsy();
        expect(() => addToScene(scene, box)).not.toThrow();
    });
});

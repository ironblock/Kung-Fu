// r01: show a mesh. A factory mesh has no material; without one it is never drawn.
import { makeGpuScene, frame } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import { addToScene, createBox, createGround, createLines, createSphere, createStandardMaterial, registerScene } from "@babylonjs/lite";

describe("r01 show a mesh", () => {
    it("steps: material, add, register; a mesh added after registration is built on the next frame", async () => {
        const { engine, scene } = makeGpuScene({ renderTask: true });
        const box = createBox(engine, { size: 2 });
        expect(box.material).toBeNull();
        box.material = createStandardMaterial();
        addToScene(scene, box);
        await registerScene(scene);
        expect(scene._renderables.filter((r) => r.mesh === box || r.mesh === undefined).length).toBeGreaterThan(0);
        const before = scene._renderables.length;

        const late = createBox(engine, 1);
        late.material = createStandardMaterial();
        addToScene(scene, late);
        expect(scene.meshes).toContain(late);
        expect(scene._renderables.length).toBe(before);
        for (let i = 0; i < 8; i++) {
            frame(engine, scene);
            await new Promise((r) => setTimeout(r, 5));
        }
        expect(scene._renderables.length).toBeGreaterThan(before);
    });

    it("without a material: the mesh is in scene.meshes, no error, and nothing is built for it", async () => {
        const { engine, scene } = makeGpuScene({ renderTask: true });
        const box = createBox(engine, 1);
        addToScene(scene, box);
        await expect(registerScene(scene)).resolves.toBeUndefined();
        frame(engine, scene);
        expect(scene.meshes).toContain(box);
        expect(scene._renderables.length).toBe(0);
    });

    it("assigning the material later (even after registerScene) builds the mesh on the following frames", async () => {
        const { engine, scene } = makeGpuScene({ renderTask: true });
        const box = createBox(engine, 1);
        addToScene(scene, box);
        await registerScene(scene);
        box.material = createStandardMaterial();
        for (let i = 0; i < 8; i++) {
            frame(engine, scene);
            await new Promise((r) => setTimeout(r, 5));
        }
        expect(scene._renderables.length).toBeGreaterThan(0);
    });

    it("shape factories assign no material, but createLines assigns a line material and is built with none set", async () => {
        const { engine, scene } = makeGpuScene({ renderTask: true });
        expect(createSphere(engine, { diameter: 1 }).material).toBeNull();
        expect(createGround(engine, { width: 2, height: 2 }).material).toBeNull();
        const line = createLines(engine, { points: [{ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 1 }] });
        expect(line.material).not.toBeNull();
        addToScene(scene, line);
        await registerScene(scene);
        frame(engine, scene);
        expect(scene._renderables.length).toBeGreaterThan(0);
    });
});

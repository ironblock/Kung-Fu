// r01: put a mesh on screen (material, camera, registration).
import { makeGpuScene, drawsOfFrame, sceneUniforms, frame } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import { addToScene, createBox, createDefaultCamera, createStandardMaterial, registerScene } from "@babylonjs/lite";

describe("r01 a mesh that draws", () => {
    it("with material and a camera framed after the meshes: drawn, scene uniforms written, camera fits the box", async () => {
        const { scene, engine, log } = makeGpuScene();
        const box = createBox(engine, 2);
        box.material = createStandardMaterial() as never;
        box.position.x = 10;
        addToScene(scene, box);
        const cam = createDefaultCamera(scene);
        await registerScene(scene);
        const draws = drawsOfFrame(engine, scene, log);
        expect(draws).toHaveLength(1);
        expect(draws[0]!.count).toBe(36);
        expect(sceneUniforms(scene).writes).toBeGreaterThan(0);
        expect(scene.camera).toBe(cam);
        expect(cam.target.x).toBeCloseTo(10);
        expect(cam.radius).toBeCloseTo(Math.sqrt(12) * 1.5);
    });

    it("without a material: added and registered with no error, never drawn", async () => {
        const { scene, engine, log } = makeGpuScene();
        const box = createBox(engine, 2);
        addToScene(scene, box);
        createDefaultCamera(scene);
        await registerScene(scene);
        expect(scene.meshes).toContain(box);
        expect(drawsOfFrame(engine, scene, log)).toHaveLength(0);
    });

    it("without a camera: the mesh is drawn but the scene uniforms are never written", async () => {
        const { scene, engine, log } = makeGpuScene();
        const box = createBox(engine, 2);
        box.material = createStandardMaterial() as never;
        addToScene(scene, box);
        await registerScene(scene);
        frame(engine, scene);
        expect(drawsOfFrame(engine, scene, log)).toHaveLength(1);
        expect(scene.camera).toBeNull();
        expect(sceneUniforms(scene).writes).toBe(0);
        expect(Array.from(sceneUniforms(scene).floats.slice(0, 16)).every((v) => v === 0)).toBe(true);
    });

    it("with createDefaultCamera called before the meshes are added: radius 1 at the origin", async () => {
        const { scene, engine } = makeGpuScene();
        const cam = createDefaultCamera(scene);
        const box = createBox(engine, 2);
        box.material = createStandardMaterial() as never;
        box.position.x = 10;
        addToScene(scene, box);
        await registerScene(scene);
        expect(cam.radius).toBe(1);
        expect([cam.target.x, cam.target.y, cam.target.z]).toEqual([0, 0, 0]);
    });
});

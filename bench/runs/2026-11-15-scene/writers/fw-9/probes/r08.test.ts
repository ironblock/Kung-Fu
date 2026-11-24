// r08: linear fog, and changing it while running.
import { makeGpuScene, drawsOfFrame, frame, sceneUniforms } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import { addToScene, createBox, createFreeCamera, createStandardMaterial, registerScene, setFog } from "@babylonjs/lite";

type Fog = { mode: 0 | 1 | 2 | 3; start: number; end: number; density: number; color: [number, number, number] };
const linear = (): Fog => ({ mode: 3, start: 2, end: 20, density: 0, color: [0.5, 0.5, 0.5] });

async function scene(how: "setFog-before" | "assign-before" | "setFog-after") {
    const s = makeGpuScene();
    const camera = createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
    addToScene(s.scene, camera);
    const box = createBox(s.engine, 1);
    box.material = createStandardMaterial() as never;
    addToScene(s.scene, box);
    if (how === "setFog-before") setFog(s.scene, linear());
    if (how === "assign-before") s.scene.fog = linear();
    await registerScene(s.scene);
    if (how === "setFog-after") setFog(s.scene, linear());
    const draws = drawsOfFrame(s.engine, s.scene, s.log);
    const fogInfo = () => Array.from(sceneUniforms(s.scene).floats.slice(80, 84));
    return { ...s, camera, fogInWgsl: draws[0]!.fragmentCode.includes("calcFogFactor"), fogInfo };
}

describe("r08 fog", () => {
    it("setFog before registerScene: fog WGSL in the box's pipeline and mode/start/end in the scene uniforms", async () => {
        const r = await scene("setFog-before");
        expect(r.fogInWgsl).toBe(true);
        expect(r.fogInfo()).toEqual([3, 2, 20, 0]);
    });

    it("changing fog later with a new object through setFog is uploaded", async () => {
        const r = await scene("setFog-before");
        setFog(r.scene, { ...linear(), end: 50 });
        frame(r.engine, r.scene);
        expect(r.fogInfo()).toEqual([3, 2, 50, 0]);
    });

    it("with an in-place edit of scene.fog: not uploaded", async () => {
        const r = await scene("setFog-before");
        r.scene.fog!.end = 50;
        frame(r.engine, r.scene);
        expect(r.fogInfo()).toEqual([3, 2, 20, 0]);
    });

    it("an in-place edit is uploaded at the next camera move", async () => {
        const r = await scene("setFog-before");
        r.scene.fog!.end = 50;
        frame(r.engine, r.scene);
        frame(r.engine, r.scene);
        expect(r.fogInfo()).toEqual([3, 2, 20, 0]);
        r.camera.position.x = 1;
        frame(r.engine, r.scene);
        expect(r.fogInfo()).toEqual([3, 2, 50, 0]);
    });

    it("with scene.fog = {...} instead of setFog: fog WGSL is built but the fog uniforms stay 0 (mode 0)", async () => {
        const r = await scene("assign-before");
        expect(r.fogInWgsl).toBe(true);
        expect(r.fogInfo()).toEqual([0, 0, 0, 0]);
    });

    it("with setFog only after registerScene: the uniforms are written but the box's pipeline has no fog WGSL", async () => {
        const r = await scene("setFog-after");
        expect(r.fogInfo()).toEqual([3, 2, 20, 0]);
        expect(r.fogInWgsl).toBe(false);
    });
});

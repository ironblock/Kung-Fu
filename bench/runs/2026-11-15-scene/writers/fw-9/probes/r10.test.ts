// r10: a scene with more than 16 lights.
import { makeGpuScene, drawsOfFrame, frame, lightCountOf, lightsBuffer } from "./scene-helpers";
import { afterEach, describe, expect, it } from "vitest";
import { addToScene, createBox, createFreeCamera, createPointLight, createStandardMaterial, registerScene, setMaxLights } from "@babylonjs/lite";

async function eighteen() {
    const s = makeGpuScene();
    addToScene(s.scene, createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 }));
    const box = createBox(s.engine, 1);
    box.material = createStandardMaterial() as never;
    addToScene(s.scene, box);
    for (let i = 0; i < 18; i++) addToScene(s.scene, createPointLight([i, 3, 0]));
    await registerScene(s.scene);
    frame(s.engine, s.scene);
    return { ...s, box };
}

describe("r10 more than 16 lights", () => {
    afterEach(() => setMaxLights(16));

    it("setMaxLights(20) before building: all 18 lights in the buffer and on the box, shader arrays sized 20", async () => {
        setMaxLights(20);
        const { scene, engine, log, box } = await eighteen();
        expect(lightsBuffer(scene).count).toBe(18);
        expect(lightCountOf(box, log)).toBe(18);
        expect(drawsOfFrame(engine, scene, log)[0]!.fragmentCode).toMatch(/array<LightEntry, 20>/);
    });

    it("without setMaxLights: 18 lights in scene.lights, only the first 16 uploaded and lighting the box, no error", async () => {
        const { scene, log, box } = await eighteen();
        expect(scene.lights).toHaveLength(18);
        expect(lightsBuffer(scene).count).toBe(16);
        expect(lightCountOf(box, log)).toBe(16);
    });
});

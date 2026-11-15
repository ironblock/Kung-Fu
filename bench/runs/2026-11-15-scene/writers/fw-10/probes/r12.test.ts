// r12: more than 16 lights. The cap is scene-wide; lights past it are dropped without an error.
import { makeGpuScene, frame, lightCount, lightsUploads } from "./scene-helpers";
import { afterEach, describe, expect, it } from "vitest";
import { addToScene, createBox, createPointLight, createStandardMaterial, MAX_LIGHTS, registerScene, setMaxLights } from "@babylonjs/lite";

afterEach(() => setMaxLights(16));

async function withLights(n: number) {
    const g = makeGpuScene({ renderTask: true });
    const box = createBox(g.engine, 1);
    box.material = createStandardMaterial();
    addToScene(g.scene, box);
    for (let i = 0; i < n; i++) addToScene(g.scene, createPointLight([i, 3, 0]));
    await registerScene(g.scene);
    frame(g.engine, g.scene);
    return { scene: g.scene, upload: lightsUploads(g.scene, g.device).at(-1)! };
}

describe("r12 light cap", () => {
    it("without setMaxLights: 20 lights are all in scene.lights, but only the first 16 are uploaded", async () => {
        expect(MAX_LIGHTS).toBe(16);
        const r = await withLights(20);
        expect(r.scene.lights).toHaveLength(20);
        expect(lightCount(r.upload)).toBe(16);
    });

    it("setMaxLights(n) before the scene is built uploads all n", async () => {
        setMaxLights(20);
        const r = await withLights(20);
        expect(lightCount(r.upload)).toBe(20);
        expect(r.upload.length).toBe(4 + 20 * 16);
    });
});

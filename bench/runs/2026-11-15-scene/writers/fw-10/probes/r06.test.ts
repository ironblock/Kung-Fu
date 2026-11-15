// r06: change a light while the scene runs. The lights buffer is re-uploaded only when a light's version moves.
import { makeGpuScene, frame, lightsUploads } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import {
    addToScene,
    createBox,
    createDirectionalLight,
    createHemisphericLight,
    createSpotLight,
    createStandardMaterial,
    registerScene,
    setLightDiffuseColor,
    setLightIntensity,
} from "@babylonjs/lite";
import type { LightBase } from "@babylonjs/lite";

async function sceneWith(light: LightBase) {
    const g = makeGpuScene({ renderTask: true });
    const box = createBox(g.engine, 1);
    box.material = createStandardMaterial();
    addToScene(g.scene, box);
    addToScene(g.scene, light);
    await registerScene(g.scene);
    frame(g.engine, g.scene);
    const uploads = () => lightsUploads(g.scene, g.device);
    return { ...g, uploads };
}

describe("r06 runtime light changes", () => {
    it("setLightIntensity / setLightDiffuseColor / direction.set reach the lights buffer on the next frame", async () => {
        const light = createDirectionalLight([0, -1, 0]);
        const s = await sceneWith(light);
        const n = s.uploads().length;
        setLightIntensity(light, 2);
        setLightDiffuseColor(light, [1, 0.5, 0]);
        frame(s.engine, s.scene);
        expect(s.uploads().length).toBe(n + 1);
        expect(Array.from(s.uploads().at(-1)!.slice(8, 11))).toEqual([2, 1, 0]);
        light.direction.set(1, 0, 0);
        frame(s.engine, s.scene);
        expect(Array.from(s.uploads().at(-1)!.slice(4, 7))).toEqual([1, 0, 0]);
    });

    it("without them (plain writes to intensity / diffuse): nothing is uploaded and the old values stay", async () => {
        const light = createDirectionalLight([0, -1, 0]);
        const s = await sceneWith(light);
        const n = s.uploads().length;
        light.intensity = 3;
        light.diffuse = [1, 0, 0];
        light.diffuse[1] = 1;
        frame(s.engine, s.scene);
        frame(s.engine, s.scene);
        expect(s.uploads().length).toBe(n);
        expect(Array.from(s.uploads().at(-1)!.slice(8, 11))).toEqual([1, 1, 1]);
    });

    it("hemispheric light: diffuseColor/groundColor have no setter; a write plus _bumpLightVersion uploads them", async () => {
        const hemi = createHemisphericLight([0, 1, 0], 1);
        const s = await sceneWith(hemi);
        const n = s.uploads().length;
        hemi.groundColor = [0.2, 0.2, 0.2];
        frame(s.engine, s.scene);
        expect(s.uploads().length).toBe(n);
        hemi._bumpLightVersion?.();
        frame(s.engine, s.scene);
        expect(s.uploads().length).toBe(n + 1);
        expect(s.uploads().at(-1)![4 + 12]).toBeCloseTo(0.2);
    });

    it("spot light: writing angle (full cone, radians) uploads cos(angle/2); writing range does not upload", async () => {
        const spot = createSpotLight([0, 5, 0], [0, -1, 0], Math.PI / 2, 2);
        const s = await sceneWith(spot);
        expect(s.uploads().at(-1)![4 + 15]).toBeCloseTo(Math.cos(Math.PI / 4));
        const n = s.uploads().length;
        spot.range = 10;
        frame(s.engine, s.scene);
        expect(s.uploads().length).toBe(n);
        spot.angle = Math.PI / 3;
        frame(s.engine, s.scene);
        expect(s.uploads().length).toBe(n + 1);
        expect(s.uploads().at(-1)![4 + 15]).toBeCloseTo(Math.cos(Math.PI / 6));
        expect(s.uploads().at(-1)![4 + 7]).toBe(10);
    });
});

// r05: change a light's brightness and colour while the scene runs.
import { makeGpuScene, frame, lightsBuffer } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import {
    addToScene,
    createBox,
    createFreeCamera,
    createHemisphericLight,
    createPointLight,
    createStandardMaterial,
    registerScene,
    setLightDiffuseColor,
    setLightIntensity,
} from "@babylonjs/lite";

async function running() {
    const s = makeGpuScene();
    addToScene(s.scene, createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 }));
    const box = createBox(s.engine, 1);
    box.material = createStandardMaterial() as never;
    addToScene(s.scene, box);
    const lamp = createPointLight([0, 5, 0]);
    addToScene(s.scene, lamp);
    await registerScene(s.scene);
    frame(s.engine, s.scene);
    // Light 0's entry starts at float 4; diffuse*intensity at +4..+6, range at +7.
    const diffuse = () => Array.from(lightsBuffer(s.scene).floats.slice(8, 11));
    const range = () => lightsBuffer(s.scene).floats[11];
    return { ...s, lamp, diffuse, range };
}

const box0 = (scene: { meshes: { position: { x: number } }[] }) => scene.meshes[0]!;

describe("r05 runtime light changes", () => {
    it("setLightIntensity and setLightDiffuseColor reach the lights buffer on the next frame", async () => {
        const { scene, engine, lamp, diffuse } = await running();
        setLightIntensity(lamp, 3);
        frame(engine, scene);
        expect(diffuse()).toEqual([3, 3, 3]);
        setLightDiffuseColor(lamp, [1, 0, 0]);
        frame(engine, scene);
        expect(diffuse()).toEqual([3, 0, 0]);
    });

    it("with plain writes (intensity, diffuse, range): nothing is uploaded until the light moves", async () => {
        const { scene, engine, lamp, diffuse, range } = await running();
        lamp.intensity = 3;
        lamp.diffuse[1] = 0;
        lamp.range = 5;
        frame(engine, scene);
        expect(diffuse()).toEqual([1, 1, 1]);
        expect(range()).toBe(Infinity);
        lamp.position.x = 1;
        frame(engine, scene);
        expect(diffuse()).toEqual([3, 0, 3]);
        expect(range()).toBe(5);
    });

    it("a plain write is also uploaded when another light in the scene moves or gets a setLight* call", async () => {
        const { scene, engine, lamp, diffuse } = await running();
        const other = createPointLight([5, 5, 0]);
        addToScene(scene, other);
        frame(engine, scene);
        lamp.intensity = 3;
        box0(scene).position.x = 2; // a mesh move does not do it
        frame(engine, scene);
        expect(diffuse()).toEqual([1, 1, 1]);
        setLightIntensity(other, 2);
        frame(engine, scene);
        expect(diffuse()).toEqual([3, 3, 3]);
        lamp.intensity = 4;
        other.position.x = 6;
        frame(engine, scene);
        expect(diffuse()).toEqual([4, 4, 4]);
    });

    it("with a plain write first, setLightIntensity to the same value does nothing", async () => {
        const { scene, engine, lamp, diffuse } = await running();
        lamp.intensity = 3;
        setLightIntensity(lamp, 3);
        frame(engine, scene);
        expect(diffuse()).toEqual([1, 1, 1]);
    });

    it("setLightDiffuseColor on a hemispheric light throws: its colours are diffuseColor and groundColor", () => {
        const sky = createHemisphericLight([0, 1, 0]);
        expect(() => setLightDiffuseColor(sky as never, [1, 0, 0])).toThrow(TypeError);
        expect(sky.diffuseColor).toEqual([1, 1, 1]);
        expect(sky.groundColor).toEqual([0, 0, 0]);
    });
});

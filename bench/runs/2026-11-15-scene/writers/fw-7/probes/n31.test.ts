import { attachDevice, floats } from "./scene-helpers";
import { addToScene, createHemisphericLight, createNullEngine, createSceneContext, setLightIntensity } from "@babylonjs/lite";
import { refreshSceneLightsUBO } from "../../babylon-lite/packages/babylon-lite/src/render/scene-lights-ubo.ts";
import { describe, expect, it } from "vitest";

// Hemispheric entry 0: [dir.xyz, 3, diffuseColor*i, _, specularColor*i, _, groundColor*i, _] from float 4.
describe("n31: hemispheric colors change on the GPU only after light._bumpLightVersion()", () => {
    function setup() {
        const engine = createNullEngine();
        attachDevice(engine);
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createHemisphericLight();
        addToScene(scene, light);
        const buf = refreshSceneLightsUBO(engine, scene);
        return { engine, scene, light, buf };
    }

    it("defaults: direction [0,1,0], groundColor [0,0,0]", () => {
        const { light, buf } = setup();
        expect([light.direction.x, light.direction.y, light.direction.z]).toEqual([0, 1, 0]);
        expect(light.groundColor).toEqual([0, 0, 0]);
        expect(Array.from(floats(buf).slice(16, 19))).toEqual([0, 0, 0]);
    });

    it("writing groundColor and diffuseColor is not uploaded; _bumpLightVersion makes it so", () => {
        const { engine, scene, light, buf } = setup();
        light.groundColor = [0.5, 0, 0];
        light.diffuseColor[1] = 0;
        refreshSceneLightsUBO(engine, scene);
        expect(floats(buf)[16]).toBe(0);
        expect(floats(buf)[9]).toBe(1);
        light._bumpLightVersion!();
        refreshSceneLightsUBO(engine, scene);
        expect(floats(buf)[16]).toBe(0.5);
        expect(floats(buf)[9]).toBe(0);
    });

    it("setLightIntensity also flushes the pending color writes, all scaled by intensity", () => {
        const { engine, scene, light, buf } = setup();
        light.groundColor = [0.5, 0, 0];
        setLightIntensity(light, 2);
        refreshSceneLightsUBO(engine, scene);
        expect(floats(buf)[16]).toBe(1);
        expect(floats(buf)[8]).toBe(2);
    });

    it("a pending color write is also uploaded after direction.set, or when another light is added", () => {
        const { engine, scene, light, buf } = setup();
        light.groundColor = [0.5, 0, 0];
        light.direction.set(0, 1, 0);
        refreshSceneLightsUBO(engine, scene);
        expect(floats(buf)[16]).toBe(0.5);
        light.groundColor = [0.25, 0, 0];
        addToScene(scene, createHemisphericLight());
        const b2 = refreshSceneLightsUBO(engine, scene);
        expect(floats(b2)[16]).toBe(0.25);
    });
});

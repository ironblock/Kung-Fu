import { attachDevice, floats } from "./scene-helpers";
import { addToScene, createNullEngine, createPointLight, createSceneContext, createSpotLight, removeFromScene, setLightDiffuseColor, setLightIntensity } from "@babylonjs/lite";
import { refreshSceneLightsUBO } from "../../babylon-lite/packages/babylon-lite/src/render/scene-lights-ubo.ts";
import { describe, expect, it } from "vitest";

// Entry 0 starts at float 4: [pos.xyz, type, diffuse*intensity.rgb, range, specular*intensity.rgb, exponent, ...]
describe("n07: plain field writes on a light are not uploaded; the setters and observable writes are", () => {
    function setup() {
        const engine = createNullEngine();
        const device = attachDevice(engine);
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const light = createPointLight([0, 0, 0], 1);
        addToScene(scene, light);
        const buf = refreshSceneLightsUBO(engine, scene);
        return { engine, device, scene, light, buf };
    }

    it("light.intensity = 3 leaves the uploaded intensity at 1; setLightIntensity uploads it", () => {
        const { engine, scene, light, buf } = setup();
        light.intensity = 3;
        refreshSceneLightsUBO(engine, scene);
        expect(floats(buf)[8]).toBe(1);
        setLightIntensity(light, 4);
        refreshSceneLightsUBO(engine, scene);
        expect(floats(buf)[8]).toBe(4);
    });

    it("light.diffuse = [...] and light.range = 5 are not uploaded; setLightDiffuseColor is", () => {
        const { engine, scene, light, buf } = setup();
        light.diffuse = [1, 0, 0];
        light.range = 5;
        refreshSceneLightsUBO(engine, scene);
        expect(Array.from(floats(buf).slice(8, 12))).toEqual([1, 1, 1, Number.MAX_VALUE].map(Math.fround));
        setLightDiffuseColor(light, [0, 1, 0]);
        refreshSceneLightsUBO(engine, scene);
        expect(Array.from(floats(buf).slice(8, 12))).toEqual([0, 1, 0, 5]);
    });

    it("light.specular = [...] is not uploaded", () => {
        const { engine, scene, light, buf } = setup();
        light.specular = [0, 0, 1];
        refreshSceneLightsUBO(engine, scene);
        expect(Array.from(floats(buf).slice(12, 15))).toEqual([1, 1, 1]);
        light._bumpLightVersion!();
        refreshSceneLightsUBO(engine, scene);
        expect(Array.from(floats(buf).slice(12, 15))).toEqual([0, 0, 1]);
    });

    it("position.set is uploaded with no extra call", () => {
        const { engine, scene, light, buf } = setup();
        light.position.set(1, 2, 3);
        refreshSceneLightsUBO(engine, scene);
        expect(Array.from(floats(buf).slice(4, 7))).toEqual([1, 2, 3]);
    });

    it("a spot light's angle write is uploaded, its exponent write is not", () => {
        const engine = createNullEngine();
        attachDevice(engine);
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const spot = createSpotLight([0, 0, 0], [0, -1, 0], Math.PI / 2, 2);
        addToScene(scene, spot);
        const buf = refreshSceneLightsUBO(engine, scene);
        spot.exponent = 9;
        refreshSceneLightsUBO(engine, scene);
        expect(floats(buf)[15]).toBe(2);
        spot.angle = Math.PI / 3;
        refreshSceneLightsUBO(engine, scene);
        expect(floats(buf)[19]).toBeCloseTo(Math.cos(Math.PI / 6));
        expect(floats(buf)[15]).toBe(9);
    });

    it("a plain write is uploaded at the next refill caused by ANY light: another light's setter, or a light added", () => {
        const { engine, scene, light, buf } = setup();
        const other = createPointLight([5, 0, 0], 1);
        addToScene(scene, other);
        refreshSceneLightsUBO(engine, scene);
        light.intensity = 3;
        refreshSceneLightsUBO(engine, scene);
        expect(floats(buf)[8]).toBe(1);
        setLightIntensity(other, 2);
        const b2 = refreshSceneLightsUBO(engine, scene);
        expect(floats(b2)[8]).toBe(3);
        light.intensity = 6;
        addToScene(scene, createPointLight([9, 0, 0], 1));
        const b3 = refreshSceneLightsUBO(engine, scene);
        expect(floats(b3)[8]).toBe(6);
    });

    it("removing another light also refills it", () => {
        const { engine, scene, light } = setup();
        const other = createPointLight([5, 0, 0], 1);
        addToScene(scene, other);
        refreshSceneLightsUBO(engine, scene);
        light.intensity = 7;
        removeFromScene(scene, other);
        const b = refreshSceneLightsUBO(engine, scene);
        expect(floats(b)[8]).toBe(7);
    });
});

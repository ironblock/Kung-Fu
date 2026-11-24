import { attachDevice } from "./scene-helpers";
import {
    createCsmDirectionalShadowGenerator,
    createDirectionalLight,
    createEsmDirectionalShadowGenerator,
    createNullEngine,
    createPcfDirectionalShadowGenerator,
    createPcfSpotlightShadowGenerator,
    createSpotLight,
} from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n24: shadow generator map sizes and depth ranges by default", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("spot PCF: mapSize 512, near 1, far 10000 while range is unbounded", () => {
        const spot = createSpotLight([0, 5, 0], [0, -1, 0], 1, 2);
        const sg = createPcfSpotlightShadowGenerator(engine, spot);
        expect(sg._config._mapSize).toBe(512);
        expect(Array.from(sg._depthValues)).toEqual([0, 10000]);
    });

    it("spot PCF: far follows light.range at creation time", () => {
        const spot = createSpotLight([0, 5, 0], [0, -1, 0], 1, 2);
        spot.range = 30;
        const sg = createPcfSpotlightShadowGenerator(engine, spot);
        expect(sg._depthValues[1]).toBe(30);
        spot.range = 60;
        expect(sg._depthValues[1]).toBe(30);
    });

    it("directional PCF, ESM and CSM: mapSize 1024; PCF and ESM ortho range 1..10000", () => {
        const light = createDirectionalLight([0, -1, 0]);
        const pcf = createPcfDirectionalShadowGenerator(engine, light);
        const esm = createEsmDirectionalShadowGenerator(engine, light);
        const csm = createCsmDirectionalShadowGenerator(engine, light);
        expect(pcf._config._mapSize).toBe(1024);
        expect(esm._config._mapSize).toBe(1024);
        expect(csm._config._mapSize).toBe(1024);
        expect([pcf._config._orthoMinZ, pcf._config._orthoMaxZ]).toEqual([1, 10000]);
        expect([esm._config._orthoMinZ, esm._config._orthoMaxZ]).toEqual([1, 10000]);
    });
});

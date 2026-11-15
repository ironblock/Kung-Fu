import { attachDevice, floats } from "./scene-helpers";
import { addToScene, createBox, createNullEngine, createPointLight, createSceneContext, MAX_LIGHTS, setMaxLights } from "@babylonjs/lite";
import { refreshSceneLightsUBO } from "../../babylon-lite/packages/babylon-lite/src/render/scene-lights-ubo.ts";
import { writeMeshLightSelection } from "../../babylon-lite/packages/babylon-lite/src/render/mesh-light-selection.ts";
import { afterEach, describe, expect, it } from "vitest";

const countOf = (f: Float32Array) => new Uint32Array(f.buffer, 0, 1)[0];

describe("n08: only the first MAX_LIGHTS (16) scene lights are uploaded or selected", () => {
    afterEach(() => setMaxLights(16));

    it("the 17th light is dropped from the lights UBO and from a mesh's light list, silently", () => {
        expect(MAX_LIGHTS).toBe(16);
        const engine = createNullEngine();
        attachDevice(engine);
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        for (let i = 0; i < 17; i++) {
            addToScene(scene, createPointLight([i, 0, 0]));
        }
        expect(scene.lights).toHaveLength(17);
        const data = floats(refreshSceneLightsUBO(engine, scene));
        expect(countOf(data)).toBe(16);
        expect(data[4 + 15 * 16]).toBe(15);
        expect(data.length).toBe(4 + 16 * 16);
        expect(writeMeshLightSelection(createBox(engine), scene.lights)).toBe(-16);
    });

    it("setMaxLights(20) lets all 17 through", () => {
        setMaxLights(20);
        const engine = createNullEngine();
        attachDevice(engine);
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        for (let i = 0; i < 17; i++) {
            addToScene(scene, createPointLight([i, 0, 0]));
        }
        const data = floats(refreshSceneLightsUBO(engine, scene));
        expect(countOf(data)).toBe(17);
        expect(data[4 + 16 * 16]).toBe(16);
    });
});

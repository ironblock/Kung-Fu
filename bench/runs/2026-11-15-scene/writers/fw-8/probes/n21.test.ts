// n21: the scene-wide lights uniform holds at most MAX_LIGHTS (16) lights, in scene.lights order.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createBox, createPointLight, createSceneContext, MAX_LIGHTS, setMaxLights } from "@babylonjs/lite";
import { ensureSceneLightState, refreshSceneLightsUBO } from "../../babylon-lite/packages/babylon-lite/src/render/scene-lights-ubo";
import { writeMeshLightSelection } from "../../babylon-lite/packages/babylon-lite/src/render/mesh-light-selection";
import { describe, expect, it } from "vitest";

describe("n21 light cap", () => {
    it("default cap is 16: of 20 lights only the first 16 are uploaded and selected", () => {
        expect(MAX_LIGHTS).toBe(16);
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        for (let i = 0; i < 20; i++) {
            addToScene(scene, createPointLight([i, 0, 0]));
        }
        const state = ensureSceneLightState(engine, scene);
        refreshSceneLightsUBO(engine, scene);
        expect(new Uint32Array(state._scratch.buffer)[0]).toBe(16);
        // entry 15 is the 16th light (x = 15); no 17th entry exists
        expect(state._scratch[4 + 15 * 16]).toBe(15);
        expect(state._scratch.length).toBe(4 + 16 * 16);
        expect(writeMeshLightSelection(createBox(engine), scene.lights)).toBe(-16);
    });

    it("setMaxLights raises the cap for state built afterwards", () => {
        setMaxLights(20);
        try {
            const { engine } = makeGpuEngine();
            const scene = createSceneContext(engine, { defaultRenderTask: false });
            for (let i = 0; i < 20; i++) {
                addToScene(scene, createPointLight([i, 0, 0]));
            }
            const state = ensureSceneLightState(engine, scene);
            expect(new Uint32Array(state._scratch.buffer)[0]).toBe(20);
        } finally {
            setMaxLights(16);
        }
    });
});

// n20: plain writes to light scalars/colour arrays are not uploaded until the light's version moves;
// setLightDiffuseColor throws on a hemispheric light; a plain write is sent with the light's next tracked change.
import { makeGpuEngine } from "./scene-helpers";
import { addToScene, createDirectionalLight, createHemisphericLight, createPointLight, createSceneContext, createSpotLight, setLightDiffuseColor, setLightIntensity } from "@babylonjs/lite";
import type { LightBase } from "@babylonjs/lite";
import { ensureSceneLightState, refreshSceneLightsUBO } from "../../babylon-lite/packages/babylon-lite/src/render/scene-lights-ubo";
import { describe, expect, it } from "vitest";

function rig(light: LightBase) {
    const { engine, device } = makeGpuEngine();
    const scene = createSceneContext(engine, { defaultRenderTask: false });
    addToScene(scene, light);
    const state = ensureSceneLightState(engine, scene);
    /** One frame's lights refresh; returns how many uploads it made. */
    const frame = (): number => {
        const before = device.writes.length;
        refreshSceneLightsUBO(engine, scene);
        return device.writes.length - before;
    };
    return { state, frame };
}

describe("n20 light changes that are not uploaded", () => {
    it("point light: intensity, diffuse, specular and range writes are ignored; the setters upload", () => {
        const light = createPointLight([0, 0, 0], 1);
        const { state, frame } = rig(light);
        light.intensity = 5;
        light.diffuse[0] = 0.5;
        light.specular = [0, 0, 0];
        light.range = 3;
        expect(frame()).toBe(0);
        expect(state._scratch[4 + 4]).toBe(1);
        setLightIntensity(light, 2);
        expect(frame()).toBe(1);
        expect(state._scratch[4 + 4]).toBe(1);
        setLightDiffuseColor(light, [0.25, 1, 1]);
        expect(frame()).toBe(1);
        expect(state._scratch[4 + 4]).toBe(0.5);
    });

    it("spot light: exponent write ignored, angle write uploaded", () => {
        const light = createSpotLight([0, 0, 0], [0, 0, 1], 1, 2);
        const { frame } = rig(light);
        light.exponent = 8;
        expect(frame()).toBe(0);
        light.angle = 0.5;
        expect(frame()).toBe(1);
    });

    it("hemispheric light: diffuseColor and groundColor writes ignored", () => {
        const light = createHemisphericLight([0, 1, 0], 1);
        const { frame } = rig(light);
        light.diffuseColor = [1, 0, 0];
        light.groundColor[1] = 1;
        expect(frame()).toBe(0);
    });

    it("position and direction set() are tracked", () => {
        const light = createSpotLight([0, 0, 0], [0, 0, 1], 1, 2);
        const { frame } = rig(light);
        light.position.set(1, 2, 3);
        expect(frame()).toBe(1);
        light.direction.set(0, -1, 0);
        expect(frame()).toBe(1);
        light.direction.x = 0.5;
        expect(frame()).toBe(1);
    });

    it("hemispheric light: setLightDiffuseColor throws TypeError; plain writes go out with the next setLightIntensity", () => {
        const light = createHemisphericLight([0, 1, 0], 1);
        const { state, frame } = rig(light);
        expect(() => setLightDiffuseColor(light as never, [1, 0, 0])).toThrow(TypeError);
        light.groundColor[1] = 0.625;
        light.diffuseColor = [0.375, 0, 0];
        expect(frame()).toBe(0);
        expect(Array.from(state._scratch)).not.toContain(1.25);
        setLightIntensity(light, 2);
        expect(frame()).toBe(1);
        // the UBO carries colour * intensity
        expect(Array.from(state._scratch)).toContain(1.25);
        expect(Array.from(state._scratch)).toContain(0.75);
    });

    it("point and directional lights: setLightDiffuseColor works; a plain range write goes out with the next tracked change", () => {
        const dir = createDirectionalLight([0, -1, 0]);
        const r1 = rig(dir);
        setLightDiffuseColor(dir, [0.25, 0.5, 0.75]);
        expect(r1.frame()).toBe(1);
        const point = createPointLight([0, 0, 0], 1);
        const { state, frame } = rig(point);
        frame();
        point.range = 4.5;
        expect(frame()).toBe(0);
        expect(Array.from(state._scratch)).not.toContain(4.5);
        point.position.set(1, 0, 0);
        expect(frame()).toBe(1);
        expect(Array.from(state._scratch)).toContain(4.5);
    });
});

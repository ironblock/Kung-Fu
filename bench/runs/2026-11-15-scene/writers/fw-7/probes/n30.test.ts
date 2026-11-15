import { attachDevice, floats } from "./scene-helpers";
import { addToScene, createDirectionalLight, createNullEngine, createPointLight, createSceneContext, createTransformNode, setParent } from "@babylonjs/lite";
import { refreshSceneLightsUBO } from "../../babylon-lite/packages/babylon-lite/src/render/scene-lights-ubo.ts";
import { describe, expect, it } from "vitest";

describe("n30: lights use their world matrix: a parent moves positions and turns directions", () => {
    it("a point light under a moved node is uploaded at its world position", () => {
        const engine = createNullEngine();
        attachDevice(engine);
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const node = createTransformNode("n", 0, 10, 0);
        const light = createPointLight([1, 0, 0]);
        setParent(light, node);
        light.position.set(1, 0, 0);
        addToScene(scene, light);
        const data = floats(refreshSceneLightsUBO(engine, scene));
        expect(Array.from(data.slice(4, 7))).toEqual([1, 10, 0]);
    });

    it("a directional light under a node rotated 90 degrees about Z has its direction turned, and stays unit length under scale", () => {
        const engine = createNullEngine();
        attachDevice(engine);
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const s = Math.SQRT1_2;
        const node = createTransformNode("n", 0, 0, 0, 0, 0, s, s, 5, 5, 5);
        const light = createDirectionalLight([1, 0, 0]);
        light.parent = node;
        addToScene(scene, light);
        const data = floats(refreshSceneLightsUBO(engine, scene));
        expect(data[4]).toBeCloseTo(0);
        expect(data[5]).toBeCloseTo(1);
        expect(data[6]).toBeCloseTo(0);
    });

    it("moving the parent later is picked up with no call on the light", () => {
        const engine = createNullEngine();
        attachDevice(engine);
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const node = createTransformNode("n");
        const light = createPointLight([0, 0, 0]);
        light.parent = node;
        addToScene(scene, light);
        const buf = refreshSceneLightsUBO(engine, scene);
        node.position.set(0, 0, 4);
        refreshSceneLightsUBO(engine, scene);
        expect(floats(buf)[6]).toBe(4);
    });
});

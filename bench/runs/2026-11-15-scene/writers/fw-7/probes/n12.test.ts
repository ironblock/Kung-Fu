import { attachDevice } from "./scene-helpers";
import { createNullEngine, createSceneContext, onBeforeRender, stepScene } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n12: onBeforeRender callbacks run newest first and get fixedDeltaMs when it is set", () => {
    it("the callback registered last runs first", () => {
        const engine = createNullEngine();
        attachDevice(engine);
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const order: string[] = [];
        onBeforeRender(scene, () => order.push("a"));
        onBeforeRender(scene, () => order.push("b"));
        onBeforeRender(scene, () => order.push("c"));
        stepScene(engine, scene, 16);
        expect(order).toEqual(["c", "b", "a"]);
    });

    it("deltaMs is the frame delta while fixedDeltaMs is 0, and fixedDeltaMs once it is above 0", () => {
        const engine = createNullEngine();
        attachDevice(engine);
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const seen: number[] = [];
        onBeforeRender(scene, (d) => seen.push(d));
        expect(scene.fixedDeltaMs).toBe(0);
        stepScene(engine, scene, 33);
        scene.fixedDeltaMs = 5;
        stepScene(engine, scene, 33);
        scene.fixedDeltaMs = -1;
        stepScene(engine, scene, 20);
        expect(seen).toEqual([33, 5, 20]);
    });
});

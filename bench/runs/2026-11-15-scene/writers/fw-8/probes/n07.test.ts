// n07: fixedDeltaMs > 0 replaces the delta handed to callbacks.
import { makeGpuEngine } from "./scene-helpers";
import { createSceneContext, onBeforeRender, stepScene } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n07 fixedDeltaMs", () => {
    it("callbacks get the real delta at 0 and fixedDeltaMs when positive", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const deltas: number[] = [];
        onBeforeRender(scene, (d) => deltas.push(d));
        expect(scene.fixedDeltaMs).toBe(0);
        stepScene(engine, scene, 16);
        scene.fixedDeltaMs = 5;
        stepScene(engine, scene, 16);
        stepScene(engine, scene, 40);
        expect(deltas).toEqual([16, 5, 5]);
    });
});

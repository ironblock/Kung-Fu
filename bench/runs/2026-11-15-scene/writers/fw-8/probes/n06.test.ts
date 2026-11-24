// n06: onBeforeRender runs the most recently registered callback first.
import { makeGpuEngine } from "./scene-helpers";
import { createSceneContext, onBeforeRender, stepScene } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";
import { tick } from "./helpers";

describe("n06 onBeforeRender order", () => {
    it("runs callbacks in reverse registration order (stepScene)", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const seen: string[] = [];
        onBeforeRender(scene, () => seen.push("first"));
        onBeforeRender(scene, () => seen.push("second"));
        onBeforeRender(scene, () => seen.push("third"));
        stepScene(engine, scene, 16);
        expect(seen).toEqual(["third", "second", "first"]);
    });

    it("same order through the frame callback list", () => {
        const { engine } = makeGpuEngine();
        const scene = createSceneContext(engine, { defaultRenderTask: false });
        const seen: number[] = [];
        onBeforeRender(scene, () => seen.push(1));
        onBeforeRender(scene, () => seen.push(2));
        tick(scene);
        expect(seen).toEqual([2, 1]);
    });
});

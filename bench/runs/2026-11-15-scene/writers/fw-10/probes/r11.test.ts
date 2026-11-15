// r11: per-frame logic with onBeforeRender — later registrations run first; fixedDeltaMs replaces the delta.
import { makeGpuScene } from "./scene-helpers";
import { describe, expect, it } from "vitest";
import { onBeforeRender, stepScene } from "@babylonjs/lite";

describe("r11 per-frame callbacks", () => {
    it("the callback registered last runs first", () => {
        const { engine, scene } = makeGpuScene();
        const order: string[] = [];
        onBeforeRender(scene, () => order.push("physics"));
        onBeforeRender(scene, () => order.push("follow-camera"));
        stepScene(engine, scene, 16);
        expect(order).toEqual(["follow-camera", "physics"]);
    });

    it("a single callback that calls the steps in order keeps that order", () => {
        const { engine, scene } = makeGpuScene();
        const order: string[] = [];
        const physics = (): number => order.push("physics");
        const follow = (): number => order.push("follow-camera");
        onBeforeRender(scene, () => {
            physics();
            follow();
        });
        stepScene(engine, scene, 16);
        expect(order).toEqual(["physics", "follow-camera"]);
    });

    it("deltaMs is the frame's delta in milliseconds unless scene.fixedDeltaMs > 0", () => {
        const { engine, scene } = makeGpuScene();
        const seen: number[] = [];
        onBeforeRender(scene, (ms) => seen.push(ms));
        stepScene(engine, scene, 16);
        scene.fixedDeltaMs = 5;
        stepScene(engine, scene, 16);
        expect(seen).toEqual([16, 5]);
    });
});

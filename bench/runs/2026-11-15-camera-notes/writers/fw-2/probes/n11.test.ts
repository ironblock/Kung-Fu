import { describe, it, expect } from "vitest";
import { createArcRotateCamera, attachControl, interpolateArcRotateCamera } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

describe("n11 interpolateArcRotateCamera rejects when anything else changes the pose between frames", () => {
    it("a direct alpha write between frames rejects the promise", async () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const p = interpolateArcRotateCamera(cam, scene, { alpha: 2 });
        tick(scene);
        cam.alpha = 0.3;
        tick(scene);
        await expect(p).rejects.toThrow();
    });
    it("drag inertia from attachControl running in the same frames rejects it", async () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas), scene);
        const p = interpolateArcRotateCamera(cam, scene, { radius: 5 });
        tick(scene);
        fire(canvas, "pointerdown", pointer());
        fire(canvas, "pointermove", pointer({ clientX: 40 }));
        tick(scene, 2);
        await expect(p).rejects.toThrow();
    });
    it("leftover inertia is zeroed on its first frame", () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        cam.inertialAlphaOffset = 0.5;
        void interpolateArcRotateCamera(cam, scene, { radius: 5 }).catch(() => {});
        expect(cam.inertialAlphaOffset).toBe(0.5);
        tick(scene);
        expect(cam.inertialAlphaOffset).toBe(0);
    });
});

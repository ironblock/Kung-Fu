import { describe, it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, touches, makeScene, tick } from "./helpers";

describe("n01 attachControl moves the camera only from the scene's per-frame callback", () => {
    it("without a scene a drag and a wheel never move the camera", () => {
        const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas));
        fire(canvas, "pointerdown", pointer({ clientX: 0, clientY: 0 }));
        fire(canvas, "pointermove", pointer({ clientX: 100, clientY: 50 }));
        fire(canvas, "wheel", { deltaY: 100 });
        expect(cam.alpha).toBe(1);
        expect(cam.beta).toBe(1);
        expect(cam.radius).toBe(10);
        expect(cam.inertialAlphaOffset).not.toBe(0);
    });
    it("with a scene the same input moves nothing until a frame runs", () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas), scene);
        fire(canvas, "pointerdown", pointer({ clientX: 0, clientY: 0 }));
        fire(canvas, "pointermove", pointer({ clientX: 100, clientY: 50 }));
        expect(cam.alpha).toBe(1);
        tick(scene);
        expect(cam.alpha).not.toBe(1);
    });
});

describe("n01b the exception: a two-finger pinch moves the camera with no scene", () => {
    it("pinch writes radius at once without a scene argument", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas));
        fire(canvas, "touchstart", touches([1, 100, 100], [2, 200, 100]));
        fire(canvas, "touchmove", touches([2, 300, 100]));
        expect(cam.radius).toBeCloseTo(5, 10);
    });
});

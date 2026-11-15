import { describe, it, expect } from "vitest";
import { createArcRotateCamera, resolveCameraViewport, getEffectiveAspectRatio } from "@babylonjs/lite";

describe("n29 resolveCameraViewport turns Babylon's bottom-origin viewport into top-origin pixels", () => {
    it("viewport y=0,height=0.5 is the bottom half: pixel y starts at half the height", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        cam.viewport = { x: 0, y: 0, width: 0.5, height: 0.5 };
        expect(resolveCameraViewport(cam, 800, 600)).toEqual({ x: 0, y: 300, width: 400, height: 300 });
    });
    it("values outside 0..1 are clamped to the target", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        cam.viewport = { x: -0.5, y: 0, width: 1, height: 1 };
        expect(resolveCameraViewport(cam, 800, 600)).toEqual({ x: 0, y: 0, width: 400, height: 600 });
    });
    it("getEffectiveAspectRatio scales the target aspect by viewport width/height", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        cam.viewport = { x: 0, y: 0, width: 0.5, height: 1 };
        expect(getEffectiveAspectRatio(cam, 800, 600)).toBeCloseTo((800 / 600) * 0.5, 12);
    });
});

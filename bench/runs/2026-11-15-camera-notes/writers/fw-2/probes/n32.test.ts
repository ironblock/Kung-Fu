import { describe, it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, touches, makeScene } from "./helpers";

describe("n32 arc-rotate pinch writes radius directly, with no inertia and no scene frame needed", () => {
    it("spreading two fingers to twice the distance halves radius at once", () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas), scene);
        fire(canvas, "touchstart", touches([1, 100, 100], [2, 200, 100]));
        fire(canvas, "touchmove", touches([2, 300, 100]));
        expect(cam.radius).toBeCloseTo(5, 10);
        expect(cam.inertialRadiusOffset).toBe(0);
    });
});

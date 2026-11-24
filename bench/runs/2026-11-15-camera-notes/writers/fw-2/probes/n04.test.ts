import { describe, it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, makeScene, tick } from "./helpers";

describe("n04 wheel zoom is proportional to the radius", () => {
    it("each wheel event subtracts deltaY * radius / (wheelPrecision * 1000) from inertialRadiusOffset", () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas), scene);
        fire(canvas, "wheel", { deltaY: 100 });
        expect(cam.inertialRadiusOffset).toBeCloseTo(-(100 * 10) / 3000, 10);
        tick(scene);
        expect(cam.radius).toBeCloseTo(10 + 1 / 3, 10);
    });
    it("the same wheel step at radius 100 moves ten times as far", () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 100, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas), scene);
        fire(canvas, "wheel", { deltaY: 100 });
        tick(scene);
        expect(cam.radius).toBeCloseTo(100 + 10 / 3, 8);
    });
});

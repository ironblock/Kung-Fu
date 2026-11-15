import { describe, it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

describe("n07 attachControl's frame clamps beta to [0.01, PI-0.01] and radius to >= 0.01 with no limits set", () => {
    it("a rotation frame pulls beta into [0.01, PI-0.01]", () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 0.05, 10, { x: 0, y: 0, z: 0 });
        attachControl(cam, asCanvas(makeCanvas()), scene);
        cam.inertialBetaOffset = -1;
        tick(scene);
        expect(cam.beta).toBe(0.01);
    });
    it("a direct beta write is not clamped", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        attachControl(cam, asCanvas(makeCanvas()), makeScene());
        cam.beta = -0.5;
        expect(cam.beta).toBe(-0.5);
    });
    it("a zoom frame keeps radius at least 0.01", () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 1, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas), scene);
        cam.inertialRadiusOffset = 50;
        tick(scene);
        expect(cam.radius).toBe(0.01);
    });
});

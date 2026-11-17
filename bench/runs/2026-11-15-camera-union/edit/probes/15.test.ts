import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, makeScene, tick } from "./helpers";

it("15: no beta limits by default; the frame step clamps beta to [0.01, PI-0.01] only on frames with a rotation offset", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    expect(cam.lowerBetaLimit).toBeUndefined();
    expect(cam.upperBetaLimit).toBeUndefined();
    const scene = makeScene();
    attachControl(cam, asCanvas(makeCanvas()), scene);
    cam.beta = 0;
    tick(scene);
    expect(cam.beta).toBe(0);
    cam.beta = 4;
    cam.inertialRadiusOffset = 0.1; // zoom only: no beta clamp
    tick(scene);
    expect(cam.beta).toBe(4);
    cam.inertialAlphaOffset = 0.01;
    tick(scene);
    expect(cam.beta).toBeCloseTo(Math.PI - 0.01, 12);
    cam.beta = -1;
    cam.inertialBetaOffset = 0.002;
    tick(scene);
    expect(cam.beta).toBe(0.01);
});

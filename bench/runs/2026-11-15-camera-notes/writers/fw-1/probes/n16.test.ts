import { it, expect } from "vitest";
import { createArcRotateCamera, setCameraLimits } from "@babylonjs/lite";

it("n16: clamping zeroes that channel's inertial offset; the disposer stops clamping but keeps the limit fields", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const dispose = setCameraLimits(cam, { lowerRadiusLimit: 5 });
    cam.inertialRadiusOffset = 1;
    cam.inertialAlphaOffset = 1;
    cam.radius = 2;
    expect(cam.radius).toBe(5);
    expect(cam.inertialRadiusOffset).toBe(0);
    expect(cam.inertialAlphaOffset).toBe(1);
    dispose();
    cam.radius = 2;
    expect(cam.radius).toBe(2);
    expect(cam.lowerRadiusLimit).toBe(5);
});

it("n16b: after a second setCameraLimits, the first disposer leaves the clamping on; the latest one stops it", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const first = setCameraLimits(cam, { lowerRadiusLimit: 5 });
    const second = setCameraLimits(cam, { upperRadiusLimit: 20 });
    first();
    cam.radius = 2;
    expect(cam.radius).toBe(5);
    second();
    cam.radius = 1;
    expect(cam.radius).toBe(1);
});

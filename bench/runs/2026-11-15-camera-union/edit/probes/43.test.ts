import { it, expect } from "vitest";
import { createArcRotateCamera, setCameraLimits } from "@babylonjs/lite";

it("43a: only the fields present are written; calls add up; undefined removes a bound", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    setCameraLimits(cam, { lowerRadiusLimit: 5 });
    setCameraLimits(cam, { upperRadiusLimit: 20 });
    expect(cam.lowerRadiusLimit).toBe(5);
    expect(cam.upperRadiusLimit).toBe(20);
    setCameraLimits(cam, { lowerRadiusLimit: undefined });
    expect("lowerRadiusLimit" in cam && cam.lowerRadiusLimit).toBeUndefined();
    cam.radius = 1;
    expect(cam.radius).toBe(1);
    cam.radius = 30;
    expect(cam.radius).toBe(20);
});

it("43b: only the latest call's function stops the clamping, and it leaves the fields set", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const stop1 = setCameraLimits(cam, { lowerRadiusLimit: 5 });
    const stop2 = setCameraLimits(cam, { upperRadiusLimit: 20 });
    stop1();
    cam.radius = 1;
    expect(cam.radius).toBe(5);
    stop2();
    cam.radius = 1;
    expect(cam.radius).toBe(1);
    expect(cam.lowerRadiusLimit).toBe(5);
    expect(cam.upperRadiusLimit).toBe(20);
});

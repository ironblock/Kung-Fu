import { it, expect } from "vitest";
import { createArcRotateCamera, setCameraLimits, interpolateArcRotateCamera } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

it("n02: limit fields do nothing until setCameraLimits; then every write is clamped at once", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    cam.lowerRadiusLimit = 5;
    cam.radius = 2;
    expect(cam.radius).toBe(2);
    setCameraLimits(cam, {});
    expect(cam.radius).toBe(5);
    cam.radius = 1;
    expect(cam.radius).toBe(5);
    cam.upperBetaLimit = 1.2; // a later direct field write is read by the installed clamp
    cam.beta = 2;
    expect(cam.beta).toBe(1.2);
});

it("n02b: interpolateArcRotateCamera honours a hand-set limit field without setCameraLimits", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    cam.lowerRadiusLimit = 5;
    const p = interpolateArcRotateCamera(cam, scene, { radius: 2 });
    tick(scene, 400);
    await expect(p).resolves.toBeUndefined();
    expect(cam.radius).toBe(5);
});

it("n02c: after setCameraLimits a write of the same value is not clamped to a raised limit", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    setCameraLimits(cam, {});
    cam.lowerRadiusLimit = 20;
    cam.radius = 10; // same value: no clamp
    expect(cam.radius).toBe(10);
    cam.radius = 11; // a changing write is clamped
    expect(cam.radius).toBe(20);
});

import { it, expect } from "vitest";
import { createArcRotateCamera, setCameraLimits, interpolateArcRotateCamera } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

it("03a: limit fields set by hand clamp no write", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    cam.lowerRadiusLimit = 5;
    cam.upperBetaLimit = 1.2;
    cam.radius = 2;
    cam.beta = 2;
    expect(cam.radius).toBe(2);
    expect(cam.beta).toBe(2);
});

it("03b: interpolateArcRotateCamera clamps its goals to hand-set fields", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    cam.lowerRadiusLimit = 5;
    const p = interpolateArcRotateCamera(cam, scene, { radius: 1 }, undefined, { interpolationFactor: 0 });
    tick(scene, 3);
    await p;
    expect(cam.radius).toBe(5);
});

it("03c: setCameraLimits clamps the pose at once and zeroes the offset of a hit bound only", () => {
    const cam = createArcRotateCamera(1, 1, 2, { x: 0, y: 0, z: 0 });
    cam.inertialRadiusOffset = 0.3;
    cam.inertialAlphaOffset = 0.2;
    setCameraLimits(cam, { lowerRadiusLimit: 5, upperAlphaLimit: 3 });
    expect(cam.radius).toBe(5);
    expect(cam.inertialRadiusOffset).toBe(0);
    expect(cam.inertialAlphaOffset).toBe(0.2);
});

it("03d: after it, a write that changes a value re-clamps all three against the fields as they are then", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    setCameraLimits(cam, { lowerRadiusLimit: 5 });
    cam.radius = 1;
    expect(cam.radius).toBe(5);
    cam.inertialBetaOffset = 0.5;
    cam.upperBetaLimit = 1.2; // by hand, after the call
    cam.beta = 1.5;
    expect(cam.beta).toBe(1.2);
    expect(cam.inertialBetaOffset).toBe(0);
    cam.lowerRadiusLimit = 8; // by hand
    cam.radius = cam.radius; // no change: no clamp
    expect(cam.radius).toBe(5);
    cam.alpha = 2; // another channel changes: radius is clamped too
    expect(cam.radius).toBe(8);
});

import * as L2 from "@babylonjs/lite";
import * as V2 from "vitest";

V2.it("03 (after check 2): once the function from the latest setCameraLimits call runs, the fields stay set but clamp nothing", () => {
    const cam = L2.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    L2.setCameraLimits(cam, { lowerRadiusLimit: 5 });
    const stop = L2.setCameraLimits(cam, { upperRadiusLimit: 20 });
    cam.radius = 1;
    V2.expect(cam.radius).toBe(5);
    stop();
    V2.expect(cam.lowerRadiusLimit).toBe(5);
    cam.radius = 1;
    V2.expect(cam.radius).toBe(1);
});

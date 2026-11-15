import { expect, test } from "vitest";
import { createArcRotateCamera, setCameraLimits } from "@babylonjs/lite";

test("setCameraLimits clamps the current pose at once and every later write in the same statement, zeroing that offset", () => {
    const cam = createArcRotateCamera(1, 1, 50, { x: 0, y: 0, z: 0 });
    cam.inertialRadiusOffset = 0.5;
    setCameraLimits(cam, { upperRadiusLimit: 20, lowerRadiusLimit: 5 });
    expect(cam.radius).toBe(20);
    expect(cam.inertialRadiusOffset).toBe(0);
    cam.inertialRadiusOffset = -3;
    cam.radius = 1;
    expect(cam.radius).toBe(5);
    expect(cam.inertialRadiusOffset).toBe(0);
    // fields written directly after the hook is installed are honoured on the next write
    cam.upperBetaLimit = 1.2;
    cam.beta = 2;
    expect(cam.beta).toBe(1.2);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: the inertial offset is zeroed only when a write hits a bound", () => {
    const cam = L.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    L.setCameraLimits(cam, { upperRadiusLimit: 20, lowerRadiusLimit: 5 });
    cam.inertialRadiusOffset = 0.5;
    cam.radius = 15;
    expect(cam.radius).toBe(15);
    expect(cam.inertialRadiusOffset).toBe(0.5);
    cam.radius = 25;
    expect(cam.radius).toBe(20);
    expect(cam.inertialRadiusOffset).toBe(0);
    // a later limit field is applied only by a write that changes the value
    cam.beta = 1.5;
    cam.upperBetaLimit = 1.2;
    cam.beta = 1.5;
    expect(cam.beta).toBe(1.5);
    cam.beta = 1.4;
    expect(cam.beta).toBe(1.2);
});

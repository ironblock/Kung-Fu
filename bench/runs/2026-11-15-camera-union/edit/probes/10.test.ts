import { it, expect } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";

it("10: createArcRotateCamera defaults", () => {
    const cam = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
    expect(cam.nearPlane).toBe(0.1);
    expect(cam.farPlane).toBe(1000);
    expect(cam.panningSensibility).toBe(50);
    expect(cam.fov).toBe(0.8);
    expect(cam.angularSensibility).toBe(1000);
    expect(cam.wheelPrecision).toBe(3);
    expect(cam.inertia).toBe(0.9);
    expect(cam.panningInertia).toBe(0.9);
});

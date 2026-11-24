import { describe, it, expect } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";

describe("n03 ArcRotateCamera defaults", () => {
    it("nearPlane 0.1, farPlane 1000, fov 0.8, panningSensibility 50, wheelPrecision 3, angularSensibility 1000, inertia 0.9", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        expect(cam.nearPlane).toBe(0.1);
        expect(cam.farPlane).toBe(1000);
        expect(cam.fov).toBe(0.8);
        expect(cam.panningSensibility).toBe(50);
        expect(cam.wheelPrecision).toBe(3);
        expect(cam.angularSensibility).toBe(1000);
        expect(cam.inertia).toBe(0.9);
        expect(cam.panningInertia).toBe(0.9);
    });
});

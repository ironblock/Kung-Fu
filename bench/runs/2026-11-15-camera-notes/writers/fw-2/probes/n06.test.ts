import { describe, it, expect } from "vitest";
import { createArcRotateCamera, setCameraLimits } from "@babylonjs/lite";

describe("n06 a limit field changed by hand after setCameraLimits applies at the next write, not at once", () => {
    it("the current pose stays out of range until alpha/beta/radius is next written", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        setCameraLimits(cam, {});
        cam.upperRadiusLimit = 5;
        expect(cam.radius).toBe(10);
        cam.alpha = 0.2;
        expect(cam.radius).toBe(5);
    });
    it("the disposer stops enforcement but leaves the limit fields set", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const off = setCameraLimits(cam, { upperRadiusLimit: 12 });
        off();
        expect(cam.upperRadiusLimit).toBe(12);
        cam.radius = 30;
        expect(cam.radius).toBe(30);
    });
});

describe("n06b a write of the current value does not apply the hand-changed limit", () => {
    it("cam.alpha = cam.alpha leaves radius out of range; a changing write clamps", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        setCameraLimits(cam, {});
        cam.upperRadiusLimit = 5;
        cam.alpha = cam.alpha;
        expect(cam.radius).toBe(10);
        cam.alpha = 0.1;
        expect(cam.radius).toBe(5);
    });
});

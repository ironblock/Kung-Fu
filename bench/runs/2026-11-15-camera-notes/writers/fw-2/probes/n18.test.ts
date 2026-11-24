import { describe, it, expect } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

describe("n18 changing camera.limits applies at the next orientation write, not at once", () => {
    it("a lower radiusMax leaves the current radius until something is written", () => {
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        cam.limits.radiusMax = 2000;
        expect(cam.radius).toBe(4000);
        cam.yaw = 0.5;
        expect(cam.radius).toBe(2000);
    });
    it("pitchDisabledRadiusScale = null allows full pitch at the default radius", () => {
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        cam.limits.pitchDisabledRadiusScale = null;
        cam.pitch = 1;
        expect(cam.pitch).toBe(1);
    });
});

describe("n18b a same-value write applies nothing; a center assignment always applies", () => {
    it("cam.yaw = cam.yaw keeps the old radius; cam.center = cam.center clamps", () => {
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        cam.limits.radiusMax = 2000;
        cam.yaw = cam.yaw;
        expect(cam.radius).toBe(4000);
        cam.center = cam.center;
        expect(cam.radius).toBe(2000);
    });
});

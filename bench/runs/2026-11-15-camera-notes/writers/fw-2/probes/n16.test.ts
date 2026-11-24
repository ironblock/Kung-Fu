import { describe, it, expect } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

describe("n16 GeospatialCamera defaults", () => {
    it("center (R,0,0), yaw 0, pitch 0.001, radius 4R, nearPlane 1, farPlane 16R, fov 0.8", () => {
        const R = 1000;
        const cam = createGeospatialCamera({ planetRadius: R });
        expect(cam.center).toEqual({ x: R, y: 0, z: 0 });
        expect(cam.yaw).toBe(0);
        expect(cam.pitch).toBe(0.001);
        expect(cam.radius).toBe(4 * R);
        expect(cam.nearPlane).toBe(1);
        expect(cam.farPlane).toBe(16 * R);
        expect(cam.fov).toBe(0.8);
        expect(cam.position.x).toBeCloseTo(5 * R, 0);
    });
    it("limits: radiusMin 10, radiusMax 4R, pitchMax PI/2-0.01, pitchDisabledRadiusScale {x:2,y:4}", () => {
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        expect(cam.limits.radiusMin).toBe(10);
        expect(cam.limits.radiusMax).toBe(4000);
        expect(cam.limits.pitchMax).toBe(Math.PI / 2 - 0.01);
        expect(cam.limits.pitchDisabledRadiusScale).toEqual({ x: 2, y: 4 });
        cam.radius = 1;
        expect(cam.radius).toBe(10);
        cam.radius = 1e9;
        expect(cam.radius).toBe(4000);
    });
});

describe("n16b when 4R < 10 the limits conflict", () => {
    it("planetRadius 1 starts at 10; writes below 10 give 10, writes above 10 give 4R", () => {
        const cam = createGeospatialCamera({ planetRadius: 1 });
        expect(cam.radius).toBe(10);
        cam.radius = 1000;
        expect(cam.radius).toBe(4);
        cam.radius = 5;
        expect(cam.radius).toBe(10);
    });
});

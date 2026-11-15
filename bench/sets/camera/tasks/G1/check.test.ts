import { describe, expect, it } from "vitest";
import { createGeospatialCamera, createGeospatialLimits } from "@babylonjs/lite";
import type { GeospatialLimits } from "@babylonjs/lite";
import { useModeLimits } from "../src/mode-limits";

const R = 1000;

function mode(radiusMin: number, radiusMax: number, yawMin: number, yawMax: number): GeospatialLimits {
    const limits = createGeospatialLimits(R);
    limits.radiusMin = radiusMin;
    limits.radiusMax = radiusMax;
    limits.yawMin = yawMin;
    limits.yawMax = yawMax;
    return limits;
}

describe("G1 useModeLimits", () => {
    it("keeps later zoom writes inside the mode's zoom range", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        useModeLimits(camera, mode(50, 2000, -0.5, 0.5));
        camera.radius = 5000;
        expect(camera.radius).toBeCloseTo(2000, 6);
        camera.radius = 1;
        expect(camera.radius).toBeCloseTo(50, 6);
        camera.radius = 700;
        expect(camera.radius).toBeCloseTo(700, 6);
    });

    it("keeps later heading writes inside the mode's heading range", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        useModeLimits(camera, mode(50, 2000, -0.5, 0.5));
        camera.radius = 1500;
        camera.yaw = 1.2;
        expect(camera.yaw).toBeCloseTo(0.5, 6);
        camera.yaw = -1.2;
        expect(camera.yaw).toBeCloseTo(-0.5, 6);
        camera.yaw = 0.25;
        expect(camera.yaw).toBeCloseTo(0.25, 6);
    });

    it("reports the mode's values through camera.limits", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        useModeLimits(camera, mode(50, 2000, -0.5, 0.5));
        expect(camera.limits.radiusMin).toBe(50);
        expect(camera.limits.radiusMax).toBe(2000);
        expect(camera.limits.yawMin).toBe(-0.5);
        expect(camera.limits.yawMax).toBe(0.5);
    });

    it("gives the new mode's ranges after a second switch", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        const city = mode(50, 2000, -0.5, 0.5);
        const globe = mode(1500, 3000, -Infinity, Infinity);
        useModeLimits(camera, city);
        useModeLimits(camera, globe);
        camera.radius = 600;
        expect(camera.radius).toBeCloseTo(1500, 6);
        camera.radius = 3500;
        expect(camera.radius).toBeCloseTo(3000, 6);
        camera.yaw = 2;
        expect(camera.yaw).toBeCloseTo(2, 6);
        expect(camera.limits.radiusMax).toBe(3000);
        useModeLimits(camera, city);
        camera.radius = 2500;
        expect(camera.radius).toBeCloseTo(2000, 6);
    });
});

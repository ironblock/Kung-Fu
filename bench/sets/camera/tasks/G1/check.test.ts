import { describe, expect, it } from "vitest";
import { createGeospatialCamera, createGeospatialLimits, setGeospatialOrientation } from "@babylonjs/lite";
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

    // Added 2026-11-18. The tests above read back what they wrote. An answer that puts its own accessors
    // on the camera, with its own storage, passed them while the camera itself never moved. This test keeps
    // the camera's own accessors from before the call and reads the camera's real values through them.
    it("leaves the camera itself following what is written", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        const ownRadius = Object.getOwnPropertyDescriptor(camera, "radius")!;
        const ownYaw = Object.getOwnPropertyDescriptor(camera, "yaw")!;
        useModeLimits(camera, mode(50, 2000, -0.5, 0.5));
        camera.radius = 700;
        camera.yaw = 0.25;
        expect(ownRadius.get!.call(camera)).toBeCloseTo(700, 6);
        expect(ownYaw.get!.call(camera)).toBeCloseTo(0.25, 6);
        camera.radius = 5000;
        camera.yaw = 1.2;
        expect(ownRadius.get!.call(camera)).toBeCloseTo(2000, 6);
        expect(ownYaw.get!.call(camera)).toBeCloseTo(0.5, 6);
    });

    // Added 2026-11-19. Every mode above lies inside the camera's own default limits (radius 10 to 4000),
    // so an answer that wraps the setters to clamp by the new object, while the camera still clamps by its
    // own, passed them. These tests use a mode wider than the defaults, and also write through the
    // library's setGeospatialOrientation. They read the real values through the camera's own accessors.
    it("lets the camera reach a mode's range that is wider than its defaults", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        const ownRadius = Object.getOwnPropertyDescriptor(camera, "radius")!;
        const ownYaw = Object.getOwnPropertyDescriptor(camera, "yaw")!;
        const real = () => ownRadius.get!.call(camera) as number;
        const city = mode(50, 2000, -0.5, 0.5);
        const wide = mode(5, 6000, -Infinity, Infinity);
        useModeLimits(camera, city);
        useModeLimits(camera, wide);
        camera.radius = 5000;
        expect(real()).toBeCloseTo(5000, 6);
        camera.radius = 7;
        expect(real()).toBeCloseTo(7, 6);
        camera.radius = 9000;
        expect(real()).toBeCloseTo(6000, 6);
        camera.radius = 1;
        expect(real()).toBeCloseTo(5, 6);
        camera.yaw = 2;
        expect(ownYaw.get!.call(camera)).toBeCloseTo(2, 6);
        useModeLimits(camera, city);
        camera.radius = 5000;
        expect(real()).toBeCloseTo(2000, 6);
    });

    it("keeps zoom and heading written through setGeospatialOrientation inside the mode's ranges", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        const ownRadius = Object.getOwnPropertyDescriptor(camera, "radius")!;
        const ownYaw = Object.getOwnPropertyDescriptor(camera, "yaw")!;
        useModeLimits(camera, mode(50, 2000, -0.5, 0.5));
        setGeospatialOrientation(camera, { radius: 3500, yaw: 1.2 });
        expect(ownRadius.get!.call(camera)).toBeCloseTo(2000, 6);
        expect(ownYaw.get!.call(camera)).toBeCloseTo(0.5, 6);
        useModeLimits(camera, mode(5, 6000, -1, 1));
        setGeospatialOrientation(camera, { radius: 5500, yaw: 0.8 });
        expect(ownRadius.get!.call(camera)).toBeCloseTo(5500, 6);
        expect(ownYaw.get!.call(camera)).toBeCloseTo(0.8, 6);
        setGeospatialOrientation(camera, { radius: 2, yaw: -3 });
        expect(ownRadius.get!.call(camera)).toBeCloseTo(5, 6);
        expect(ownYaw.get!.call(camera)).toBeCloseTo(-1, 6);
    });
    // Added 2026-11-19, after a fresh attack. Every mode above differs from the defaults only in its zoom
    // and heading fields, so an answer that copied only those four fields, or only the number fields,
    // passed. "camera.limits must report that mode's values": here the modes also have their own pitch
    // range and pitch fade, null in one and an object in another, and camera.limits must equal the mode.
    it("reports every value of the mode through camera.limits, pitch fields too", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        const flat = mode(50, 2500, -0.7, 0.7);
        flat.pitchMin = 0.05;
        flat.pitchMax = 0.6;
        flat.pitchDisabledRadiusScale = null;
        const steep = mode(20, 3500, -Infinity, Infinity);
        steep.pitchMin = 0.2;
        steep.pitchMax = 1.3;
        steep.pitchDisabledRadiusScale = { x: 1.5, y: 3 };
        useModeLimits(camera, flat);
        expect({ ...camera.limits }).toEqual({ ...flat });
        useModeLimits(camera, steep);
        expect({ ...camera.limits }).toEqual({ ...steep });
        useModeLimits(camera, flat);
        expect({ ...camera.limits }).toEqual({ ...flat });
        expect(camera.limits.pitchDisabledRadiusScale).toBeNull();
    });
});

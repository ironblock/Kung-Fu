import { it, expect } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

it("n32: default pose looks straight down at (R,0,0) from radius 4R; yaw 0 faces world +Z", () => {
    const R = 1000;
    const cam = createGeospatialCamera({ planetRadius: R });
    expect(cam.center).toEqual({ x: R, y: 0, z: 0 });
    expect(cam.radius).toBe(4 * R);
    expect(cam.pitch).toBe(0.001);
    expect(cam.yaw).toBe(0);
    expect(cam.position.x).toBeCloseTo(5 * R, 0);
    // tilt toward the horizon at a close radius: the look direction gains +Z (north)
    cam.radius = 100;
    cam.pitch = 1;
    expect(cam._lookAt.z).toBeGreaterThan(0.8);
    cam.yaw = Math.PI / 2;
    expect(Math.abs(cam._lookAt.z)).toBeLessThan(1e-6);
});

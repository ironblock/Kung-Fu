import { expect, test } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

test("geospatial camera starts at center (R,0,0), radius 4R, pitch 0.001, yaw 0, far 16R, near 1; north is +Z", () => {
    const R = 1000;
    const cam = createGeospatialCamera({ planetRadius: R });
    expect(cam.center).toEqual({ x: R, y: 0, z: 0 });
    expect(cam.radius).toBe(4 * R);
    expect(cam.pitch).toBe(0.001);
    expect(cam.yaw).toBe(0);
    expect([cam.nearPlane, cam.farPlane, cam.fov]).toEqual([1, 16 * R, 0.8]);
    expect(cam.position.x).toBeCloseTo(5 * R, 0);
    // yaw 0 faces north (+Z): the up vector of a straight-down camera points north
    expect(cam.upVector.z).toBeGreaterThan(0.99);
});

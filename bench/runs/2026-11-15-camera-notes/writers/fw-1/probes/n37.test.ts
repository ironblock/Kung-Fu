import { it, expect } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

it("n37: a centre at a pole (on the Z axis) is moved to latitude ~89.96 deg", () => {
    const R = 1000;
    const cam = createGeospatialCamera({ planetRadius: R });
    cam.center = { x: 0, y: 0, z: R };
    expect(cam.center.z).toBeCloseTo(R * 0.998749218, 3);
    expect(Math.hypot(cam.center.x, cam.center.y, cam.center.z)).toBeCloseTo(R, 6);
});

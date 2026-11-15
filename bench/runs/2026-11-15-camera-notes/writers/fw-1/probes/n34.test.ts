import { it, expect } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

it("n34: geospatial defaults", () => {
    const R = 1000;
    const cam = createGeospatialCamera({ planetRadius: R });
    expect(cam.limits.radiusMin).toBe(10);
    expect(cam.limits.radiusMax).toBe(4 * R);
    expect(cam.nearPlane).toBe(1);
    expect(cam.farPlane).toBe(16 * R);
    expect(cam.fov).toBe(0.8);
    cam.radius = 1;
    expect(cam.radius).toBe(10);
    cam.radius = 10 * R;
    expect(cam.radius).toBe(4 * R);
});

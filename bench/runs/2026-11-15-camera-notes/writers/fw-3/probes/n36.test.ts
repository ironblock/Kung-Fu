import { expect, test } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

test("geospatial radiusMin is 10 whatever planetRadius is; radius is clamped to [radiusMin, radiusMax] on every write", () => {
    expect(createGeospatialCamera({ planetRadius: 1 }).limits.radiusMin).toBe(10);
    expect(createGeospatialCamera({ planetRadius: 1e6 }).limits.radiusMin).toBe(10);
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    cam.radius = 2;
    expect(cam.radius).toBe(10);
    cam.radius = 1e9;
    expect(cam.radius).toBe(4000);
});

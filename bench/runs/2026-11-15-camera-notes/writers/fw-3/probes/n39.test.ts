import { expect, test } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

test("geospatial: changing camera.limits does not re-clamp until the next orientation write", () => {
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    expect(cam.radius).toBe(4000);
    cam.limits.radiusMax = 2000;
    expect(cam.radius).toBe(4000);
    cam.yaw = 0.5;
    expect(cam.radius).toBe(2000);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: a write that does not change yaw/pitch/radius is skipped; a center write re-clamps", () => {
    const cam = L.createGeospatialCamera({ planetRadius: 1000 });
    cam.limits.radiusMax = 2000;
    cam.radius = cam.radius;
    cam.yaw = cam.yaw;
    cam.pitch = cam.pitch;
    expect(cam.radius).toBe(4000);
    cam.center = { ...cam.center };
    expect(cam.radius).toBe(2000);
});

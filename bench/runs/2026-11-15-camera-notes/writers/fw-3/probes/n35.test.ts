import { expect, test } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

test("geospatial yaw and pitch read back wrapped to [-PI, PI)", () => {
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    cam.yaw = 4;
    expect(cam.yaw).toBeCloseTo(4 - 2 * Math.PI, 12);
    cam.yaw = Math.PI;
    expect(cam.yaw).toBeCloseTo(-Math.PI, 12);
});

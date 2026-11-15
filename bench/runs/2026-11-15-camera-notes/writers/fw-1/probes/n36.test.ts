import { it, expect } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

it("n36: yaw is wrapped to [-PI, PI)", () => {
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    cam.yaw = 4;
    expect(cam.yaw).toBeCloseTo(4 - 2 * Math.PI, 12);
    cam.yaw = Math.PI;
    expect(cam.yaw).toBeCloseTo(-Math.PI, 12);
});

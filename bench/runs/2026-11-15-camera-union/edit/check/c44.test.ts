import { it, expect } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

it("c44: a yaw write of the same value does not apply an in-place polar center", () => {
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    cam.center.x = 0;
    cam.center.z = 1000;
    cam.yaw = cam.yaw;
    expect(cam.center.z).toBe(1000);
    cam.yaw = 0.2;
    expect(cam.center.z).toBeLessThan(1000);
});

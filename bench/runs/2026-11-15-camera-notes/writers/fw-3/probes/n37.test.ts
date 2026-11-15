import { expect, test } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

test("geospatial: writing camera.center.x in place changes nothing derived; assigning camera.center copies and recomputes", () => {
    const R = 1000;
    const cam = createGeospatialCamera({ planetRadius: R });
    const px = cam.position.x;
    cam.center.x = 0; cam.center.y = R;
    expect(cam.position.x).toBe(px);
    const c = { x: 0, y: R, z: 0 };
    cam.center = c;
    expect(cam.center).not.toBe(c);
    expect(cam.position.y).toBeCloseTo(5 * R, 0);
});

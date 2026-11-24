import { it, expect } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

it("n35: editing camera.center in place moves nothing; assigning a Vec3 copies it and re-orbits", () => {
    const R = 1000;
    const cam = createGeospatialCamera({ planetRadius: R });
    const px = cam.position.x;
    cam.center.y = 500;
    expect(cam.position.x).toBe(px);
    expect(cam.position.y).toBeCloseTo(0, 6);
    const c = { x: 0, y: R, z: 0 };
    cam.center = c;
    expect(cam.position.y).toBeCloseTo(5 * R, 0);
    expect(cam.center).not.toBe(c);
    c.y = 0;
    expect(cam.center.y).toBe(R);
});

it("n35b: after an in-place edit of center, the next radius change re-orbits around the edited centre", () => {
    const R = 1000;
    const cam = createGeospatialCamera({ planetRadius: R });
    cam.center.x = 0;
    cam.center.y = R;
    expect(cam.position.y).toBeCloseTo(0, 6); // nothing yet
    cam.radius = 2 * R;
    expect(cam.position.y).toBeCloseTo(3 * R, 0);
    expect(cam.position.x).toBeCloseTo(0, 0);
});

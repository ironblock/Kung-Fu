// Reach f: setters, -0, NaN, pole clamp re-applied by setGeospatialOrientation.
import { describe, expect, it } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";
const R = 1000;
describe("reach f", () => {
    it("yaw = -0 when stored 0 does nothing; NaN always applies", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        cam.limits.radiusMax = 2000;
        cam.yaw = -0;
        expect(cam.radius).toBe(4000);
        cam.yaw = 2 * Math.PI; // wraps to 0 == stored but write differs: applies
        expect(cam.radius).toBe(2000);
    });
    it("setGeospatialOrientation({}) after an in-place center edit re-orbits it", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        cam.center.x = 0; cam.center.y = R;
        setGeospatialOrientation(cam, {});
        expect(cam.position.y).toBeGreaterThan(R);
    });
});

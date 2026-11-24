import { describe, it, expect } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";

describe("n15 writing camera.center.x in place does not move a GeospatialCamera", () => {
    it("in-place mutation leaves position unchanged; assigning a new object re-orbits", () => {
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        const before = { ...cam.position };
        cam.center.x = 0;
        cam.center.y = 1000;
        expect(cam.position.x).toBe(before.x);
        expect(cam.position.y).toBe(before.y);
        cam.center = { x: 0, y: 1000, z: 0 };
        expect(cam.position.y).toBeGreaterThan(1000);
        expect(Math.abs(cam.position.x)).toBeLessThan(1e-6);
    });
});

describe("n15b an in-place center change is used by the next yaw/pitch/radius write", () => {
    it("after center.x/y in place, a yaw write orbits the changed center", () => {
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        cam.center.x = 0;
        cam.center.y = 1000;
        cam.yaw = 0.5;
        expect(cam.position.y).toBeGreaterThan(4000);
        expect(Math.abs(cam.position.x)).toBeLessThan(10);
    });
    it("setGeospatialOrientation with a new center re-orbits at once", () => {
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        setGeospatialOrientation(cam, { center: { x: 0, y: 1000, z: 0 } });
        expect(cam.position.y).toBeGreaterThan(4000);
    });
});

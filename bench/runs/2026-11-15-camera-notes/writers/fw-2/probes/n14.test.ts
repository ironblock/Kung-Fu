import { describe, it, expect } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";

describe("n14 geospatial pitch is clamped against the radius it is applied with", () => {
    it("at the default radius (4 * planetRadius) a pitch write is forced to 0.001", () => {
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        cam.pitch = 1;
        expect(cam.pitch).toBe(0.001);
    });
    it("writing pitch then radius one at a time keeps the clamped pitch", () => {
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        cam.pitch = 1;
        cam.radius = 500;
        expect(cam.pitch).toBe(0.001);
    });
    it("radius first, then pitch, gives the pitch", () => {
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        cam.radius = 500;
        cam.pitch = 1;
        expect(cam.pitch).toBe(1);
    });
    it("setGeospatialOrientation with both clamps pitch against the new radius", () => {
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        setGeospatialOrientation(cam, { pitch: 1, radius: 500 });
        expect(cam.pitch).toBe(1);
    });
    it("between 2 and 4 planet radii the pitch ceiling falls linearly to pitchMin", () => {
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        setGeospatialOrientation(cam, { pitch: 1.5, radius: 3000 });
        const max = Math.PI / 2 - 0.01;
        expect(cam.pitch).toBeCloseTo(max * 0.5 + 0.001 * 0.5, 10);
    });
});

describe("n14b the start radius is radiusMin 10 when 4R is smaller", () => {
    it("planetRadius 1 starts at radius 10, and pitch there is forced to 0.001", () => {
        const cam = createGeospatialCamera({ planetRadius: 1 });
        expect(cam.radius).toBe(10);
        cam.pitch = 1;
        expect(cam.pitch).toBe(0.001);
    });
});

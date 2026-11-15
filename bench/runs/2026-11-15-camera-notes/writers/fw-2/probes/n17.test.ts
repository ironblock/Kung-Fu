import { describe, it, expect } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

describe("n17 geospatial north is +Z: yaw 0 looks toward +Z, yaw PI/2 (east) toward -Y at a centre on +X", () => {
    it("with the default centre on +X, pitch near horizon and yaw 0 the eye sits on -Z of the centre", () => {
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        cam.radius = 100;
        cam.pitch = 1.2;
        // eye = centre - lookAt * radius; looking north (+Z) puts the eye south (-Z)
        expect(cam.position.z).toBeLessThan(-50);
        expect(Math.abs(cam.position.y)).toBeLessThan(1e-6);
        cam.yaw = Math.PI / 2;
        expect(Math.abs(cam.position.z)).toBeLessThan(1e-6);
        // looking toward -Y puts the eye on +Y
        expect(cam.position.y).toBeGreaterThan(50);
    });
    it("yaw is wrapped to [-PI, PI)", () => {
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        cam.yaw = Math.PI;
        expect(cam.yaw).toBeCloseTo(-Math.PI, 12);
        cam.yaw = 7;
        expect(cam.yaw).toBeCloseTo(7 - 2 * Math.PI, 12);
    });
    it("a centre near the pole is pulled off it", () => {
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        cam.center = { x: 0, y: 0, z: 1000 };
        expect(cam.center.z).toBeLessThan(1000);
    });
});

import { describe, expect, it } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";
import { tiltGlobeCamera } from "./globe-tilt.ts";

const R = 6_371_000;

function angleFromDown(cam: GeospatialCamera): number {
    // Angle between the view direction and the geocentric "down" at the centre.
    const c = cam.center;
    const cl = Math.hypot(c.x, c.y, c.z);
    const up = { x: c.x / cl, y: c.y / cl, z: c.z / cl };
    const look = cam._lookAt;
    const cosPitch = -(look.x * up.x + look.y * up.y + look.z * up.z);
    return Math.acos(Math.max(-1, Math.min(1, cosPitch)));
}

function lookTargetError(cam: GeospatialCamera): number {
    // The view direction must point exactly at the centre point.
    const dx = cam.center.x - cam.position.x;
    const dy = cam.center.y - cam.position.y;
    const dz = cam.center.z - cam.position.z;
    const len = Math.hypot(dx, dy, dz);
    const l = cam._lookAt;
    return Math.hypot(dx / len - l.x, dy / len - l.y, dz / len - l.z);
}

describe("tiltGlobeCamera", () => {
    for (const pitch of [0.1, 0.6, 1.2]) {
        it(`tilts a fresh (fully zoomed out) camera to ${pitch} and keeps zoom, heading and centre`, () => {
            const cam = createGeospatialCamera({ planetRadius: R });
            setGeospatialOrientation(cam, { yaw: 0.7, center: { x: 0, y: R, z: 0 } });
            const before = { radius: cam.radius, yaw: cam.yaw, center: { ...cam.center } };

            tiltGlobeCamera(cam, pitch);

            expect(cam.pitch).toBeCloseTo(pitch, 9);
            expect(angleFromDown(cam)).toBeCloseTo(pitch, 6);
            expect(lookTargetError(cam)).toBeLessThan(1e-6);
            expect(cam.radius).toBe(before.radius);
            expect(cam.yaw).toBeCloseTo(before.yaw, 12);
            expect(cam.center.x).toBeCloseTo(before.center.x, 3);
            expect(cam.center.y).toBeCloseTo(before.center.y, 3);
            expect(cam.center.z).toBeCloseTo(before.center.z, 3);
        });
    }

    it("keeps the tilt when zoomed in and out afterwards", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        tiltGlobeCamera(cam, 0.8);
        for (const r of [R * 3, R * 0.5, 50, R * 2, cam.limits.radiusMax]) {
            cam.radius = r;
            expect(cam.pitch).toBeCloseTo(0.8, 9);
            expect(angleFromDown(cam)).toBeCloseTo(0.8, 6);
            expect(lookTargetError(cam)).toBeLessThan(1e-6);
        }
    });

    it("works on a camera already zoomed in", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        cam.radius = 100_000;
        tiltGlobeCamera(cam, 1.0);
        expect(cam.pitch).toBeCloseTo(1.0, 9);
        expect(cam.radius).toBe(100_000);
        expect(lookTargetError(cam)).toBeLessThan(1e-6);
    });
});

import { describe, it, expect } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation, type GeospatialCamera } from "@babylonjs/lite";
import { tiltGlobeCamera } from "./globe-tilt.ts";

const R = 6378137;

/** Angle between the look direction and the geocentric up at the centre, i.e. the pitch the camera really has. */
function measuredPitch(cam: GeospatialCamera): number {
    const c = cam.center;
    const len = Math.hypot(c.x, c.y, c.z);
    const look = cam._lookAt;
    const dot = (look.x * c.x + look.y * c.y + look.z * c.z) / len;
    return Math.acos(Math.max(-1, Math.min(1, -dot)));
}

/** The eye really sits on the ray from the centre along -look at distance radius. */
function eyeLooksAtCentre(cam: GeospatialCamera): boolean {
    const p = cam.position;
    const c = cam.center;
    const look = cam._lookAt;
    const d = cam.radius;
    return Math.abs(p.x + look.x * d - c.x) < 1e-3 && Math.abs(p.y + look.y * d - c.y) < 1e-3 && Math.abs(p.z + look.z * d - c.z) < 1e-3;
}

describe("tiltGlobeCamera", () => {
    it("tilts a new camera (fully zoomed out) without changing zoom, heading or centre", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        cam.yaw = 0.7;
        const before = { yaw: cam.yaw, radius: cam.radius, center: { ...cam.center } };

        tiltGlobeCamera(cam, 0.6);

        expect(measuredPitch(cam)).toBeCloseTo(0.6, 6);
        expect(cam.pitch).toBeCloseTo(0.6, 6);
        expect(cam.radius).toBe(before.radius);
        expect(cam.yaw).toBeCloseTo(before.yaw, 9);
        expect(cam.center.x).toBeCloseTo(before.center.x, 3);
        expect(cam.center.y).toBeCloseTo(before.center.y, 3);
        expect(cam.center.z).toBeCloseTo(before.center.z, 3);
        expect(eyeLooksAtCentre(cam)).toBe(true);
    });

    it("keeps the tilt when the app zooms in and out afterwards", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        tiltGlobeCamera(cam, 1.2);
        for (const r of [R * 3, R * 1.5, R * 0.5, 100, R * 2.5, R * 4]) {
            cam.radius = r;
            expect(measuredPitch(cam)).toBeCloseTo(1.2, 6);
            expect(eyeLooksAtCentre(cam)).toBe(true);
        }
    });

    it("works for the full pitch range at the starting zoom", () => {
        for (const p of [0.1, 0.5, 1.2]) {
            const cam = createGeospatialCamera({ planetRadius: R });
            tiltGlobeCamera(cam, p);
            expect(measuredPitch(cam)).toBeCloseTo(p, 6);
        }
    });

    it("keeps the tilt after a setGeospatialOrientation call with only a new radius", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        tiltGlobeCamera(cam, 0.9);
        setGeospatialOrientation(cam, { radius: R * 3.9 });
        expect(measuredPitch(cam)).toBeCloseTo(0.9, 6);
    });

    it("rejects a pitch outside the camera's limits instead of clamping it silently", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        expect(() => tiltGlobeCamera(cam, 2)).toThrow(RangeError);
        expect(() => tiltGlobeCamera(cam, Number.NaN)).toThrow(RangeError);
    });
});

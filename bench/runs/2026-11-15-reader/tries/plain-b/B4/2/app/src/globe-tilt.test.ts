import { describe, expect, it } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";
import { tiltGlobeCamera } from "./globe-tilt.js";

const R = 6371000;

/** Angle between the camera's look direction and the direction from the centre back to the planet core. */
function tiltOf(cam: ReturnType<typeof createGeospatialCamera>): number {
    const c = cam.center;
    const m = Math.hypot(c.x, c.y, c.z);
    const look = cam._lookAt;
    // Looking straight down means lookAt = -centerNormal, so dot = -1 and the angle is 0.
    const dot = -(look.x * c.x + look.y * c.y + look.z * c.z) / m;
    return Math.acos(Math.max(-1, Math.min(1, dot)));
}

describe("tiltGlobeCamera", () => {
    it("tilts a freshly created (fully zoomed out) camera without touching zoom, heading or centre", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        setGeospatialOrientation(cam, { yaw: 0.7, center: { x: R * 0.6, y: R * 0.5, z: R * 0.3 } });
        const before = { yaw: cam.yaw, radius: cam.radius, center: { ...cam.center } };

        tiltGlobeCamera(cam, 1.0);

        expect(cam.pitch).toBeCloseTo(1.0, 9);
        expect(tiltOf(cam)).toBeCloseTo(1.0, 6);
        expect(cam.yaw).toBeCloseTo(before.yaw, 9);
        expect(cam.radius).toBe(before.radius);
        expect(cam.center).toEqual(before.center);
    });

    it("keeps the tilt when the camera is moved nearer and farther", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        tiltGlobeCamera(cam, 0.4);

        for (const r of [R * 3, R * 1.5, R * 0.5, 50, R * 2.5, R * 4]) {
            cam.radius = r;
            expect(cam.pitch).toBeCloseTo(0.4, 9);
            expect(tiltOf(cam)).toBeCloseTo(0.4, 6);
        }
    });

    it("accepts the full range the app uses", () => {
        for (const p of [0.1, 0.6, 1.2]) {
            const cam = createGeospatialCamera({ planetRadius: R });
            tiltGlobeCamera(cam, p);
            expect(tiltOf(cam)).toBeCloseTo(p, 6);
        }
    });
});

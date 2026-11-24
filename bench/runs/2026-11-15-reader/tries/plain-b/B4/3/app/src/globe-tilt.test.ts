import { describe, expect, it } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";
import { tiltGlobeCamera } from "./globe-tilt";

const R = 6371000;

function lookAtOf(cam: ReturnType<typeof createGeospatialCamera>) {
    // Direction from the eye to the centre point.
    const c = cam.center;
    const p = cam.position;
    const dx = c.x - p.x;
    const dy = c.y - p.y;
    const dz = c.z - p.z;
    const len = Math.hypot(dx, dy, dz);
    return { x: dx / len, y: dy / len, z: dz / len };
}

describe("tiltGlobeCamera", () => {
    it("tilts a freshly created (fully zoomed-out) camera without changing zoom, heading or centre", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        setGeospatialOrientation(cam, { yaw: 0.7, center: { x: R * 0.6, y: R * 0.5, z: R * 0.3 } });
        const before = { yaw: cam.yaw, radius: cam.radius, center: { ...cam.center } };

        tiltGlobeCamera(cam, 0.8);

        expect(cam.pitch).toBeCloseTo(0.8, 9);
        expect(cam.radius).toBeCloseTo(before.radius, 6);
        expect(cam.yaw).toBeCloseTo(before.yaw, 9);
        expect(cam.center.x).toBeCloseTo(before.center.x, 3);
        expect(cam.center.y).toBeCloseTo(before.center.y, 3);
        expect(cam.center.z).toBeCloseTo(before.center.z, 3);

        // The camera really looks at its centre: the view direction's angle from
        // the geocentric up at the centre equals the requested pitch.
        const look = lookAtOf(cam);
        const c = cam.center;
        const cl = Math.hypot(c.x, c.y, c.z);
        const cosToUp = -(look.x * c.x + look.y * c.y + look.z * c.z) / cl;
        expect(Math.acos(cosToUp)).toBeCloseTo(0.8, 6);
    });

    it("keeps the tilt when the camera is later zoomed in and back out", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        tiltGlobeCamera(cam, 1.0);

        cam.radius = R * 1.5;
        expect(cam.pitch).toBeCloseTo(1.0, 9);
        cam.radius = R * 3.5;
        expect(cam.pitch).toBeCloseTo(1.0, 9);
        cam.radius = R * 4;
        expect(cam.pitch).toBeCloseTo(1.0, 9);
    });

    it("works for the pitch range the app uses", () => {
        for (const pitch of [0.1, 0.6, 1.2]) {
            const cam = createGeospatialCamera({ planetRadius: R });
            tiltGlobeCamera(cam, pitch);
            expect(cam.pitch).toBeCloseTo(pitch, 9);
        }
    });
});

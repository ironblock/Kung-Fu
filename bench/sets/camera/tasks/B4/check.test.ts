import { describe, expect, it } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";
import { tiltGlobeCamera } from "../src/globe-tilt";

const R = 1000;

/** The angle between the camera's line of sight (eye to centre) and straight down at the centre. */
function seenTilt(camera: GeospatialCamera): number {
    const c = camera.center;
    const p = camera.position;
    const look = { x: c.x - p.x, y: c.y - p.y, z: c.z - p.z };
    const lookLen = Math.hypot(look.x, look.y, look.z);
    const cLen = Math.hypot(c.x, c.y, c.z);
    const down = { x: -c.x / cLen, y: -c.y / cLen, z: -c.z / cLen };
    const cos = (look.x * down.x + look.y * down.y + look.z * down.z) / lookLen;
    return Math.acos(Math.max(-1, Math.min(1, cos)));
}

describe("B4 globe tilt", () => {
    it("tilts a newly created, fully zoomed-out camera without zooming, turning or moving it", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        const radius = camera.radius;
        const yaw = camera.yaw;
        const center = { ...camera.center };

        tiltGlobeCamera(camera, 0.8);

        expect(camera.pitch).toBeCloseTo(0.8, 6);
        expect(seenTilt(camera)).toBeCloseTo(0.8, 4);
        expect(camera.radius).toBeCloseTo(radius, 9);
        expect(camera.yaw).toBeCloseTo(yaw, 9);
        expect(camera.center.x).toBeCloseTo(center.x, 9);
        expect(camera.center.y).toBeCloseTo(center.y, 9);
        expect(camera.center.z).toBeCloseTo(center.z, 9);
    });

    it("tilts a camera that is already close to the globe, and can tilt it again", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        camera.radius = 1.5 * R;
        tiltGlobeCamera(camera, 1.1);
        expect(camera.pitch).toBeCloseTo(1.1, 6);
        expect(seenTilt(camera)).toBeCloseTo(1.1, 4);
        tiltGlobeCamera(camera, 0.3);
        expect(camera.pitch).toBeCloseTo(0.3, 6);
        expect(camera.radius).toBeCloseTo(1.5 * R, 9);
    });

    it("keeps the tilt when the camera is later moved nearer or farther", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        tiltGlobeCamera(camera, 0.6);
        camera.radius = 3 * R;
        expect(camera.pitch).toBeCloseTo(0.6, 6);
        expect(seenTilt(camera)).toBeCloseTo(0.6, 4);
        camera.radius = 4 * R;
        expect(camera.pitch).toBeCloseTo(0.6, 6);
        camera.radius = 1.2 * R;
        expect(camera.pitch).toBeCloseTo(0.6, 6);
        expect(seenTilt(camera)).toBeCloseTo(0.6, 4);
    });
});

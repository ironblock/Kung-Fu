import { describe, expect, it } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation, getViewMatrix } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";
import { tiltGlobeCamera } from "./globe-tilt.js";

const R = 100;

function lookAtFromWorld(cam: GeospatialCamera): { x: number; y: number; z: number } {
    const w = cam.worldMatrix as unknown as ArrayLike<number>;
    // Column 2 of the camera-to-world matrix is the local +Z (forward) axis.
    return { x: w[8]!, y: w[9]!, z: w[10]! };
}

function centreDirectionError(cam: GeospatialCamera): number {
    // Centre must lie on the forward axis: view-space x and y of the centre are zero.
    const v = getViewMatrix(cam) as unknown as ArrayLike<number>;
    const c = cam.center;
    const x = v[0]! * c.x + v[4]! * c.y + v[8]! * c.z + v[12]!;
    const y = v[1]! * c.x + v[5]! * c.y + v[9]! * c.z + v[13]!;
    const z = v[2]! * c.x + v[6]! * c.y + v[10]! * c.z + v[14]!;
    return Math.hypot(x, y) / Math.abs(z);
}

describe("tiltGlobeCamera", () => {
    it("tilts a fresh, fully zoomed-out camera to the requested pitch", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        const radius = cam.radius;
        const yaw = cam.yaw;
        const center = { ...cam.center };
        expect(cam.pitch).toBeLessThan(0.01); // fresh camera is straight down

        tiltGlobeCamera(cam, 0.6);

        expect(cam.pitch).toBeCloseTo(0.6, 9);
        expect(cam.radius).toBe(radius);
        expect(cam.yaw).toBeCloseTo(yaw, 12);
        expect(cam.center).toEqual(center);
        expect(centreDirectionError(cam)).toBeLessThan(1e-4);
    });

    it("the look direction makes the requested angle with the geocentric down axis", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        for (const pitch of [0.1, 0.5, 1.2]) {
            tiltGlobeCamera(cam, pitch);
            const c = cam.center;
            const up = { x: c.x / R, y: c.y / R, z: c.z / R };
            const look = lookAtFromWorld(cam);
            // Forward vector: cos(angle between forward and straight down) = -forward·up.
            const cosPitch = -(look.x * up.x + look.y * up.y + look.z * up.z);
            expect(Math.acos(Math.min(1, Math.max(-1, cosPitch)))).toBeCloseTo(pitch, 4);
        }
    });

    it("keeps the tilt when moved nearer and farther", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        tiltGlobeCamera(cam, 1.0);
        for (const r of [10, 50, 150, 300, cam.limits.radiusMax]) {
            setGeospatialOrientation(cam, { radius: r });
            expect(cam.pitch).toBeCloseTo(1.0, 9);
            expect(cam.radius).toBeCloseTo(r, 9);
            expect(centreDirectionError(cam)).toBeLessThan(1e-4);
        }
    });

    it("works for a camera already zoomed in", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        setGeospatialOrientation(cam, { radius: 170, yaw: 0.6, pitch: 0.2 });
        tiltGlobeCamera(cam, 1.1);
        expect(cam.pitch).toBeCloseTo(1.1, 9);
        expect(cam.radius).toBeCloseTo(170, 9);
        expect(cam.yaw).toBeCloseTo(0.6, 9);
        expect(centreDirectionError(cam)).toBeLessThan(1e-4);
    });
});

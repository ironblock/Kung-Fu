import { describe, expect, it } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";
import { tiltGlobeCamera } from "./globe-tilt";

const R = 6_378_137;

function check(cam: ReturnType<typeof createGeospatialCamera>, pitch: number) {
    const c = cam.center;
    const cl = Math.hypot(c.x, c.y, c.z);
    // Exact (float64) derived pose: the eye looks at the centre from `radius` away, at `pitch`.
    const e = cam.position;
    const d = { x: c.x - e.x, y: c.y - e.y, z: c.z - e.z };
    const len = Math.hypot(d.x, d.y, d.z);
    expect(len / cam.radius).toBeCloseTo(1, 9);
    expect(Math.acos(-(d.x * c.x + d.y * c.y + d.z * c.z) / (len * cl))).toBeCloseTo(pitch, 9);
    // Rendered world matrix (float32 storage): forward axis points at the centre at that tilt.
    const m = cam.worldMatrix as unknown as ArrayLike<number>;
    const fwd = { x: m[8]!, y: m[9]!, z: m[10]! };
    expect((fwd.x * d.x + fwd.y * d.y + fwd.z * d.z) / len).toBeCloseTo(1, 5);
    expect(Math.acos(-(fwd.x * c.x + fwd.y * c.y + fwd.z * c.z) / cl)).toBeCloseTo(pitch, 3);
    expect(cam.pitch).toBeCloseTo(pitch, 12);
}

describe("tiltGlobeCamera", () => {
    for (const pitch of [0.1, 0.5, 0.8, 1.2]) {
        it(`tilts a fresh camera to ${pitch}`, () => {
            const cam = createGeospatialCamera({ planetRadius: R });
            setGeospatialOrientation(cam, { yaw: 0.7, center: { x: R * 0.6, y: R * 0.48, z: R * 0.64 } });
            const yaw = cam.yaw, radius = cam.radius, center = { ...cam.center };
            tiltGlobeCamera(cam, pitch);
            expect(cam.yaw).toBe(yaw);
            expect(cam.radius).toBe(radius);
            expect(cam.center).toEqual(center);
            check(cam, pitch);
            for (const r of [R * 3, R * 2, R, 1000, 50, R * 4]) {
                cam.radius = r;
                check(cam, pitch);
            }
            setGeospatialOrientation(cam, { radius: R * 1.5 });
            check(cam, pitch);
        });
    }
    it("works at close zoom", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        cam.radius = 5000;
        tiltGlobeCamera(cam, 1.0);
        expect(cam.radius).toBe(5000);
        check(cam, 1.0);
    });
});

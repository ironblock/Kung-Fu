// Ticket f: setGeospatialOrientation always re-applies; setters skip writes equal to the stored value; center always applies.
import { describe, expect, it } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";

const R = 1000;
describe("ticket f", () => {
    it("with no field given it still re-applies the limits", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        cam.limits.radiusMax = 2000;
        cam.limits.yawMax = 0.25;
        setGeospatialOrientation(cam, {});
        expect(cam.radius).toBe(2000);
        expect(cam.yaw).toBe(0);
        cam.limits.yawMin = 0.1;
        setGeospatialOrientation(cam, {});
        expect(cam.yaw).toBe(0.1);
    });
    it("omitted, undefined or null fields keep the current value; given ones are wrapped and clamped", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        cam.limits.pitchDisabledRadiusScale = null;
        setGeospatialOrientation(cam, { yaw: 0.5, pitch: 0.7, radius: 3000 });
        cam.limits.radiusMax = 2000;
        setGeospatialOrientation(cam, { yaw: undefined, pitch: null as never, radius: null as never, center: null as never });
        expect(cam.yaw).toBe(0.5);
        expect(cam.pitch).toBe(0.7);
        expect(cam.radius).toBe(2000);
        expect(cam.center).toEqual({ x: R, y: 0, z: 0 });
        setGeospatialOrientation(cam, { yaw: 4 });
        expect(cam.yaw).toBeCloseTo(4 - 2 * Math.PI, 12);
        expect(cam.pitch).toBe(0.7);
        setGeospatialOrientation(cam, { radius: 5 });
        expect(cam.radius).toBe(10);
    });
    it("yaw/pitch/radius setters skip a write equal to the stored (wrapped, clamped) value", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        cam.limits.radiusMax = 2000;
        cam.yaw = cam.yaw;
        cam.pitch = cam.pitch;
        cam.radius = cam.radius;
        expect(cam.radius).toBe(4000);
        // stored yaw is wrapped: writing 4 again differs from the stored 4 - 2PI, so it applies
        const c2 = createGeospatialCamera({ planetRadius: R });
        c2.yaw = 4;
        c2.limits.radiusMax = 2000;
        c2.yaw = 4;
        expect(c2.radius).toBe(2000);
        // stored radius is clamped: a write clamped back to the stored value still applies everything
        const c3 = createGeospatialCamera({ planetRadius: R });
        c3.limits.yawMax = 0;
        c3.limits.yawMin = 0;
        c3.radius = 9000; // differs from 4000, clamped back to 4000 by radiusMax
        expect(c3.radius).toBe(4000);
        c3.limits.yawMin = 0.3;
        c3.limits.yawMax = 0.3;
        c3.radius = 9000;
        expect(c3.yaw).toBe(0.3);
        expect(c3.radius).toBe(4000);
    });
    it("the center setter always re-applies", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        cam.limits.radiusMax = 1500;
        cam.center = cam.center;
        expect(cam.radius).toBe(1500);
    });

    it("pitch is wrapped to [-PI, PI) as yaw is", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        cam.limits.pitchDisabledRadiusScale = null;
        setGeospatialOrientation(cam, { pitch: 7, yaw: -4 });
        expect(cam.pitch).toBeCloseTo(7 - 2 * Math.PI, 12);
        expect(cam.yaw).toBeCloseTo(-4 + 2 * Math.PI, 12);
        setGeospatialOrientation(cam, { yaw: Math.PI });
        expect(cam.yaw).toBeCloseTo(-Math.PI, 12);
    });
});

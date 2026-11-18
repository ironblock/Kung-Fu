// Ticket d: the camera clamps with the limits object it was created with; field edits apply, reassignment does not.
import { describe, expect, it } from "vitest";
import { attachGeospatialControls, createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";
import { asCanvas, fire, makeCanvas, makeScene, tick } from "./helpers";

const R = 1000;
describe("ticket d", () => {
    it("a field edit applies at the next write that changes the value, not at an equal write", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        expect(cam.radius).toBe(4 * R);
        cam.limits.radiusMax = 2000;
        expect(cam.radius).toBe(4000);
        cam.radius = cam.radius; // equal: nothing
        expect(cam.radius).toBe(4000);
        cam.yaw = cam.yaw;
        cam.pitch = cam.pitch;
        expect(cam.radius).toBe(4000);
        cam.radius = 3000;
        expect(cam.radius).toBe(2000);

        const c2 = createGeospatialCamera({ planetRadius: R });
        c2.limits.radiusMax = 2000;
        c2.yaw = 0.5; // a yaw write that changes the value re-applies all limits
        expect(c2.radius).toBe(2000);

        const c3 = createGeospatialCamera({ planetRadius: R });
        c3.limits.radiusMax = 2000;
        c3.pitch = 0.002;
        expect(c3.radius).toBe(2000);
    });
    it("any center assignment applies, cam.center = cam.center included", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        cam.limits.radiusMax = 2500;
        cam.center = cam.center;
        expect(cam.radius).toBe(2500);
        cam.limits.radiusMin = 3000;
        cam.limits.radiusMax = 5000;
        cam.center = { x: R, y: 0, z: 0 };
        expect(cam.radius).toBe(3000);
    });
    it("pitchDisabledRadiusScale = null, or a new {x,y}, on the held object takes effect", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        cam.pitch = 1;
        expect(cam.pitch).toBeCloseTo(0.001, 12); // radius 4R: forced to pitchMin
        cam.limits.pitchDisabledRadiusScale = null;
        cam.pitch = 1.2;
        expect(cam.pitch).toBe(1.2);
        for (const r of [10, 100 * R]) {
            cam.radius = r;
            cam.pitch = 1.3;
            expect(cam.pitch).toBe(1.3);
        }
        const c2 = createGeospatialCamera({ planetRadius: R });
        c2.limits.pitchDisabledRadiusScale = { x: 5, y: 6 };
        c2.pitch = 1;
        expect(c2.pitch).toBe(1);
    });
    it("assigning a new object to camera.limits changes none of the camera's clamping", () => {
        const cam = createGeospatialCamera({ planetRadius: R });
        const original = cam.limits;
        cam.limits = { ...original, radiusMax: 2000, pitchDisabledRadiusScale: null };
        cam.radius = 3000;
        expect(cam.radius).toBe(3000);
        cam.pitch = 1;
        expect(cam.pitch).toBeLessThan(1); // the new object's null scale is not used
        cam.center = cam.center;
        expect(cam.radius).toBe(3000);
        setGeospatialOrientation(cam, { radius: 3500 });
        expect(cam.radius).toBe(3500);
        cam.radius = 9000; // original radiusMax is 4R
        expect(cam.radius).toBe(4000);
        cam.pitch = 1.1; // at 4R the original scale still forces pitchMin
        expect(cam.pitch).toBeCloseTo(0.001, 12);
        cam.limits.radiusMax = 100; // edits to the new object do nothing either
        cam.radius = 3000;
        expect(cam.radius).toBe(3000);
        original.radiusMax = 2000; // the original object still drives it
        cam.radius = 3100;
        expect(cam.radius).toBe(2000);
    });

    it("attachGeospatialControls reads camera.limits as assigned; the camera then clamps by the object it was made with", () => {
        (globalThis as { window?: unknown }).window ??= { addEventListener() {}, removeEventListener() {} };
        function run(limits: Record<string, number> | null, deltaY: number) {
            const cam = createGeospatialCamera({ planetRadius: R });
            if (limits) cam.limits = { ...cam.limits, ...limits };
            if (deltaY > 0) cam.radius = 2000;
            const canvas = makeCanvas();
            const scene = makeScene();
            attachGeospatialControls(cam, asCanvas(canvas), scene);
            for (let i = 0; i < 40; i++) {
                fire(canvas, "wheel", { deltaY, clientX: 400, clientY: 300 });
                tick(scene);
            }
            tick(scene, 60);
            return cam.radius;
        }
        expect(run(null, -100)).toBeLessThan(3990);
        expect(run({ radiusMin: 3990 }, -100)).toBeGreaterThanOrEqual(3990 - 1e-6);
        // a wider new radiusMax lets the controls ask for more, but the camera keeps the original 4R
        const out = run({ radiusMax: 100000 }, 100);
        expect(out).toBeGreaterThan(3000); // the zoom-out did run
        expect(out).toBeLessThanOrEqual(4000);
    });
});

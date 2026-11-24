import { describe, expect, it } from "vitest";
import { computeLookAtFromYawPitch, createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";
import { tiltGlobeCamera } from "../src/globe-tilt";

const R = 1000;

type V = { x: number; y: number; z: number };

/**
 * The camera's own state, read through the getters the library gave it, kept before the answer runs. An answer
 * that puts accessors of its own on the camera cannot change what these report. The view is read from the
 * camera's world matrix, which is what a renderer reads: the eye is its translation, the line of sight its
 * third column.
 */
function own(camera: GeospatialCamera) {
    const get = (name: string) => {
        const d = Object.getOwnPropertyDescriptor(camera, name);
        if (!d || !d.get) {
            throw new Error(`the camera has no own getter for ${name}`);
        }
        return d.get;
    };
    const g = { pitch: get("pitch"), yaw: get("yaw"), radius: get("radius"), center: get("center"), wm: get("worldMatrix") };
    return {
        pitch: () => g.pitch.call(camera) as number,
        yaw: () => g.yaw.call(camera) as number,
        radius: () => g.radius.call(camera) as number,
        center: () => ({ ...(g.center.call(camera) as V) }),
        view: () => {
            const m = g.wm.call(camera) as unknown as number[];
            const eye = { x: m[12]!, y: m[13]!, z: m[14]! };
            const f = { x: m[8]!, y: m[9]!, z: m[10]! };
            const fl = Math.hypot(f.x, f.y, f.z);
            return { eye, look: { x: f.x / fl, y: f.y / fl, z: f.z / fl } };
        },
    };
}

/** The angle between a line of sight and straight down at the centre. */
function tiltOf(look: V, c: V): number {
    const cl = Math.hypot(c.x, c.y, c.z);
    const cos = -(look.x * c.x + look.y * c.y + look.z * c.z) / cl;
    return Math.acos(Math.max(-1, Math.min(1, cos)));
}

/**
 * The camera, as the library holds it, looks at `center` from `radius` away, at tilt `pitch` and heading `yaw`:
 * its real pitch, yaw and radius read so, and its world matrix shows that view.
 */
function expectPose(o: ReturnType<typeof own>, pitch: number, yaw: number, radius: number, center: V): void {
    expect(o.pitch()).toBeCloseTo(pitch, 6);
    expect(o.yaw()).toBeCloseTo(yaw, 9);
    expect(o.radius()).toBeCloseTo(radius, 6);
    const c = o.center();
    expect(c.x).toBeCloseTo(center.x, 6);
    expect(c.y).toBeCloseTo(center.y, 6);
    expect(c.z).toBeCloseTo(center.z, 6);
    const { eye, look } = o.view();
    expect(tiltOf(look, center)).toBeCloseTo(pitch, 4);
    const want = computeLookAtFromYawPitch(yaw, pitch, center, { x: 0, y: 0, z: 0 });
    expect(look.x).toBeCloseTo(want.x, 5);
    expect(look.y).toBeCloseTo(want.y, 5);
    expect(look.z).toBeCloseTo(want.z, 5);
    const tol = radius * 1e-6;
    expect(Math.abs(eye.x - (center.x - want.x * radius))).toBeLessThan(tol);
    expect(Math.abs(eye.y - (center.y - want.y * radius))).toBeLessThan(tol);
    expect(Math.abs(eye.z - (center.z - want.z * radius))).toBeLessThan(tol);
}

describe("B4 globe tilt", () => {
    it("tilts a newly created, fully zoomed-out camera without zooming, turning or moving it", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        const o = own(camera);
        const radius = o.radius();
        const yaw = o.yaw();
        const center = o.center();

        tiltGlobeCamera(camera, 0.8);

        expectPose(o, 0.8, yaw, radius, center);
    });

    it("tilts a camera that is already close to the globe, and can tilt it again", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        const o = own(camera);
        camera.radius = 1.5 * R;
        const center = o.center();
        tiltGlobeCamera(camera, 1.1);
        expectPose(o, 1.1, 0, 1.5 * R, center);
        tiltGlobeCamera(camera, 0.3);
        expectPose(o, 0.3, 0, 1.5 * R, center);
    });

    it("keeps the tilt when the camera is later moved nearer or farther", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        const o = own(camera);
        const center = o.center();
        tiltGlobeCamera(camera, 0.6);
        camera.radius = 3 * R;
        expectPose(o, 0.6, 0, 3 * R, center);
        camera.radius = 4 * R;
        expectPose(o, 0.6, 0, 4 * R, center);
        camera.radius = 1.2 * R;
        expectPose(o, 0.6, 0, 1.2 * R, center);
    });

    it("tilts a camera with another heading, another centre and another planet, and keeps the heading", () => {
        const planet = 6000;
        const camera = createGeospatialCamera({ planetRadius: planet });
        const o = own(camera);
        const s = Math.SQRT1_2 * planet;
        setGeospatialOrientation(camera, { yaw: 1.0, center: { x: s, y: s * 0.6, z: s * 0.8 } });
        const yaw = o.yaw();
        const radius = o.radius();
        const center = o.center();
        expect(yaw).toBeCloseTo(1.0, 9);
        expect(radius).toBeCloseTo(4 * planet, 6);

        tiltGlobeCamera(camera, 0.9);
        expectPose(o, 0.9, yaw, radius, center);

        camera.radius = 2.5 * planet;
        expectPose(o, 0.9, yaw, 2.5 * planet, center);
        camera.radius = 3.5 * planet;
        expectPose(o, 0.9, yaw, 3.5 * planet, center);
    });
    it("keeps the tilt given close to the globe when the camera is later moved out", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        const o = own(camera);
        camera.radius = 1.5 * R;
        const center = o.center();
        tiltGlobeCamera(camera, 0.6);
        expectPose(o, 0.6, 0, 1.5 * R, center);
        camera.radius = 3.5 * R;
        expectPose(o, 0.6, 0, 3.5 * R, center);
        camera.radius = 4 * R;
        expectPose(o, 0.6, 0, 4 * R, center);
    });

    it("keeps the tilt when the app asks for a zoom past the farthest the camera goes", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        const o = own(camera);
        const center = o.center();
        camera.radius = 2 * R;
        tiltGlobeCamera(camera, 0.6);
        camera.radius = 6 * R;
        expectPose(o, 0.6, 0, o.radius(), center);
        expect(o.radius()).toBeGreaterThan(2 * R);
    });

    it("keeps the tilt when the app zooms through setGeospatialOrientation", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        const o = own(camera);
        const center = o.center();
        tiltGlobeCamera(camera, 0.6);
        setGeospatialOrientation(camera, { radius: 3.5 * R });
        expectPose(o, 0.6, 0, 3.5 * R, center);
        setGeospatialOrientation(camera, { radius: 1.5 * R });
        expectPose(o, 0.6, 0, 1.5 * R, center);
    });
});

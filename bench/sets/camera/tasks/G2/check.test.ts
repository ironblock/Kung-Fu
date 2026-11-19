import { describe, expect, it, vi } from "vitest";
import { computeLocalBasis, createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";
import type { GeospatialCamera } from "@babylonjs/lite";
import { centerOnLatLon } from "../src/center-on";

const R = 1000;
type V = { x: number; y: number; z: number };

function newCamera(): GeospatialCamera {
    const camera = createGeospatialCamera({ planetRadius: R });
    setGeospatialOrientation(camera, { radius: 1500, pitch: 0.4, yaw: 0.3 });
    return camera;
}

// The camera's own east, north and up at the point it starts centred on (latitude 0, longitude 0).
function originFrame(): { east: V; north: V; up: V } {
    const start = createGeospatialCamera({ planetRadius: R }).center;
    const east = { x: 0, y: 0, z: 0 };
    const north = { x: 0, y: 0, z: 0 };
    const up = { x: 0, y: 0, z: 0 };
    computeLocalBasis({ ...start }, east, north, up);
    return { east, north, up };
}

function expected(latDeg: number, lonDeg: number): V {
    const { east, north, up } = originFrame();
    const lat = (latDeg * Math.PI) / 180;
    const lon = (lonDeg * Math.PI) / 180;
    const a = R * Math.cos(lat) * Math.cos(lon);
    const b = R * Math.cos(lat) * Math.sin(lon);
    const c = R * Math.sin(lat);
    return { x: a * up.x + b * east.x + c * north.x, y: a * up.y + b * east.y + c * north.y, z: a * up.z + b * east.z + c * north.z };
}

function expectNear(actual: V, want: V): void {
    expect(Math.hypot(actual.x - want.x, actual.y - want.y, actual.z - want.z)).toBeLessThan(1e-6 * R);
}

describe("G2 centerOnLatLon", () => {
    it("puts latitude 0, longitude 0 at the camera's starting centre", () => {
        const camera = newCamera();
        centerOnLatLon(camera, 0, 0);
        expectNear(camera.center, expected(0, 0));
    });

    it("moves the centre east for a positive longitude, as the camera reckons east", () => {
        const camera = newCamera();
        centerOnLatLon(camera, 0, 20);
        const { east } = originFrame();
        expect(camera.center.x * east.x + camera.center.y * east.y + camera.center.z * east.z).toBeGreaterThan(0);
        expectNear(camera.center, expected(0, 20));
        centerOnLatLon(camera, 0, -75);
        expectNear(camera.center, expected(0, -75));
    });

    it("moves the centre north for a positive latitude", () => {
        const camera = newCamera();
        centerOnLatLon(camera, 45, 0);
        expectNear(camera.center, expected(45, 0));
        centerOnLatLon(camera, -30, 120);
        expectNear(camera.center, expected(-30, 120));
        centerOnLatLon(camera, 60, -150);
        expectNear(camera.center, expected(60, -150));
    });

    it("keeps zoom, heading and tilt", () => {
        const camera = newCamera();
        centerOnLatLon(camera, 30, 40);
        expect(camera.radius).toBeCloseTo(1500, 6);
        expect(camera.pitch).toBeCloseTo(0.4, 6);
        expect(camera.yaw).toBeCloseTo(0.3, 6);
    });

    // Added 2026-11-19. The tests above read camera.center. An answer that wrote the point into the
    // camera's own centre vector in place passed them, while the eye, the up vector and the view stayed
    // where they were. This test keeps the camera's own world matrix getter from before the calls and
    // compares the view, after each of three calls and after a later heading write, with a library camera
    // put at the expected centre by setGeospatialOrientation, with the same zoom, heading and tilt.
    it("moves the camera's view with the centre, as the library's own camera there would be", () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        setGeospatialOrientation(camera, { radius: 1700, pitch: 0.6, yaw: -0.8 });
        const own = Object.getOwnPropertyDescriptor(camera, "worldMatrix")!.get!;
        const view = () => Array.from(own.call(camera) as unknown as ArrayLike<number>);
        view();
        const compare = (lat: number, lon: number, yaw: number) => {
            const lib = createGeospatialCamera({ planetRadius: R });
            setGeospatialOrientation(lib, { radius: 1700, pitch: 0.6, yaw, center: expected(lat, lon) });
            const want = Array.from(lib.worldMatrix as unknown as ArrayLike<number>);
            const got = view();
            expect(Math.hypot(got[12]! - want[12]!, got[13]! - want[13]!, got[14]! - want[14]!)).toBeLessThan(1e-6 * R);
            for (const i of [0, 1, 2, 4, 5, 6, 8, 9, 10]) expect(Math.abs(got[i]! - want[i]!)).toBeLessThan(1e-6);
            expect(Math.hypot(camera.position.x - want[12]!, camera.position.y - want[13]!, camera.position.z - want[14]!)).toBeLessThan(1e-6 * R);
        };
        centerOnLatLon(camera, 30, 40);
        compare(30, 40, -0.8);
        centerOnLatLon(camera, -30, 120);
        compare(-30, 120, -0.8);
        centerOnLatLon(camera, 60, -150);
        compare(60, -150, -0.8);
        camera.yaw = 1.1;
        compare(60, -150, 1.1);
    });
    // Added 2026-11-19, after a fresh attack. The default build is left-handed, so an answer that wrote
    // in that build's axes, and never asked the camera which way is east, passed every test above. "North
    // and east must be the camera's own": this test loads the library's right-handed build, whose camera
    // reckons east the other way, and the answer with it. It also uses a planet of another radius, and
    // starts from a camera whose centre is off the ground.
    it("follows the camera's own east and north in the right-handed build too, on any planet", async () => {
        vi.resetModules();
        vi.doMock("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system.ts", () => ({ _rightHanded: true }));
        try {
            const lite = await import("@babylonjs/lite");
            const { centerOnLatLon: center } = await import("../src/center-on");
            for (const radius of [1000, 2500]) {
                const start = lite.createGeospatialCamera({ planetRadius: radius }).center;
                const east = { x: 0, y: 0, z: 0 };
                const north = { x: 0, y: 0, z: 0 };
                const up = { x: 0, y: 0, z: 0 };
                lite.computeLocalBasis({ ...start }, east, north, up);
                // The right-handed camera's own east is not the left-handed build's.
                const lh = originFrame().east;
                expect(east.x * lh.x + east.y * lh.y + east.z * lh.z).toBeLessThan(0);
                const want = (latDeg: number, lonDeg: number): V => {
                    const lat = (latDeg * Math.PI) / 180;
                    const lon = (lonDeg * Math.PI) / 180;
                    const a = radius * Math.cos(lat) * Math.cos(lon);
                    const b = radius * Math.cos(lat) * Math.sin(lon);
                    const c = radius * Math.sin(lat);
                    return { x: a * up.x + b * east.x + c * north.x, y: a * up.y + b * east.y + c * north.y, z: a * up.z + b * east.z + c * north.z };
                };
                const near = (got: V, w: V) => expect(Math.hypot(got.x - w.x, got.y - w.y, got.z - w.z)).toBeLessThan(1e-6 * radius);
                const camera = lite.createGeospatialCamera({ planetRadius: radius });
                lite.setGeospatialOrientation(camera, { radius: 1.5 * radius, pitch: 0.4, yaw: 0.3, center: { x: 1.3 * radius, y: 0.1 * radius, z: 0 } });
                center(camera, 0, 20);
                expect(camera.center.x * east.x + camera.center.y * east.y + camera.center.z * east.z).toBeGreaterThan(0);
                near(camera.center, want(0, 20));
                center(camera, 45, -60);
                near(camera.center, want(45, -60));
                center(camera, -30, 120);
                near(camera.center, want(-30, 120));
            }
        } finally {
            vi.doUnmock("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system.ts");
            vi.resetModules();
        }
    });
});

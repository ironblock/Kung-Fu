import { describe, expect, it } from "vitest";
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
});

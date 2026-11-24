import { expect, it } from "vitest";
import { computeLocalBasis, createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";
import { centerOnLatLon } from "../src/center-on";

// Real state: the eye and axes from the camera's own worldMatrix getter (kept before the call), compared with a
// library camera put at the expected centre by setGeospatialOrientation with the same radius, pitch and yaw.
const R = 1000;
function expected(latDeg: number, lonDeg: number) {
    const e = { x: 0, y: 0, z: 0 }, n = { x: 0, y: 0, z: 0 }, u = { x: 0, y: 0, z: 0 };
    computeLocalBasis({ ...createGeospatialCamera({ planetRadius: R }).center }, e, n, u);
    const lat = (latDeg * Math.PI) / 180, lon = (lonDeg * Math.PI) / 180;
    const a = R * Math.cos(lat) * Math.cos(lon), b = R * Math.cos(lat) * Math.sin(lon), c = R * Math.sin(lat);
    return { x: a * u.x + b * e.x + c * n.x, y: a * u.y + b * e.y + c * n.y, z: a * u.z + b * e.z + c * n.z };
}

for (const [lat, lon] of [[30, 40], [-30, 120], [60, -150]] as const) {
    it(`G2 ${lat},${lon}: the camera's real view re-orbits the new centre`, () => {
        const camera = createGeospatialCamera({ planetRadius: R });
        setGeospatialOrientation(camera, { radius: 1500, pitch: 0.4, yaw: 0.3 });
        const ownWm = Object.getOwnPropertyDescriptor(camera, "worldMatrix")!.get!;
        ownWm.call(camera);
        centerOnLatLon(camera, lat, lon);
        const got = ownWm.call(camera) as unknown as number[];
        const lib = createGeospatialCamera({ planetRadius: R });
        setGeospatialOrientation(lib, { radius: 1500, pitch: 0.4, yaw: 0.3, center: expected(lat, lon) });
        const want = lib.worldMatrix as unknown as number[];
        const eyeOff = Math.hypot(got[12]! - want[12]!, got[13]! - want[13]!, got[14]! - want[14]!);
        console.log(`PROBE ${lat},${lon} eye off by ${eyeOff.toFixed(3)} position off by ${Math.hypot(camera.position.x - lib.position.x, camera.position.y - lib.position.y, camera.position.z - lib.position.z).toFixed(3)}`);
        expect(eyeOff).toBeLessThan(1e-3);
        for (const i of [4, 5, 6, 8, 9, 10]) expect(got[i]).toBeCloseTo(want[i]!, 5);
    });
}

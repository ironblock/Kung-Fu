import { expect, test } from "vitest";
import { createGeospatialCamera } from "@babylonjs/lite";

test("geospatial: a center near a pole (+-Z) is pulled back to about 89.96 degrees latitude", () => {
    const R = 1000;
    const cam = createGeospatialCamera({ planetRadius: R });
    cam.center = { x: 0, y: 0, z: R };
    expect(cam.center.z).toBeCloseTo(R * 0.998749218, 6);
    expect(Math.hypot(cam.center.x, cam.center.y, cam.center.z)).toBeCloseTo(R, 6);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: the pole limit is spherical latitude asin(0.998749) = 87.13 degrees; 88 is moved, 87 kept", () => {
    const R = 1000;
    const deg = Math.PI / 180;
    const cam = L.createGeospatialCamera({ planetRadius: R });
    const at = (lat: number, lon: number) => ({ x: R * Math.cos(lat * deg) * Math.cos(lon * deg), y: R * Math.cos(lat * deg) * Math.sin(lon * deg), z: R * Math.sin(lat * deg) });
    cam.center = at(88, 30);
    const c = cam.center;
    expect(Math.asin(c.z / R) / deg).toBeCloseTo(87.13, 2);
    expect(Math.atan2(c.y, c.x) / deg).toBeCloseTo(30, 9);
    expect(Math.hypot(c.x, c.y, c.z)).toBeCloseTo(R, 6);
    cam.center = at(-88, 0);
    expect(Math.asin(cam.center.z / R) / deg).toBeCloseTo(-87.13, 2);
    cam.center = at(87, 0);
    expect(Math.asin(cam.center.z / R) / deg).toBeCloseTo(87, 9);
});

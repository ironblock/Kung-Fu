import { it, expect } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation } from "@babylonjs/lite";

it("60: a center applied past +-87.13 degrees latitude is moved to it, keeping distance and longitude", () => {
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    const lim = Math.asin(0.998749218);
    expect((lim * 180) / Math.PI).toBeCloseTo(87.13, 2);
    setGeospatialOrientation(cam, { center: { x: 30, y: 40, z: 1000 } });
    const c = cam.center;
    const mag = Math.hypot(c.x, c.y, c.z);
    expect(mag).toBeCloseTo(Math.hypot(30, 40, 1000), 6);
    expect(Math.asin(c.z / mag)).toBeCloseTo(lim, 6);
    expect(Math.atan2(c.y, c.x)).toBeCloseTo(Math.atan2(40, 30), 9);
    cam.center = { x: 0, y: 0, z: -2000 };
    expect(Math.asin(cam.center.z / 2000)).toBeCloseTo(-lim, 6);
    // written in place: moved only when next applied
    cam.center.z = -2000;
    cam.center.x = 0;
    expect(cam.center.z).toBe(-2000);
    cam.yaw = 0.3;
    expect(cam.center.z).toBeGreaterThan(-2000);
    // inside the limit: untouched
    cam.center = { x: 500, y: 0, z: 500 };
    expect({ ...cam.center }).toEqual({ x: 500, y: 0, z: 500 });
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

it("60c (after check): a yaw write of the same value does not apply an in-place polar center", () => {
    const cam = L.createGeospatialCamera({ planetRadius: 1000 });
    cam.center.x = 0;
    cam.center.z = 1000;
    cam.yaw = cam.yaw;
    expect(cam.center.z).toBe(1000);
    cam.yaw = 0.2;
    expect(cam.center.z).toBeLessThan(1000);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";


V3.afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

V3.it("60 (after check 3): camera.center reads the moved value; a held key pan toward the pole stops at 87.13 degrees", () => {
    const cam = L3.createGeospatialCamera({ planetRadius: 1e6 });
    cam.center = { x: 0, y: 0, z: 1e6 };
    V3.expect((Math.asin(cam.center.z / 1e6) * 180) / Math.PI).toBeCloseTo(87.13, 1);
    const win = H3.makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = H3.makeScene();
    const cam2 = L3.createGeospatialCamera({ planetRadius: 1e6 });
    L3.attachGeospatialControls(cam2, H3.asCanvas(H3.makeCanvas()), scene);
    H3.fire(win, "keydown", H3.key("ArrowUp"));
    H3.tick(scene, 3000);
    const lat = (Math.asin(cam2.center.z / Math.hypot(cam2.center.x, cam2.center.y, cam2.center.z)) * 180) / Math.PI;
    V3.expect(lat).toBeLessThan(87.14);
    V3.expect(lat).toBeGreaterThan(87.1);
});

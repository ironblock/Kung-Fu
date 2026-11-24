import { it, expect, afterEach } from "vitest";
import { createGeospatialCamera, attachGeospatialControls, setGeospatialOrientation } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

it("66: on the first frame after a pan or zoom stops, center moves to where the look vector hits the planet sphere", () => {
    const win = makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    cam.limits.pitchMin = 0;
    // center 100 above the surface, looking straight down from 500 above it
    setGeospatialOrientation(cam, { radius: 500, pitch: 0, center: { x: 1100, y: 0, z: 0 } });
    attachGeospatialControls(cam, asCanvas(makeCanvas()), scene);
    tick(scene, 2);
    expect(cam.center.x).toBeCloseTo(1100, 6); // nothing moved: no re-centre
    fire(win, "keydown", key("ArrowUp"));
    tick(scene);
    fire(win, "keyup", key("ArrowUp"));
    const moving = Math.hypot(cam.center.x, cam.center.y, cam.center.z);
    expect(moving).toBeCloseTo(1100, 3); // a pan keeps the center's distance
    const eye = { ...cam.position };
    tick(scene); // pan stops: re-centre
    const c = cam.center;
    expect(Math.hypot(c.x, c.y, c.z)).toBeCloseTo(1000, 3);
    expect(cam.radius).toBeCloseTo(Math.hypot(eye.x - c.x, eye.y - c.y, eye.z - c.z), 3);
    expect(cam.radius).toBeCloseTo(600, 0); // eye 1600 from the origin, sphere 1000
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

it("66c (after check): if the look ray misses the sphere nothing moves", () => {
    const win = H.makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = H.makeScene();
    const cam = L.createGeospatialCamera({ planetRadius: 1000 });
    cam.limits.pitchDisabledRadiusScale = null;
    L.setGeospatialOrientation(cam, { radius: 50, pitch: 1.5, center: { x: 1500, y: 0, z: 0 } });
    L.attachGeospatialControls(cam, H.asCanvas(H.makeCanvas()), scene);
    H.fire(win, "keydown", H.key("ArrowUp"));
    H.tick(scene);
    H.fire(win, "keyup", H.key("ArrowUp"));
    const before = { ...cam.center };
    H.tick(scene, 3);
    expect({ ...cam.center }).toEqual(before);
    expect(cam.radius).toBeCloseTo(50, 6);
});

it("66d (after check): the new radius is clamped to radiusMin/radiusMax", () => {
    const win = H.makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = H.makeScene();
    const cam = L.createGeospatialCamera({ planetRadius: 1000 });
    cam.limits.pitchMin = 0;
    L.setGeospatialOrientation(cam, { radius: 500, pitch: 0, center: { x: 1100, y: 0, z: 0 } });
    L.attachGeospatialControls(cam, H.asCanvas(H.makeCanvas()), scene);
    H.fire(win, "keydown", H.key("Equal"));
    H.tick(scene);
    H.fire(win, "keyup", H.key("Equal"));
    H.tick(scene, 50);
    cam.limits.radiusMax = 200; // the next zoom step clamps radius to 200: eye at 1300, center still 1100
    H.tick(scene, 150);
    // unclamped, the re-centre would give radius 300 (eye 1300 to the surface at 1000); it gives 200 and moves the eye
    expect(cam.center.x).toBeCloseTo(1000, 3);
    expect(cam.radius).toBe(200);
    expect(cam.position.x).toBeCloseTo(1200, 3);
});

import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

V2.afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

V2.it("66 (after check 2): after a wheel zoom the re-centre waits until the zoom's coasting ends", () => {
    const win = H2.makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = H2.makeScene();
    const cam = L2.createGeospatialCamera({ planetRadius: 1000 });
    cam.limits.pitchMin = 0;
    L2.setGeospatialOrientation(cam, { radius: 500, pitch: 0, center: { x: 1100, y: 0, z: 0 } });
    const c = H2.makeCanvas();
    L2.attachGeospatialControls(cam, H2.asCanvas(c), scene, { zoomToCursor: false });
    H2.fire(c, "wheel", { deltaY: -1, clientX: 400, clientY: 300 });
    H2.tick(scene, 3); // input ended, still coasting
    V2.expect(Math.hypot(cam.center.x, cam.center.y, cam.center.z)).toBeCloseTo(1100, 3);
    let frames = 0;
    while (Math.abs(Math.hypot(cam.center.x, cam.center.y, cam.center.z) - 1000) > 1e-3 && frames < 500) {
        H2.tick(scene);
        frames++;
    }
    V2.expect(frames).toBeGreaterThan(5);
    V2.expect(frames).toBeLessThan(500);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";


V3.afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

V3.it("66 (after check 3): with the eye inside the sphere the look ray's far-side hit moves nothing", () => {
    const win = H3.makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = H3.makeScene();
    const cam = L3.createGeospatialCamera({ planetRadius: 1e6 });
    L3.attachGeospatialControls(cam, H3.asCanvas(H3.makeCanvas()), scene);
    cam.limits.pitchMin = 0;
    L3.setGeospatialOrientation(cam, { radius: 1000, pitch: 0, center: { x: 5e5, y: 0, z: 0 } });
    V3.expect(Math.hypot(cam.position.x, cam.position.y, cam.position.z)).toBeLessThan(1e6);
    H3.fire(win, "keydown", H3.key("ArrowUp"));
    H3.tick(scene);
    H3.fire(win, "keyup", H3.key("ArrowUp"));
    const before = { ...cam.center };
    H3.tick(scene, 2);
    V3.expect(cam.center.x).toBeCloseTo(before.x, 6);
    V3.expect(cam.radius).toBeCloseTo(1000, 6);
});

V3.it("66 (after check 3): the sphere's radius is that of the current camera.limits", () => {
    const win = H3.makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = H3.makeScene();
    const cam = L3.createGeospatialCamera({ planetRadius: 1e6 });
    L3.attachGeospatialControls(cam, H3.asCanvas(H3.makeCanvas()), scene);
    cam.limits = { ...cam.limits, planetRadius: 9e5 };
    H3.fire(win, "keydown", H3.key("ArrowUp"));
    H3.tick(scene);
    H3.fire(win, "keyup", H3.key("ArrowUp"));
    H3.tick(scene);
    V3.expect(Math.hypot(cam.center.x, cam.center.y, cam.center.z)).toBeCloseTo(9e5, 0);
});

import { expect, test } from "vitest";
import { createGeospatialCamera, flyGeospatialCameraToAsync } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

test("fly: time comes from frame deltas (default 1000 ms); yaw takes the shortest way round", async () => {
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    cam.yaw = 3;
    let done = false;
    const p = flyGeospatialCameraToAsync(cam, scene, { yaw: -3 }).then(() => { done = true; });
    tick(scene, 5, 100);
    expect(Math.abs(cam.yaw)).toBeGreaterThan(3);
    tick(scene, 4, 100);
    await Promise.resolve();
    expect(done).toBe(false);
    // shortest way from 3 to -3 passes through PI, so yaw never comes near 0
    tick(scene, 1, 100);
    await p;
    expect(done).toBe(true);
    expect(cam.yaw).toBeCloseTo(-3, 9);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: a frame delta of 0 counts as 1000/60 ms, so the flight ends after 61 such frames", async () => {
    const scene = H.makeScene();
    const cam = L.createGeospatialCamera({ planetRadius: 1000 });
    let done = false;
    const p = L.flyGeospatialCameraToAsync(cam, scene, { yaw: 1 }).then(() => { done = true; });
    H.tick(scene, 59, 0);
    await Promise.resolve(); await Promise.resolve();
    expect(done).toBe(false);
    H.tick(scene, 2, 0);
    await p;
    expect(done).toBe(true);
    expect(cam.yaw).toBeCloseTo(1, 9);
});

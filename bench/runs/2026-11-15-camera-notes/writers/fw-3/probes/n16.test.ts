import { expect, test } from "vitest";
import { createArcRotateCamera, interpolateArcRotateCamera } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

test("interpolate: each frame moves 1 - 2^(-dt/factor) of the way (dt in seconds, factor default 0.1); factor <= 0 snaps", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const p = interpolateArcRotateCamera(cam, scene, { radius: 20 });
    tick(scene, 1, 100);
    expect(cam.radius).toBeCloseTo(15, 12);
    tick(scene, 1, 100);
    expect(cam.radius).toBeCloseTo(17.5, 12);
    tick(scene, 100, 100);
    await p;
    const q = interpolateArcRotateCamera(cam, scene, { radius: 3 }, undefined, { interpolationFactor: 0 });
    tick(scene, 1);
    await q;
    expect(cam.radius).toBe(3);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: a frame delta of 0 or less counts as 1/60 s", async () => {
    for (const d of [0, -5]) {
        const scene = H.makeScene();
        const cam = L.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const p = L.interpolateArcRotateCamera(cam, scene, { radius: 20 });
        H.tick(scene, 1, d);
        expect(cam.radius).toBeCloseTo(10 + 10 * (1 - Math.pow(2, -(1 / 60) / 0.1)), 12);
        H.tick(scene, 300, 100);
        await p;
    }
});

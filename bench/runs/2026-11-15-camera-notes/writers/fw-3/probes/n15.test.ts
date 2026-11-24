import { expect, test } from "vitest";
import { createArcRotateCamera, interpolateArcRotateCamera, setCameraLimits } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

test("interpolate: alpha takes the shortest arc but ends exactly on goal.alpha, unwrapped; goals are clamped to limits", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const p = interpolateArcRotateCamera(cam, scene, { alpha: 2 * Math.PI });
    tick(scene, 1);
    await p;
    expect(cam.alpha).toBe(2 * Math.PI);

    setCameraLimits(cam, { upperRadiusLimit: 15 });
    const q = interpolateArcRotateCamera(cam, scene, { radius: 100 });
    tick(scene, 300);
    await q;
    expect(cam.radius).toBe(15);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: an alpha goal past upperAlphaLimit ends on the limit, not on the goal", async () => {
    const scene = H.makeScene();
    const cam = L.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    cam.upperAlphaLimit = 1;
    const p = L.interpolateArcRotateCamera(cam, scene, { alpha: 2 });
    H.tick(scene, 300);
    await p;
    expect(cam.alpha).toBe(1);
});

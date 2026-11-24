import { expect, test } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, makeScene, tick } from "./helpers";

test("limit fields written directly, without setCameraLimits, clamp nothing", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    cam.upperRadiusLimit = 12;
    cam.lowerRadiusLimit = 8;
    cam.radius = 50;
    expect(cam.radius).toBe(50);
    const canvas = makeCanvas();
    attachControl(cam, asCanvas(canvas), scene);
    fire(canvas, "wheel", { deltaY: 300 });
    tick(scene, 30);
    expect(cam.radius).toBeGreaterThan(50);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: interpolateArcRotateCamera clamps its goal to limit fields written directly", async () => {
    const scene = H.makeScene();
    const cam = L.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    cam.upperRadiusLimit = 12;
    cam.radius = 50;
    expect(cam.radius).toBe(50);
    const p = L.interpolateArcRotateCamera(cam, scene, { radius: 100 });
    H.tick(scene, 300);
    await p;
    expect(cam.radius).toBe(12);
});

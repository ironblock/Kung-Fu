import { it, expect } from "vitest";
import { createArcRotateCamera, interpolateArcRotateCamera, setCameraLimits } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

it("56a: nothing moves until a scene frame runs", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    void interpolateArcRotateCamera(cam, scene, { radius: 20 }, undefined, { interpolationFactor: 0 });
    await Promise.resolve();
    expect(cam.radius).toBe(10);
});

it("56b: goals are clamped to the limit fields each frame; it resolves on the clamped value", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    setCameraLimits(cam, { upperRadiusLimit: 15 });
    const p = interpolateArcRotateCamera(cam, scene, { radius: 50 });
    tick(scene, 2);
    cam.upperRadiusLimit = 12; // read each frame (no value change, no cancel)
    tick(scene, 300);
    await p;
    expect(cam.radius).toBe(12);
});

it("56c: alpha and beta take the shortest arc; alpha ends exactly on the unwrapped goal", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const p = interpolateArcRotateCamera(cam, scene, { alpha: 2 * Math.PI });
    tick(scene);
    await p;
    expect(cam.alpha).toBe(2 * Math.PI);
    const cam2 = createArcRotateCamera(0, 0.2, 10, { x: 0, y: 0, z: 0 });
    void interpolateArcRotateCamera(cam2, scene, { beta: 2 * Math.PI - 0.2 }).catch(() => {});
    tick(scene, 1, 100);
    expect(cam2.beta).toBeCloseTo(0.2 - 0.2, 9);
});

it("56d: a NaN goal field counts as omitted", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0.5, 1, 10, { x: 0, y: 0, z: 0 });
    const p = interpolateArcRotateCamera(cam, scene, { alpha: NaN, radius: 12 }, undefined, { interpolationFactor: 0 });
    tick(scene);
    await p;
    expect(cam.alpha).toBe(0.5);
    expect(cam.radius).toBe(12);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

it("56c (after check): a NaN in goal.target is not omitted: it is written to camera.target and the promise rejects", async () => {
    const scene = H.makeScene();
    const cam = L.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    let state = "pending";
    L.interpolateArcRotateCamera(cam, scene, { target: { x: NaN, y: 0, z: 0 } }, undefined, { interpolationFactor: 0 }).then(() => (state = "resolved"), () => (state = "rejected"));
    H.tick(scene, 50);
    await new Promise((r) => setTimeout(r, 0));
    expect(Number.isNaN(cam.target.x)).toBe(true);
    expect(state).toBe("rejected");
});

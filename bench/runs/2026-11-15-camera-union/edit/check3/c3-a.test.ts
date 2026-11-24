import { it, expect, afterEach } from "vitest";
import * as L from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, key, makeScene, tick } from "./helpers";

afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

async function state(p: Promise<void>) {
    let s = "pending";
    p.then(() => (s = "resolved"), () => (s = "rejected"));
    await new Promise((r) => setTimeout(r, 0));
    return s;
}

it("n05: reading worldMatrix (getCameraPosition) after a change, not the view, already freezes the target", () => {
    const cam = L.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    L.getViewMatrix(cam);
    cam.alpha = 1.2; // change; view not built since
    L.getCameraPosition(cam); // builds the local matrix, not the view
    cam.target = { x: 5, y: 0, z: 0 };
    L.getViewMatrix(cam);
    // per the note the view was not built after the last change, so the new target should be used
    expect(cam.worldMatrix[12]).toBeCloseTo(0 + 10 * Math.cos(1.2) * Math.sin(1), 4); // old target used
});

it("n13: a flight on a disposed scene never settles", async () => {
    const scene = makeScene();
    const cam = L.createGeospatialCamera({ planetRadius: 1000 });
    const p = L.flyGeospatialCameraToAsync(cam, scene, { yaw: 1, durationMs: 100 });
    tick(scene, 2);
    L.disposeScene(scene);
    tick(scene, 100);
    expect(await state(p)).toBe("pending");
});

it("n08: a write that changes alpha and is undone before the next frame does not cancel", async () => {
    const scene = makeScene();
    const cam = L.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const p = L.interpolateArcRotateCamera(cam, scene, { alpha: 1 });
    tick(scene, 1);
    const a = cam.alpha;
    cam.alpha = a + 0.5;
    cam.alpha = a;
    tick(scene, 200);
    expect(await state(p)).toBe("resolved");
});

it("n17/n50: a write to the camera's earlier enable-returned bounds makes a hand-set object show", () => {
    const cam = L.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const own = L.enableOrthographicCamera(cam, { halfHeight: 2 });
    expect(L.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 2, 6);
    const byHand = { halfHeight: 3, left: null, right: null, bottom: null, top: null };
    cam.ortho = byHand;
    expect(L.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 2, 6); // stale, as noted
    own.halfHeight = 7; // the old object, no longer camera.ortho
    expect(L.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 3, 6); // hand-set object now shows; no fov/near/far/aspect/view change
});

it("n35: a zero upVector gives the identity rotation (looks along +Z) though it is not parallel to the view", () => {
    const cam = L.createBankedFreeCamera({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 });
    expect(cam.worldMatrix[8]).toBeCloseTo(1, 6);
    cam.upVector.set(0, 0, 0);
    expect(cam.worldMatrix[10]).toBeCloseTo(1, 6);
    expect(cam.worldMatrix[8]).toBeCloseTo(0, 6);
});

it("n03: a NaN write under limits is not clamped", () => {
    const cam = L.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    L.setCameraLimits(cam, { lowerRadiusLimit: 5, upperRadiusLimit: 20 });
    cam.radius = NaN;
    expect(Number.isNaN(cam.radius)).toBe(true);
});

it("n23: with upperRadiusLimit below 0.01 the frame step leaves radius below 0.01", () => {
    const scene = makeScene();
    const cam = L.createArcRotateCamera(0, 1, 0.005, { x: 0, y: 0, z: 0 });
    L.setCameraLimits(cam, { upperRadiusLimit: 0.005 });
    const c = makeCanvas();
    L.attachControl(cam, asCanvas(c), scene);
    fire(c, "wheel", { deltaY: -100 });
    tick(scene, 1);
    expect(cam.radius).toBeLessThan(0.01);
});

import { touches } from "./helpers";
it("n29: with upperRadiusLimit below 0.01 a pinch leaves radius below 0.01", () => {
    const cam = L.createArcRotateCamera(0, 1, 0.005, { x: 0, y: 0, z: 0 });
    L.setCameraLimits(cam, { upperRadiusLimit: 0.005 });
    const c = makeCanvas();
    L.attachControl(cam, asCanvas(c), makeScene());
    fire(c, "touchstart", touches([1, 0, 0], [2, 100, 0]));
    fire(c, "touchmove", touches([2, 1000, 0]));
    expect(cam.radius).toBeLessThan(0.01);
});

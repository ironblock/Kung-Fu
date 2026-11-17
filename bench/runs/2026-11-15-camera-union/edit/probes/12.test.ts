import { it, expect } from "vitest";
import { createArcRotateCamera, interpolateArcRotateCamera } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

it("12a: a write between its frames rejects the promise", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const p = interpolateArcRotateCamera(cam, scene, { radius: 20 });
    tick(scene);
    cam.target.y = 0.5;
    tick(scene);
    await expect(p).rejects.toThrow();
});

it("12b: a second interpolation on the camera rejects the first", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const p1 = interpolateArcRotateCamera(cam, scene, { radius: 20 });
    tick(scene);
    const p2 = interpolateArcRotateCamera(cam, scene, { alpha: 1 });
    tick(scene, 2);
    await expect(p1).rejects.toThrow();
    tick(scene, 200);
    await expect(p2).resolves.toBeUndefined();
});

it("12c: a write that leaves the value as last written does not cancel", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const p = interpolateArcRotateCamera(cam, scene, { radius: 20 });
    tick(scene);
    cam.radius = cam.radius;
    tick(scene, 300);
    await expect(p).resolves.toBeUndefined();
});

it("12d: a change before the first frame becomes the start; the first frame zeroes all five offsets", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const p = interpolateArcRotateCamera(cam, scene, { radius: 20 }, undefined, { interpolationFactor: 0 });
    cam.alpha = 2;
    cam.inertialAlphaOffset = 1;
    cam.inertialBetaOffset = 1;
    cam.inertialRadiusOffset = 1;
    cam.inertialPanningX = 1;
    cam.inertialPanningY = 1;
    tick(scene);
    await p;
    expect(cam.alpha).toBe(2);
    expect(cam.radius).toBe(20);
    expect([cam.inertialAlphaOffset, cam.inertialBetaOffset, cam.inertialRadiusOffset, cam.inertialPanningX, cam.inertialPanningY]).toEqual([0, 0, 0, 0, 0]);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";


async function state3(p: Promise<void>) {
    let s = "pending";
    p.then(() => (s = "resolved"), () => (s = "rejected"));
    await new Promise((r) => setTimeout(r, 0));
    return s;
}

V3.it("12 (after check 3): a change undone before the next frame does not cancel", async () => {
    const scene = H3.makeScene();
    const cam = L3.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const p = L3.interpolateArcRotateCamera(cam, scene, { alpha: 1 });
    H3.tick(scene, 1);
    const a = cam.alpha;
    cam.alpha = a + 0.5;
    cam.alpha = a;
    H3.tick(scene, 200);
    V3.expect(await state3(p)).toBe("resolved");
});

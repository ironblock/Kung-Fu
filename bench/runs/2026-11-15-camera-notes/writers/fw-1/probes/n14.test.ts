import { it, expect } from "vitest";
import { createArcRotateCamera, interpolateArcRotateCamera } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

it("n14a: a direct write between frames rejects the promise; the first frame zeroes inertia", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    cam.inertialAlphaOffset = 0.5;
    const p = interpolateArcRotateCamera(cam, scene, { radius: 20 });
    tick(scene);
    expect(cam.inertialAlphaOffset).toBe(0);
    cam.radius = 3;
    tick(scene);
    await expect(p).rejects.toThrow();
});

it("n14b: a second interpolation rejects the first", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const a = interpolateArcRotateCamera(cam, scene, { radius: 20 });
    a.catch(() => {});
    tick(scene);
    const b = interpolateArcRotateCamera(cam, scene, { radius: 5 });
    tick(scene, 2);
    await expect(a).rejects.toThrow();
    tick(scene, 400);
    await expect(b).resolves.toBeUndefined();
    expect(cam.radius).toBe(5);
});

it("n14c: a pose write after the call but before its first frame is taken as the start, and the promise resolves", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const p = interpolateArcRotateCamera(cam, scene, { radius: 20 });
    cam.radius = 3;
    cam.alpha = 0.5;
    tick(scene, 400);
    await expect(p).resolves.toBeUndefined();
    expect(cam.radius).toBe(20);
    expect(cam.alpha).toBe(0.5);
});

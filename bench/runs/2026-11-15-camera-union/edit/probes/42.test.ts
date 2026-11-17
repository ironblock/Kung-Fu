import { it, expect } from "vitest";
import { createArcRotateCamera, interpolateArcRotateCamera } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

it("42a: each frame moves 1 - 2^(-dt/0.1) of the remaining way", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    void interpolateArcRotateCamera(cam, scene, { radius: 20 }).catch(() => {});
    tick(scene, 1, 100);
    expect(cam.radius).toBeCloseTo(10 + 10 * 0.5, 9);
    tick(scene, 1, 200);
    expect(cam.radius).toBeCloseTo(15 + 5 * 0.75, 9);
});

it("42b: alpha moves that share of the shortest arc", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(3, 1, 10, { x: 0, y: 0, z: 0 });
    void interpolateArcRotateCamera(cam, scene, { alpha: -3 }).catch(() => {});
    tick(scene, 1, 100);
    expect(cam.alpha).toBeCloseTo(3 + (2 * Math.PI - 6) * 0.5, 9);
});

it("42c: a delta <= 0 counts as 1/60 s; a custom factor is used", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    void interpolateArcRotateCamera(cam, scene, { radius: 20 }, undefined, { interpolationFactor: 0.5 }).catch(() => {});
    tick(scene, 1, 0);
    expect(cam.radius).toBeCloseTo(10 + 10 * (1 - Math.pow(2, -1 / 60 / 0.5)), 9);
});

it("42d: a factor <= 0 snaps on the first frame", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const p = interpolateArcRotateCamera(cam, scene, { radius: 20, alpha: 1 }, undefined, { interpolationFactor: -1 });
    tick(scene);
    await p;
    expect(cam.radius).toBe(20);
    expect(cam.alpha).toBe(1);
});

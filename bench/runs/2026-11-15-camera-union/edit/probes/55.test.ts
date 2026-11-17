import { it, expect } from "vitest";
import { createArcRotateCamera, getProjectionMatrix } from "@babylonjs/lite";

it("55a: a hand-set ortho object is ignored while enableOrthographicCamera has never run", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    cam.ortho = { halfHeight: 1, left: null, right: null, bottom: null, top: null };
    const p = getProjectionMatrix(cam, 1);
    expect(p[11]).toBe(1); // perspective
});

it("55b: after it ran once on any camera, a hand-set object is used, but only once the cache is rebuilt", async () => {
    const { enableOrthographicCamera } = await import("@babylonjs/lite");
    enableOrthographicCamera(createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 }));
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    expect(getProjectionMatrix(cam, 1)[11]).toBe(1);
    cam.ortho = { halfHeight: 1, left: null, right: null, bottom: null, top: null };
    expect(getProjectionMatrix(cam, 1)[11]).toBe(1); // cached perspective
    cam.fov = 0.5; // any change rebuilds
    const p = getProjectionMatrix(cam, 1);
    expect(p[11]).toBe(0);
    expect(p[15]).toBe(1);
});

it("55c: an aspect change or a view change also rebuilds it", async () => {
    const { enableOrthographicCamera } = await import("@babylonjs/lite");
    enableOrthographicCamera(createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 }));
    const a = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    getProjectionMatrix(a, 1);
    a.ortho = { halfHeight: 1, left: null, right: null, bottom: null, top: null };
    expect(getProjectionMatrix(a, 2)[11]).toBe(0);
    const b = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    getProjectionMatrix(b, 1);
    b.ortho = { halfHeight: 1, left: null, right: null, bottom: null, top: null };
    b.alpha = 0.3;
    expect(getProjectionMatrix(b, 1)[11]).toBe(0);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

it("55d (after check): a camera never projected uses a hand-set ortho at its first getProjectionMatrix", () => {
    L.enableOrthographicCamera(L.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 }));
    const cam = L.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    cam.ortho = { halfHeight: 1, left: null, right: null, bottom: null, top: null };
    const p = L.getProjectionMatrix(cam, 1);
    expect(p[11]).toBe(0);
    expect(p[15]).toBe(1);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("55 (after check 3): a field write to the camera's earlier returned bounds brings a hand-set object in", () => {
    const cam = L3.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const own = L3.enableOrthographicCamera(cam, { halfHeight: 2 });
    L3.getProjectionMatrix(cam, 1);
    cam.ortho = { halfHeight: 3, left: null, right: null, bottom: null, top: null };
    V3.expect(L3.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 2, 6);
    own.halfHeight = 7;
    V3.expect(L3.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 3, 6);
});

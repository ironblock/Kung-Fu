import { it, expect } from "vitest";
import { createArcRotateCamera, getProjectionMatrix, getViewProjectionMatrix, enableOrthographicCamera } from "@babylonjs/lite";

it("72a: fov/nearPlane/farPlane writes show at the next projection call, compared by value", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const p = getProjectionMatrix(cam, 1);
    const a = p[5];
    const ver = cam._projRev;
    cam.fov = cam.fov; // same value: no rebuild
    getProjectionMatrix(cam, 1);
    expect(cam._projRev).toBe(ver);
    cam.fov = 1.2;
    expect(getProjectionMatrix(cam, 1)[5]).not.toBe(a);
    const vp0 = Array.from(getViewProjectionMatrix(cam, 1));
    cam.farPlane = 50;
    expect(Array.from(getViewProjectionMatrix(cam, 1))).not.toEqual(vp0);
});

it("72b: with ortho from enableOrthographicCamera, fov's value changes nothing", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    enableOrthographicCamera(cam);
    const p = Array.from(getProjectionMatrix(cam, 1));
    cam.fov = 1.2;
    expect(Array.from(getProjectionMatrix(cam, 1))).toEqual(p);
    cam.nearPlane = 5;
    expect(Array.from(getProjectionMatrix(cam, 1))).not.toEqual(p);
});

import * as L2 from "@babylonjs/lite";
import * as V2 from "vitest";

V2.it("72 (after check 2): with a hand-set ortho, a fov write rebuilds the projection and so switches it to ortho", () => {
    L2.enableOrthographicCamera(L2.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 })); // ran once
    const cam = L2.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const persp = Array.from(L2.getProjectionMatrix(cam, 1));
    cam.ortho = { halfHeight: 2, left: null, right: null, bottom: null, top: null };
    V2.expect(Array.from(L2.getProjectionMatrix(cam, 1))).toEqual(persp);
    cam.fov = 1.3;
    const o = Array.from(L2.getProjectionMatrix(cam, 1));
    V2.expect(o[5]).toBeCloseTo(0.5, 6);
    V2.expect(o[15]).toBe(1);
    cam.fov = 0.4; // its value is unused
    V2.expect(Array.from(L2.getProjectionMatrix(cam, 1))).toEqual(o);
});

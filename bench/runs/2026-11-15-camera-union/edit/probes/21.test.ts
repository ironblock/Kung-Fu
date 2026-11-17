import { it, expect } from "vitest";
import { createArcRotateCamera, enableOrthographicCamera, getProjectionMatrix } from "@babylonjs/lite";

it("21a: halfHeight 1 by default; null planes are +-halfHeight and +-halfHeight*aspect; fov is ignored", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const b = enableOrthographicCamera(cam);
    expect(b.halfHeight).toBe(1);
    expect([b.left, b.right, b.bottom, b.top]).toEqual([null, null, null, null]);
    const p = Array.from(getProjectionMatrix(cam, 2));
    expect(p[0]).toBeCloseTo(2 / 4, 6);
    expect(p[5]).toBeCloseTo(1, 6);
    cam.fov = 0.3;
    expect(Array.from(getProjectionMatrix(cam, 2))).toEqual(p);
});

it("21b: a write that changes a field of the returned bounds shows at the next getProjectionMatrix", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const b = enableOrthographicCamera(cam, { halfHeight: 2 });
    expect(getProjectionMatrix(cam, 1)[5]).toBeCloseTo(0.5, 6);
    b.halfHeight = 4;
    expect(getProjectionMatrix(cam, 1)[5]).toBeCloseTo(0.25, 6);
    b.left = -1;
    b.right = 3;
    const p = getProjectionMatrix(cam, 1);
    expect(p[0]).toBeCloseTo(0.5, 6);
    expect(p[12]).toBeCloseTo(-0.5, 6);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("21 (after check 3): under ortho fov's value is unused, but a fov write rebuilds", () => {
    const cam = L3.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    L3.enableOrthographicCamera(cam, { halfHeight: 2 });
    const p0 = Array.from(L3.getProjectionMatrix(cam, 1));
    cam.fov = 1.3;
    V3.expect(Array.from(L3.getProjectionMatrix(cam, 1))).toEqual(p0);
    cam.ortho = { halfHeight: 4, left: null, right: null, bottom: null, top: null };
    V3.expect(L3.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 2, 6);
    cam.fov = 1.4;
    V3.expect(L3.getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 4, 6);
});

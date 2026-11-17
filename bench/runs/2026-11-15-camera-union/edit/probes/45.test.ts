import { it, expect } from "vitest";
import { createArcRotateCamera, getViewMatrix, getProjectionMatrix, getViewProjectionMatrix } from "@babylonjs/lite";

it("45: the matrix getters return the camera's own cache, overwritten in place on the next change or other aspect", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const v = getViewMatrix(cam);
    const keep = Array.from(v);
    cam.alpha = 1;
    const v2 = getViewMatrix(cam);
    expect(v2).toBe(v);
    expect(Array.from(v)).not.toEqual(keep);
    const p = getProjectionMatrix(cam, 1);
    const p0 = p[0];
    expect(getProjectionMatrix(cam, 2)).toBe(p);
    expect(p[0]).not.toBe(p0);
    const vp = getViewProjectionMatrix(cam, 1);
    const vp0 = Array.from(vp);
    cam.radius = 20;
    expect(getViewProjectionMatrix(cam, 1)).toBe(vp);
    expect(Array.from(vp)).not.toEqual(vp0);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("45 (after check 3): a held matrix changes only when its getter (or getViewProjectionMatrix) next runs", () => {
    const cam = L3.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const v = L3.getViewMatrix(cam);
    const p = L3.getProjectionMatrix(cam, 1);
    const v0 = Array.from(v), p0 = Array.from(p);
    cam.alpha = 1;
    cam.fov = 1.2;
    V3.expect(Array.from(v)).toEqual(v0);
    V3.expect(Array.from(p)).toEqual(p0);
    L3.getViewProjectionMatrix(cam, 1);
    V3.expect(Array.from(v)).not.toEqual(v0);
    V3.expect(Array.from(p)).not.toEqual(p0);
});

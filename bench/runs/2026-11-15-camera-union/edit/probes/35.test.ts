import { it, expect } from "vitest";
import { createArcRotateCamera, enableOrthographicCamera, disableOrthographicCamera, getProjectionMatrix } from "@babylonjs/lite";

it("35: a second enableOrthographicCamera replaces camera.ortho; the old object no longer drives it; disable sets null", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const a = enableOrthographicCamera(cam, { halfHeight: 2 });
    const b = enableOrthographicCamera(cam);
    expect(cam.ortho).toBe(b);
    expect(b).not.toBe(a);
    expect(b.halfHeight).toBe(1);
    a.halfHeight = 10;
    expect(getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1, 6);
    disableOrthographicCamera(cam);
    expect(cam.ortho).toBeNull();
});

import * as L2 from "@babylonjs/lite";
import * as V2 from "vitest";

V2.it("35 (after check 2): disableOrthographicCamera clears the cached ortho terms; a hand-written ortho = null keeps them", () => {
    const a = L2.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    L2.enableOrthographicCamera(a, { left: 1, right: 3, bottom: -1, top: 1 });
    const ortho = Array.from(L2.getProjectionMatrix(a, 1));
    V2.expect(ortho[15]).toBe(1);
    a.ortho = null;
    V2.expect(Array.from(L2.getProjectionMatrix(a, 1))).toEqual(ortho); // still the ortho matrix
    a.fov = 1.1;
    const p = L2.getProjectionMatrix(a, 1);
    V2.expect([p[12], p[15]]).toEqual([ortho[12], 1]); // stale terms in the perspective rebuild
    const b = L2.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    L2.enableOrthographicCamera(b, { left: 1, right: 3, bottom: -1, top: 1 });
    L2.getProjectionMatrix(b, 1);
    L2.disableOrthographicCamera(b);
    V2.expect(b.ortho).toBe(null);
    const q = L2.getProjectionMatrix(b, 1);
    V2.expect([q[12], q[13], q[15]]).toEqual([0, 0, 0]);
});

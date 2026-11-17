import { it, expect } from "vitest";
import { createArcRotateCamera, enableOrthographicCamera, disableOrthographicCamera, getProjectionMatrix } from "@babylonjs/lite";

it("58a: ortho = null by hand keeps the cached matrix; a fov rebuild keeps p[12], p[13], p[15]", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    enableOrthographicCamera(cam, { left: 0, right: 4, bottom: 0, top: 2 });
    const o = Array.from(getProjectionMatrix(cam, 1));
    cam.ortho = null;
    expect(Array.from(getProjectionMatrix(cam, 1))).toEqual(o);
    cam.fov = 0.7;
    const p = getProjectionMatrix(cam, 1);
    expect(p[11]).toBe(1);
    expect(p[12]).toBeCloseTo(o[12]!, 6);
    expect(p[13]).toBeCloseTo(o[13]!, 6);
    expect(p[15]).toBe(1);
});

it("58b: disableOrthographicCamera clears them and switches at the next call", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    enableOrthographicCamera(cam, { left: 0, right: 4, bottom: 0, top: 2 });
    getProjectionMatrix(cam, 1);
    disableOrthographicCamera(cam);
    const p = getProjectionMatrix(cam, 1);
    expect([p[11], p[12], p[13], p[15]]).toEqual([1, 0, 0, 0]);
});

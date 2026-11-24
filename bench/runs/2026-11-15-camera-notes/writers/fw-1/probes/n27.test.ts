import { it, expect } from "vitest";
import { createArcRotateCamera, enableOrthographicCamera, disableOrthographicCamera, getProjectionMatrix } from "@babylonjs/lite";

it("n27: assigning camera.ortho = null leaves the cached orthographic matrix; disableOrthographicCamera does not", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    enableOrthographicCamera(cam);
    expect(getProjectionMatrix(cam, 1)[11]).toBe(0);
    cam.ortho = null;
    expect(getProjectionMatrix(cam, 1)[11]).toBe(0); // still orthographic
    cam.fov = 0.9;
    expect(getProjectionMatrix(cam, 1)[11]).toBe(1); // a projection change rebuilds it

    const cam2 = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    enableOrthographicCamera(cam2);
    getProjectionMatrix(cam2, 1);
    disableOrthographicCamera(cam2);
    expect(getProjectionMatrix(cam2, 1)[11]).toBe(1);
});

it("n27b: after ortho = null by hand, the matrix rebuilt by a fov write keeps the ortho p[15]=1, p[12], p[13]", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    enableOrthographicCamera(cam, { left: -1, right: 3, bottom: -1, top: 3 });
    const o = getProjectionMatrix(cam, 1);
    const o12 = o[12], o13 = o[13];
    expect(o[15]).toBe(1);
    expect(o12).not.toBe(0);
    cam.ortho = null;
    cam.fov = 0.9;
    const p = getProjectionMatrix(cam, 1);
    expect(p[11]).toBe(1);
    expect(p[15]).toBe(1);
    expect(p[12]).toBe(o12);
    expect(p[13]).toBe(o13);

    const cam2 = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    enableOrthographicCamera(cam2, { left: -1, right: 3, bottom: -1, top: 3 });
    getProjectionMatrix(cam2, 1);
    disableOrthographicCamera(cam2);
    const q = getProjectionMatrix(cam2, 1);
    expect(q[15]).toBe(0);
    expect(q[12]).toBe(0);
    expect(q[13]).toBe(0);
});

import { expect, test } from "vitest";
import { createArcRotateCamera, getProjectionMatrix, enableOrthographicCamera } from "@babylonjs/lite";

test("ortho: halfHeight defaults to 1; null planes are +-halfHeight vertically and +-halfHeight*aspect horizontally; fov ignored", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const o = enableOrthographicCamera(cam);
    expect(o.halfHeight).toBe(1);
    expect(cam.ortho).toBe(o);
    let p = getProjectionMatrix(cam, 2);
    expect(p[5]).toBeCloseTo(1, 6); // 2/(top-bottom) = 2/2
    expect(p[0]).toBeCloseTo(0.5, 6); // 2/(2*2)
    cam.fov = 0.1;
    p = getProjectionMatrix(cam, 2);
    expect(p[5]).toBeCloseTo(1, 6);
    o.halfHeight = 4;
    p = getProjectionMatrix(cam, 2);
    expect(p[5]).toBeCloseTo(0.25, 6);
    o.left = 0; o.right = 10;
    p = getProjectionMatrix(cam, 2);
    expect(p[0]).toBeCloseTo(0.2, 6);
});

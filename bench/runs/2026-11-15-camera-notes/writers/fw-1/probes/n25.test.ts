import { it, expect } from "vitest";
import { createArcRotateCamera, enableOrthographicCamera, getProjectionMatrix } from "@babylonjs/lite";

it("n25: ortho defaults to halfHeight 1, width from aspect; fov has no effect", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const b = enableOrthographicCamera(cam);
    expect(b.halfHeight).toBe(1);
    expect(b.left).toBeNull();
    const p = getProjectionMatrix(cam, 2);
    expect(p[0]).toBeCloseTo(1 / 2, 10); // 2/(right-left) = 2/(2*1*2)
    expect(p[5]).toBeCloseTo(1, 10);
    cam.fov = 0.3;
    const q = getProjectionMatrix(cam, 2);
    expect(q[0]).toBeCloseTo(0.5, 10);
    expect(q[5]).toBeCloseTo(1, 10);
    b.halfHeight = 4;
    expect(getProjectionMatrix(cam, 2)[5]).toBeCloseTo(0.25, 10);
});

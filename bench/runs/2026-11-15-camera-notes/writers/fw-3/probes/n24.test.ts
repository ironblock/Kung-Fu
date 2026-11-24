import { expect, test } from "vitest";
import { createArcRotateCamera, getViewMatrix, getProjectionMatrix, getViewProjectionMatrix } from "@babylonjs/lite";

test("matrix getters return the camera's own cache object, overwritten in place on the next change", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const v1 = getViewMatrix(cam);
    const before = v1[12];
    cam.alpha = 1;
    const v2 = getViewMatrix(cam);
    expect(v2).toBe(v1);
    expect(v1[12]).not.toBe(before);
    const p1 = getProjectionMatrix(cam, 1);
    const p2 = getProjectionMatrix(cam, 2);
    expect(p2).toBe(p1);
    expect(getViewProjectionMatrix(cam, 1)).toBe(getViewProjectionMatrix(cam, 2));
});

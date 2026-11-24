import { it, expect } from "vitest";
import { createArcRotateCamera, getViewMatrix, getViewProjectionMatrix } from "@babylonjs/lite";

it("n28: matrix getters return the camera's own cache object, overwritten on change", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const v1 = getViewMatrix(cam);
    const saved = Array.from(v1);
    cam.alpha = 1;
    const v2 = getViewMatrix(cam);
    expect(v2).toBe(v1);
    expect(Array.from(v1)).not.toEqual(saved);
    const a = getViewProjectionMatrix(cam, 1);
    const b = getViewProjectionMatrix(cam, 2);
    expect(b).toBe(a);
});

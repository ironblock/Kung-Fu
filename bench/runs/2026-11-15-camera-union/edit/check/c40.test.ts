import { it, expect } from "vitest";
import { createArcRotateCamera, enableOrthographicCamera, getProjectionMatrix } from "@babylonjs/lite";

it("c40: after enableOrthographicCamera ran once, a hand-set ortho on a camera never projected is used at the first call, with no change", () => {
    enableOrthographicCamera(createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 }));
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    cam.ortho = { halfHeight: 1, left: null, right: null, bottom: null, top: null };
    const p = getProjectionMatrix(cam, 1);
    expect(p[11]).toBe(0);
    expect(p[15]).toBe(1);
});

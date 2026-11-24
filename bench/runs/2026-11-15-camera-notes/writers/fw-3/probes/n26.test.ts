import { expect, test } from "vitest";
import { createArcRotateCamera, getProjectionMatrix } from "@babylonjs/lite";
import type { OrthographicBounds } from "@babylonjs/lite";

test("before any enableOrthographicCamera call, a camera.ortho assigned by hand is ignored", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    cam.ortho = { halfHeight: 5, left: null, right: null, bottom: null, top: null } as OrthographicBounds;
    const p = getProjectionMatrix(cam, 1);
    expect(p[11]).toBe(1); // perspective w = z
    expect(p[15]).toBe(0);
});

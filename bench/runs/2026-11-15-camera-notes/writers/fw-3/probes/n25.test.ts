import { expect, test } from "vitest";
import { createArcRotateCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

test("projection is reverse-Z: a point at nearPlane gets depth 1, at farPlane depth 0", () => {
    const cam = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    // eye at z = -10 looking +Z
    const opts = { viewport: { x: 0, y: 0, width: 100, height: 100 }, backingWidth: 100, backingHeight: 100 };
    const near = projectWorldToScreen({ x: 0, y: 0, z: -10 + cam.nearPlane }, getViewMatrix(cam), getViewProjectionMatrix(cam, 1), opts);
    const far = projectWorldToScreen({ x: 0, y: 0, z: -10 + cam.farPlane }, getViewMatrix(cam), getViewProjectionMatrix(cam, 1), opts);
    expect(near.z).toBeCloseTo(1, 5);
    expect(far.z).toBeCloseTo(0, 5);
});

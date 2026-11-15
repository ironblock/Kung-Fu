import { expect, test } from "vitest";
import { createArcRotateCamera, getProjectionMatrix, enableOrthographicCamera, disableOrthographicCamera } from "@babylonjs/lite";

test("ortho: calling enableOrthographicCamera again replaces the bounds; the old object no longer drives the projection", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const first = enableOrthographicCamera(cam, { halfHeight: 2 });
    const second = enableOrthographicCamera(cam);
    expect(second).not.toBe(first);
    expect(second.halfHeight).toBe(1);
    first.halfHeight = 10;
    expect(getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1, 6);
    disableOrthographicCamera(cam);
    expect(cam.ortho).toBeNull();
    expect(getProjectionMatrix(cam, 1)[11]).toBe(1);
});

import { describe, it, expect } from "vitest";
import { createArcRotateCamera, enableOrthographicCamera, getProjectionMatrix } from "@babylonjs/lite";

describe("n28 a second enableOrthographicCamera call replaces camera.ortho; the old bounds object no longer drives the camera", () => {
    it("writes to the first bounds object are ignored after a second enable", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const first = enableOrthographicCamera(cam, { halfHeight: 2 });
        const second = enableOrthographicCamera(cam);
        expect(cam.ortho).toBe(second);
        expect(second.halfHeight).toBe(1);
        first.halfHeight = 10;
        expect(getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1, 6);
        second.halfHeight = 4;
        expect(getProjectionMatrix(cam, 1)[5]).toBeCloseTo(1 / 4, 6);
    });
});

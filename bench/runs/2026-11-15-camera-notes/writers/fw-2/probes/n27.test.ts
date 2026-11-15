import { describe, it, expect } from "vitest";
import { createArcRotateCamera, enableOrthographicCamera, getProjectionMatrix } from "@babylonjs/lite";

describe("n27 enableOrthographicCamera: halfHeight defaults to 1 world unit, width is halfHeight * aspect, fov ignored", () => {
    it("default volume is +-1 vertically and +-aspect horizontally", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const b = enableOrthographicCamera(cam);
        expect(b.halfHeight).toBe(1);
        expect(b.left).toBeNull();
        const p = getProjectionMatrix(cam, 2);
        expect(p[5]).toBeCloseTo(1, 6);
        expect(p[0]).toBeCloseTo(1 / 2, 6);
        cam.fov = 0.3;
        const q = getProjectionMatrix(cam, 2);
        expect(q[5]).toBeCloseTo(1, 6);
    });
    it("explicit left/right are used as given, not scaled by aspect", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        enableOrthographicCamera(cam, { left: -4, right: 4, halfHeight: 2 });
        const p = getProjectionMatrix(cam, 3);
        expect(p[0]).toBeCloseTo(2 / 8, 6);
        expect(p[5]).toBeCloseTo(1 / 2, 6);
    });
});

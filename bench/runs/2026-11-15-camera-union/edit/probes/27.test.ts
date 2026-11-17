import { it, expect } from "vitest";
import { createFreeCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen, enableOrthographicCamera } from "@babylonjs/lite";

const opts = { viewport: { x: 0, y: 0, width: 100, height: 100 }, backingWidth: 100, backingHeight: 100 };

it("27: reverse-Z: nearPlane maps to z 1 and farPlane to z 0, perspective and orthographic", () => {
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    cam.nearPlane = 2;
    cam.farPlane = 50;
    for (const ortho of [false, true]) {
        if (ortho) enableOrthographicCamera(cam);
        const v = getViewMatrix(cam);
        const vp = getViewProjectionMatrix(cam, 1);
        expect(projectWorldToScreen({ x: 0, y: 0, z: 2 }, v, vp, opts).z).toBeCloseTo(1, 6);
        expect(projectWorldToScreen({ x: 0, y: 0, z: 50 }, v, vp, opts).z).toBeCloseTo(0, 6);
        expect(projectWorldToScreen({ x: 0, y: 0, z: 10 }, v, vp, opts).z).toBeGreaterThan(projectWorldToScreen({ x: 0, y: 0, z: 20 }, v, vp, opts).z);
    }
});

import { it, expect } from "vitest";
import { createFreeCamera, enableOrthographicCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

const opts = { viewport: { x: 0, y: 0, width: 100, height: 100 }, backingWidth: 100, backingHeight: 100 };

it("74: ortho bounds are view-space world units around the view axis; depth from nearPlane/farPlane", () => {
    const cam = createFreeCamera({ x: 10, y: 5, z: 0 }, { x: 10, y: 5, z: 1 });
    cam.nearPlane = 1;
    cam.farPlane = 21;
    enableOrthographicCamera(cam, { halfHeight: 2 });
    const v = getViewMatrix(cam);
    const vp = getViewProjectionMatrix(cam, 1);
    const top = projectWorldToScreen({ x: 10, y: 7, z: 5 }, v, vp, opts);
    expect(top.y).toBeCloseTo(0, 6);
    expect(top.x).toBeCloseTo(50, 6);
    const right = projectWorldToScreen({ x: 12, y: 5, z: 15 }, v, vp, opts);
    expect(right.x).toBeCloseTo(100, 6);
    expect(projectWorldToScreen({ x: 10, y: 5, z: 1 }, v, vp, opts).z).toBeCloseTo(1, 6);
    expect(projectWorldToScreen({ x: 10, y: 5, z: 11 }, v, vp, opts).z).toBeCloseTo(0.5, 6);
});

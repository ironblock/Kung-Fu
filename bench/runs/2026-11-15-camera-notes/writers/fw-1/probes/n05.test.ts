import { it, expect } from "vitest";
import { createArcRotateCamera, getViewMatrix, getViewProjectionMatrix, getProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

it("n05: perspective projection is reverse-Z (near -> 1, far -> 0)", () => {
    // eye at (0,0,-10) looking down +Z
    const cam = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    const opts = { viewport: { x: 0, y: 0, width: 800, height: 600 }, backingWidth: 800, backingHeight: 600 };
    const view = getViewMatrix(cam);
    const vp = getViewProjectionMatrix(cam, 800 / 600);
    const near = projectWorldToScreen({ x: 0, y: 0, z: -10 + cam.nearPlane }, view, vp, opts);
    const far = projectWorldToScreen({ x: 0, y: 0, z: -10 + cam.farPlane }, view, vp, opts);
    expect(near.z).toBeCloseTo(1, 5);
    expect(far.z).toBeCloseTo(0, 5);
    const p = getProjectionMatrix(cam, 1);
    expect(p[11]).toBe(1);
});

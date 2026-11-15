import { it, expect } from "vitest";
import { createArcRotateCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

it("n31: offscreen points keep unclamped coordinates; behind-camera points are offscreen", () => {
    const cam = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 }); // eye (0,0,-10) looking +Z
    const v = getViewMatrix(cam);
    const vp = getViewProjectionMatrix(cam, 1);
    const opts = { viewport: { x: 0, y: 0, width: 100, height: 100 }, backingWidth: 100, backingHeight: 100 };
    const side = projectWorldToScreen({ x: 100, y: 0, z: 0 }, v, vp, opts);
    expect(side.offscreen).toBe(true);
    expect(side.x).toBeGreaterThan(100);
    const behind = projectWorldToScreen({ x: 0, y: 0, z: -20 }, v, vp, opts);
    expect(behind.behindCamera).toBe(true);
    expect(behind.offscreen).toBe(true);
    expect(Number.isFinite(behind.x)).toBe(true);
});

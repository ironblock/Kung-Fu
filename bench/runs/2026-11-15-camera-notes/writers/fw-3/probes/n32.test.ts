import { expect, test } from "vitest";
import { createArcRotateCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

test("projectWorldToScreen flags: behind camera -> offscreen and clipped; beyond far -> clipped only; off-side keeps unclamped x", () => {
    const cam = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    const v = getViewMatrix(cam);
    const vp = getViewProjectionMatrix(cam, 1);
    const o = { viewport: { x: 0, y: 0, width: 100, height: 100 }, backingWidth: 100, backingHeight: 100 };
    const behind = projectWorldToScreen({ x: 0, y: 0, z: -20 }, v, vp, o);
    expect([behind.behindCamera, behind.offscreen, behind.clipped]).toEqual([true, true, true]);
    const far = projectWorldToScreen({ x: 0, y: 0, z: 2000 }, v, vp, o);
    expect([far.behindCamera, far.offscreen, far.clipped]).toEqual([false, false, true]);
    const side = projectWorldToScreen({ x: 100, y: 0, z: 0 }, v, vp, o);
    expect(side.offscreen).toBe(true);
    expect(side.x).toBeGreaterThan(100);
    expect(Number.isFinite(side.x)).toBe(true);
});

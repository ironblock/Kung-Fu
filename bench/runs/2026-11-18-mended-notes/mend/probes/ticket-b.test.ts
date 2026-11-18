// Ticket b: resolveCameraViewport alone clamps edges and rounds outward; the other viewport functions use raw fields.
import { describe, expect, it } from "vitest";
import { createArcRotateCamera, getEffectiveAspectRatio, resolveCameraViewport } from "@babylonjs/lite";
import { _applyCameraViewport } from "../../babylon-lite/packages/babylon-lite/src/camera/camera";

function cam(viewport?: { x: number; y: number; width: number; height: number }) {
    const c = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    if (viewport) (c as { viewport?: unknown }).viewport = viewport;
    return c;
}
function passRect(c: ReturnType<typeof cam>, w: number, h: number) {
    let rect: number[] | null = null;
    const pass = { setViewport: (...a: number[]) => (rect = a.slice(0, 4)), setScissorRect: () => {} };
    _applyCameraViewport(pass as never, c, w, h);
    return rect;
}

describe("ticket b", () => {
    it("y counted from the bottom, returned from the top", () => {
        expect(resolveCameraViewport(cam({ x: 0, y: 0, width: 0.5, height: 0.5 }), 800, 600)).toEqual({ x: 0, y: 300, width: 400, height: 300 });
        expect(resolveCameraViewport(cam(), 800, 600)).toEqual({ x: 0, y: 0, width: 800, height: 600 });
        expect(resolveCameraViewport(null, 800, 600)).toEqual({ x: 0, y: 0, width: 800, height: 600 });
    });
    it("each edge clamped to [0,1]; off-canvas shrinks, fully off is zero-sized", () => {
        expect(resolveCameraViewport(cam({ x: -0.5, y: 0, width: 1, height: 1 }), 800, 600)).toEqual({ x: 0, y: 0, width: 400, height: 600 });
        expect(resolveCameraViewport(cam({ x: 0.5, y: 0, width: 1, height: 1 }), 800, 600)).toEqual({ x: 400, y: 0, width: 400, height: 600 });
        expect(resolveCameraViewport(cam({ x: 0, y: -0.5, width: 1, height: 1 }), 800, 600)).toEqual({ x: 0, y: 300, width: 800, height: 300 });
        expect(resolveCameraViewport(cam({ x: 0, y: 0.5, width: 1, height: 1 }), 800, 600)).toEqual({ x: 0, y: 0, width: 800, height: 300 });
        expect(resolveCameraViewport(cam({ x: 1.5, y: 0, width: 0.5, height: 1 }), 800, 600)).toEqual({ x: 800, y: 0, width: 0, height: 600 });
    });
    it("start edge floored, far edge ceiled", () => {
        expect(resolveCameraViewport(cam({ x: 0.1001, y: 0, width: 0.2, height: 1 }), 100, 100)).toEqual({ x: 10, y: 0, width: 21, height: 100 });
        expect(resolveCameraViewport(cam({ x: 0, y: 0.1001, width: 1, height: 0.2 }), 100, 100)).toEqual({ x: 0, y: 69, width: 100, height: 21 });
    });
    it("getEffectiveAspectRatio and _applyCameraViewport use the raw fields, no clamp", () => {
        const off = cam({ x: -0.5, y: 0, width: 1, height: 1 });
        expect(getEffectiveAspectRatio(off, 800, 600)).toBeCloseTo(800 / 600, 12);
        expect(passRect(off, 800, 600)).toEqual([-400, 0, 800, 600]);
        const offY = cam({ x: 0, y: -0.5, width: 1, height: 1 });
        expect(passRect(offY, 800, 600)).toEqual([0, 300, 800, 600]);
        expect(passRect(cam(), 800, 600)).toBeNull();
    });
});

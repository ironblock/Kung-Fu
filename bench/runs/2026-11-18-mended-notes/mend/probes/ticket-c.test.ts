// Ticket c: getEffectiveAspectRatio formula on raw fields; getProjectionMatrix ignores viewport;
// matches _applyCameraViewport's rectangle up to rounding; can differ from resolveCameraViewport's when it clamps.
import { describe, expect, it } from "vitest";
import { createArcRotateCamera, createFreeCamera, getEffectiveAspectRatio, getProjectionMatrix, resolveCameraViewport } from "@babylonjs/lite";
import { _applyCameraViewport } from "../../babylon-lite/packages/babylon-lite/src/camera/camera";

type VP = { x: number; y: number; width: number; height: number };
function withVp<T extends object>(c: T, v?: VP): T {
    (c as { viewport?: VP }).viewport = v;
    return c;
}
function passRect(c: object, w: number, h: number): number[] {
    let rect: number[] = [];
    const pass = { setViewport: (...a: number[]) => (rect = a.slice(0, 4)), setScissorRect: () => {} };
    _applyCameraViewport(pass as never, c as never, w, h);
    return rect;
}

describe("ticket c", () => {
    it("getProjectionMatrix does not read camera.viewport", () => {
        const a = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const m1 = Array.from(getProjectionMatrix(a, 1.5) as ArrayLike<number>);
        const b = withVp(createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 }), { x: 0.5, y: 0, width: 0.25, height: 1 });
        const m2 = Array.from(getProjectionMatrix(b, 1.5) as ArrayLike<number>);
        expect(m2).toEqual(m1);
    });
    it("formula: target ratio times viewport.width/viewport.height, raw fields, x/y unused", () => {
        expect(getEffectiveAspectRatio(null, 800, 600)).toBeCloseTo(800 / 600, 12);
        expect(getEffectiveAspectRatio(undefined, 800, 600)).toBeCloseTo(800 / 600, 12);
        const f = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        expect(getEffectiveAspectRatio(f, 800, 600)).toBeCloseTo(800 / 600, 12);
        const cases: VP[] = [
            { x: 0, y: 0, width: 0.5, height: 1 },
            { x: 0.3, y: 0.7, width: 0.5, height: 0.25 },
            { x: -0.5, y: 0, width: 1, height: 1 },
            { x: 0.9, y: 0.9, width: 0.5, height: 0.5 },
            { x: 0, y: 0, width: 2, height: 0.5 },
        ];
        for (const v of cases) {
            const c = withVp(createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 }), v);
            expect(getEffectiveAspectRatio(c, 800, 600)).toBeCloseTo((800 / 600) * (v.width / v.height), 12);
        }
    });
    it("equals the shape of _applyCameraViewport's rectangle up to rounding, also off-canvas", () => {
        for (const v of [{ x: 0.25, y: 0.25, width: 0.5, height: 0.5 }, { x: -0.5, y: 0, width: 1, height: 1 }, { x: 0.9, y: 0.9, width: 0.5, height: 0.5 }]) {
            const c = withVp(createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 }), v);
            const r = passRect(c, 800, 600);
            expect(getEffectiveAspectRatio(c, 800, 600)).toBeCloseTo(r[2]! / r[3]!, 12);
        }
        // rounding: 1/3 of 100px -> rect 34 wide
        const c = withVp(createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 }), { x: 0, y: 0, width: 1 / 3, height: 1 });
        const r = passRect(c, 100, 100);
        expect(r[2]).toBe(34);
        expect(getEffectiveAspectRatio(c, 100, 100)).toBeCloseTo(1 / 3, 12);
    });
    it("differs from resolveCameraViewport's rectangle when an edge is clamped", () => {
        const c = withVp(createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 }), { x: -0.5, y: 0, width: 1, height: 1 });
        const r = resolveCameraViewport(c, 800, 600);
        expect(r.width / r.height).toBeCloseTo(400 / 600, 12);
        expect(getEffectiveAspectRatio(c, 800, 600)).toBeCloseTo(800 / 600, 12);
        // inside [0,1] and on whole pixels they agree
        const d = withVp(createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 }), { x: 0.25, y: 0.5, width: 0.5, height: 0.5 });
        const q = resolveCameraViewport(d, 800, 600);
        expect(getEffectiveAspectRatio(d, 800, 600)).toBeCloseTo(q.width / q.height, 12);
    });
});

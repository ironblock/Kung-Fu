import { describe, it, expect } from "vitest";
import {
    createArcRotateCamera, createFreeCamera, enableOrthographicCamera, disableOrthographicCamera,
    getProjectionMatrix, getViewMatrix, getViewProjectionMatrix, getEffectiveAspectRatio, resolveCameraViewport,
    projectWorldToScreen, getCameraPosition,
} from "@babylonjs/lite";

const P = (c: any, a = 1) => Array.from(getProjectionMatrix(c, a));
const fc = () => createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
const opts = { viewport: { x: 0, y: 0, width: 800, height: 600 }, backingWidth: 800, backingHeight: 600 };

describe("projection", () => {
    it("n15 hand ortho ignored before enable; not invalidating; but works after another camera enabled", () => {
        const a = fc(); const persp = P(a);
        (a as any).ortho = { halfHeight: 2, left: null, right: null, bottom: null, top: null };
        a.fov = 0.7; const p2 = P(a); expect(p2[15]).toBe(0); // still perspective
        const b = fc(); enableOrthographicCamera(b);
        const c = fc(); P(c); (c as any).ortho = { halfHeight: 3, left: null, right: null, bottom: null, top: null };
        expect(P(c)[15]).toBe(0); // cached perspective: assignment did not invalidate
        const pc = P(c, 1.5); // aspect change rebuilds
        (globalThis as any).__n15 = pc[15];
        expect(pc[15]).toBe(1); // hand-assigned ortho on camera never passed to enable now honoured
        void persp;
    });
    it("n16 ortho bounds derive, fov ignored, near/far", () => {
        const c = fc(); const o = enableOrthographicCamera(c); expect(o.halfHeight).toBe(1);
        const m = P(c, 2); expect(m[0]).toBeCloseTo(2 / 4); expect(m[5]).toBeCloseTo(1);
        c.fov = 0.1; expect(P(c, 2)).toEqual(m);
        o.halfHeight = 2; const m2 = P(c, 2); expect(m2[0]).toBeCloseTo(2 / 8); expect(m2[5]).toBeCloseTo(0.5);
        o.left = 0; const m3 = P(c, 2); expect(m3[0]).toBeCloseTo(2 / 4);
        c.nearPlane = 2; c.farPlane = 12; const m4 = P(c, 2); expect(m4[10]).toBeCloseTo(-1 / 10); expect(m4[14]).toBeCloseTo(12 / 10);
    });
    it("n17 re-enable replaces; disable", () => {
        const c = fc(); const o1 = enableOrthographicCamera(c); const o2 = enableOrthographicCamera(c, { halfHeight: 5 });
        expect(c.ortho).toBe(o2); o1.halfHeight = 100; expect(P(c)[5]).toBeCloseTo(1 / 5);
        disableOrthographicCamera(c); expect(c.ortho).toBeNull(); const m = P(c); expect(m[11]).toBe(1); expect(m[15]).toBe(0);
        expect(m[5]).toBeCloseTo(1 / Math.tan(0.4));
    });
    it("n18 reverse-Z, ortho too, projectWorldToScreen z", () => {
        const c = fc(); c.nearPlane = 1; c.farPlane = 100;
        const z = (d: number) => projectWorldToScreen({ x: 0, y: 0, z: -10 + d }, getViewMatrix(c), getViewProjectionMatrix(c, 800 / 600), opts).z;
        expect(z(1)).toBeCloseTo(1); expect(z(100)).toBeCloseTo(0);
        enableOrthographicCamera(c); expect(z(1)).toBeCloseTo(1); expect(z(100)).toBeCloseTo(0);
        const a = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 }); expect(P(a)[11]).toBe(1);
    });
    it("n23 aspect passed, effective aspect", () => {
        const c = fc(); c.viewport = { x: 0, y: 0, width: 0.5, height: 1 };
        expect(getEffectiveAspectRatio(c, 800, 600)).toBeCloseTo(800 / 600 * 0.5);
        const m = P(c, 2); expect(m[0]).toBeCloseTo(1 / Math.tan(0.4) / 2);
        expect(getEffectiveAspectRatio(fc(), 800, 600)).toBeCloseTo(4 / 3);
    });
    it("n24 floating origin view zero translation; worldOrigin", () => {
        const c = createFreeCamera({ x: 100, y: 50, z: -10 }, { x: 100, y: 50, z: 0 });
        const p = { x: 101, y: 51, z: 20 };
        const ref = projectWorldToScreen(p, getViewMatrix(c), getViewProjectionMatrix(c, 4 / 3), opts);
        const c2 = createFreeCamera({ x: 100, y: 50, z: -10 }, { x: 100, y: 50, z: 0 }); c2._useFloatingOrigin = true;
        const v = Array.from(getViewMatrix(c2)); expect(v.slice(12, 15).map(Math.abs)).toEqual([0, 0, 0]);
        const r2 = projectWorldToScreen(p, getViewMatrix(c2), getViewProjectionMatrix(c2, 4 / 3), { ...opts, worldOrigin: getCameraPosition(c2) });
        expect(r2.x).toBeCloseTo(ref.x, 3); expect(r2.y).toBeCloseTo(ref.y, 3); expect(r2.z).toBeCloseTo(ref.z, 5);
    });
    it("n19 RangeErrors", () => {
        const c = fc(); const V = getViewMatrix(c), VP = getViewProjectionMatrix(c, 1); const pt = { x: 0, y: 0, z: 0 };
        const bad = [
            { ...opts, viewport: { x: 0, y: 0, width: 0, height: 10 } }, { ...opts, viewport: { x: 0, y: 0, width: -1, height: 10 } },
            { ...opts, viewport: { x: 0, y: 0, width: Infinity, height: 10 } }, { ...opts, backingWidth: 0 }, { ...opts, backingHeight: NaN },
            { ...opts, cssWidth: 100 }, { ...opts, cssHeight: 100 },
        ];
        for (const o of bad) expect(() => projectWorldToScreen(pt, V, VP, o as any)).toThrow(RangeError);
        expect(() => projectWorldToScreen(pt, V, VP, { ...opts, cssWidth: 100, cssHeight: 100 })).not.toThrow();
    });
    it("n20 flags", () => {
        const c = fc(); const V = getViewMatrix(c), VP = getViewProjectionMatrix(c, 4 / 3);
        const r = (p: any) => projectWorldToScreen(p, V, VP, opts);
        const far = r({ x: 1000, y: 0, z: 0 }); expect(far.x).toBeGreaterThan(800); expect(far.offscreen).toBe(true); expect(far.clipped).toBe(true); expect(far.behindCamera).toBe(false);
        const beh = r({ x: 0, y: 0, z: -20 }); expect(beh.behindCamera).toBe(true); expect(beh.offscreen).toBe(true);
        const atPlane = r({ x: 1, y: 0, z: -10 }); expect(atPlane.behindCamera).toBe(true);
        const tooFar = r({ x: 0, y: 0, z: 20000 }); expect(tooFar.offscreen).toBe(false); expect(tooFar.clipped).toBe(true);
        const tooNear = r({ x: 0, y: 0, z: -9.5 }); expect(tooNear.offscreen).toBe(false); expect(tooNear.clipped).toBe(true);
        const nan = r({ x: NaN, y: 0, z: 0 }); expect(nan.x).toBeNaN(); expect(nan.clipped && nan.offscreen).toBe(true);
        const ok = r({ x: 0, y: 0, z: 0 }); expect([ok.offscreen, ok.clipped, ok.behindCamera]).toEqual([false, false, false]);
    });
    it("n21 resolveCameraViewport", () => {
        const c = fc(); c.viewport = { x: 0.1, y: 0.25, width: 0.5, height: 0.5 };
        expect(resolveCameraViewport(c, 101, 101)).toEqual({ x: 10, y: 25, width: 61 - 10, height: Math.ceil(0.75 * 101) - 25 });
        c.viewport = { x: -0.5, y: 0, width: 2, height: 1 }; expect(resolveCameraViewport(c, 100, 100)).toEqual({ x: 0, y: 0, width: 100, height: 100 });
        c.viewport = { x: 0, y: 0, width: 1, height: 0.5 }; expect(resolveCameraViewport(c, 100, 100)).toEqual({ x: 0, y: 50, width: 100, height: 50 });
    });
    it("n22 x/y backing pixels incl viewport offset; css scale", () => {
        const c = fc(); const V = getViewMatrix(c), VP = getViewProjectionMatrix(c, 1);
        const o = { viewport: { x: 100, y: 50, width: 200, height: 200 }, backingWidth: 800, backingHeight: 600 };
        const r = projectWorldToScreen({ x: 0, y: 0, z: 0 }, V, VP, o); expect(r.x).toBeCloseTo(200); expect(r.y).toBeCloseTo(150); expect(r.cssX).toBe(r.x); expect(r.cssY).toBe(r.y);
        const r2 = projectWorldToScreen({ x: 0, y: 0, z: 0 }, V, VP, { ...o, cssWidth: 400, cssHeight: 200 }); expect(r2.cssX).toBeCloseTo(100); expect(r2.cssY).toBeCloseTo(50);
    });
});

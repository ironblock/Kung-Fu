import { describe, expect, it } from "vitest";
import {
    createArcRotateCamera,
    createFreeCamera,
    getViewMatrix,
    getProjectionMatrix,
    getViewProjectionMatrix,
    getCameraPosition,
    getEffectiveAspectRatio,
    resolveCameraViewport,
    enableOrthographicCamera,
    disableOrthographicCamera,
    projectWorldToScreen,
    projectPointToViewportToRef,
} from "@babylonjs/lite";

const arr = (m: ArrayLike<number>) => Array.from(m);
function depth(p: number[], zv: number) {
    // row-vector convention: clip = [0,0,zv,1] * P (column-major storage)
    const z = zv * p[10]! + p[14]!;
    const w = zv * p[11]! + p[15]!;
    return z / w;
}
const vp = { x: 0, y: 0, width: 100, height: 100 };

describe("n47 projection", () => {
    it("reverse-Z LH perspective, vertical fov", () => {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        c.nearPlane = 2;
        c.farPlane = 50;
        const p = arr(getProjectionMatrix(c, 2));
        expect(depth(p, 2)).toBeCloseTo(1, 6);
        expect(depth(p, 50)).toBeCloseTo(0, 6);
        expect(p[11]).toBe(1); // w = +z view: LH
        expect(p[5]).toBeCloseTo(1 / Math.tan(0.4), 6);
        expect(p[0]).toBeCloseTo(1 / Math.tan(0.4) / 2, 6);
    });
    it("orthographic too", () => {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        c.nearPlane = 2;
        c.farPlane = 50;
        enableOrthographicCamera(c);
        const p = arr(getProjectionMatrix(c, 1));
        expect(depth(p, 2)).toBeCloseTo(1, 6);
        expect(depth(p, 50)).toBeCloseTo(0, 6);
    });
});

describe("n48 effective aspect", () => {
    it("", () => {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        expect(getEffectiveAspectRatio(c, 800, 600)).toBeCloseTo(4 / 3, 12);
        c.viewport = { x: 0, y: 0, width: 0.5, height: 1 };
        expect(getEffectiveAspectRatio(c, 800, 600)).toBeCloseTo(2 / 3, 12);
    });
});

describe("n49 viewport", () => {
    it("y from bottom, floored/ceiled, clamped", () => {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        c.viewport = { x: 0.1, y: 0, width: 0.33, height: 0.25 };
        expect(resolveCameraViewport(c, 100, 100)).toEqual({ x: 10, y: 75, width: 34, height: 25 });
        c.viewport = { x: 0.505, y: 0.505, width: 0.2, height: 0.2 };
        const r = resolveCameraViewport(c, 100, 100);
        expect(r.x).toBe(50);
        expect(r.y).toBe(29);
        expect(r.x + r.width).toBe(71);
        expect(r.y + r.height).toBe(50);
        c.viewport = { x: 0.8, y: -0.5, width: 0.5, height: 1 };
        expect(resolveCameraViewport(c, 100, 100)).toEqual({ x: 80, y: 50, width: 20, height: 50 });
    });
});

describe("n50 cache arrays", () => {
    it("", () => {
        const c = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        const v = getViewMatrix(c);
        const p = getProjectionMatrix(c, 1);
        const m = getViewProjectionMatrix(c, 1);
        const vs = arr(v), ps = arr(p), ms = arr(m);
        c.alpha = 2;
        c.fov = 1.2;
        expect(getViewMatrix(c)).toBe(v);
        expect(getProjectionMatrix(c, 1)).toBe(p);
        expect(getViewProjectionMatrix(c, 1)).toBe(m);
        expect(arr(v)).not.toEqual(vs);
        expect(arr(p)).not.toEqual(ps);
        expect(arr(m)).not.toEqual(ms);
    });
});

describe("n51 parent", () => {
    it("", () => {
        const parentCam = createFreeCamera({ x: 100, y: 0, z: 0 }, { x: 100, y: 0, z: 1 });
        const c = createFreeCamera({ x: 1, y: 2, z: 3 }, { x: 1, y: 2, z: 4 });
        c.parent = parentCam;
        const p = getCameraPosition(c);
        expect(p.x).toBeCloseTo(101, 9);
        expect(p.y).toBeCloseTo(2, 9);
    });
});

describe("n52 ortho", () => {
    it("defaults, derived planes, fov ignored, near/far depth, replace", () => {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        const o = enableOrthographicCamera(c);
        expect(o.halfHeight).toBe(1);
        expect([o.left, o.right, o.bottom, o.top]).toEqual([null, null, null, null]);
        const p = arr(getProjectionMatrix(c, 2));
        expect(p[0]).toBeCloseTo(2 / 4, 6);
        expect(p[5]).toBeCloseTo(1, 12);
        c.fov = 0.1;
        expect(arr(getProjectionMatrix(c, 2))).toEqual(p);
        c.farPlane = 100;
        expect(arr(getProjectionMatrix(c, 2))).not.toEqual(p);
        const o2 = enableOrthographicCamera(c, { halfHeight: 3 });
        expect(c.ortho).toBe(o2);
        expect(o2).not.toBe(o);
        o.halfHeight = 7;
        expect(getProjectionMatrix(c, 2)[5]).toBeCloseTo(1 / 3, 6);
    });
});

describe("n53 ortho = null by hand", () => {
    it("", () => {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        enableOrthographicCamera(c, { left: -1, right: 3 });
        const po = arr(getProjectionMatrix(c, 1));
        c.ortho = null;
        expect(arr(getProjectionMatrix(c, 1))).toEqual(po); // stale cache
        const pp = arr(getProjectionMatrix(c, 1.5)); // recomputed
        expect(pp[12]).not.toBe(0);
        expect(pp[15]).toBe(1);
        const c2 = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        const clean = arr(getProjectionMatrix(c2, 1));
        enableOrthographicCamera(c2, { left: -1, right: 3 });
        getProjectionMatrix(c2, 1);
        disableOrthographicCamera(c2);
        expect(arr(getProjectionMatrix(c2, 1))).toEqual(clean);
    });
});

describe("n54 RangeError", () => {
    it("throws on bad sizes and lone css", () => {
        const I = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) as any;
        const pt = { x: 0, y: 0, z: 1 };
        const ok = { viewport: vp, backingWidth: 100, backingHeight: 100 };
        expect(() => projectWorldToScreen(pt, I, I, ok)).not.toThrow();
        expect(() => projectWorldToScreen(pt, I, I, { ...ok, viewport: { ...vp, width: 0 } })).toThrow(RangeError);
        expect(() => projectWorldToScreen(pt, I, I, { ...ok, backingHeight: Infinity })).toThrow(RangeError);
        expect(() => projectWorldToScreen(pt, I, I, { ...ok, cssWidth: 50 })).toThrow(RangeError);
        expect(() => projectPointToViewportToRef(pt, I, I, { ...vp, width: 0, height: 0 }, { x: 0, y: 0, z: 0 })).not.toThrow();
    });
    it("does not throw when sizes positive/finite and css given together", () => {
        const I = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]) as any;
        const pt = { x: 0, y: 0, z: 1 };
        const ok = { viewport: vp, backingWidth: 100, backingHeight: 100 };
        expect(() => projectWorldToScreen(pt, I, I, { ...ok, cssWidth: 0, cssHeight: 0 })).not.toThrow();
        expect(() => projectWorldToScreen(pt, I, I, { ...ok, viewport: { ...vp, x: NaN } })).not.toThrow();
    });
});

describe("n55 projectWorldToScreen", () => {
    it("", () => {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        c.nearPlane = 1;
        c.farPlane = 100;
        const v = getViewMatrix(c);
        const m = getViewProjectionMatrix(c, 1);
        const opts = { viewport: vp, backingWidth: 100, backingHeight: 100, cssWidth: 50, cssHeight: 25 };
        const near = projectWorldToScreen({ x: 0, y: 0, z: 1 }, v, m, opts);
        expect(near.z).toBeCloseTo(1, 6);
        const off = projectWorldToScreen({ x: 100, y: 0, z: 10 }, v, m, opts);
        expect(off.x).toBeGreaterThan(100);
        expect(off.offscreen).toBe(true);
        expect(off.cssX).toBeCloseTo(off.x * 0.5, 9);
        expect(off.cssY).toBeCloseTo(off.y * 0.25, 9);
        expect(projectWorldToScreen({ x: 0, y: 0, z: 0 }, v, m, opts).behindCamera).toBe(true);
        expect(projectWorldToScreen({ x: 0, y: 0, z: -5 }, v, m, opts).behindCamera).toBe(true);
        expect(projectWorldToScreen({ x: 0, y: 0, z: 0.5 }, v, m, opts).behindCamera).toBe(false);
    });
});

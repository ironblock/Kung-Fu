import { it, expect } from "vitest";
import { createFreeCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

const opts = { viewport: { x: 0, y: 0, width: 100, height: 100 }, backingWidth: 100, backingHeight: 100 };
const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
cam.nearPlane = 1;
cam.farPlane = 100;
const v = getViewMatrix(cam);
const vp = getViewProjectionMatrix(cam, 1);
const at = (x: number, y: number, z: number) => projectWorldToScreen({ x, y, z }, v, vp, opts);

it("36a: behind the camera: behindCamera, offscreen and clipped", () => {
    const r = at(0, 0, -5);
    expect([r.behindCamera, r.offscreen, r.clipped]).toEqual([true, true, true]);
});

it("36b: past farPlane or nearer than nearPlane, in frame: only clipped", () => {
    for (const z of [200, 0.5]) {
        const r = at(0, 0, z);
        expect([r.behindCamera, r.offscreen, r.clipped]).toEqual([false, false, true]);
    }
    const ok = at(0, 0, 10);
    expect([ok.behindCamera, ok.offscreen, ok.clipped]).toEqual([false, false, false]);
});

it("36c: finite x/y are not clamped; under perspective a point on the camera plane gives NaN", () => {
    const r = at(100, 0, 10);
    expect(r.offscreen).toBe(true);
    expect(r.x).toBeGreaterThan(100);
    const p = at(1, 0, 0);
    expect(p.clipW).toBe(0);
    expect(Number.isNaN(p.x)).toBe(true);
    expect([p.behindCamera, p.offscreen, p.clipped]).toEqual([true, true, true]);
});

import * as L2 from "@babylonjs/lite";
import * as V2 from "vitest";

const opts2 = { viewport: { x: 0, y: 0, width: 800, height: 600 }, backingWidth: 800, backingHeight: 600 };

V2.it("36 (after check 2): under ortho a point on the camera plane has clipW 1 and finite x/y; the ToRef form agrees", () => {
    const cam = L2.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    L2.enableOrthographicCamera(cam, { halfHeight: 5 });
    const v = L2.getViewMatrix(cam), vp = L2.getViewProjectionMatrix(cam, 800 / 600);
    const r = L2.projectWorldToScreen({ x: 1, y: 0, z: 0 }, v, vp, opts2);
    V2.expect(r.clipW).toBe(1);
    V2.expect([r.behindCamera, r.offscreen, r.clipped]).toEqual([true, true, true]);
    V2.expect(Number.isFinite(r.x) && Number.isFinite(r.y)).toBe(true);
    const out = { x: 0, y: 0, z: 0, cssX: 0, cssY: 0, clipW: 0, behindCamera: false, clipped: false, offscreen: false };
    L2.projectWorldToScreenToRef({ x: 1, y: 0, z: 0 }, v, vp, opts2, out);
    V2.expect(out).toEqual(r);
    // perspective, ToRef form: camera plane gives NaN
    const pc = L2.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    L2.projectWorldToScreenToRef({ x: 1, y: 0, z: 0 }, L2.getViewMatrix(pc), L2.getViewProjectionMatrix(pc, 800 / 600), opts2, out);
    V2.expect(out.clipW).toBe(0);
    V2.expect(Number.isNaN(out.x)).toBe(true);
});

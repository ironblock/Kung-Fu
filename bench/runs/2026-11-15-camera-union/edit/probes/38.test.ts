import { it, expect } from "vitest";
import { createFreeCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
const v = getViewMatrix(cam);
const vp = getViewProjectionMatrix(cam, 1);
const P = { x: 0, y: 0, z: 10 };

it("38a: x/y are canvas backing pixels (viewport offset added, y from the top); cssX/cssY scale by css/backing; z is NDC depth", () => {
    const r = projectWorldToScreen(P, v, vp, { viewport: { x: 100, y: 50, width: 200, height: 200 }, backingWidth: 800, backingHeight: 600, cssWidth: 400, cssHeight: 300 });
    expect(r.x).toBeCloseTo(200, 9);
    expect(r.y).toBeCloseTo(150, 9);
    expect(r.cssX).toBeCloseTo(100, 9);
    expect(r.cssY).toBeCloseTo(75, 9);
    expect(r.z).toBeGreaterThan(0);
    expect(r.z).toBeLessThan(1);
    const up = projectWorldToScreen({ x: 0, y: 1, z: 10 }, v, vp, { viewport: { x: 0, y: 0, width: 200, height: 200 }, backingWidth: 200, backingHeight: 200 });
    expect(up.y).toBeLessThan(100);
});

it("38b: RangeError on a non-positive or non-finite viewport size or backing size, or only one css size", () => {
    const good = { viewport: { x: 0, y: 0, width: 100, height: 100 }, backingWidth: 100, backingHeight: 100 };
    const bad = [
        { ...good, viewport: { x: 0, y: 0, width: 0, height: 100 } },
        { ...good, viewport: { x: 0, y: 0, width: 100, height: -1 } },
        { ...good, viewport: { x: 0, y: 0, width: Infinity, height: 100 } },
        { ...good, backingWidth: 0 },
        { ...good, backingHeight: NaN },
        { ...good, cssWidth: 100 },
        { ...good, cssHeight: 100 },
    ];
    for (const o of bad) expect(() => projectWorldToScreen(P, v, vp, o)).toThrow(RangeError);
    expect(() => projectWorldToScreen(P, v, vp, good)).not.toThrow();
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

it("38c (after check): z is 0..1, reverse-Z: 1 at nearPlane, 0 at farPlane", () => {
    const c = L.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    const o = { viewport: { x: 0, y: 0, width: 100, height: 100 }, backingWidth: 100, backingHeight: 100 };
    const vv = L.getViewMatrix(c);
    const pp = L.getViewProjectionMatrix(c, 1);
    expect(L.projectWorldToScreen({ x: 0, y: 0, z: c.nearPlane }, vv, pp, o).z).toBeCloseTo(1, 6);
    expect(L.projectWorldToScreen({ x: 0, y: 0, z: c.farPlane }, vv, pp, o).z).toBeCloseTo(0, 6);
    const mid = L.projectWorldToScreen({ x: 0, y: 0, z: 10 }, vv, pp, o).z;
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(1);
});

import * as L2 from "@babylonjs/lite";
import * as V2 from "vitest";

V2.it("38 (after check 2): projectWorldToScreenToRef throws the same RangeErrors and gives the same x/y/css/z", () => {
    const cam = L2.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    const v = L2.getViewMatrix(cam), vp = L2.getViewProjectionMatrix(cam, 800 / 600);
    const out = { x: 0, y: 0, z: 0, cssX: 0, cssY: 0, clipW: 0, behindCamera: false, clipped: false, offscreen: false };
    const base = { viewport: { x: 10, y: 20, width: 800, height: 600 }, backingWidth: 1600, backingHeight: 1200 };
    V2.expect(() => L2.projectWorldToScreenToRef({ x: 0, y: 0, z: 5 }, v, vp, { ...base, backingWidth: 0 }, out)).toThrow(RangeError);
    V2.expect(() => L2.projectWorldToScreenToRef({ x: 0, y: 0, z: 5 }, v, vp, { ...base, cssWidth: 800 }, out)).toThrow(RangeError);
    const o = { ...base, cssWidth: 800, cssHeight: 600 };
    L2.projectWorldToScreenToRef({ x: 0, y: 0, z: 5 }, v, vp, o, out);
    V2.expect(out).toEqual(L2.projectWorldToScreen({ x: 0, y: 0, z: 5 }, v, vp, o));
    V2.expect([out.x, out.y]).toEqual([410, 320]);
    V2.expect([out.cssX, out.cssY]).toEqual([205, 160]);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("38 (after check 3): with neither css size given cssX/cssY equal x/y", () => {
    const cam = L3.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const r = L3.projectWorldToScreen({ x: 1, y: 1, z: 0 }, L3.getViewMatrix(cam), L3.getViewProjectionMatrix(cam, 2), { viewport: { x: 0, y: 0, width: 400, height: 200 }, backingWidth: 800, backingHeight: 600 });
    V3.expect(Number.isFinite(r.x)).toBe(true);
    V3.expect(r.cssX).toBe(r.x);
    V3.expect(r.cssY).toBe(r.y);
});

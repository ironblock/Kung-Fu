import { it, expect } from "vitest";
import { createFreeCamera, getViewMatrix, getViewProjectionMatrix, getCameraPosition, projectWorldToScreen } from "@babylonjs/lite";

const opts = { viewport: { x: 0, y: 0, width: 100, height: 100 }, backingWidth: 100, backingHeight: 100 };

it("65: _useFloatingOrigin zeroes the view translation; projectWorldToScreen then needs worldOrigin = camera position", () => {
    const P = { x: 1001, y: 2, z: 2010 };
    const plain = createFreeCamera({ x: 1000, y: 0, z: 2000 }, { x: 1000, y: 0, z: 2001 });
    const ref = projectWorldToScreen(P, getViewMatrix(plain), getViewProjectionMatrix(plain, 1), opts);
    const fo = createFreeCamera({ x: 1000, y: 0, z: 2000 }, { x: 1000, y: 0, z: 2001 });
    fo._useFloatingOrigin = true;
    const v = getViewMatrix(fo);
    expect([v[12], v[13], v[14]].map(Math.abs)).toEqual([0, 0, 0]);
    const vp = getViewProjectionMatrix(fo, 1);
    const wrong = projectWorldToScreen(P, v, vp, opts);
    expect(wrong.x).not.toBeCloseTo(ref.x, 3);
    const r = projectWorldToScreen(P, v, vp, { ...opts, worldOrigin: getCameraPosition(fo) });
    expect(r.x).toBeCloseTo(ref.x, 3);
    expect(r.y).toBeCloseTo(ref.y, 3);
    expect(r.z).toBeCloseTo(ref.z, 5);
});

it("65b: set after a view matrix is cached, the flag shows only at the next view rebuild", () => {
    const cam = createFreeCamera({ x: 1000, y: 0, z: 2000 }, { x: 1000, y: 0, z: 2001 });
    getViewMatrix(cam);
    cam._useFloatingOrigin = true;
    expect(getViewMatrix(cam)[14]).not.toBeCloseTo(0, 3);
    cam.position.y = 0.5;
    expect(Math.abs(getViewMatrix(cam)[14]!)).toBe(0);
});

import * as L2 from "@babylonjs/lite";
import * as V2 from "vitest";

V2.it("65 (after check 2): a camera never viewed uses the flag at its first getViewMatrix; a cached view waits for a pose change", () => {
    const fresh = L2.createFreeCamera({ x: 5, y: 6, z: 7 }, { x: 5, y: 6, z: 20 });
    fresh._useFloatingOrigin = true;
    const v = L2.getViewMatrix(fresh);
    V2.expect([v[12], v[13], v[14]].map(Math.abs)).toEqual([0, 0, 0]);
    const cam = L2.createFreeCamera({ x: 5, y: 6, z: 7 }, { x: 5, y: 6, z: 20 });
    const w = L2.getViewMatrix(cam);
    const t = [w[12], w[13], w[14]];
    cam._useFloatingOrigin = true;
    L2.getViewMatrix(cam);
    V2.expect([w[12], w[13], w[14]]).toEqual(t); // kept
    cam.target.x = 5.5; // a pose change
    L2.getViewMatrix(cam);
    V2.expect([w[12], w[13], w[14]].map(Math.abs)).toEqual([0, 0, 0]);
});

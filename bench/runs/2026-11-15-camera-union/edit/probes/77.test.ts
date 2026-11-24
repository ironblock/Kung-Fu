import { it, expect } from "vitest";
import { createFreeCamera, getViewProjectionMatrix, projectPointToViewportToRef } from "@babylonjs/lite";

it("77: projectPointToViewportToRef applies transform*world, accepts zero-size viewports, writes only x, y, z", () => {
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    const vp = getViewProjectionMatrix(cam, 1);
    const world = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 10, 1]); // translate z+10
    const out = { x: 0, y: 0, z: 0, tag: "kept", cssX: 7 };
    projectPointToViewportToRef({ x: 0, y: 0, z: 0 }, world as never, vp, { x: 0, y: 0, width: 100, height: 100 }, out);
    expect(out.x).toBeCloseTo(50, 6);
    expect(out.y).toBeCloseTo(50, 6);
    expect(out.z).toBeGreaterThan(0);
    expect(out.tag).toBe("kept");
    expect(out.cssX).toBe(7);
    const z = { x: 0, y: 0, z: 0 };
    expect(() => projectPointToViewportToRef({ x: 0, y: 0, z: 0 }, world as never, vp, { x: 5, y: 6, width: 0, height: 0 }, z)).not.toThrow();
    expect([z.x, z.y]).toEqual([5, 6]);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

import { vi } from "vitest";
const mm = vi.hoisted(() => ({ calls: [] as unknown[] }));
vi.mock("../../babylon-lite/packages/babylon-lite/src/math/multiply-mat4.ts", async (orig) => {
    const m = (await orig()) as { multiplyMat4: (a: unknown, b: unknown) => unknown };
    return { ...m, multiplyMat4: (a: unknown, b: unknown) => { const r = m.multiplyMat4(a, b); mm.calls.push(r); return r; } };
});

it("77b (after check): each call allocates a new matrix through multiplyMat4", () => {
    const cam = L.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    const vp = L.getViewProjectionMatrix(cam, 1);
    const world = new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 10, 1]);
    const out = { x: 0, y: 0, z: 0 };
    const n0 = mm.calls.length;
    L.projectPointToViewportToRef({ x: 0, y: 0, z: 0 }, world as never, vp, { x: 0, y: 0, width: 100, height: 100 }, out);
    L.projectPointToViewportToRef({ x: 0, y: 0, z: 0 }, world as never, vp, { x: 0, y: 0, width: 100, height: 100 }, out);
    expect(mm.calls.length - n0).toBe(2);
    expect(mm.calls[n0]).not.toBe(mm.calls[n0 + 1]);
    expect(mm.calls[n0]).not.toBe(vp);
});

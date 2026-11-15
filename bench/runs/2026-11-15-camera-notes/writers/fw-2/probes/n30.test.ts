import { describe, it, expect } from "vitest";
import { createArcRotateCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

describe("n30 projectWorldToScreen: x/y in backing pixels of the viewport, z is 0..1 depth, offscreen points are not clamped", () => {
    const cam = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    const view = getViewMatrix(cam);
    const vp = getViewProjectionMatrix(cam, 800 / 600);
    const options = { viewport: { x: 0, y: 0, width: 800, height: 600 }, backingWidth: 800, backingHeight: 600 };
    it("the target lands at the viewport centre with depth in (0,1)", () => {
        const r = projectWorldToScreen({ x: 0, y: 0, z: 0 }, view, vp, options);
        expect(r.x).toBeCloseTo(400, 6);
        expect(r.y).toBeCloseTo(300, 6);
        expect(r.z).toBeGreaterThan(0);
        expect(r.z).toBeLessThan(1);
        expect(r.offscreen).toBe(false);
    });
    it("a point far to the side keeps an extrapolated x beyond the viewport", () => {
        const r = projectWorldToScreen({ x: 100, y: 0, z: 0 }, view, vp, options);
        expect(r.offscreen).toBe(true);
        expect(Math.abs(r.x - 400)).toBeGreaterThan(400);
    });
    it("a point behind the eye is behindCamera and offscreen", () => {
        const r = projectWorldToScreen({ x: 0, y: 0, z: -20 }, view, vp, options);
        expect(r.behindCamera).toBe(true);
        expect(r.offscreen).toBe(true);
    });
    it("a zero-sized viewport throws RangeError, as does cssWidth without cssHeight", () => {
        expect(() => projectWorldToScreen({ x: 0, y: 0, z: 0 }, view, vp, { ...options, viewport: { x: 0, y: 0, width: 0, height: 600 } })).toThrow(RangeError);
        expect(() => projectWorldToScreen({ x: 0, y: 0, z: 0 }, view, vp, { ...options, cssWidth: 400 })).toThrow(RangeError);
    });
    it("cssX is x scaled by cssWidth / backingWidth", () => {
        const r = projectWorldToScreen({ x: 0, y: 0, z: 0 }, view, vp, { ...options, cssWidth: 400, cssHeight: 300 });
        expect(r.cssX).toBeCloseTo(200, 6);
        expect(r.cssY).toBeCloseTo(150, 6);
    });
});

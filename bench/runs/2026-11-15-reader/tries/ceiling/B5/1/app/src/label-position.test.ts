import { describe, expect, it } from "vitest";
import { createFreeCamera } from "@babylonjs/lite";
import { labelPosition } from "./label-position";

function canvas(width: number, height: number, cssW: number, cssH: number): HTMLCanvasElement {
    return { width, height, clientWidth: cssW, clientHeight: cssH } as unknown as HTMLCanvasElement;
}

describe("labelPosition", () => {
    const cam = () => {
        const c = createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
        c.farPlane = 100;
        return c;
    };
    const cv = canvas(1600, 1200, 800, 600);

    it("centers a forward point in CSS pixels", () => {
        const r = labelPosition(cam(), cv, { x: 0, y: 0, z: 0 });
        expect(r.visible).toBe(true);
        expect(r.x).toBeCloseTo(400);
        expect(r.y).toBeCloseTo(300);
    });
    it("puts +x right and +y up", () => {
        const r = labelPosition(cam(), cv, { x: 1, y: 1, z: 0 });
        expect(r.x).toBeGreaterThan(400);
        expect(r.y).toBeLessThan(300);
    });
    it("treats points beyond far plane as visible", () => {
        const r = labelPosition(cam(), cv, { x: 0, y: 0, z: 1e6 });
        expect(r.visible).toBe(true);
        expect(r.x).toBeCloseTo(400);
    });
    it("is not visible but extrapolated when off to the side", () => {
        const r = labelPosition(cam(), cv, { x: 1000, y: 0, z: 0 });
        expect(r.visible).toBe(false);
        expect(r.x).toBeGreaterThan(800);
    });
    it("is never visible behind the camera", () => {
        expect(labelPosition(cam(), cv, { x: 0, y: 0, z: -20 }).visible).toBe(false);
    });
    it("handles floating origin", () => {
        const c = createFreeCamera({ x: 1e7, y: 0, z: -10 }, { x: 1e7, y: 0, z: 0 });
        (c as { _useFloatingOrigin?: boolean })._useFloatingOrigin = true;
        const r = labelPosition(c, cv, { x: 1e7, y: 0, z: 0 });
        expect(r.visible).toBe(true);
        expect(r.x).toBeCloseTo(400);
    });
});

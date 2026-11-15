import { describe, it, expect } from "vitest";
import { createFreeCamera, getProjectionMatrix, enableOrthographicCamera } from "@babylonjs/lite";

describe("n18", () => {
    it("hand ortho ignored until enable ran once; then hand ortho not invalidating cache", () => {
        const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        const persp = [...getProjectionMatrix(c, 1)];
        c.ortho = { halfHeight: 2, left: null, right: null, bottom: null, top: null };
        c.fov = 0.9; // force rebuild
        expect(getProjectionMatrix(c, 1)[15]).toBe(0); // still perspective
        void persp;
        const other = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        enableOrthographicCamera(other);
        // now process-wide installed; c's hand ortho is used on next rebuild, but not before
        expect(getProjectionMatrix(c, 1)[15]).toBe(0); // cached, not invalidated
        c.fov = 1.0;
        const m = getProjectionMatrix(c, 1);
        expect(m[15]).toBe(1);
        expect(m[5]).toBeCloseTo(1 / 2);
        // hand assignment on a fresh-cached camera
        const d = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        getProjectionMatrix(d, 1);
        d.ortho = { halfHeight: 2, left: null, right: null, bottom: null, top: null };
        expect(getProjectionMatrix(d, 1)[15]).toBe(0);
    });
});

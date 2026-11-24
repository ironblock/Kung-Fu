// Reach c/b: orthographic getProjectionMatrix also ignores viewport; height 0 viewport.
import { describe, expect, it } from "vitest";
import { createArcRotateCamera, enableOrthographicCamera, getEffectiveAspectRatio, getProjectionMatrix, resolveCameraViewport } from "@babylonjs/lite";

describe("reach c", () => {
    it("ortho camera projection ignores viewport", () => {
        const a = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        enableOrthographicCamera(a);
        const m1 = Array.from(getProjectionMatrix(a, 1.5) as ArrayLike<number>);
        const b = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        enableOrthographicCamera(b);
        (b as { viewport?: unknown }).viewport = { x: 0, y: 0, width: 0.25, height: 1 };
        const m2 = Array.from(getProjectionMatrix(b, 1.5) as ArrayLike<number>);
        expect(m2).toEqual(m1);
    });
    it("far edge clamped: width 1.5 at x 0 gives 800 wide; aspect from raw fields", () => {
        const c = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        (c as { viewport?: unknown }).viewport = { x: 0, y: 0, width: 1.5, height: 1 };
        expect(resolveCameraViewport(c, 800, 600)).toEqual({ x: 0, y: 0, width: 800, height: 600 });
        expect(getEffectiveAspectRatio(c, 800, 600)).toBeCloseTo(2, 12);
    });
});

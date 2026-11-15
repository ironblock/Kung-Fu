import { describe, expect, it } from "vitest";
import { createChaseCamera } from "./chase-camera.js";

// Column 1 of the camera-to-world matrix is the camera's picture-up axis.
function pictureUp(camera: { worldMatrix: ArrayLike<number> }) {
    const m = camera.worldMatrix;
    return { x: m[4]!, y: m[5]!, z: m[6]! };
}

function expectVec(actual: { x: number; y: number; z: number }, expected: [number, number, number]) {
    expect(actual.x).toBeCloseTo(expected[0], 6);
    expect(actual.y).toBeCloseTo(expected[1], 6);
    expect(actual.z).toBeCloseTo(expected[2], 6);
}

describe("createChaseCamera", () => {
    it("starts upright, looking at the target", () => {
        // Looking down at the origin: upright is world +Y projected into the view plane.
        const chase = createChaseCamera({ x: 0, y: 2, z: -10 }, { x: 0, y: 0, z: 0 });
        const f = { x: 0, y: -2, z: 10 };
        const fl = Math.hypot(f.x, f.y, f.z);
        const d = -2 / fl;
        const p = { x: -d * f.x / fl, y: 1 - d * f.y / fl, z: -d * f.z / fl };
        const pl = Math.hypot(p.x, p.y, p.z);
        expectVec(pictureUp(chase.camera), [p.x / pl, p.y / pl, p.z / pl]);
        expect(chase.camera.target.z).toBe(0);
    });

    it("rolls so the picture up follows the requested up", () => {
        const chase = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        chase.bank({ x: 1, y: 0, z: 0 });
        expectVec(pictureUp(chase.camera), [1, 0, 0]);
    });

    it("projects an up that is not perpendicular to the view", () => {
        const chase = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const c = Math.SQRT1_2;
        chase.bank({ x: c, y: c, z: 0 });
        expectVec(pictureUp(chase.camera), [c, c, 0]);
        // An up with a view-direction component still gives the perpendicular part.
        chase.bank({ x: 0, y: 1, z: 1 });
        expectVec(pictureUp(chase.camera), [0, 1, 0]);
    });

    it("keeps the previous roll when the up points along the line of sight", () => {
        const chase = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        chase.bank({ x: 1, y: 0, z: 0 });
        chase.bank({ x: 0, y: 0, z: 1 });
        expectVec(pictureUp(chase.camera), [1, 0, 0]);
        chase.bank({ x: 0, y: 0, z: -1 });
        expectVec(pictureUp(chase.camera), [1, 0, 0]);
        expect(chase.camera.target.z).toBe(10);
    });

    it("still looks at the target after banking", () => {
        const chase = createChaseCamera({ x: 3, y: 1, z: -5 }, { x: 0, y: 0, z: 0 });
        chase.bank({ x: 0.6, y: 0.8, z: 0 });
        const m = chase.camera.worldMatrix;
        // Column 2 is the view direction; it must point from eye to target.
        const dx = -3, dy = -1, dz = 5;
        const len = Math.hypot(dx, dy, dz);
        expect(m[8]!).toBeCloseTo(dx / len, 6);
        expect(m[9]!).toBeCloseTo(dy / len, 6);
        expect(m[10]!).toBeCloseTo(dz / len, 6);
    });

    it("handles a vertical view without a degenerate basis", () => {
        const chase = createChaseCamera({ x: 0, y: 10, z: 0 }, { x: 0, y: 0, z: 0 });
        expectVec(pictureUp(chase.camera), [0, 0, 1]);
        chase.bank({ x: 1, y: 0, z: 0 });
        expectVec(pictureUp(chase.camera), [1, 0, 0]);
    });
});

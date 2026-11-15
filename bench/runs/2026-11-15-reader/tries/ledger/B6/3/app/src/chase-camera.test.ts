import { describe, expect, it } from "vitest";
import { createChaseCamera } from "./chase-camera";

// Column layout of the camera's world matrix: x axis at 0..2, picture-up (y axis) at 4..6, view (z) at 8..10.
const picUp = (c: ReturnType<typeof createChaseCamera>) => {
    const w = c.camera.worldMatrix;
    return [w[4]!, w[5]!, w[6]!];
};
const viewAxis = (c: ReturnType<typeof createChaseCamera>) => {
    const w = c.camera.worldMatrix;
    return [w[8]!, w[9]!, w[10]!];
};
const expectVec = (actual: number[], expected: number[]) => {
    expect(actual[0]).toBeCloseTo(expected[0]!, 6);
    expect(actual[1]).toBeCloseTo(expected[1]!, 6);
    expect(actual[2]).toBeCloseTo(expected[2]!, 6);
};

describe("createChaseCamera", () => {
    it("starts upright, looking at the target from the eye", () => {
        const c = createChaseCamera({ x: 0, y: 5, z: -10 }, { x: 0, y: 0, z: 0 });
        expect(c.camera.position.x).toBe(0);
        expect(c.camera.position.y).toBe(5);
        expect(c.camera.position.z).toBe(-10);
        expect(c.camera.target.x).toBe(0);
        expect(c.camera.target.y).toBe(0);
        expect(c.camera.target.z).toBe(0);
        const up = picUp(c);
        expect(up[1]).toBeGreaterThan(0);
        // View is (0,-5,10)/|..|; world Y projected onto its perpendicular plane is (0,2,1)/sqrt5.
        expectVec(up, [0, 2 / Math.sqrt(5), 1 / Math.sqrt(5)]);
    });

    it("rolls so picture-up follows the given up", () => {
        const c = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        c.bank({ x: 1, y: 0, z: 0 });
        expectVec(picUp(c), [1, 0, 0]);
        expectVec(viewAxis(c), [0, 0, 1]);
    });

    it("picks the closest picture-up for an off-axis up", () => {
        const c = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        c.bank({ x: 0.6, y: 0.8, z: 0 });
        expectVec(picUp(c), [0.6, 0.8, 0]);
    });

    it("projects a tilted up onto the view plane", () => {
        // Looking down +Z, the component of (1,1,1) perpendicular to Z is (1,1,0) -> unit (1,1,0)/sqrt2.
        const c = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        c.bank({ x: 1, y: 1, z: 1 });
        const s = Math.SQRT1_2;
        expectVec(picUp(c), [s, s, 0]);
    });

    it("keeps its previous roll when up points along the line of sight, either way", () => {
        const c = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        c.bank({ x: 1, y: 0, z: 0 });
        c.bank({ x: 0, y: 0, z: 1 });
        expectVec(picUp(c), [1, 0, 0]);
        expectVec(viewAxis(c), [0, 0, 1]);
        c.bank({ x: 0, y: 0, z: -1 });
        expectVec(picUp(c), [1, 0, 0]);
        expect(c.camera.target.z).toBe(1);
    });

    it("keeps the roll on a degenerate call even after the view direction moved", () => {
        const c = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        c.bank({ x: 0, y: 1, z: 0 });
        // Turn the view to +X (still perpendicular to picture-up +Y); the roll should be unchanged.
        c.camera.target.set(1, 0, 0);
        c.bank({ x: 1, y: 0, z: 0 });
        expectVec(picUp(c), [0, 1, 0]);
    });

    it("keeps picture-up perpendicular to the view after the view moves and up is not degenerate", () => {
        const c = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        c.bank({ x: 1, y: 0, z: 0 });
        c.camera.target.set(0, 1, 1);
        // Up (0,0,1) against view (0,1,1)/sqrt2: projection is (0,-1,1)/sqrt2.
        c.bank({ x: 0, y: 0, z: 1 });
        const s = Math.SQRT1_2;
        expectVec(picUp(c), [0, -s, s]);
        expectVec(viewAxis(c), [0, s, s]);
    });

    it("keeps the previous roll, re-projected, when up is degenerate for the moved view", () => {
        const c = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        c.bank({ x: 1, y: 0, z: 0 });
        const s = Math.SQRT1_2;
        c.camera.target.set(0, 1, 1);
        // Up exactly along the new view: fall back to last picture-up (1,0,0), already perpendicular.
        c.bank({ x: 0, y: s, z: s });
        expectVec(picUp(c), [1, 0, 0]);
    });

    it("handles NaN and zero up as degenerate", () => {
        const c = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        c.bank({ x: 0, y: 1, z: 0 });
        c.bank({ x: NaN, y: 0, z: 0 });
        c.bank({ x: 0, y: 0, z: 0 });
        expectVec(picUp(c), [0, 1, 0]);
    });

    it("falls back to a different upright when the start points straight down", () => {
        const c = createChaseCamera({ x: 0, y: 10, z: 0 }, { x: 0, y: 0, z: 0 });
        const up = picUp(c);
        expect(Math.hypot(up[0]!, up[1]!, up[2]!)).toBeCloseTo(1, 6);
        expect(up[1]).toBeCloseTo(0, 6);
        c.bank({ x: 0, y: 1, z: 0 });
        expectVec(picUp(c), up);
    });
});

import { describe, expect, it } from "vitest";
import { createChaseCamera } from "./chase-camera.ts";

type Vec = { x: number; y: number; z: number };
const axes = (m: ArrayLike<number>) => ({
    right: [m[0]!, m[1]!, m[2]!],
    up: [m[4]!, m[5]!, m[6]!],
    fwd: [m[8]!, m[9]!, m[10]!],
    pos: [m[12]!, m[13]!, m[14]!],
});
const close = (a: number[], b: number[]) => a.forEach((v, i) => expect(v).toBeCloseTo(b[i]!, 6));
const norm = (v: Vec) => {
    const l = Math.hypot(v.x, v.y, v.z);
    return [v.x / l, v.y / l, v.z / l];
};

describe("createChaseCamera", () => {
    const eye = { x: 1, y: 2, z: -8 };
    const target = { x: 1, y: 1, z: 2 };
    const fwd = norm({ x: 0, y: -1, z: 10 });

    it("starts at eye, looking at target, upright", () => {
        const { camera } = createChaseCamera(eye, target);
        const a = axes(camera.worldMatrix as unknown as ArrayLike<number>);
        close(a.pos, [1, 2, -8]);
        close(a.fwd, fwd);
        expect(a.up[1]).toBeGreaterThan(0.99);
        expect(Math.abs(a.right[1]!)).toBeLessThan(1e-9);
    });

    it("rolls to match up, projected onto the picture plane", () => {
        const c = createChaseCamera(eye, target);
        c.bank({ x: 1, y: 0, z: 0 });
        let a = axes(c.camera.worldMatrix as unknown as ArrayLike<number>);
        close(a.up, [1, 0, 0]);
        close(a.fwd, fwd);
        c.bank({ x: 0, y: -1, z: 0 });
        a = axes(c.camera.worldMatrix as unknown as ArrayLike<number>);
        expect(a.up[1]).toBeLessThan(-0.99);
        close(a.fwd, fwd);
        // A non-perpendicular up: the picture up is its projection.
        const u = norm({ x: 0.3, y: 0.2, z: 0.9 });
        c.bank({ x: u[0]!, y: u[1]!, z: u[2]! });
        a = axes(c.camera.worldMatrix as unknown as ArrayLike<number>);
        const d = u[0]! * fwd[0]! + u[1]! * fwd[1]! + u[2]! * fwd[2]!;
        close(a.up, norm({ x: u[0]! - d * fwd[0]!, y: u[1]! - d * fwd[1]!, z: u[2]! - d * fwd[2]! }));
        close(a.fwd, fwd);
    });

    it("keeps the previous roll when up is along the line of sight, either way", () => {
        const c = createChaseCamera(eye, target);
        c.bank({ x: 1, y: 0, z: 0 });
        const before = Array.from(c.camera.worldMatrix as unknown as ArrayLike<number>);
        for (const s of [1, -1]) {
            c.bank({ x: s * fwd[0]!, y: s * fwd[1]!, z: s * fwd[2]! });
            const after = Array.from(c.camera.worldMatrix as unknown as ArrayLike<number>);
            close(after, before);
        }
    });

    it("handles exactly axis-aligned lines of sight", () => {
        const c = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 5 });
        c.bank({ x: 1, y: 0, z: 0 });
        c.bank({ x: 0, y: 0, z: 1 });
        c.bank({ x: 0, y: 0, z: -1 });
        const a = axes(c.camera.worldMatrix as unknown as ArrayLike<number>);
        close(a.up, [1, 0, 0]);
        close(a.fwd, [0, 0, 1]);
        // Looking straight down still yields a valid look-at.
        const d = createChaseCamera({ x: 0, y: 5, z: 0 }, { x: 0, y: 0, z: 0 });
        close(axes(d.camera.worldMatrix as unknown as ArrayLike<number>).fwd, [0, -1, 0]);
    });
});

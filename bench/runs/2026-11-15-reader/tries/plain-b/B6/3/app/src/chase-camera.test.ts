import { describe, expect, it } from "vitest";
import { createChaseCamera } from "./chase-camera.ts";

type V = { x: number; y: number; z: number };

function axes(camera: { worldMatrix: unknown }) {
    const m = camera.worldMatrix as ArrayLike<number>;
    // Columns of the camera-to-world matrix: [xAxis, yAxis, zAxis, eye].
    return {
        x: { x: m[0]!, y: m[1]!, z: m[2]! },
        y: { x: m[4]!, y: m[5]!, z: m[6]! },
        z: { x: m[8]!, y: m[9]!, z: m[10]! },
    };
}
const dot = (a: V, b: V) => a.x * b.x + a.y * b.y + a.z * b.z;

describe("createChaseCamera", () => {
    const eye = { x: 0, y: 2, z: -10 };
    const target = { x: 0, y: 0, z: 0 };

    it("starts upright and looks at the target", () => {
        const { camera } = createChaseCamera(eye, target);
        const a = axes(camera);
        expect(a.y.y).toBeGreaterThan(0.9);
        expect(dot(a.z, { x: 0, y: -2, z: 10 })).toBeGreaterThan(0);
    });

    it("rolls so the picture-up matches a banked up as closely as possible", () => {
        const { camera, bank } = createChaseCamera(eye, target);
        const up = { x: 0.6, y: 0.8, z: 0 };
        bank(up);
        const a = axes(camera);
        // Forward is unchanged: still looking at the target.
        expect(dot(a.z, { x: 0, y: -2, z: 10 }) / Math.hypot(2, 10)).toBeGreaterThan(0.999);
        // Picture-up is the unit up projected onto the image plane.
        const f = a.z;
        const d = dot(up, f);
        const want = { x: up.x - d * f.x, y: up.y - d * f.y, z: up.z - d * f.z };
        const wl = Math.hypot(want.x, want.y, want.z);
        expect(dot(a.y, { x: want.x / wl, y: want.y / wl, z: want.z / wl })).toBeGreaterThan(0.999999);
    });

    it("keeps the previous roll when up is along the line of sight, either way", () => {
        const { camera, bank } = createChaseCamera(eye, target);
        bank({ x: 1, y: 0, z: 0 });
        const before = axes(camera).y;
        const fwd = { x: 0, y: -2, z: 10 };
        const n = Math.hypot(fwd.x, fwd.y, fwd.z);
        bank({ x: fwd.x / n, y: fwd.y / n, z: fwd.z / n });
        bank({ x: -fwd.x / n, y: -fwd.y / n, z: -fwd.z / n });
        const after = axes(camera);
        expect(dot(after.y, before)).toBeGreaterThan(0.999999);
        expect(dot(after.z, fwd) / n).toBeGreaterThan(0.999999);
    });
});

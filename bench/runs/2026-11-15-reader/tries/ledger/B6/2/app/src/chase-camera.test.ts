import { describe, expect, it } from "vitest";
import { createChaseCamera } from "./chase-camera.ts";

type V = { x: number; y: number; z: number };

const close = (a: V, b: V, eps = 1e-6) => {
    expect(Math.abs(a.x - b.x)).toBeLessThan(eps);
    expect(Math.abs(a.y - b.y)).toBeLessThan(eps);
    expect(Math.abs(a.z - b.z)).toBeLessThan(eps);
};

// Camera basis from the world matrix (columns x, y, z, eye).
function axes(m: ArrayLike<number>) {
    return {
        x: { x: m[0]!, y: m[1]!, z: m[2]! },
        y: { x: m[4]!, y: m[5]!, z: m[6]! },
        z: { x: m[8]!, y: m[9]!, z: m[10]! },
    };
}

const unit = (v: V): V => {
    const l = Math.hypot(v.x, v.y, v.z);
    return { x: v.x / l, y: v.y / l, z: v.z / l };
};

// Independent expectation: normalized projection of up onto the plane perpendicular to the line of sight.
function expectedPictureUp(fwd: V, up: V): V {
    const f = unit(fwd);
    const d = up.x * f.x + up.y * f.y + up.z * f.z;
    return unit({ x: up.x - d * f.x, y: up.y - d * f.y, z: up.z - d * f.z });
}

describe("createChaseCamera", () => {
    it("starts upright and looks at the target", () => {
        const c = createChaseCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
        const a = axes(c.camera.worldMatrix);
        close(a.y, { x: 0, y: 1, z: 0 });
        close(a.z, { x: 0, y: 0, z: 1 });
        expect(c.camera.position).toMatchObject({ x: 0, y: 0, z: -10 });
        expect(c.camera.target).toMatchObject({ x: 0, y: 0, z: 0 });
    });

    it("rolls so the picture up matches the requested up", () => {
        const c = createChaseCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
        c.bank({ x: 1, y: 0, z: 0 });
        const a = axes(c.camera.worldMatrix);
        close(a.y, { x: 1, y: 0, z: 0 });
        close(a.z, { x: 0, y: 0, z: 1 });
    });

    it("projects an oblique up onto the picture plane", () => {
        const c = createChaseCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
        const up = unit({ x: 0, y: 1, z: 1 });
        c.bank(up);
        close(axes(c.camera.worldMatrix).y, { x: 0, y: 1, z: 0 });
    });

    it("keeps the previous roll when up points along the line of sight, either way", () => {
        const c = createChaseCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
        c.bank({ x: 1, y: 0, z: 0 });
        c.bank({ x: 0, y: 0, z: 1 });
        close(axes(c.camera.worldMatrix).y, { x: 1, y: 0, z: 0 });
        c.bank({ x: 0, y: 0, z: -1 });
        close(axes(c.camera.worldMatrix).y, { x: 1, y: 0, z: 0 });
        close(axes(c.camera.worldMatrix).z, { x: 0, y: 0, z: 1 });
        expect(c.camera.target).toMatchObject({ x: 0, y: 0, z: 0 });
    });

    it("matches the independent projection for many random ups and camera poses", () => {
        let seed = 12345;
        const rnd = () => {
            seed = (seed * 1664525 + 1013904223) >>> 0;
            return seed / 4294967296 * 2 - 1;
        };
        for (let i = 0; i < 300; i++) {
            const eye = { x: rnd() * 50, y: rnd() * 50, z: rnd() * 50 };
            const target = { x: rnd() * 50, y: rnd() * 50, z: rnd() * 50 };
            const fwd = { x: target.x - eye.x, y: target.y - eye.y, z: target.z - eye.z };
            const c = createChaseCamera(eye, target);
            const up = unit({ x: rnd(), y: rnd(), z: rnd() });
            c.bank(up);
            const a = axes(c.camera.worldMatrix);
            close(a.y, expectedPictureUp(fwd, up), 1e-4);
            close(a.z, unit(fwd), 1e-4);
        }
    });
});

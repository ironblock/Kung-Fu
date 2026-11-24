import { describe, expect, it } from "vitest";
import { createChaseCamera } from "./chase-camera.ts";

// Column layout of the camera's world matrix: x axis at 0..2, y axis (picture up) at 4..6,
// z axis (line of sight) at 8..10, eye at 12..14.
function axes(m: ArrayLike<number>) {
    return {
        x: [m[0]!, m[1]!, m[2]!],
        y: [m[4]!, m[5]!, m[6]!],
        z: [m[8]!, m[9]!, m[10]!],
    };
}

function expectVec(actual: number[], expected: number[], digits = 6) {
    for (let i = 0; i < 3; i++) {
        expect(actual[i]).toBeCloseTo(expected[i]!, digits);
    }
}

describe("createChaseCamera", () => {
    it("starts upright, sitting at eye and looking at target", () => {
        const cc = createChaseCamera({ x: 0, y: 2, z: -10 }, { x: 0, y: 2, z: 0 });
        const a = axes(cc.camera.worldMatrix);
        expectVec(a.z, [0, 0, 1]);
        expectVec(a.y, [0, 1, 0]);
        const m = cc.camera.worldMatrix;
        expectVec([m[12]!, m[13]!, m[14]!], [0, 2, -10]);
    });

    it("rolls so picture-up follows a banked up vector", () => {
        const cc = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 5 });
        cc.bank({ x: 1, y: 0, z: 0 });
        expectVec(axes(cc.camera.worldMatrix).y, [1, 0, 0]);
        expectVec(axes(cc.camera.worldMatrix).z, [0, 0, 1]);
    });

    it("projects an up vector that is not perpendicular to the line of sight", () => {
        const cc = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 5 });
        // Up tilted toward the viewer: the picture-up is its component across the line of sight.
        cc.bank({ x: 0, y: 0.6, z: 0.8 });
        expectVec(axes(cc.camera.worldMatrix).y, [0, 1, 0]);
        expectVec(axes(cc.camera.worldMatrix).z, [0, 0, 1]);
    });

    it("keeps the previous roll when up points along the line of sight, either way", () => {
        const cc = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 5 });
        cc.bank({ x: 1, y: 0, z: 0 });
        const before = axes(cc.camera.worldMatrix);

        cc.bank({ x: 0, y: 0, z: 1 });
        cc.bank({ x: 0, y: 0, z: -1 });

        const after = axes(cc.camera.worldMatrix);
        expectVec(after.y, before.y);
        expectVec(after.x, before.x);
        expectVec(after.z, [0, 0, 1]);
    });

    it("still looks at the target after a degenerate bank on an angled line of sight", () => {
        const eye = { x: 1, y: 2, z: 3 };
        const target = { x: 4, y: 6, z: 3 };
        const cc = createChaseCamera(eye, target);
        const dir = [0.6, 0.8, 0];
        cc.bank({ x: 0, y: 0, z: 1 });
        cc.bank({ x: dir[0]!, y: dir[1]!, z: dir[2]! });
        cc.bank({ x: -dir[0]!, y: -dir[1]!, z: -dir[2]! });
        expectVec(axes(cc.camera.worldMatrix).z, dir);
    });

    it("bumps the world matrix version when the roll changes", () => {
        const cc = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 5 });
        const v0 = cc.camera.worldMatrixVersion;
        cc.bank({ x: 1, y: 0, z: 0 });
        expect(cc.camera.worldMatrixVersion).toBeGreaterThan(v0);
    });

    it("does not bump the version on a degenerate bank", () => {
        const cc = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 5 });
        const v0 = cc.camera.worldMatrixVersion;
        cc.bank({ x: 0, y: 0, z: 1 });
        expect(cc.camera.worldMatrixVersion).toBe(v0);
    });

    it("uses the current target when it has been moved", () => {
        const cc = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 5 });
        cc.camera.target.set(5, 0, 0);
        cc.bank({ x: 0, y: 1, z: 0 });
        expectVec(axes(cc.camera.worldMatrix).z, [1, 0, 0]);
        expectVec(axes(cc.camera.worldMatrix).y, [0, 1, 0]);
    });

    it("falls back to +Z as the upright reference on a vertical line of sight", () => {
        const cc = createChaseCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 5, z: 0 });
        expectVec(axes(cc.camera.worldMatrix).z, [0, 1, 0]);
        // Reference is +Z, so the picture-up is +Z projected across the view: it must be (0,0,1)'s
        // component perpendicular to +Y, which is +Z itself.
        expectVec(axes(cc.camera.worldMatrix).y, [0, 0, 1]);
    });
});

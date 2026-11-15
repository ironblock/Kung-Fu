import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createArcRotateCamera, getCameraPosition, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";

const expected = JSON.parse(readFileSync(resolve(import.meta.dirname, "expected.json"), "utf8")) as {
    eyeX: number;
    eyeY: number;
    upright: boolean;
    sameAsOtherSide: boolean;
};

describe("A4: an orbit camera past the top", () => {
    const origin = { x: 0, y: 0, z: 0 };
    const camera = createArcRotateCamera(0, 0.5, 10, origin);
    getCameraPosition(camera);
    camera.beta = -0.5;

    it("eyeX and eyeY", () => {
        const eye = getCameraPosition(camera);
        expect(Math.abs(eye.x - expected.eyeX)).toBeLessThan(0.01);
        expect(Math.abs(eye.y - expected.eyeY)).toBeLessThan(0.01);
    });

    it("upright", () => {
        const options = { viewport: { x: 0, y: 0, width: 800, height: 600 }, backingWidth: 800, backingHeight: 600 };
        const view = getViewMatrix(camera);
        const vp = getViewProjectionMatrix(camera, 800 / 600);
        const low = projectWorldToScreen({ x: 0, y: 0, z: 0 }, view, vp, options);
        const high = projectWorldToScreen({ x: 0, y: 1, z: 0 }, view, vp, options);
        // Screen y grows downward: upright means the higher point is drawn higher.
        expect(high.y < low.y).toBe(expected.upright);
    });

    it("sameAsOtherSide", () => {
        const other = createArcRotateCamera(Math.PI, 0.5, 10, origin);
        const a = camera.worldMatrix;
        const b = other.worldMatrix;
        let same = true;
        for (let i = 0; i < 16; i++) {
            if (Math.abs(a[i]! - b[i]!) > 1e-5) {
                same = false;
            }
        }
        expect(same).toBe(expected.sameAsOtherSide);
    });
});

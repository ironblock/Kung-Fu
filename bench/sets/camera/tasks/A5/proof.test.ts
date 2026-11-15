import { describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { createArcRotateCamera, getEffectiveAspectRatio, resolveCameraViewport } from "@babylonjs/lite";

const expected = JSON.parse(readFileSync(resolve(import.meta.dirname, "expected.json"), "utf8")) as {
    x: number;
    y: number;
    width: number;
    height: number;
    aspect: number;
};

describe("A5: a camera viewport partly past the canvas edge", () => {
    const camera = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    camera.viewport = { x: 0.8, y: 0.1, width: 0.3, height: 0.3 };
    const rect = resolveCameraViewport(camera, 1000, 500);

    it("x", () => expect(rect.x).toBe(expected.x));
    it("y", () => expect(rect.y).toBe(expected.y));
    it("width", () => expect(rect.width).toBe(expected.width));
    it("height", () => expect(rect.height).toBe(expected.height));
    it("aspect", () => expect(Math.abs(getEffectiveAspectRatio(camera, 1000, 500) - expected.aspect)).toBeLessThan(0.01));
});

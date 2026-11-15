import { describe, expect, it } from "vitest";
import { createFreeCamera } from "@babylonjs/lite";
import { labelPosition } from "./label-position.ts";

// 800x600 backing store shown at 400x300 CSS pixels (device pixel ratio 2).
const canvas = { width: 800, height: 600, clientWidth: 400, clientHeight: 300 } as unknown as HTMLCanvasElement;

function makeCamera() {
    const camera = createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
    camera.fov = 0.8;
    camera.nearPlane = 0.1;
    camera.farPlane = 1000;
    return camera;
}

describe("labelPosition", () => {
    it("puts the target point at the canvas centre and marks it visible", () => {
        const p = labelPosition(makeCamera(), canvas, { x: 0, y: 0, z: 0 });
        expect(p.visible).toBe(true);
        expect(p.x).toBeCloseTo(200, 6);
        expect(p.y).toBeCloseTo(150, 6);
    });

    it("treats points behind the camera as not visible", () => {
        const p = labelPosition(makeCamera(), canvas, { x: 0, y: 0, z: -20 });
        expect(p.visible).toBe(false);
    });

    it("counts points beyond the far plane as visible", () => {
        const p = labelPosition(makeCamera(), canvas, { x: 0, y: 0, z: 5000 });
        expect(p.visible).toBe(true);
        expect(p.x).toBeCloseTo(200, 6);
        expect(p.y).toBeCloseTo(150, 6);
    });

    it("gives extrapolated coordinates past the edge for in-front points outside the picture", () => {
        const p = labelPosition(makeCamera(), canvas, { x: 1000, y: 0, z: 0 });
        expect(p.visible).toBe(false);
        expect(p.x).toBeGreaterThan(400);
        expect(p.y).toBeCloseTo(150, 6);
    });

    it("uses camera-relative coordinates under floating origin", () => {
        const camera = createFreeCamera({ x: 1e6, y: 0, z: 1e6 - 10 }, { x: 1e6, y: 0, z: 1e6 });
        camera.fov = 0.8;
        camera.nearPlane = 0.1;
        camera.farPlane = 1000;
        camera._useFloatingOrigin = true;
        camera._viewVer = -1;
        const p = labelPosition(camera, canvas, { x: 1e6, y: 0, z: 1e6 });
        expect(p.visible).toBe(true);
        expect(p.x).toBeCloseTo(200, 3);
        expect(p.y).toBeCloseTo(150, 3);
    });
});

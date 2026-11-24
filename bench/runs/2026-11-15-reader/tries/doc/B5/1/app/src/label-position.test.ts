import { describe, expect, it } from "vitest";
import { createArcRotateCamera, createFreeCamera, enableOrthographicCamera } from "@babylonjs/lite";
import { labelPosition } from "./label-position.js";

// Backing store is 800x600 device pixels; CSS box is 400x300, so CSS = backing / 2.
const canvas = { width: 800, height: 600, clientWidth: 400, clientHeight: 300 } as unknown as HTMLCanvasElement;

// Looks down +Z (left-handed), so the points in front have z > 0 relative to the camera.
function forwardCamera() {
    const cam = createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
    cam.fov = 0.8;
    cam.nearPlane = 0.1;
    cam.farPlane = 1000;
    return cam;
}

describe("labelPosition", () => {
    it("places the target point at the canvas centre", () => {
        const p = labelPosition(forwardCamera(), canvas, { x: 0, y: 0, z: 0 });
        expect(p.visible).toBe(true);
        expect(p.x).toBeCloseTo(200, 3);
        expect(p.y).toBeCloseTo(150, 3);
    });

    it("reports a point in front and off to the right as not visible, with x past the right edge", () => {
        const p = labelPosition(forwardCamera(), canvas, { x: 100, y: 0, z: 0 });
        expect(p.visible).toBe(false);
        expect(p.x).toBeGreaterThan(400);
        expect(p.y).toBeCloseTo(150, 3);
    });

    it("reports a point above the picture with y above the top edge", () => {
        const p = labelPosition(forwardCamera(), canvas, { x: 0, y: 100, z: 0 });
        expect(p.visible).toBe(false);
        expect(p.y).toBeLessThan(0);
    });

    it("treats points behind the camera as never visible", () => {
        const p = labelPosition(forwardCamera(), canvas, { x: 0, y: 0, z: -20 });
        expect(p.visible).toBe(false);
    });

    it("keeps points beyond the far plane visible", () => {
        const p = labelPosition(forwardCamera(), canvas, { x: 0, y: 0, z: 50000 });
        expect(p.visible).toBe(true);
        expect(p.x).toBeCloseTo(200, 2);
        expect(p.y).toBeCloseTo(150, 2);
    });

    it("works for an arc-rotate camera", () => {
        const cam = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        const p = labelPosition(cam, canvas, { x: 0, y: 0, z: 0 });
        expect(p.visible).toBe(true);
        expect(p.x).toBeCloseTo(200, 3);
    });

    it("treats a point behind the camera as invisible for an orthographic camera", () => {
        const cam = forwardCamera();
        enableOrthographicCamera(cam, { halfHeight: 5 });
        expect(labelPosition(cam, canvas, { x: 0, y: 0, z: 0 }).visible).toBe(true);
        expect(labelPosition(cam, canvas, { x: 0, y: 0, z: -20 }).visible).toBe(false);
    });
});

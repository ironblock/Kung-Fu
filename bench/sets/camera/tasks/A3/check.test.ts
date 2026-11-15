import { describe, expect, it } from "vitest";
import { createArcRotateCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";
import { asCanvas, makeCanvas } from "./helpers";
import { trackScreenShift } from "../src/screen-shift";

type Vec = { x: number; y: number; z: number };

/** Where the point appears now, in CSS pixels, read off the library at this moment. */
function at(camera: Camera, point: Vec, width: number, height: number): { x: number; y: number } {
    const r = projectWorldToScreen(point, getViewMatrix(camera), getViewProjectionMatrix(camera, width / height), {
        viewport: { x: 0, y: 0, width, height },
        backingWidth: width,
        backingHeight: height,
    });
    return { x: r.cssX, y: r.cssY };
}

describe("trackScreenShift", () => {
    const point = { x: 3, y: 1, z: -2 };

    it("reports the shift since creation after the camera turns", () => {
        const canvas = makeCanvas(800, 600);
        const camera = createArcRotateCamera(0.4, 1.2, 10, { x: 0, y: 0, z: 0 });
        const start = at(camera, point, 800, 600);
        const tracker = trackScreenShift(camera, asCanvas(canvas));
        expect(tracker.shift(point).dx).toBeCloseTo(0, 3);
        camera.alpha += 0.3;
        const now = at(camera, point, 800, 600);
        const s = tracker.shift(point);
        expect(Math.abs(now.x - start.x)).toBeGreaterThan(5);
        expect(s.dx).toBeCloseTo(now.x - start.x, 2);
        expect(s.dy).toBeCloseTo(now.y - start.y, 2);
    });

    it("measures from the last mark, and sees a field-of-view change", () => {
        const canvas = makeCanvas(640, 480);
        const camera = createArcRotateCamera(-1, 1, 8, { x: 0, y: 0, z: 0 });
        const tracker = trackScreenShift(camera, asCanvas(canvas));
        camera.radius = 5;
        tracker.mark();
        const marked = at(camera, point, 640, 480);
        expect(tracker.shift(point).dx).toBeCloseTo(0, 3);
        camera.fov = 0.4;
        const now = at(camera, point, 640, 480);
        const s = tracker.shift(point);
        expect(Math.hypot(now.x - marked.x, now.y - marked.y)).toBeGreaterThan(5);
        expect(s.dx).toBeCloseTo(now.x - marked.x, 2);
        expect(s.dy).toBeCloseTo(now.y - marked.y, 2);
    });
});

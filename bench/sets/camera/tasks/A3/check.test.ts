import { describe, expect, it } from "vitest";
import { createArcRotateCamera, createFreeCamera, enableOrthographicCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";
import { asCanvas, makeCanvas } from "./helpers";
import { trackScreenShift } from "../src/screen-shift";

type Vec = { x: number; y: number; z: number };

/**
 * Where the point appears now, in CSS pixels, read off the library at this moment, on a canvas of
 * width x height backing pixels shown at cssWidth x cssHeight CSS pixels.
 */
function at(camera: Camera, point: Vec, width: number, height: number, cssWidth = width, cssHeight = height): { x: number; y: number } {
    const r = projectWorldToScreen(point, getViewMatrix(camera), getViewProjectionMatrix(camera, width / height), {
        viewport: { x: 0, y: 0, width, height },
        backingWidth: width,
        backingHeight: height,
        cssWidth,
        cssHeight,
    });
    return { x: r.cssX, y: r.cssY };
}

/** A canvas of 1600 x 1200 backing pixels shown at 800 x 600 CSS pixels, as on a screen of pixel ratio 2. */
function sharpCanvas(): ReturnType<typeof makeCanvas> {
    const canvas = makeCanvas(1600, 1200);
    canvas.clientWidth = 800;
    canvas.clientHeight = 600;
    canvas.style.width = "800px";
    canvas.style.height = "600px";
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, right: 800, bottom: 600, x: 0, y: 0, width: 800, height: 600 });
    return canvas;
}

/** A canvas of width x height backing pixels shown at cssWidth x cssHeight CSS pixels. */
function shownAt(width: number, height: number, cssWidth: number, cssHeight: number): ReturnType<typeof makeCanvas> {
    const canvas = makeCanvas(width, height);
    canvas.clientWidth = cssWidth;
    canvas.clientHeight = cssHeight;
    canvas.style.width = `${cssWidth}px`;
    canvas.style.height = `${cssHeight}px`;
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, right: cssWidth, bottom: cssHeight, x: 0, y: 0, width: cssWidth, height: cssHeight });
    return canvas;
}

/** Turn and zoom the camera, mark, turn again, and compare each shift with the library's CSS projection. */
function turnMarkTurn(camera: Camera, canvas: ReturnType<typeof makeCanvas>, width: number, height: number, cssWidth: number, cssHeight: number, point: Vec): void {
    const orbit = camera as unknown as { alpha: number; beta: number; radius: number };
    const start = at(camera, point, width, height, cssWidth, cssHeight);
    const tracker = trackScreenShift(camera, asCanvas(canvas));
    orbit.alpha += 0.3;
    orbit.radius = 7;
    const now = at(camera, point, width, height, cssWidth, cssHeight);
    const s = tracker.shift(point);
    expect(Math.abs(now.x - start.x)).toBeGreaterThan(5);
    expect(s.dx).toBeCloseTo(now.x - start.x, 2);
    expect(s.dy).toBeCloseTo(now.y - start.y, 2);
    tracker.mark();
    const marked = at(camera, point, width, height, cssWidth, cssHeight);
    orbit.beta = 0.9;
    const later = at(camera, point, width, height, cssWidth, cssHeight);
    const t = tracker.shift(point);
    expect(Math.hypot(later.x - marked.x, later.y - marked.y)).toBeGreaterThan(5);
    expect(t.dx).toBeCloseTo(later.x - marked.x, 2);
    expect(t.dy).toBeCloseTo(later.y - marked.y, 2);
}

/** Run `body` with the window's pixel ratio at 2, where there is a window, so that it agrees with the canvas. */
function atRatio2(body: () => void): void {
    const w = (globalThis as { window?: { devicePixelRatio?: number } }).window;
    const had = w?.devicePixelRatio;
    if (w) {
        w.devicePixelRatio = 2;
    }
    try {
        body();
    } finally {
        if (w) {
            w.devicePixelRatio = had;
        }
    }
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

    it("measures in CSS pixels on a canvas with twice as many backing pixels", () => {
        atRatio2(() => {
            const canvas = sharpCanvas();
            const camera = createArcRotateCamera(0.4, 1.2, 10, { x: 0, y: 0, z: 0 });
            const start = at(camera, point, 1600, 1200, 800, 600);
            const tracker = trackScreenShift(camera, asCanvas(canvas));
            camera.alpha += 0.3;
            camera.radius = 7;
            const now = at(camera, point, 1600, 1200, 800, 600);
            const s = tracker.shift(point);
            expect(Math.abs(now.x - start.x)).toBeGreaterThan(5);
            expect(s.dx).toBeCloseTo(now.x - start.x, 2);
            expect(s.dy).toBeCloseTo(now.y - start.y, 2);
            tracker.mark();
            const marked = at(camera, point, 1600, 1200, 800, 600);
            camera.beta = 0.9;
            camera.fov = 0.6;
            const later = at(camera, point, 1600, 1200, 800, 600);
            const t = tracker.shift(point);
            expect(Math.hypot(later.x - marked.x, later.y - marked.y)).toBeGreaterThan(5);
            expect(t.dx).toBeCloseTo(later.x - marked.x, 2);
            expect(t.dy).toBeCloseTo(later.y - marked.y, 2);
        });
    });

    it("works for a free camera that moves and turns", () => {
        const canvas = makeCanvas(800, 600);
        const camera = createFreeCamera({ x: 0, y: 2, z: -10 }, { x: 0, y: 0, z: 0 });
        const start = at(camera, point, 800, 600);
        const tracker = trackScreenShift(camera, asCanvas(canvas));
        camera.position.x = 1;
        camera.position.z = -9;
        camera.target.x = 0.5;
        const now = at(camera, point, 800, 600);
        const s = tracker.shift(point);
        expect(Math.hypot(now.x - start.x, now.y - start.y)).toBeGreaterThan(5);
        expect(s.dx).toBeCloseTo(now.x - start.x, 2);
        expect(s.dy).toBeCloseTo(now.y - start.y, 2);
        tracker.mark();
        const marked = at(camera, point, 800, 600);
        camera.target.y = 1;
        camera.position.y = 3;
        const later = at(camera, point, 800, 600);
        const t = tracker.shift(point);
        expect(Math.hypot(later.x - marked.x, later.y - marked.y)).toBeGreaterThan(5);
        expect(t.dx).toBeCloseTo(later.x - marked.x, 2);
        expect(t.dy).toBeCloseTo(later.y - marked.y, 2);
    });
    it("measures in CSS pixels when the backing size is not the pixel ratio times the CSS size", () => {
        // Rendered at half resolution on a screen of pixel ratio 2: 400 x 300 backing pixels shown at 800 x 600.
        atRatio2(() => {
            turnMarkTurn(createArcRotateCamera(0.4, 1.2, 10, { x: 0, y: 0, z: 0 }), shownAt(400, 300, 800, 600), 400, 300, 800, 600, point);
        });
        // Stretched: a square backing store shown in a box of another shape.
        turnMarkTurn(createArcRotateCamera(0.4, 1.2, 10, { x: 0, y: 0, z: 0 }), shownAt(400, 400, 800, 600), 400, 400, 800, 600, point);
    });

    it("works for an orthographic camera that zooms", () => {
        const canvas = makeCanvas(800, 600);
        const camera = createArcRotateCamera(0.4, 1.2, 10, { x: 0, y: 0, z: 0 });
        const ortho = enableOrthographicCamera(camera, { halfHeight: 5 });
        const start = at(camera, point, 800, 600);
        const tracker = trackScreenShift(camera, asCanvas(canvas));
        ortho.halfHeight = 3;
        const now = at(camera, point, 800, 600);
        const s = tracker.shift(point);
        expect(Math.hypot(now.x - start.x, now.y - start.y)).toBeGreaterThan(5);
        expect(s.dx).toBeCloseTo(now.x - start.x, 2);
        expect(s.dy).toBeCloseTo(now.y - start.y, 2);
        tracker.mark();
        const marked = at(camera, point, 800, 600);
        camera.alpha += 0.2;
        ortho.halfHeight = 4;
        const later = at(camera, point, 800, 600);
        const t = tracker.shift(point);
        expect(Math.hypot(later.x - marked.x, later.y - marked.y)).toBeGreaterThan(5);
        expect(t.dx).toBeCloseTo(later.x - marked.x, 2);
        expect(t.dy).toBeCloseTo(later.y - marked.y, 2);
    });
});

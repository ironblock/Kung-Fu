import { describe, expect, it } from "vitest";
import { createFreeCamera, enableOrthographicCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";
import { labelPosition } from "../src/label-position";
import { asCanvas, makeCanvas } from "./helpers";

type V = { x: number; y: number; z: number };

/** A canvas of bw x bh backing pixels shown at cw x ch CSS pixels, as on a screen with more device pixels per CSS pixel. */
function shownCanvas(bw: number, bh: number, cw: number, ch: number) {
    const canvas = makeCanvas(bw, bh);
    canvas.clientWidth = cw;
    canvas.clientHeight = ch;
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, right: cw, bottom: ch, x: 0, y: 0, width: cw, height: ch });
    return canvas;
}

/** The library's own answer for a camera that renders to the whole canvas: CSS pixels, and whether it is in the picture. */
function library(camera: Camera, p: V, bw: number, bh: number, cw: number, ch: number) {
    const r = projectWorldToScreen(p, getViewMatrix(camera), getViewProjectionMatrix(camera, bw / bh), {
        viewport: { x: 0, y: 0, width: bw, height: bh },
        backingWidth: bw,
        backingHeight: bh,
        cssWidth: cw,
        cssHeight: ch,
    });
    return { x: r.cssX, y: r.cssY, visible: !r.offscreen };
}

/** A camera off the origin that looks up, to the right and away from the axes. */
function turnedCamera() {
    return createFreeCamera({ x: 3, y: 2, z: -4 }, { x: 10, y: 4, z: 20 });
}

function expectAsLibrary(bw: number, bh: number, cw: number, ch: number, points: V[]): void {
    const camera = turnedCamera();
    const canvas = shownCanvas(bw, bh, cw, ch);
    for (const p of points) {
        const got = labelPosition(camera, asCanvas(canvas), p);
        const want = library(camera, p, bw, bh, cw, ch);
        expect(got.visible).toBe(want.visible);
        expect(got.x).toBeCloseTo(want.x, 2);
        expect(got.y).toBeCloseTo(want.y, 2);
    }
}

function rig() {
    const canvas = makeCanvas(800, 600);
    // At the origin, looking along +Z, world +Y up. Its far clipping distance is 10000.
    const camera = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    return { canvas: asCanvas(canvas), camera };
}

describe("B5 label position", () => {
    it("puts a point straight ahead at the centre of the canvas, visible", () => {
        const { canvas, camera } = rig();
        const label = labelPosition(camera, canvas, { x: 0, y: 0, z: 50 });
        expect(label.visible).toBe(true);
        expect(label.x).toBeCloseTo(400, 6);
        expect(label.y).toBeCloseTo(300, 6);
    });

    it("measures y downward from the top and x rightward from the left", () => {
        const { canvas, camera } = rig();
        const above = labelPosition(camera, canvas, { x: 0, y: 5, z: 50 });
        const right = labelPosition(camera, canvas, { x: 5, y: 0, z: 50 });
        expect(above.visible).toBe(true);
        expect(above.y).toBeLessThan(300);
        expect(above.y).toBeGreaterThan(0);
        expect(right.visible).toBe(true);
        expect(right.x).toBeGreaterThan(400);
        expect(right.x).toBeLessThan(800);
    });

    it("counts a point beyond the far clipping distance as visible", () => {
        const { canvas, camera } = rig();
        const label = labelPosition(camera, canvas, { x: 0, y: 0, z: 50000 });
        expect(label.visible).toBe(true);
        expect(label.x).toBeCloseTo(400, 3);
        expect(label.y).toBeCloseTo(300, 3);

        const farUp = labelPosition(camera, canvas, { x: 0, y: 5000, z: 50000 });
        expect(farUp.visible).toBe(true);
        expect(farUp.y).toBeLessThan(300);
    });

    it("keeps the off-edge position of a point in front but outside the picture", () => {
        const { canvas, camera } = rig();
        const label = labelPosition(camera, canvas, { x: 500, y: 0, z: 50 });
        expect(label.visible).toBe(false);
        expect(Number.isFinite(label.x)).toBe(true);
        expect(label.x).toBeGreaterThan(800);
        expect(label.y).toBeCloseTo(300, 3);
    });

    it("never shows a point behind the camera", () => {
        const { canvas, camera } = rig();
        expect(labelPosition(camera, canvas, { x: 0, y: 0, z: -50 }).visible).toBe(false);
        expect(labelPosition(camera, canvas, { x: 1, y: 1, z: -50000 }).visible).toBe(false);
    });

    it("gives CSS pixels on a canvas with twice as many backing pixels, for a turned camera and off-centre points", () => {
        const points = [{ x: 12, y: 7, z: 25 }, { x: -3, y: 9, z: 40 }, { x: 60, y: 4, z: 30 }];
        expectAsLibrary(1600, 1200, 800, 600, points);
        const camera = turnedCamera();
        const label = labelPosition(camera, asCanvas(shownCanvas(1600, 1200, 800, 600)), points[0]!);
        expect(label.visible).toBe(true);
        expect(label.x).toBeLessThan(800);
        expect(label.y).toBeLessThan(600);
    });

    it("gives the right place on a wide canvas, for a turned camera and off-centre points", () => {
        expectAsLibrary(1800, 600, 1200, 400, [{ x: 4, y: 5, z: 30 }, { x: 30, y: 1, z: 25 }, { x: -20, y: 3, z: 20 }]);
    });

    it("counts a point ten million units away as visible", () => {
        const { canvas, camera } = rig();
        const label = labelPosition(camera, canvas, { x: 0, y: 0, z: 1e7 });
        expect(label.visible).toBe(true);
        expect(label.x).toBeCloseTo(400, 2);
        expect(label.y).toBeCloseTo(300, 2);
    });
    it("does not show a point past the far clipping distance that is outside the picture", () => {
        const { canvas, camera } = rig();
        const label = labelPosition(camera, canvas, { x: 500000, y: 0, z: 50000 });
        expect(label.visible).toBe(false);
        expect(label.x).toBeGreaterThan(800);
        expect(label.y).toBeCloseTo(300, 3);
    });

    it("shows a point in the picture that is nearer than the camera's near clipping distance", () => {
        const { canvas, camera } = rig();
        const p = { x: 0.1, y: 0, z: 0.5 };
        const label = labelPosition(camera, canvas, p);
        const want = library(camera, p, 800, 600, 800, 600);
        expect(want.visible).toBe(true);
        expect(label.visible).toBe(true);
        expect(label.x).toBeCloseTo(want.x, 2);
        expect(label.y).toBeCloseTo(want.y, 2);
    });

    it("gives the right place and visibility for an orthographic camera", () => {
        const camera = turnedCamera();
        enableOrthographicCamera(camera, { halfHeight: 10 });
        const canvas = shownCanvas(1600, 1200, 800, 600);
        for (const p of [{ x: 5, y: 3, z: 40 }, { x: 8, y: 6, z: 25 }, { x: 40, y: 2, z: 30 }]) {
            const got = labelPosition(camera, asCanvas(canvas), p);
            const want = library(camera, p, 1600, 1200, 800, 600);
            expect(got.visible).toBe(want.visible);
            expect(got.x).toBeCloseTo(want.x, 2);
            expect(got.y).toBeCloseTo(want.y, 2);
        }
    });
});

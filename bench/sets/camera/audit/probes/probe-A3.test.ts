import { expect, it } from "vitest";
import { createArcRotateCamera, createFreeCamera, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";
import { asCanvas, makeCanvas } from "./helpers";
import { trackScreenShift } from "../src/screen-shift";

type Vec = { x: number; y: number; z: number };
const point = { x: 3, y: 1, z: -2 };

/** The library's own projection, in CSS pixels, for a canvas of bw x bh backing pixels shown at cw x ch. */
function at(camera: Camera, p: Vec, bw: number, bh: number, cw: number, ch: number): { x: number; y: number } {
    const r = projectWorldToScreen(p, getViewMatrix(camera), getViewProjectionMatrix(camera, bw / bh), {
        viewport: { x: 0, y: 0, width: bw, height: bh }, backingWidth: bw, backingHeight: bh, cssWidth: cw, cssHeight: ch,
    });
    return { x: r.cssX, y: r.cssY };
}

function hiDpi() {
    const canvas = makeCanvas(1600, 1200);
    canvas.clientWidth = 800;
    canvas.clientHeight = 600;
    canvas.getBoundingClientRect = () => ({ left: 0, top: 0, right: 800, bottom: 600, x: 0, y: 0, width: 800, height: 600 });
    return canvas;
}

it("A3 hi-dpi canvas: shift in CSS pixels", () => {
    const canvas = hiDpi();
    const camera = createArcRotateCamera(0.4, 1.2, 10, { x: 0, y: 0, z: 0 });
    const start = at(camera, point, 1600, 1200, 800, 600);
    const tracker = trackScreenShift(camera, asCanvas(canvas));
    camera.alpha += 0.3;
    const now = at(camera, point, 1600, 1200, 800, 600);
    const s = tracker.shift(point);
    console.log("PROBE dpi2 got", s.dx.toFixed(2), s.dy.toFixed(2), "want", (now.x - start.x).toFixed(2), (now.y - start.y).toFixed(2));
    expect(s.dx).toBeCloseTo(now.x - start.x, 2);
    expect(s.dy).toBeCloseTo(now.y - start.y, 2);
});

it("A3 free camera that moves and turns", () => {
    const canvas = makeCanvas(800, 600);
    const camera = createFreeCamera({ x: 0, y: 2, z: -10 }, { x: 0, y: 0, z: 0 });
    const start = at(camera, point, 800, 600, 800, 600);
    let s = { dx: NaN, dy: NaN };
    let threw = "";
    try {
        const tracker = trackScreenShift(camera, asCanvas(canvas));
        camera.position.x = 1;
        camera.target.x = 0.5;
        const nowS = tracker.shift(point);
        s = nowS;
    } catch (e) {
        threw = String(e).slice(0, 120);
        camera.position.x = 1;
        camera.target.x = 0.5;
    }
    const now = at(camera, point, 800, 600, 800, 600);
    console.log("PROBE free got", s.dx.toFixed(2), s.dy.toFixed(2), "want", (now.x - start.x).toFixed(2), (now.y - start.y).toFixed(2), threw);
    expect(s.dx).toBeCloseTo(now.x - start.x, 2);
    expect(s.dy).toBeCloseTo(now.y - start.y, 2);
});

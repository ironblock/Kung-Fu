import { expect, it } from "vitest";
import { createFreeCamera, getEffectiveAspectRatio, getViewMatrix, getViewProjectionMatrix, projectWorldToScreen } from "@babylonjs/lite";
import type { Camera } from "@babylonjs/lite";
import { labelPosition } from "../src/label-position";
import { asCanvas, makeCanvas } from "./helpers";

type V = { x: number; y: number; z: number };
// The library's own answer, in CSS pixels, for a canvas of bw x bh backing pixels shown at cw x ch.
function lib(camera: Camera, p: V, bw: number, bh: number, cw: number, ch: number) {
    const r = projectWorldToScreen(p, getViewMatrix(camera), getViewProjectionMatrix(camera, getEffectiveAspectRatio(camera, bw, bh)), {
        viewport: { x: 0, y: 0, width: bw, height: bh }, backingWidth: bw, backingHeight: bh, cssWidth: cw, cssHeight: ch,
    });
    return { x: r.cssX, y: r.cssY, visible: !r.offscreen };
}

function canvasOf(bw: number, bh: number, cw: number, ch: number) {
    const c = makeCanvas(bw, bh);
    c.clientWidth = cw;
    c.clientHeight = ch;
    c.getBoundingClientRect = () => ({ left: 0, top: 0, right: cw, bottom: ch, x: 0, y: 0, width: cw, height: ch });
    return c;
}

function turned() {
    const camera = createFreeCamera({ x: 3, y: 2, z: -4 }, { x: 10, y: 4, z: 20 });
    return camera;
}

function compare(label: string, bw: number, bh: number, cw: number, ch: number, p: V) {
    const camera = turned();
    const canvas = canvasOf(bw, bh, cw, ch);
    const got = labelPosition(camera, asCanvas(canvas), p);
    const want = lib(camera, p, bw, bh, cw, ch);
    console.log(`PROBE ${label} got ${got.x.toFixed(2)},${got.y.toFixed(2)} ${got.visible} want ${want.x.toFixed(2)},${want.y.toFixed(2)} ${want.visible}`);
    expect(got.visible).toBe(want.visible);
    expect(got.x).toBeCloseTo(want.x, 2);
    expect(got.y).toBeCloseTo(want.y, 2);
}

it("B5 hi-dpi canvas (1600x1200 backing at 800x600 CSS), turned camera, off-centre point", () => {
    compare("dpi2", 1600, 1200, 800, 600, { x: 12, y: 7, z: 25 });
});

it("B5 wide canvas, turned camera, off-centre point", () => {
    compare("wide", 1200, 400, 1200, 400, { x: 4, y: 5, z: 30 });
});

it("B5 a point 1e7 away straight ahead is visible", () => {
    const camera = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const canvas = makeCanvas(800, 600);
    const got = labelPosition(camera, asCanvas(canvas), { x: 0, y: 0, z: 1e7 });
    console.log(`PROBE far1e7 got ${got.x.toFixed(2)},${got.y.toFixed(2)} ${got.visible}`);
    expect(got.visible).toBe(true);
    expect(got.x).toBeCloseTo(400, 2);
});

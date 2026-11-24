import { expect, test } from "vitest";
import { createArcRotateCamera, resolveCameraViewport, getEffectiveAspectRatio } from "@babylonjs/lite";

test("resolveCameraViewport: viewport.y counts from the bottom, the result's y from the top; fractions clamped to [0,1]", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    cam.viewport = { x: 0, y: 0, width: 0.5, height: 0.5 };
    expect(resolveCameraViewport(cam, 800, 600)).toEqual({ x: 0, y: 300, width: 400, height: 300 });
    cam.viewport = { x: 0.5, y: 0.5, width: 1, height: 1 };
    expect(resolveCameraViewport(cam, 800, 600)).toEqual({ x: 400, y: 0, width: 400, height: 300 });
    expect(resolveCameraViewport(null, 800, 600)).toEqual({ x: 0, y: 0, width: 800, height: 600 });
    cam.viewport = { x: 0, y: 0, width: 0.5, height: 1 };
    expect(getEffectiveAspectRatio(cam, 800, 600)).toBeCloseTo((800 / 600) * 0.5, 12);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: the pixel edges are clamped to the canvas, not the fractions", () => {
    const cam = L.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    cam.viewport = { x: -0.5, y: 0, width: 1, height: 1 };
    expect(L.resolveCameraViewport(cam, 800, 600)).toEqual({ x: 0, y: 0, width: 400, height: 600 });
});

import { it, expect } from "vitest";
import { createArcRotateCamera, resolveCameraViewport } from "@babylonjs/lite";

it("23: viewport.y counts from the bottom, the result from the top; edges are clamped to the canvas", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    cam.viewport = { x: 0, y: 0, width: 0.5, height: 0.5 };
    expect(resolveCameraViewport(cam, 800, 600)).toEqual({ x: 0, y: 300, width: 400, height: 300 });
    cam.viewport = { x: -0.5, y: 0, width: 1, height: 1 };
    expect(resolveCameraViewport(cam, 800, 600)).toEqual({ x: 0, y: 0, width: 400, height: 600 });
});

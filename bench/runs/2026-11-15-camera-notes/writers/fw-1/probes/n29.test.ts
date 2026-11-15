import { it, expect } from "vitest";
import { createArcRotateCamera, resolveCameraViewport, getEffectiveAspectRatio } from "@babylonjs/lite";

it("n29: viewport y counts from the bottom; resolved pixel y from the top; aspect scales by width/height", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    cam.viewport = { x: 0, y: 0, width: 0.5, height: 0.25 };
    expect(resolveCameraViewport(cam, 800, 600)).toEqual({ x: 0, y: 450, width: 400, height: 150 });
    expect(getEffectiveAspectRatio(cam, 800, 600)).toBeCloseTo((800 / 600) * 2, 10);
    cam.viewport = { x: 0.75, y: 0, width: 0.5, height: 1 };
    expect(resolveCameraViewport(cam, 800, 600)).toEqual({ x: 600, y: 0, width: 200, height: 600 });
});

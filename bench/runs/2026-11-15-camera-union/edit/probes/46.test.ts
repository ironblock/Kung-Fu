import { it, expect } from "vitest";
import { createArcRotateCamera, getProjectionMatrix, getEffectiveAspectRatio } from "@babylonjs/lite";

it("46: getProjectionMatrix ignores camera.viewport; getEffectiveAspectRatio folds it in", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const full = Array.from(getProjectionMatrix(cam, 800 / 600));
    cam.viewport = { x: 0, y: 0, width: 0.5, height: 1 };
    expect(Array.from(getProjectionMatrix(cam, 800 / 600))).toEqual(full);
    const eff = getEffectiveAspectRatio(cam, 800, 600);
    expect(eff).toBeCloseTo(400 / 600, 12);
    expect(getProjectionMatrix(cam, eff)[0]).toBeCloseTo(full[0]! * 2, 5);
});

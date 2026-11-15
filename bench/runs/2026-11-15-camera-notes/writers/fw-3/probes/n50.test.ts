import { expect, test } from "vitest";
import { createArcRotateCamera, getProjectionMatrix, getEffectiveAspectRatio } from "@babylonjs/lite";

test("getProjectionMatrix applies no camera.viewport: pass getEffectiveAspectRatio(camera, w, h) as the aspect to match the render", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const plain = Array.from(getProjectionMatrix(cam, 800 / 600));
    cam.viewport = { x: 0, y: 0, width: 0.5, height: 1 };
    expect(Array.from(getProjectionMatrix(cam, 800 / 600))).toEqual(plain);
    const eff = getEffectiveAspectRatio(cam, 800, 600);
    expect(getProjectionMatrix(cam, eff)[0]).toBeCloseTo(plain[0]! * 2, 6);
});

import { expect, test } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, touches } from "./helpers";

test("pinch writes radius directly: startRadius * startDistance / distance, with no scene and no inertia", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c));
    fire(c, "touchstart", touches([1, 100, 100], [2, 200, 100]));
    fire(c, "touchmove", touches([2, 300, 100]));
    expect(cam.radius).toBeCloseTo(5, 12);
    expect(cam.inertialRadiusOffset).toBe(0);
});

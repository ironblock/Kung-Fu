import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, touches, makeScene } from "./helpers";

it("n09: pinch writes radius directly, startRadius*startDistance/currentDistance, with no inertia", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene);
    fire(c, "touchstart", touches([1, 0, 0], [2, 100, 0]));
    fire(c, "touchmove", touches([2, 200, 0]));
    expect(cam.radius).toBeCloseTo(5, 10);
    expect(cam.inertialRadiusOffset).toBe(0);
});

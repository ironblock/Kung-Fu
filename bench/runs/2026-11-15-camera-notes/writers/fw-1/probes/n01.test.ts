import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, touches } from "./helpers";

it("n01: attachControl without a scene never moves the camera", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c));
    fire(c, "pointerdown", pointer({ clientX: 0, clientY: 0 }));
    fire(c, "pointermove", pointer({ clientX: 100, clientY: 50 }));
    fire(c, "pointerup", pointer());
    fire(c, "wheel", { deltaY: 100 });
    expect(cam.alpha).toBe(1);
    expect(cam.beta).toBe(1);
    expect(cam.radius).toBe(10);
    expect(cam.inertialAlphaOffset).not.toBe(0);
    expect(cam.inertialRadiusOffset).not.toBe(0);
});

it("n01b: a two-finger pinch writes radius at once even with no scene", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c));
    fire(c, "touchstart", touches([1, 0, 0], [2, 100, 0]));
    fire(c, "touchmove", touches([2, 200, 0]));
    expect(cam.radius).toBeCloseTo(5, 12);
    expect(cam.inertialRadiusOffset).toBe(0);
});

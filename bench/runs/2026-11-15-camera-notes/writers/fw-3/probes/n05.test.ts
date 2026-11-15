import { expect, test } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

test("beta: no default limits; attachControl's frame step clamps beta to [0.01, PI-0.01] only while rotation inertia runs", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    expect(cam.lowerBetaLimit).toBeUndefined();
    const canvas = makeCanvas();
    attachControl(cam, asCanvas(canvas), scene);
    cam.beta = 0;
    tick(scene, 1);
    expect(cam.beta).toBe(0);
    cam.beta = -1;
    expect(cam.beta).toBe(-1);
    // a tiny drag starts rotation inertia: beta is clamped on that frame
    fire(canvas, "pointerdown", pointer({ clientX: 0, clientY: 0 }));
    fire(canvas, "pointermove", pointer({ clientX: 10, clientY: 0 }));
    tick(scene, 1);
    expect(cam.beta).toBeCloseTo(0.01, 10);
    cam.beta = 4;
    fire(canvas, "pointermove", pointer({ clientX: 20, clientY: 0 }));
    tick(scene, 1);
    expect(cam.beta).toBeCloseTo(Math.PI - 0.01, 10);
});

import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

it("n07: frames that apply rotation clamp beta to [0.01, PI-0.01]; radius floors at 0.01; alpha is not wrapped", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 0.05, 10, { x: 0, y: 0, z: 0 });
    cam.inertia = 0;
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene);
    cam.beta = 4; // direct write: no clamp outside a rotation frame
    expect(cam.beta).toBe(4);
    cam.beta = 0.05;
    fire(c, "pointerdown", pointer({ clientX: 0, clientY: 0 }));
    fire(c, "pointermove", pointer({ clientX: -10000, clientY: 100 }));
    fire(c, "pointerup", pointer());
    tick(scene);
    expect(cam.beta).toBe(0.01);
    expect(cam.alpha).toBeCloseTo(11, 10);
    fire(c, "wheel", { deltaY: -100000 });
    tick(scene);
    expect(cam.radius).toBe(0.01);
});

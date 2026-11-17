import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

it("c2-36: an Alt diagonal is not normalised: alpha gets the full 1/100 and radius the full 1/25", () => {
    enableArcRotateKeyboardControls();
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    cam.inertia = 0;
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene, { keyboard: true });
    fire(c, "keydown", key("ArrowUp", { altKey: true }));
    fire(c, "keydown", key("ArrowRight", { altKey: true }));
    tick(scene);
    expect(cam.alpha - 1).toBeCloseTo(1 / 100, 12);
    expect(10 - cam.radius).toBeCloseTo(1 / 25, 12);
    // the plain diagonal is normalised, for contrast
    const cam2 = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    cam2.inertia = 0;
    const c2 = makeCanvas();
    const s2 = makeScene();
    attachControl(cam2, asCanvas(c2), s2, { keyboard: true });
    fire(c2, "keydown", key("ArrowUp"));
    fire(c2, "keydown", key("ArrowRight"));
    tick(s2);
    expect(cam2.alpha - 1).toBeCloseTo(Math.SQRT1_2 / 100, 12);
});

import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

it("n12a: keyboard option is ignored before enableArcRotateKeyboardControls", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene, { keyboard: true });
    expect(c.listeners.has("keydown")).toBe(false);
    expect(c.tabIndex).toBe(-1);
    fire(c, "keydown", key("ArrowRight"));
    tick(scene);
    expect(cam.alpha).toBe(1);
});

it("n12b: after enabling, keys are heard on the canvas, which gets tabIndex 0", () => {
    enableArcRotateKeyboardControls();
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene, { keyboard: true });
    expect(c.tabIndex).toBe(0);
    fire(c, "keydown", key("ArrowRight"));
    tick(scene);
    expect(cam.alpha).toBeGreaterThan(1);
});

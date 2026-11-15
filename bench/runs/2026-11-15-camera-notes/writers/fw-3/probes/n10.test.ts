import { expect, test } from "vitest";
import { createArcRotateCamera, attachControl, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

test("keyboard: ArrowUp lowers beta, Ctrl+arrows pan, Alt+ArrowUp lowers radius", () => {
    enableArcRotateKeyboardControls();
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene, { keyboard: true });
    fire(c, "keydown", key("ArrowUp"));
    tick(scene, 1);
    expect(cam.beta).toBeCloseTo(0.99, 12);
    fire(c, "keyup", key("ArrowUp"));
    tick(scene, 100);
    const r0 = cam.radius;
    fire(c, "keydown", key("ArrowUp", { altKey: true }));
    tick(scene, 1);
    expect(cam.radius).toBeCloseTo(r0 - 1 / 25, 12);
    fire(c, "keyup", key("ArrowUp", { altKey: false }));
    tick(scene, 100);
    fire(c, "keydown", key("ArrowRight", { ctrlKey: true }));
    tick(scene, 1);
    expect(cam.inertialPanningX).toBeCloseTo((1 / 50) * 0.9, 12);
    expect(cam.inertialAlphaOffset).toBe(0);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: Alt+ArrowUp adds 1/25 to inertialRadiusOffset each frame, so the drop grows", () => {
    L.enableArcRotateKeyboardControls();
    const scene = H.makeScene();
    const cam = L.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c = H.makeCanvas();
    L.attachControl(cam, H.asCanvas(c), scene, { keyboard: true });
    H.fire(c, "keydown", H.key("ArrowUp", { altKey: true }));
    H.tick(scene, 1);
    expect(cam.radius).toBeCloseTo(10 - 0.04, 12);
    H.tick(scene, 1);
    expect(cam.radius).toBeCloseTo(10 - 0.04 - (0.04 * 0.9 + 0.04), 12);
});

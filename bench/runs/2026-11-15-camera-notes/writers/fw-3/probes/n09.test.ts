import { expect, test } from "vitest";
import { createArcRotateCamera, attachControl, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

test("keyboard option is ignored until enableArcRotateKeyboardControls() runs; keys are read from canvas once per frame", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c1 = makeCanvas();
    attachControl(cam, asCanvas(c1), scene, { keyboard: true });
    expect(c1.listeners.has("keydown")).toBe(false);

    enableArcRotateKeyboardControls();
    const cam2 = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c2 = makeCanvas();
    attachControl(cam2, asCanvas(c2), scene, { keyboard: true });
    expect(c2.listeners.get("keydown")!.length).toBe(1);
    expect(c2.tabIndex).toBe(0);
    fire(c2, "keydown", key("ArrowRight"));
    expect(cam2.inertialAlphaOffset).toBe(0);
    tick(scene, 1);
    // added 1/100 at the start of the frame, applied, then decayed by 0.9
    expect(cam2.alpha).toBeCloseTo(1.01, 12);
    tick(scene, 1);
    expect(cam2.inertialAlphaOffset).toBeCloseTo((0.01 * 0.9 + 0.01) * 0.9, 12);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: two held arrows are normalised; an existing tabindex attribute is left alone", () => {
    L.enableArcRotateKeyboardControls();
    const scene = H.makeScene();
    const cam = L.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c = H.makeCanvas();
    c.setAttribute("tabindex", "-1");
    L.attachControl(cam, H.asCanvas(c), scene, { keyboard: true });
    expect(c.tabIndex).toBe(-1);
    H.fire(c, "keydown", H.key("ArrowRight"));
    H.fire(c, "keydown", H.key("ArrowDown"));
    H.tick(scene, 1);
    expect(cam.alpha - 1).toBeCloseTo(1 / (100 * Math.SQRT2), 12);
    expect(Math.abs(cam.beta - 1)).toBeCloseTo(1 / (100 * Math.SQRT2), 12);
});

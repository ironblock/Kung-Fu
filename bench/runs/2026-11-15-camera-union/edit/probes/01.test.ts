import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, touches, key } from "./helpers";

it("01: without a scene, drags, right drags, wheel and keys only fill the inertial offsets", () => {
    enableArcRotateKeyboardControls();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), undefined, { keyboard: true });
    fire(c, "pointerdown", pointer({ clientX: 0, clientY: 0 }));
    fire(c, "pointermove", pointer({ clientX: 100, clientY: 50 }));
    fire(c, "pointerup", pointer());
    fire(c, "pointerdown", pointer({ button: 2, buttons: 2 }));
    fire(c, "pointermove", pointer({ button: 2, buttons: 2, clientX: 30, clientY: 30 }));
    fire(c, "pointerup", pointer({ button: 2 }));
    fire(c, "wheel", { deltaY: 100 });
    fire(c, "keydown", key("ArrowLeft"));
    expect([cam.alpha, cam.beta, cam.radius]).toEqual([1, 1, 10]);
    expect([cam.target.x, cam.target.y, cam.target.z]).toEqual([0, 0, 0]);
    expect(cam.inertialAlphaOffset).not.toBe(0);
    expect(cam.inertialBetaOffset).not.toBe(0);
    expect(cam.inertialRadiusOffset).not.toBe(0);
    expect(cam.inertialPanningX).not.toBe(0);
});

it("01b: a two-finger pinch writes radius at once even with no scene", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c));
    fire(c, "touchstart", touches([1, 0, 0], [2, 100, 0]));
    fire(c, "touchmove", touches([2, 200, 0]));
    expect(cam.radius).toBeCloseTo(5, 12);
    expect(cam.inertialRadiusOffset).toBe(0);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

it("01c (after check): the offsets are camera fields: another attachControl with a scene applies a scene-less drag", () => {
    const scene = H.makeScene();
    const cam = L.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c1 = H.makeCanvas();
    L.attachControl(cam, H.asCanvas(c1));
    H.fire(c1, "pointerdown", H.pointer());
    H.fire(c1, "pointermove", H.pointer({ clientX: 100 }));
    expect(cam.alpha).toBe(1);
    expect(cam.inertialAlphaOffset).not.toBe(0);
    L.attachControl(cam, H.asCanvas(H.makeCanvas()), scene);
    H.tick(scene);
    expect(cam.alpha).not.toBe(1);
});

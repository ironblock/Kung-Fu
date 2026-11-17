import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

enableArcRotateKeyboardControls();

function setup(opts: Parameters<typeof attachControl>[3] = { keyboard: true }) {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    cam.inertia = 0; // see one frame's input
    cam.panningInertia = 0;
    cam.angularSensibility = 1; // camera sensibilities are not used by keys
    cam.panningSensibility = 1;
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene, opts);
    return { scene, cam, c };
}

it("49a: ArrowUp lowers beta, ArrowRight raises alpha, by 1/100 per frame; a diagonal is normalised", () => {
    let { scene, cam, c } = setup();
    fire(c, "keydown", key("ArrowUp"));
    tick(scene);
    expect(cam.beta).toBeCloseTo(1 - 0.01, 12);
    ({ scene, cam, c } = setup());
    fire(c, "keydown", key("ArrowRight"));
    fire(c, "keydown", key("ArrowUp"));
    tick(scene);
    expect(cam.alpha).toBeCloseTo(0.01 / Math.SQRT2, 12);
    expect(cam.beta).toBeCloseTo(1 - 0.01 / Math.SQRT2, 12);
});

it("49b: with Ctrl the arrows pan by 1/50; with Alt Up adds 1/25 to inertialRadiusOffset (zooms in)", () => {
    let { scene, cam, c } = setup();
    fire(c, "keydown", key("ArrowRight", { ctrlKey: true }));
    cam.panningInertia = 1; // keep the offset the keys added
    tick(scene);
    const px = cam.inertialPanningX;
    expect(px).toBeCloseTo(1 / 50, 12);
    expect(cam.alpha).toBe(0);
    ({ scene, cam, c } = setup());
    fire(c, "keydown", key("ArrowUp", { altKey: true }));
    tick(scene);
    expect(cam.radius).toBeCloseTo(10 - 1 / 25, 12);
    expect(cam.beta).toBe(1);
});

it("49c: sensitivities come from the keyboard options; offsets build up while held, to about 10x the step at inertia 0.9", () => {
    let { scene, cam, c } = setup({ keyboard: { angularSensitivity: 10 } });
    fire(c, "keydown", key("ArrowRight"));
    tick(scene);
    expect(cam.alpha).toBeCloseTo(0.1, 12);
    ({ scene, cam, c } = setup());
    cam.inertia = 0.9;
    fire(c, "keydown", key("ArrowRight"));
    tick(scene, 200);
    const a = cam.alpha;
    tick(scene);
    expect(cam.alpha - a).toBeCloseTo(0.1, 6);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

it("49c (after check): pan needs the event's ctrlKey flag; a held ControlLeft key without it does not pan", () => {
    L.enableArcRotateKeyboardControls();
    const run = (flag: boolean, pressCtrl: boolean) => {
        const scene = H.makeScene();
        const cam = L.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const c = H.makeCanvas();
        L.attachControl(cam, H.asCanvas(c), scene, { keyboard: true });
        if (pressCtrl) H.fire(c, "keydown", H.key("ControlLeft", { ctrlKey: flag }));
        H.fire(c, "keydown", H.key("ArrowLeft", { ctrlKey: flag }));
        H.tick(scene, 3);
        return { alpha: cam.alpha, moved: cam.target.x !== 0 || cam.target.y !== 0 || cam.target.z !== 0 };
    };
    const flagged = run(true, false);
    expect(flagged.moved).toBe(true);
    expect(flagged.alpha).toBe(0);
    const held = run(false, true);
    expect(held.moved).toBe(false);
    expect(held.alpha).not.toBe(0);
});

import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

V2.it("49 (after check 2): per frame a held arrow adds 1/angularSensitivity to the offset; a plain diagonal 1/sqrt(2) of it to each", () => {
    L2.enableArcRotateKeyboardControls();
    const scene = H2.makeScene();
    const cam = L2.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    cam.inertia = 1; // keep what the keys add
    const c = H2.makeCanvas();
    L2.attachControl(cam, H2.asCanvas(c), scene, { keyboard: true });
    H2.fire(c, "keydown", H2.key("ArrowRight"));
    H2.tick(scene);
    V2.expect(cam.inertialAlphaOffset).toBeCloseTo(1 / 100, 12);
    H2.tick(scene);
    V2.expect(cam.inertialAlphaOffset).toBeCloseTo(2 / 100, 12);
    H2.fire(c, "keyup", H2.key("ArrowRight"));
    cam.inertialAlphaOffset = 0;
    H2.fire(c, "keydown", H2.key("ArrowUp"));
    H2.fire(c, "keydown", H2.key("ArrowLeft"));
    H2.tick(scene);
    V2.expect(cam.inertialAlphaOffset).toBeCloseTo(-Math.SQRT1_2 / 100, 12);
    V2.expect(cam.inertialBetaOffset).toBeCloseTo(-Math.SQRT1_2 / 100, 12);
});

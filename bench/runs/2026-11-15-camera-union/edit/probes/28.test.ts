import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, touches, makeScene, tick } from "./helpers";

it("28a: wheel offset is deltaY*radius/(wheelPrecision*1000); positive deltaY zooms out", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    cam.inertia = 0;
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene);
    fire(c, "wheel", { deltaY: 300 });
    expect(cam.inertialRadiusOffset).toBeCloseTo(-1, 12);
    tick(scene);
    expect(cam.radius).toBeCloseTo(11, 12);
    cam.radius = 100;
    fire(c, "wheel", { deltaY: -300 });
    expect(cam.inertialRadiusOffset).toBeCloseTo(10, 12);
});

it("28b: the frame step and the pinch stop at 0.01; a direct write does not", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 1, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene);
    fire(c, "wheel", { deltaY: -100000 });
    tick(scene);
    expect(cam.radius).toBe(0.01);
    cam.radius = 1;
    fire(c, "touchstart", touches([1, 0, 0], [2, 10, 0]));
    fire(c, "touchmove", touches([2, 100000, 0]));
    expect(cam.radius).toBe(0.01);
    cam.radius = 0;
    expect(cam.radius).toBe(0);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("28 (after check 3): an upperRadiusLimit below 0.01 wins over the floor; a direct write below 0.01 stays until a zoom frame", () => {
    const scene = H3.makeScene();
    const cam = L3.createArcRotateCamera(0, 1, 0.005, { x: 0, y: 0, z: 0 });
    L3.setCameraLimits(cam, { upperRadiusLimit: 0.005 });
    const c = H3.makeCanvas();
    L3.attachControl(cam, H3.asCanvas(c), scene);
    H3.fire(c, "wheel", { deltaY: -100 });
    H3.tick(scene, 1);
    V3.expect(cam.radius).toBeLessThan(0.01);
    const cam2 = L3.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    L3.attachControl(cam2, H3.asCanvas(H3.makeCanvas()), scene);
    cam2.radius = 0.001;
    cam2.inertialAlphaOffset = 0.1; // rotating frames do not floor it
    H3.tick(scene, 3);
    V3.expect(cam2.radius).toBe(0.001);
    cam2.inertialRadiusOffset = -0.0001;
    H3.tick(scene);
    V3.expect(cam2.radius).toBe(0.01);
});

import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, touches, makeScene } from "./helpers";

it("34: the pinch writes start radius * start distance / current distance at once, with no offset", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene);
    fire(c, "touchstart", touches([1, 0, 0]));
    fire(c, "touchstart", touches([2, 100, 0]));
    fire(c, "touchmove", touches([2, 50, 0]));
    expect(cam.radius).toBeCloseTo(20, 12);
    fire(c, "touchmove", touches([2, 400, 0]));
    expect(cam.radius).toBeCloseTo(2.5, 12);
    expect(cam.inertialRadiusOffset).toBe(0);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("34 (after check 3): with upperRadiusLimit 0.005 a pinch leaves radius at 0.005", () => {
    const cam = L3.createArcRotateCamera(0, 1, 0.005, { x: 0, y: 0, z: 0 });
    L3.setCameraLimits(cam, { upperRadiusLimit: 0.005 });
    const c = H3.makeCanvas();
    L3.attachControl(cam, H3.asCanvas(c), H3.makeScene());
    H3.fire(c, "touchstart", H3.touches([1, 0, 0], [2, 100, 0]));
    H3.fire(c, "touchmove", H3.touches([2, 1000, 0]));
    V3.expect(cam.radius).toBe(0.005);
});

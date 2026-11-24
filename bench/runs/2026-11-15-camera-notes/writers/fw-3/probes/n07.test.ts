import { expect, test } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

test("pan: right-drag of dx gives inertialPanningX = -dx/panningSensibility; each frame target moves offset*radius/1000", () => {
    const scene = makeScene();
    // alpha = -PI/2, beta = PI/2: eye on -Z looking +Z, camera right is +X
    const cam = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 20, { x: 0, y: 0, z: 0 });
    const canvas = makeCanvas();
    attachControl(cam, asCanvas(canvas), scene);
    fire(canvas, "pointerdown", pointer({ button: 2, clientX: 100, clientY: 100 }));
    fire(canvas, "pointermove", pointer({ button: 2, clientX: 150, clientY: 100 }));
    expect(cam.inertialPanningX).toBeCloseTo(-1, 12);
    tick(scene, 1);
    expect(cam.target.x).toBeCloseTo(-1 * 20 / 1000, 9);
    expect(cam.inertialPanningX).toBeCloseTo(-0.9, 12);
});

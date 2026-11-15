import { expect, test } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, makeScene, tick } from "./helpers";

test("wheel: offset -= deltaY*radius/(wheelPrecision*1000); positive deltaY zooms out; radius floored at 0.01", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const canvas = makeCanvas();
    attachControl(cam, asCanvas(canvas), scene);
    fire(canvas, "wheel", { deltaY: 100 });
    expect(cam.inertialRadiusOffset).toBeCloseTo(-(100 * 10) / 3000, 12);
    tick(scene, 1);
    expect(cam.radius).toBeCloseTo(10 + 1000 / 3000, 12);
    cam.inertialRadiusOffset = 0;
    cam.wheelPrecision = 0.001;
    fire(canvas, "wheel", { deltaY: -1000 });
    tick(scene, 1);
    expect(cam.radius).toBe(0.01);
});

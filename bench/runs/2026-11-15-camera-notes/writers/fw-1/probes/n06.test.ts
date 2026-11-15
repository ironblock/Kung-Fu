import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, makeScene, tick } from "./helpers";

it("n06: wheel offset = -deltaY*radius/(wheelPrecision*1000); positive deltaY zooms out", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    cam.inertia = 0;
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene);
    fire(c, "wheel", { deltaY: 100 });
    expect(cam.inertialRadiusOffset).toBeCloseTo((-100 * 10) / 3000, 10);
    tick(scene);
    expect(cam.radius).toBeCloseTo(10 + 1 / 3, 10);
    cam.radius = 20;
    fire(c, "wheel", { deltaY: 100 });
    tick(scene);
    expect(cam.radius).toBeCloseTo(20 + 2 / 3, 10);
});

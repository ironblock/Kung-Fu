import { it, expect } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

it("n21: the controls clamp pitch to +-(PI/2 - 0.01); dragging down looks down", () => {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    cam.inertia = 0;
    const c = makeCanvas();
    attachFreeControl(cam, asCanvas(c), scene);
    fire(c, "pointerdown", pointer({ clientY: 0 }));
    fire(c, "pointermove", pointer({ clientY: 100 }));
    tick(scene);
    expect(cam._pitch).toBeCloseTo(-100 / 2000, 10);
    fire(c, "pointermove", pointer({ clientY: 100000 }));
    tick(scene);
    expect(cam._pitch).toBeCloseTo(-(Math.PI / 2 - 0.01), 10);
});

it("n21b: at the default inertia 0.9 a 100 px downward drag lowers _pitch by 0.05 on the first frame and about 0.5 in all", () => {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    expect(cam.inertia).toBe(0.9);
    const c = makeCanvas();
    attachFreeControl(cam, asCanvas(c), scene);
    fire(c, "pointerdown", pointer({ clientY: 0 }));
    fire(c, "pointermove", pointer({ clientY: 100 }));
    fire(c, "pointerup", pointer());
    tick(scene);
    expect(cam._pitch).toBeCloseTo(-0.05, 10);
    tick(scene, 200);
    expect(cam._pitch).toBeLessThan(-0.45);
    expect(cam._pitch).toBeGreaterThan(-0.5);
});

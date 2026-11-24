import { expect, test } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

test("free camera: turning stops once the decayed turn falls below speed*0.001, so a high speed removes look coasting", () => {
    const turnAfter = (speed: number): [number, number] => {
        const scene = makeScene();
        const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        cam.speed = speed;
        const canvas = makeCanvas();
        attachFreeControl(cam, asCanvas(canvas), scene);
        fire(canvas, "pointerdown", pointer({ clientX: 0 }));
        fire(canvas, "pointermove", pointer({ clientX: 200 }));
        tick(scene, 1);
        const y1 = cam._yaw;
        tick(scene, 1);
        return [y1, cam._yaw];
    };
    const [a1, a2] = turnAfter(2);
    expect(a1).toBeCloseTo(0.1, 12);
    expect(a2).toBeCloseTo(0.19, 12);
    const [b1, b2] = turnAfter(100);
    expect(b1).toBeCloseTo(0.1, 12);
    expect(b2).toBe(b1);
});

import { expect, test } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

test("free camera: look direction lives in _yaw/_pitch set at creation; a target written later is replaced on the next control move", () => {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const canvas = makeCanvas();
    attachFreeControl(cam, asCanvas(canvas), scene);
    cam.target.set(10, 0, 0); // look along +X
    tick(scene, 1);
    expect(cam.target.x).toBe(10); // no input: kept
    fire(canvas, "pointerdown", pointer({ clientX: 0 }));
    fire(canvas, "pointermove", pointer({ clientX: 1 }));
    tick(scene, 1);
    // target rebuilt from the old yaw (towards +Z), at distance 1
    expect(cam.target.z).toBeCloseTo(1, 3);
    expect(Math.abs(cam.target.x)).toBeLessThan(0.01);
});

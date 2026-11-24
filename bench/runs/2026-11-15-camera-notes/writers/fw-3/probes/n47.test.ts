import { expect, test } from "vitest";
import { createFreeCamera, attachFreeControl, getViewMatrix } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

test("free camera: _yaw = atan2(dx, dz) of the look direction; writing _yaw alone does not turn the view until a control move rebuilds target", () => {
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 });
    expect(cam._yaw).toBeCloseTo(Math.PI / 2, 12);
    expect(cam._pitch).toBe(0);
    const before = Array.from(getViewMatrix(cam));
    cam._yaw = 0;
    expect(Array.from(getViewMatrix(cam))).toEqual(before);
    const scene = makeScene();
    const canvas = makeCanvas();
    attachFreeControl(cam, asCanvas(canvas), scene);
    fire(canvas, "keydown", key("KeyW"));
    tick(scene, 1);
    expect(cam.target.z - cam.position.z).toBeCloseTo(1, 12);
});

import { expect, test } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

test("free camera: forward moves along the look direction including pitch; Space moves along world +Y", () => {
    const scene = makeScene();
    // looking up at 45 degrees
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 10, z: 10 });
    const canvas = makeCanvas();
    attachFreeControl(cam, asCanvas(canvas), scene);
    fire(canvas, "keydown", key("KeyW"));
    tick(scene, 1);
    expect(cam.position.y).toBeCloseTo(cam.position.z, 12);
    expect(cam.position.y).toBeGreaterThan(0);
    fire(canvas, "keyup", key("KeyW"));
    tick(scene, 300);
    const { x, z } = cam.position;
    fire(canvas, "keydown", key("Space"));
    tick(scene, 3);
    expect(cam.position.x).toBe(x);
    expect(cam.position.z).toBe(z);
});

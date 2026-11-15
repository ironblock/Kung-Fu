import { it, expect } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

it("n22: a frame of held key moves speed*deltaMs/sqrt(100000)", () => {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    cam.inertia = 0;
    const c = makeCanvas();
    attachFreeControl(cam, asCanvas(c), scene);
    fire(c, "keydown", key("KeyW"));
    tick(scene, 1, 16);
    expect(cam.position.z).toBeCloseTo((2 * 16) / Math.sqrt(100000), 6);
    tick(scene, 1, 32);
    expect(cam.position.z).toBeCloseTo((2 * 16 + 2 * 32) / Math.sqrt(100000), 6);
});

it("n22b: deltaMs is floored at 1, so a 0 ms frame still moves speed/sqrt(100000)", () => {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    cam.inertia = 0;
    const c = makeCanvas();
    attachFreeControl(cam, asCanvas(c), scene);
    fire(c, "keydown", key("KeyW"));
    tick(scene, 1, 0);
    expect(cam.position.z).toBeCloseTo(2 / Math.sqrt(100000), 9);
});

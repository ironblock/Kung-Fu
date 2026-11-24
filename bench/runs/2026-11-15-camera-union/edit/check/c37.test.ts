import { it, expect } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

it("c37: _pitch is clamped only on frames with a turn: a camera made looking straight up keeps pitch PI/2 through key moves", () => {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 10, z: 0 });
    expect(cam._pitch).toBeCloseTo(Math.PI / 2, 12);
    const c = makeCanvas();
    attachFreeControl(cam, asCanvas(c), scene);
    fire(c, "keydown", key("KeyW"));
    tick(scene, 3);
    expect(cam._pitch).toBeCloseTo(Math.PI / 2, 12);
    // target straight above: identity rotation (n51)
    const w = cam.worldMatrix;
    expect([w[0], w[5], w[10]]).toEqual([1, 1, 1]);
    cam._pitch = 3;
    tick(scene);
    expect(cam._pitch).toBe(3);
});

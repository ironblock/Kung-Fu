import { it, expect } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

it("n19: controls rebuild target from the yaw/pitch taken at creation; a later target write is lost on the first input", () => {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const c = makeCanvas();
    attachFreeControl(cam, asCanvas(c), scene);
    cam.target.set(10, 0, 0); // look along +X
    tick(scene);
    expect(cam.target.x).toBe(10);
    fire(c, "keydown", key("KeyD"));
    tick(scene);
    fire(c, "keyup", key("KeyD"));
    // target is again 1 unit ahead along +Z (the creation direction), not +X
    expect(cam.target.z - cam.position.z).toBeCloseTo(1, 6);
    expect(cam.target.x - cam.position.x).toBeCloseTo(0, 6);
});

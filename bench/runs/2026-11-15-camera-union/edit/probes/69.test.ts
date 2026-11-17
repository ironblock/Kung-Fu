import { it, expect } from "vitest";
import { createFreeCamera, createBankedFreeCamera } from "@babylonjs/lite";

it("69: moving position alone turns the camera to keep the target; moving both translates it", () => {
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    cam.position.x = 10;
    // forward axis now points from (10,0,0) to (0,0,10)
    expect(cam.worldMatrix[8]).toBeCloseTo(-Math.SQRT1_2, 6);
    expect(cam.worldMatrix[10]).toBeCloseTo(Math.SQRT1_2, 6);
    cam.position.set(0, 0, 0);
    cam.position.x += 5;
    cam.target.x += 5;
    expect(cam.worldMatrix[8]).toBeCloseTo(0, 12);
    expect(cam.worldMatrix[10]).toBeCloseTo(1, 12);
    expect(cam.worldMatrix[12]).toBe(5);
});

it("69b: a banked camera's view also depends on its upVector", () => {
    const cam = createBankedFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const w = Array.from(cam.worldMatrix);
    cam.upVector.set(1, 0, 0);
    expect(Array.from(cam.worldMatrix)).not.toEqual(w);
});

import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

V2.it("69 (after check 2): hand writes to position and target leave _yaw/_pitch alone; the next key move re-aims from them", () => {
    const scene = H2.makeScene();
    const cam = L2.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    const c = H2.makeCanvas();
    L2.attachFreeControl(cam, H2.asCanvas(c), scene);
    cam.position.x = 10;
    cam.target.set(10, 0, -5); // aim along -Z by hand
    H2.tick(scene);
    V2.expect(cam._yaw).toBe(0);
    V2.expect([cam.target.x, cam.target.z]).toEqual([10, -5]); // no input: aim kept
    H2.fire(c, "keydown", H2.key("KeyW"));
    H2.tick(scene);
    V2.expect(cam.target.z - cam.position.z).toBeCloseTo(1, 12); // back to _yaw 0: +Z
    V2.expect(cam.position.z).toBeGreaterThan(0);
});

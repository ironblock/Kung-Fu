import { expect, test } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

test("free camera: a held key adds speed*deltaMs/sqrt(100000) per frame to a velocity that decays by inertia", () => {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const canvas = makeCanvas();
    attachFreeControl(cam, asCanvas(canvas), scene);
    fire(canvas, "keydown", key("KeyW"));
    const step = (2 * 16) / Math.sqrt(100000);
    tick(scene, 1, 16);
    expect(cam.position.z).toBeCloseTo(step, 12);
    tick(scene, 1, 16);
    expect(cam.position.z).toBeCloseTo(step + step * 0.9 + step, 12);
    // after the key is released the camera keeps coasting
    fire(canvas, "keyup", key("KeyW"));
    const z = cam.position.z;
    tick(scene, 1, 16);
    expect(cam.position.z).toBeGreaterThan(z);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: deltaMs is floored at 1", () => {
    const scene = H.makeScene();
    const cam = L.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const canvas = H.makeCanvas();
    L.attachFreeControl(cam, H.asCanvas(canvas), scene);
    H.fire(canvas, "keydown", H.key("KeyW"));
    H.tick(scene, 1, 0);
    expect(cam.position.z).toBeCloseTo(cam.speed / Math.sqrt(100000), 12);
});

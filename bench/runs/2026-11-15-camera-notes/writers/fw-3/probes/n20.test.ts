import { expect, test } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

test("free camera: drag with any of buttons 0/1/2 turns; pitch clamped to +-(PI/2 - 0.01); right drag turns right, down drag looks down", () => {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const canvas = makeCanvas();
    attachFreeControl(cam, asCanvas(canvas), scene);
    fire(canvas, "pointerdown", pointer({ button: 1, clientX: 0, clientY: 0 }));
    fire(canvas, "pointermove", pointer({ clientX: 200, clientY: 0 }));
    tick(scene, 1);
    expect(cam._yaw).toBeCloseTo(0.1, 12);
    expect(cam.target.x).toBeGreaterThan(0);
    fire(canvas, "pointerup", pointer());
    tick(scene, 100);
    const yawBefore = cam._yaw;
    fire(canvas, "pointerdown", pointer({ button: 0, clientX: 0, clientY: 0 }));
    fire(canvas, "pointermove", pointer({ clientX: -200, clientY: 0 }));
    tick(scene, 1);
    expect(cam._yaw).toBeCloseTo(yawBefore - 0.1, 12);
    fire(canvas, "pointerup", pointer());
    tick(scene, 100);
    fire(canvas, "pointerdown", pointer({ button: 2, clientX: 0, clientY: 0 }));
    fire(canvas, "pointermove", pointer({ clientX: 0, clientY: 20000 }));
    tick(scene, 1);
    expect(cam._pitch).toBeCloseTo(-(Math.PI / 2 - 0.01), 12);
    expect(cam.target.y).toBeLessThan(cam.position.y);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: the turn coasts: dx/angularSensitivity on the first frame, then times inertia each frame", () => {
    const scene = H.makeScene();
    const cam = L.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const canvas = H.makeCanvas();
    L.attachFreeControl(cam, H.asCanvas(canvas), scene);
    H.fire(canvas, "pointerdown", H.pointer({ button: 0, clientX: 0, clientY: 0 }));
    H.fire(canvas, "pointermove", H.pointer({ clientX: 200, clientY: 0 }));
    H.tick(scene, 1);
    expect(cam._yaw).toBeCloseTo(0.1, 12);
    H.tick(scene, 1);
    expect(cam._yaw).toBeCloseTo(0.1 + 0.1 * cam.inertia, 12);
    H.fire(canvas, "pointerup", H.pointer());
    H.tick(scene, 200);
    expect(cam._yaw).toBeGreaterThan(0.9);
});

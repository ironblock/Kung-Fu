import { expect, test } from "vitest";
import { createFreeCamera, attachFreeControl, attachConfigurableFreeControl, createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, pointer } from "./helpers";

test("free controls without a scene never move the camera", () => {
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const canvas = makeCanvas();
    attachFreeControl(cam, asCanvas(canvas));
    fire(canvas, "keydown", key("KeyW"));
    fire(canvas, "pointerdown", pointer());
    fire(canvas, "pointermove", pointer({ clientX: 100 }));
    expect([cam.position.x, cam.position.y, cam.position.z, cam.target.z]).toEqual([0, 0, 0, 10]);
    const cam2 = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    const c2 = makeCanvas();
    attachConfigurableFreeControl(cam2, asCanvas(c2));
    fire(c2, "keydown", key("KeyW"));
    expect(cam2.position.z).toBe(0);
});

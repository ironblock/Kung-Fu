import { expect, test } from "vitest";
import { createArcRotateCamera, interpolateArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

test("interpolateArcRotateCamera rejects when anything else moves the pose between frames, a second interpolation included", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const p = interpolateArcRotateCamera(cam, scene, { radius: 20 });
    tick(scene, 2);
    cam.alpha = 0.5;
    tick(scene, 1);
    await expect(p).rejects.toThrow(/interrupted/);

    const a = interpolateArcRotateCamera(cam, scene, { radius: 5 });
    tick(scene, 1);
    const b = interpolateArcRotateCamera(cam, scene, { radius: 30 });
    tick(scene, 2);
    await expect(a).rejects.toThrow(/interrupted/);
    b.catch(() => {});

    // leftover inertia is zeroed on the first frame, but a drag during the transition cancels it
    const scene2 = makeScene();
    const cam2 = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const canvas = makeCanvas();
    attachControl(cam2, asCanvas(canvas), scene2);
    cam2.inertialAlphaOffset = 0.3;
    const c = interpolateArcRotateCamera(cam2, scene2, { radius: 20 });
    tick(scene2, 1);
    expect(cam2.inertialAlphaOffset).toBe(0);
    fire(canvas, "pointerdown", pointer({ clientX: 0 }));
    fire(canvas, "pointermove", pointer({ clientX: 50 }));
    tick(scene2, 2);
    await expect(c).rejects.toThrow(/interrupted/);
});

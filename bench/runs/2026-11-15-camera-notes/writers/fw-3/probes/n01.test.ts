import { expect, test } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

test("attachControl: input only fills inertial offsets; camera moves on frames, never without a scene", () => {
    const noScene = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c1 = makeCanvas();
    attachControl(noScene, asCanvas(c1));
    fire(c1, "pointerdown", pointer({ clientX: 100, clientY: 100 }));
    fire(c1, "pointermove", pointer({ clientX: 150, clientY: 100 }));
    fire(c1, "wheel", { deltaY: 100 });
    expect(noScene.alpha).toBe(1);
    expect(noScene.radius).toBe(10);
    expect(noScene.inertialAlphaOffset).toBeCloseTo(-0.05);
    expect(noScene.inertialRadiusOffset).not.toBe(0);

    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c2 = makeCanvas();
    attachControl(cam, asCanvas(c2), scene);
    fire(c2, "pointerdown", pointer({ clientX: 100, clientY: 100 }));
    fire(c2, "pointermove", pointer({ clientX: 150, clientY: 100 }));
    expect(cam.alpha).toBe(1);
    tick(scene, 1);
    expect(cam.alpha).toBeCloseTo(0.95);
});

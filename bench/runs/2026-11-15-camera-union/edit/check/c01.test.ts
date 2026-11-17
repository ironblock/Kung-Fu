import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

it("c01: a scene-less attachControl's drag moves the camera if another attachControl on it has a scene", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c1 = makeCanvas();
    attachControl(cam, asCanvas(c1));
    attachControl(cam, asCanvas(makeCanvas()), scene);
    fire(c1, "pointerdown", pointer());
    fire(c1, "pointermove", pointer({ clientX: 100 }));
    tick(scene);
    expect(cam.alpha).not.toBe(1);
});

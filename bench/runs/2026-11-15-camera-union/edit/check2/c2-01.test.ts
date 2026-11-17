import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

it("c2-01: keys on a scene-less attachControl add nothing to the offsets, even when another attachment has a scene", () => {
    enableArcRotateKeyboardControls();
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c1 = makeCanvas();
    attachControl(cam, asCanvas(c1), undefined, { keyboard: true });
    fire(c1, "keydown", key("ArrowLeft"));
    expect(cam.inertialAlphaOffset).toBe(0);
    attachControl(cam, asCanvas(makeCanvas()), scene);
    tick(scene, 5);
    expect(cam.inertialAlphaOffset).toBe(0);
    expect(cam.alpha).toBe(1);
});

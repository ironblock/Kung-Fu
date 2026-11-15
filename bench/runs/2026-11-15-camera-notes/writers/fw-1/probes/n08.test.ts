import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

it("n08: middle button does nothing; touch always rotates whatever pointerMappings say", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene, { pointerMappings: { primaryButton: "pan" } });
    fire(c, "pointerdown", pointer({ button: 1, buttons: 4 }));
    fire(c, "pointermove", pointer({ clientX: 100, clientY: 100 }));
    fire(c, "pointerup", pointer({ clientX: 100, clientY: 100 }));
    expect(cam.inertialAlphaOffset).toBe(0);
    expect(cam.inertialPanningX).toBe(0);
    fire(c, "pointerdown", pointer({ pointerType: "touch", clientX: 0, clientY: 0 }));
    fire(c, "pointermove", pointer({ pointerType: "touch", clientX: 100, clientY: 0 }));
    expect(cam.inertialAlphaOffset).not.toBe(0);
    expect(cam.inertialPanningX).toBe(0);
    fire(c, "pointerup", pointer({ pointerType: "touch" }));
    // a mouse primary drag with the mapping pans
    cam.inertialAlphaOffset = 0;
    fire(c, "pointerdown", pointer({ clientX: 0, clientY: 0 }));
    fire(c, "pointermove", pointer({ clientX: 100, clientY: 0 }));
    expect(cam.inertialAlphaOffset).toBe(0);
    expect(cam.inertialPanningX).not.toBe(0);
    tick(scene);
});

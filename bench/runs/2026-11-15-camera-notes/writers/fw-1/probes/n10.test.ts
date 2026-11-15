import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

function panDistance(radius: number): number {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, Math.PI / 2, radius, { x: 0, y: 0, z: 0 });
    cam.panningInertia = 0;
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene);
    fire(c, "pointerdown", pointer({ button: 2, buttons: 2, clientX: 0 }));
    fire(c, "pointermove", pointer({ button: 2, buttons: 2, clientX: 50 }));
    fire(c, "pointerup", pointer({ button: 2 }));
    expect(cam.inertialPanningX).toBe(-1);
    tick(scene);
    return Math.hypot(cam.target.x, cam.target.y, cam.target.z);
}

it("n10: a pan moves the target by (pixels/panningSensibility)*radius/1000", () => {
    expect(panDistance(10)).toBeCloseTo(0.01, 10);
    expect(panDistance(100)).toBeCloseTo(0.1, 10);
});

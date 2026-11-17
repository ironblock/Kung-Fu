import { it, expect } from "vitest";
import * as L from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

function panAt(beta: number) {
    const scene = makeScene();
    const cam = L.createArcRotateCamera(0, beta, 10, { x: 0, y: 0, z: 0 });
    L.attachControl(cam, asCanvas(makeCanvas()), scene);
    cam.inertialPanningX = 1;
    cam.inertialPanningY = 1;
    tick(scene, 1);
    return { x: cam.target.x, y: cam.target.y, z: cam.target.z };
}

it("n25: at beta = 2*PI (sin slightly < 0) the pan goes along world +X and +Y, not a flipped beta-0 move", () => {
    const at0 = panAt(0);
    const at2pi = panAt(2 * Math.PI);
    console.log(at0, at2pi, Math.sin(2 * Math.PI));
    expect(Math.sin(2 * Math.PI)).toBeLessThan(0);
    // at beta 0, X pan goes along (0,0,1) at alpha 0
    expect(at0.z).toBeCloseTo(0.01, 6);
    // note predicts flipped: z = -0.01. Library: +X / +Y
    expect(at2pi.x).toBeCloseTo(0.01, 6);
    expect(at2pi.y).toBeCloseTo(0.01, 6);
    expect(at2pi.z).toBeCloseTo(0, 6);
});

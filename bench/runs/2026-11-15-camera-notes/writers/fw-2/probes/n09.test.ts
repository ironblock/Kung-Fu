import { describe, it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

describe("n09 panning: offset per pixel is 1/panningSensibility, target moves offset * radius / 1000 per frame", () => {
    it("a 50-pixel right-drag at radius 10 moves the target 0.01 along the camera's right on the first frame", () => {
        const scene = makeScene();
        // alpha = -PI/2, beta = PI/2: eye on -Z looking at +Z, right vector is +X
        const cam = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas), scene);
        fire(canvas, "pointerdown", pointer({ button: 2, buttons: 2 }));
        fire(canvas, "pointermove", pointer({ button: 2, buttons: 2, clientX: 50 }));
        expect(cam.inertialPanningX).toBeCloseTo(-1, 10);
        tick(scene);
        const moved = Math.hypot(cam.target.x, cam.target.y, cam.target.z);
        expect(moved).toBeCloseTo((1 * 10) / 1000, 8);
        expect(Math.abs(cam.target.x)).toBeCloseTo(0.01, 8);
    });
    it("the same drag at radius 100 moves the target ten times as far", () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(-Math.PI / 2, Math.PI / 2, 100, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas), scene);
        fire(canvas, "pointerdown", pointer({ button: 2, buttons: 2 }));
        fire(canvas, "pointermove", pointer({ button: 2, buttons: 2, clientX: 50 }));
        tick(scene);
        expect(Math.hypot(cam.target.x, cam.target.y, cam.target.z)).toBeCloseTo(0.1, 8);
    });
});

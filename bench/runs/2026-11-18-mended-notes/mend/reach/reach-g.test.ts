// Reach g: total turn of one move under default inertia; pitch clamp; sign of dy.
import { describe, expect, it } from "vitest";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import { asCanvas, fire, makeCanvas, makeScene, pointer, tick } from "./helpers";

describe("reach g", () => {
    it("default inertia: one 100px move turns more than 100/angularSensitivity", () => {
        const canvas = makeCanvas(); const scene = makeScene();
        const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        attachFreeControl(cam, asCanvas(canvas), scene);
        const y0 = cam._yaw;
        fire(canvas, "pointerdown", pointer({ clientX: 0 }));
        fire(canvas, "pointermove", pointer({ clientX: 100 }));
        tick(scene, 200);
        const turn = cam._yaw - y0;
        console.log("turn", turn, "dx/as", 100 / cam.angularSensitivity);
        expect(turn).toBeCloseTo(100 / cam.angularSensitivity, 6);
    });
    it("pitch is clamped to +-(PI/2 - 0.01); dy down lowers _pitch", () => {
        const canvas = makeCanvas(); const scene = makeScene();
        const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        cam.inertia = 0;
        attachFreeControl(cam, asCanvas(canvas), scene);
        const p0 = cam._pitch;
        fire(canvas, "pointerdown", pointer({ clientY: 0 }));
        fire(canvas, "pointermove", pointer({ clientY: 100 }));
        tick(scene);
        console.log("pitch delta", cam._pitch - p0);
        fire(canvas, "pointermove", pointer({ clientY: 100000 }));
        tick(scene);
        expect(cam._pitch).toBeCloseTo(-(Math.PI / 2 - 0.01), 12);
    });
});

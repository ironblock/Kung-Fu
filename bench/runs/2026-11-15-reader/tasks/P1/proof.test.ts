// Shows on the library itself that the expected answer of P1 is so. Not a check of a subject's answer.
import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import { asCanvas, fire, makeCanvas, pointer, touches } from "./helpers";

describe("P1: controls attached with no scene", () => {
    it("a drag and a wheel turn change nothing, and a pinch changes the radius", () => {
        const camera = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(camera, asCanvas(canvas));

        fire(canvas, "pointerdown", pointer({ clientX: 100, clientY: 100 }));
        fire(canvas, "pointermove", pointer({ clientX: 220, clientY: 160 }));
        fire(canvas, "pointerup", pointer({ clientX: 220, clientY: 160 }));
        expect([camera.alpha, camera.beta, camera.radius]).toEqual([1, 1, 10]);
        expect(camera.inertialAlphaOffset).not.toBe(0);

        fire(canvas, "wheel", { deltaY: 120 });
        expect([camera.alpha, camera.beta, camera.radius]).toEqual([1, 1, 10]);
        expect(camera.inertialRadiusOffset).not.toBe(0);

        fire(canvas, "touchstart", touches([1, 100, 100], [2, 200, 100]));
        fire(canvas, "touchmove", touches([1, 50, 100], [2, 250, 100]));
        expect([camera.alpha, camera.beta]).toEqual([1, 1]);
        expect(camera.radius).toBe(5);
    });
});

import { describe, it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

function setup(options?: Parameters<typeof attachControl>[3]) {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const canvas = makeCanvas();
    attachControl(cam, asCanvas(canvas), scene, options);
    return { scene, cam, canvas };
}

describe("n08 only button 0 rotates and button 2 pans; middle button and Ctrl do nothing special", () => {
    it("a middle-button drag moves nothing", () => {
        const { scene, cam, canvas } = setup();
        fire(canvas, "pointerdown", pointer({ button: 1, buttons: 4 }));
        fire(canvas, "pointermove", pointer({ button: 1, buttons: 4, clientX: 80, clientY: 40 }));
        tick(scene, 5);
        expect(cam.alpha).toBe(1);
        expect(cam.beta).toBe(1);
        expect(cam.target.x).toBe(0);
    });
    it("Ctrl + primary-button drag rotates and does not pan", () => {
        const { scene, cam, canvas } = setup();
        fire(canvas, "pointerdown", pointer({ ctrlKey: true }));
        fire(canvas, "pointermove", pointer({ ctrlKey: true, clientX: 80, clientY: 0 }));
        tick(scene);
        expect(cam.alpha).not.toBe(1);
        expect(cam.target.x).toBe(0);
        expect(cam.target.z).toBe(0);
    });
    it("a touch pointer with button 0 rotates even when primaryButton is mapped to pan", () => {
        const { scene, cam, canvas } = setup({ pointerMappings: { primaryButton: "pan" } });
        fire(canvas, "pointerdown", pointer({ pointerType: "touch" }));
        fire(canvas, "pointermove", pointer({ pointerType: "touch", clientX: 80 }));
        tick(scene);
        expect(cam.alpha).not.toBe(1);
        expect(cam.target.x).toBe(0);
    });
    it("a mouse with primaryButton mapped to pan pans", () => {
        const { scene, cam, canvas } = setup({ pointerMappings: { primaryButton: "pan" } });
        fire(canvas, "pointerdown", pointer());
        fire(canvas, "pointermove", pointer({ clientX: 80 }));
        tick(scene);
        expect(cam.alpha).toBe(1);
        expect(Math.hypot(cam.target.x, cam.target.z)).toBeGreaterThan(0);
    });
});

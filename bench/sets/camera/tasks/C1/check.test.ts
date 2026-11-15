import { describe, it, expect } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import { asCanvas, fire, listenerCount, makeCanvas, makeScene, pointer, tick } from "./helpers";
import { attachSteadyZoom } from "../src/steady-zoom";

function camera(radius = 10) {
    return createArcRotateCamera(0.5, 1.1, radius, { x: 0, y: 0, z: 0 });
}

/** Distance one notch moves the camera, once its glide has settled. Positive = closer. */
function notch(cam: ReturnType<typeof camera>, canvas: ReturnType<typeof makeCanvas>, scene: ReturnType<typeof makeScene>, deltaY: number): number {
    const before = cam.radius;
    fire(canvas, "wheel", { deltaY, deltaMode: 0 });
    tick(scene, 300);
    return before - cam.radius;
}

/** What one notch does with the library's default controls at the given distance. */
function defaultNotch(radius: number, deltaY: number): number {
    const cam = camera(radius);
    const canvas = makeCanvas();
    const scene = makeScene();
    const detach = attachControl(cam, asCanvas(canvas), scene);
    const d = notch(cam, canvas, scene, deltaY);
    detach();
    return d;
}

describe("attachSteadyZoom", () => {
    it("zooms by the same distance per notch, near or far", () => {
        const expected = defaultNotch(10, -100);
        expect(expected).toBeGreaterThan(0);

        const cam = camera(10);
        const canvas = makeCanvas();
        const scene = makeScene();
        attachSteadyZoom(cam, asCanvas(canvas), scene);

        expect(notch(cam, canvas, scene, -100)).toBeCloseTo(expected, 4);

        cam.radius = 40;
        expect(notch(cam, canvas, scene, -100)).toBeCloseTo(expected, 4);

        cam.radius = 6;
        expect(notch(cam, canvas, scene, -100)).toBeCloseTo(expected, 4);

        cam.radius = 25;
        expect(notch(cam, canvas, scene, 100)).toBeCloseTo(-expected, 4);
    });

    it("keeps the usual drag to orbit", () => {
        const cam = camera(10);
        const canvas = makeCanvas();
        const scene = makeScene();
        attachSteadyZoom(cam, asCanvas(canvas), scene);
        fire(canvas, "pointerdown", pointer({ clientX: 100, clientY: 100 }));
        fire(canvas, "pointermove", pointer({ clientX: 180, clientY: 100 }));
        fire(canvas, "pointerup", pointer({ clientX: 180, clientY: 100 }));
        tick(scene, 100);
        expect(cam.alpha).not.toBeCloseTo(0.5, 3);
    });

    it("removes everything it added", () => {
        const cam = camera(10);
        const canvas = makeCanvas();
        const scene = makeScene();
        const before = scene._beforeRender.length;
        const detach = attachSteadyZoom(cam, asCanvas(canvas), scene);
        detach();
        expect(listenerCount(canvas)).toBe(0);
        expect(scene._beforeRender.length).toBe(before);
    });
});

import { describe, expect, it } from "vitest";
import { asCanvas, fire, key, makeCanvas, makeScene, pointer, tick } from "./helpers";
import { createOrbitCamera } from "../src/orbit-camera";

describe("createOrbitCamera", () => {
    it("returns an orbit camera 10 units from the origin", () => {
        const camera = createOrbitCamera(asCanvas(makeCanvas()), makeScene());
        expect(camera.radius).toBeCloseTo(10, 6);
        expect(camera.target.x).toBeCloseTo(0, 6);
        expect(camera.target.y).toBeCloseTo(0, 6);
        expect(camera.target.z).toBeCloseTo(0, 6);
    });

    it("a mouse drag turns the camera", () => {
        const canvas = makeCanvas();
        const scene = makeScene();
        const camera = createOrbitCamera(asCanvas(canvas), scene);
        const before = camera.alpha;
        fire(canvas, "pointerdown", pointer({ clientX: 100, clientY: 100 }));
        fire(canvas, "pointermove", pointer({ clientX: 220, clientY: 100 }));
        fire(canvas, "pointerup", pointer({ clientX: 220, clientY: 100 }));
        tick(scene, 3);
        expect(camera.alpha).not.toBe(before);
    });

    it("the left arrow key turns the camera", () => {
        const canvas = makeCanvas();
        const scene = makeScene();
        const camera = createOrbitCamera(asCanvas(canvas), scene);
        const before = camera.alpha;
        fire(canvas, "keydown", key("ArrowLeft"));
        tick(scene, 3);
        fire(canvas, "keyup", key("ArrowLeft"));
        expect(camera.alpha).not.toBe(before);
    });
});

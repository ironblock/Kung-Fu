import { describe, it, expect } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, pointer, makeScene, tick } from "./helpers";

describe("n22 attachFreeControl re-aims from its own yaw/pitch, so a hand-set target is lost on the next move", () => {
    it("after target is set by hand, one key frame puts target back along the creation direction", () => {
        const scene = makeScene();
        const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const canvas = makeCanvas();
        attachFreeControl(cam, asCanvas(canvas), scene);
        cam.target.set(10, 0, 0); // look toward +X
        fire(canvas, "keydown", key("KeyW"));
        tick(scene);
        // moved along +Z (the old yaw), and target is one unit ahead on +Z
        expect(cam.position.z).toBeGreaterThan(0);
        expect(cam.position.x).toBeCloseTo(0, 10);
        expect(cam.target.x).toBeCloseTo(0, 10);
        expect(cam.target.z - cam.position.z).toBeCloseTo(1, 10);
    });
    it("a mouse drag also re-aims from the creation direction", () => {
        const scene = makeScene();
        const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const canvas = makeCanvas();
        attachFreeControl(cam, asCanvas(canvas), scene);
        cam.target.set(10, 0, 0);
        fire(canvas, "pointerdown", pointer());
        fire(canvas, "pointermove", pointer({ clientX: 1 }));
        tick(scene);
        expect(cam.target.z).toBeGreaterThan(0.99);
    });
});

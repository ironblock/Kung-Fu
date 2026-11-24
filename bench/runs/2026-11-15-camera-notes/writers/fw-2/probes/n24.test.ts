import { describe, it, expect } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

describe("n24 attachFreeControl clamps pitch to +-(PI/2 - 0.01); dragging down looks down", () => {
    it("a long downward drag stops 0.01 rad short of straight down", () => {
        const scene = makeScene();
        const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const canvas = makeCanvas();
        attachFreeControl(cam, asCanvas(canvas), scene);
        fire(canvas, "pointerdown", pointer());
        fire(canvas, "pointermove", pointer({ clientY: 20000 }));
        tick(scene);
        expect(cam._pitch).toBeCloseTo(-(Math.PI / 2 - 0.01), 12);
        expect(cam.target.y).toBeLessThan(0);
    });
});

import { describe, it, expect } from "vitest";
import { createFreeCamera, attachFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

function turnAfterTwoFrames(speed: number, dx = 200): number {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    cam.speed = speed;
    const canvas = makeCanvas();
    attachFreeControl(cam, asCanvas(canvas), scene);
    fire(canvas, "pointerdown", pointer());
    fire(canvas, "pointermove", pointer({ clientX: dx }));
    tick(scene);
    const yaw1 = cam._yaw;
    tick(scene);
    return cam._yaw - yaw1;
}

describe("n33 attachFreeControl stops look inertia below speed * 0.001, so a high speed kills the mouse-look glide", () => {
    it("speed 2: the turn keeps gliding on the second frame", () => {
        expect(turnAfterTwoFrames(2)).toBeGreaterThan(0);
    });
    it("speed 1000: the turn is applied once and stops", () => {
        expect(turnAfterTwoFrames(1000)).toBe(0);
    });
});

describe("n33b the cutoff compares the decayed turn, so a long enough drag glides at speed 1000", () => {
    it("speed 1000: a 3000 px drag still turns on the second frame", () => {
        expect(turnAfterTwoFrames(1000, 3000)).toBeGreaterThan(0);
    });
});

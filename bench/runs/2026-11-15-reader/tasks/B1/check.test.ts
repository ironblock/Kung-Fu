import { describe, expect, it } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import { attachLimitedOrbit } from "../src/limited-orbit";
import { asCanvas, fire, listenerCount, makeCanvas, makeScene, tick, touches } from "./helpers";

function setup(radius: number) {
    const canvas = makeCanvas();
    const scene = makeScene();
    const before = scene._beforeRender.length;
    const camera = createArcRotateCamera(0, 1, radius, { x: 0, y: 0, z: 0 });
    const detach = attachLimitedOrbit(camera, asCanvas(canvas), scene, 2, 6);
    return { canvas, scene, camera, detach, before };
}

describe("B1 limited orbit", () => {
    it("brings a camera that starts too far into the range at once", () => {
        const { camera } = setup(10);
        expect(camera.radius).toBeLessThanOrEqual(6 + 1e-9);
        expect(camera.radius).toBeGreaterThanOrEqual(2 - 1e-9);
    });

    it("lets the wheel zoom out, but never past the far limit on any frame", () => {
        const { canvas, scene, camera } = setup(5);
        fire(canvas, "wheel", { deltaY: 5000, deltaX: 0, deltaMode: 0 });
        let max = camera.radius;
        for (let i = 0; i < 60; i++) {
            tick(scene);
            max = Math.max(max, camera.radius);
        }
        expect(camera.radius).toBeGreaterThan(5);
        expect(max).toBeLessThanOrEqual(6 + 1e-9);
    });

    it("lets the wheel zoom in, but never past the near limit on any frame", () => {
        const { canvas, scene, camera } = setup(5);
        fire(canvas, "wheel", { deltaY: -5000, deltaX: 0, deltaMode: 0 });
        let min = camera.radius;
        for (let i = 0; i < 60; i++) {
            tick(scene);
            min = Math.min(min, camera.radius);
        }
        expect(camera.radius).toBeLessThan(5);
        expect(min).toBeGreaterThanOrEqual(2 - 1e-9);
    });

    it("lets a pinch zoom, but not past either limit", () => {
        const { canvas, scene, camera } = setup(5);
        fire(canvas, "touchstart", touches([1, 100, 100], [2, 300, 100]));
        fire(canvas, "touchmove", touches([1, 0, 100], [2, 2000, 100]));
        tick(scene);
        expect(camera.radius).toBeLessThan(5);
        expect(camera.radius).toBeGreaterThanOrEqual(2 - 1e-9);

        fire(canvas, "touchmove", touches([1, 199, 100], [2, 201, 100]));
        tick(scene);
        expect(camera.radius).toBeGreaterThan(5);
        expect(camera.radius).toBeLessThanOrEqual(6 + 1e-9);
    });

    it("removes everything it added", () => {
        const { canvas, scene, detach, before } = setup(5);
        expect(listenerCount(canvas)).toBeGreaterThan(0);
        detach();
        expect(listenerCount(canvas)).toBe(0);
        expect(scene._beforeRender.length).toBe(before);
    });
});

import { describe, expect, it } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import { attachLimitedOrbit } from "../src/limited-orbit";
import { asCanvas, fire, listenerCount, makeCanvas, makeScene, tick, touches } from "./helpers";

function setup(radius: number) {
    const canvas = makeCanvas();
    const scene = makeScene();
    const before = scene._beforeRender.length;
    const camera = createArcRotateCamera(0, 1, radius, { x: 0, y: 0, z: 0 });
    // The camera's own radius and world-matrix getters, kept before the answer runs: what the library
    // itself holds, whatever the answer puts on the camera object.
    const ownRadius = Object.getOwnPropertyDescriptor(camera, "radius")!.get!;
    const ownWorld = Object.getOwnPropertyDescriptor(camera, "worldMatrix")!.get!;
    const target = camera.target;
    const detach = attachLimitedOrbit(camera, asCanvas(canvas), scene, 2, 6);
    /** The distance the picture shows: the eye's from the point it orbits, read as a renderer reads it. */
    const real = (): number => {
        const w = ownWorld.call(camera) as ArrayLike<number>;
        const eye = Math.hypot(w[12]! - target.x, w[13]! - target.y, w[14]! - target.z);
        expect(ownRadius.call(camera)).toBeCloseTo(camera.radius, 6);
        expect(eye).toBeCloseTo(camera.radius, 4);
        expect(eye).toBeLessThanOrEqual(6 + 1e-6);
        expect(eye).toBeGreaterThanOrEqual(2 - 1e-6);
        return eye;
    };
    return { canvas, scene, camera, detach, before, real };
}

describe("B1 limited orbit", () => {
    it("brings a camera that starts too far into the range at once", () => {
        const { camera, real } = setup(10);
        expect(camera.radius).toBeLessThanOrEqual(6 + 1e-9);
        expect(camera.radius).toBeGreaterThanOrEqual(2 - 1e-9);
        real();
    });

    it("lets the wheel zoom out, but never past the far limit on any frame", () => {
        const { canvas, scene, camera, real } = setup(5);
        fire(canvas, "wheel", { deltaY: 5000, deltaX: 0, deltaMode: 0 });
        let max = camera.radius;
        for (let i = 0; i < 60; i++) {
            tick(scene);
            max = Math.max(max, camera.radius);
            real();
            if (i === 10) {
                fire(canvas, "wheel", { deltaY: 5000, deltaX: 0, deltaMode: 0 });
            }
        }
        expect(camera.radius).toBeGreaterThan(5);
        expect(real()).toBeGreaterThan(5.01);
        expect(max).toBeLessThanOrEqual(6 + 1e-9);
    });

    it("lets the wheel zoom in, but never past the near limit on any frame", () => {
        const { canvas, scene, camera, real } = setup(5);
        fire(canvas, "wheel", { deltaY: -5000, deltaX: 0, deltaMode: 0 });
        let min = camera.radius;
        for (let i = 0; i < 60; i++) {
            tick(scene);
            min = Math.min(min, camera.radius);
            real();
            if (i === 10) {
                fire(canvas, "wheel", { deltaY: -5000, deltaX: 0, deltaMode: 0 });
            }
        }
        expect(camera.radius).toBeLessThan(5);
        expect(real()).toBeLessThan(4.99);
        expect(min).toBeGreaterThanOrEqual(2 - 1e-9);
    });

    it("lets a pinch zoom, but not past either limit", () => {
        const { canvas, scene, camera, real } = setup(5);
        fire(canvas, "touchstart", touches([1, 100, 100], [2, 300, 100]));
        fire(canvas, "touchmove", touches([1, 0, 100], [2, 2000, 100]));
        tick(scene);
        expect(camera.radius).toBeLessThan(5);
        expect(camera.radius).toBeGreaterThanOrEqual(2 - 1e-9);
        expect(real()).toBeLessThan(4.99);
        tick(scene, 3);
        real();

        fire(canvas, "touchmove", touches([1, 199, 100], [2, 201, 100]));
        tick(scene);
        expect(camera.radius).toBeGreaterThan(5);
        expect(camera.radius).toBeLessThanOrEqual(6 + 1e-9);
        expect(real()).toBeGreaterThan(5.01);
        tick(scene, 3);
        real();
    });

    it("keeps zooming in at once after the wheel has pushed hard against the far limit", () => {
        const { canvas, scene, camera, real } = setup(5);
        fire(canvas, "wheel", { deltaY: 5000, deltaX: 0, deltaMode: 0 });
        tick(scene, 3);
        real();
        expect(camera.radius).toBeGreaterThan(6 - 1e-3);
        // A small turn of the wheel back in must show within two frames, as it does with no limit near.
        fire(canvas, "wheel", { deltaY: -300, deltaX: 0, deltaMode: 0 });
        tick(scene, 2);
        expect(real()).toBeLessThan(6 - 0.01);
        tick(scene, 60);
        real();
    });

    it("removes everything it added", () => {
        const { canvas, scene, detach, before } = setup(5);
        expect(listenerCount(canvas)).toBeGreaterThan(0);
        detach();
        expect(listenerCount(canvas)).toBe(0);
        expect(scene._beforeRender.length).toBe(before);
    });
});

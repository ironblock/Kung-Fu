import { describe, it, expect } from "vitest";
import { createArcRotateCamera, setCameraLimits, interpolateArcRotateCamera } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

describe("n05 limits are enforced only after setCameraLimits, and then on every write", () => {
    it("a limit field set by hand alone clamps nothing", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        cam.upperRadiusLimit = 5;
        cam.radius = 20;
        expect(cam.radius).toBe(20);
    });
    it("after setCameraLimits a direct write is clamped in the same statement", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        setCameraLimits(cam, { upperRadiusLimit: 15, lowerBetaLimit: 0.5 });
        cam.radius = 20;
        expect(cam.radius).toBe(15);
        cam.beta = 0.1;
        expect(cam.beta).toBe(0.5);
    });
    it("setCameraLimits clamps the current pose at once and zeroes the inertial offset", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        cam.inertialRadiusOffset = 3;
        setCameraLimits(cam, { upperRadiusLimit: 5 });
        expect(cam.radius).toBe(5);
        expect(cam.inertialRadiusOffset).toBe(0);
    });
});

describe("n05b the exception: interpolateArcRotateCamera clamps goals to hand-set limits without setCameraLimits", () => {
    it("radius goal 50 with a hand-set upperRadiusLimit 5 resolves at 5", async () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        cam.upperRadiusLimit = 5;
        const p = interpolateArcRotateCamera(cam, scene, { radius: 50 });
        tick(scene, 500);
        await p;
        expect(cam.radius).toBeCloseTo(5, 6);
        cam.radius = 20;
        expect(cam.radius).toBe(20);
    });
});

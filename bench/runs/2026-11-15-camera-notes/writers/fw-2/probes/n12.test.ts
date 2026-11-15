import { describe, it, expect } from "vitest";
import { createArcRotateCamera, setCameraLimits, interpolateArcRotateCamera } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

describe("n12 interpolateArcRotateCamera clamps the goal to the camera's limits and resolves there", () => {
    it("a radius goal past upperRadiusLimit resolves with radius at the limit", async () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 2, { x: 0, y: 0, z: 0 });
        setCameraLimits(cam, { upperRadiusLimit: 5 });
        let done = false;
        const p = interpolateArcRotateCamera(cam, scene, { radius: 50 }).then(() => {
            done = true;
        });
        for (let i = 0; i < 200 && !done; i++) {
            tick(scene);
            await Promise.resolve();
        }
        await p;
        expect(done).toBe(true);
        expect(cam.radius).toBe(5);
    });
    it("nothing moves until a scene frame runs", () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 2, { x: 0, y: 0, z: 0 });
        void interpolateArcRotateCamera(cam, scene, { radius: 10 });
        expect(cam.radius).toBe(2);
        tick(scene);
        expect(cam.radius).toBeGreaterThan(2);
    });
});

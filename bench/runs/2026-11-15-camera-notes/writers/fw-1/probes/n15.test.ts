import { it, expect } from "vitest";
import { createArcRotateCamera, interpolateArcRotateCamera, setCameraLimits } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";

it("n15: alpha travels the short way and ends exactly at the goal value; out-of-limit goals settle at the limit", async () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    setCameraLimits(cam, { upperRadiusLimit: 20 });
    const goal = 2 * Math.PI + 0.1;
    const p = interpolateArcRotateCamera(cam, scene, { alpha: goal, radius: 50 });
    let maxSeen = 0;
    for (let i = 0; i < 400; i++) {
        tick(scene);
        if (cam.alpha < 1) maxSeen = Math.max(maxSeen, cam.alpha);
    }
    await expect(p).resolves.toBeUndefined();
    expect(maxSeen).toBeLessThan(0.11);
    expect(cam.alpha).toBe(goal);
    expect(cam.radius).toBe(20);
});

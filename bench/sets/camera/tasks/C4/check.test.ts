import { describe, it, expect } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";
import { spinAround } from "../src/turntable";

async function flush(): Promise<void> {
    for (let i = 0; i < 20; i++) {
        await Promise.resolve();
    }
}

describe("spinAround", () => {
    it.each([0.75, 1, 2])("glides %s turns the way alpha grows, smoothly, and ends exactly there", async (turns) => {
        const scene = makeScene();
        const cam = createArcRotateCamera(0.3, 1.1, 8, { x: 1, y: 2, z: 3 });
        let done = false;
        let failed: unknown;
        spinAround(cam, scene, turns).then(
            () => (done = true),
            (e) => (failed = e ?? "rejected")
        );
        await flush();

        const alphas = [cam.alpha];
        for (let frame = 0; frame < 3000 && !done && failed === undefined; frame++) {
            tick(scene);
            alphas.push(cam.alpha);
            await flush();
        }
        expect(failed).toBeUndefined();
        expect(done).toBe(true);

        let biggest = 0;
        for (let i = 1; i < alphas.length; i++) {
            const step = alphas[i]! - alphas[i - 1]!;
            expect(step).toBeGreaterThanOrEqual(-1e-9);
            biggest = Math.max(biggest, step);
        }
        expect(biggest).toBeLessThan(0.5);
        expect(cam.alpha).toBeCloseTo(0.3 + 2 * Math.PI * turns, 9);
        expect(cam.beta).toBeCloseTo(1.1, 9);
        expect(cam.radius).toBeCloseTo(8, 9);
        expect([cam.target.x, cam.target.y, cam.target.z]).toEqual([1, 2, 3]);
    });
});

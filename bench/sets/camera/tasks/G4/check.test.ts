import { describe, expect, it } from "vitest";
import { createGeospatialCamera, normalizeRadians, setGeospatialOrientation } from "@babylonjs/lite";
import { makeScene, tick } from "./helpers";
import { spinAround } from "../src/spin-around";

const R = 1000;

async function flush(): Promise<void> {
    for (let i = 0; i < 5; i++) {
        await Promise.resolve();
    }
}

async function spin(startYaw: number, durationMs: number): Promise<{ total: number; minStep: number; done: boolean; frames: number; camera: ReturnType<typeof createGeospatialCamera> }> {
    const scene = makeScene();
    const camera = createGeospatialCamera({ planetRadius: R });
    setGeospatialOrientation(camera, { radius: 1500, pitch: 0.5, yaw: startYaw });
    let done = false;
    void spinAround(camera, scene, durationMs).then(() => {
        done = true;
    });
    await flush();
    let total = 0;
    let minStep = Infinity;
    let prev = camera.yaw;
    let frames = 0;
    const limit = Math.ceil((durationMs * 1.5) / 16) + 30;
    while (!done && frames < limit) {
        tick(scene, 1, 16);
        await flush();
        frames++;
        const step = normalizeRadians(camera.yaw - prev);
        prev = camera.yaw;
        total += step;
        minStep = Math.min(minStep, step);
    }
    return { total, minStep, done, frames, camera };
}

describe("G4 spinAround", () => {
    it("turns one full turn eastward and resolves", async () => {
        const r = await spin(0.3, 2000);
        expect(r.done).toBe(true);
        expect(r.total).toBeCloseTo(2 * Math.PI, 2);
        expect(r.minStep).toBeGreaterThanOrEqual(-1e-9);
        expect(normalizeRadians(r.camera.yaw - 0.3)).toBeCloseTo(0, 6);
    });

    it("takes about the given duration", async () => {
        const r = await spin(-2, 3000);
        expect(r.done).toBe(true);
        expect(r.frames * 16).toBeGreaterThan(3000 * 0.8);
        expect(r.frames * 16).toBeLessThan(3000 * 1.25 + 100);
    });

    it("keeps the centre, tilt and zoom", async () => {
        const r = await spin(2.5, 1000);
        expect(r.done).toBe(true);
        expect(r.total).toBeCloseTo(2 * Math.PI, 2);
        expect(r.minStep).toBeGreaterThanOrEqual(-1e-9);
        expect(r.camera.radius).toBeCloseTo(1500, 6);
        expect(r.camera.pitch).toBeCloseTo(0.5, 6);
        expect(r.camera.center.x).toBeCloseTo(R, 6);
        expect(r.camera.center.y).toBeCloseTo(0, 6);
        expect(r.camera.center.z).toBeCloseTo(0, 6);
    });
});

import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { createGeospatialCamera, attachGeospatialControls, flyGeospatialCameraToAsync } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, makeScene, tick } from "./helpers";

beforeEach(() => {
    (globalThis as Record<string, unknown>).window = { addEventListener() {}, removeEventListener() {} };
});
afterEach(() => {
    delete (globalThis as Record<string, unknown>).window;
});

describe("n21 user input through attachGeospatialControls ends a running flight, which resolves", () => {
    it("a wheel during a flight resolves the flight early", async () => {
        const scene = makeScene();
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        const canvas = makeCanvas();
        attachGeospatialControls(cam, asCanvas(canvas), scene);
        let done = false;
        const p = flyGeospatialCameraToAsync(cam, scene, { yaw: 2, durationMs: 10000 }).then(() => (done = true));
        tick(scene, 2);
        fire(canvas, "wheel", { deltaY: -1, clientX: 400, clientY: 300 });
        tick(scene);
        await p;
        expect(done).toBe(true);
        expect(cam.yaw).toBeLessThan(1);
    });
});

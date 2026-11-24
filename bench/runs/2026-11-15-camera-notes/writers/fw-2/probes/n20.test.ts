import { describe, it, expect, afterEach, beforeEach } from "vitest";
import { createGeospatialCamera, attachGeospatialControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, makeScene, tick } from "./helpers";

beforeEach(() => {
    (globalThis as Record<string, unknown>).window = { addEventListener() {}, removeEventListener() {} };
});
afterEach(() => {
    delete (globalThis as Record<string, unknown>).window;
});

function zoomOnce(deltaY: number): number {
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    const canvas = makeCanvas();
    attachGeospatialControls(cam, asCanvas(canvas), scene, { zoomToCursor: false });
    const r0 = cam.radius;
    fire(canvas, "wheel", { deltaY, clientX: 400, clientY: 300 });
    tick(scene, 10);
    return r0 - cam.radius;
}

describe("n20 geospatial wheel zoom uses only the sign of deltaY", () => {
    it("deltaY 1 and deltaY 1000 zoom by the same amount; negative deltaY zooms in", () => {
        const small = zoomOnce(-1);
        const big = zoomOnce(-1000);
        expect(small).toBeGreaterThan(0);
        expect(big).toBeCloseTo(small, 6);
    });
});

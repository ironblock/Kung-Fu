import { expect, test } from "vitest";
import { createGeospatialCamera, attachGeospatialControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, makeScene, tick } from "./helpers";

test("geospatial wheel uses only the sign of deltaY: deltaY -1 and -500 zoom the same; deltaY < 0 zooms in", () => {
    (globalThis as Record<string, unknown>).window = makeCanvas();
    try {
        const run = (deltaY: number): number => {
            const scene = makeScene();
            const cam = createGeospatialCamera({ planetRadius: 1000 });
            const canvas = makeCanvas();
            attachGeospatialControls(cam, asCanvas(canvas), scene);
            fire(canvas, "wheel", { deltaY, clientX: 400, clientY: 300 });
            tick(scene, 20);
            return cam.radius;
        };
        const a = run(-1);
        const b = run(-500);
        expect(a).toBeLessThan(4000);
        expect(b).toBe(a);
    } finally {
        delete (globalThis as Record<string, unknown>).window;
    }
});

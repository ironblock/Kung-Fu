import { expect, test } from "vitest";
import { createGeospatialCamera, attachGeospatialControls, flyGeospatialCameraToAsync } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

test("geospatial controls: user input on a frame ends a running flight, whose promise resolves", async () => {
    (globalThis as Record<string, unknown>).window = makeCanvas();
    try {
        const scene = makeScene();
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        const canvas = makeCanvas();
        attachGeospatialControls(cam, asCanvas(canvas), scene);
        let resolved = false;
        const p = flyGeospatialCameraToAsync(cam, scene, { radius: 1000, durationMs: 1000 }).then(() => { resolved = true; });
        tick(scene, 10, 16);
        fire(canvas, "pointerdown", pointer({ button: 2, clientX: 400, clientY: 300 }));
        fire(canvas, "pointermove", pointer({ button: 2, clientX: 410, clientY: 300 }));
        tick(scene, 1, 16);
        await p;
        expect(resolved).toBe(true);
        const r = cam.radius;
        tick(scene, 100, 16);
        expect(cam.radius).toBe(r);
        expect(r).toBeGreaterThan(1000);
    } finally {
        delete (globalThis as Record<string, unknown>).window;
    }
});

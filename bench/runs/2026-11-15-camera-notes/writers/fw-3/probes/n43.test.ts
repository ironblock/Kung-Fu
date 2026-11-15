import { expect, test } from "vitest";
import { createGeospatialCamera, attachGeospatialControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

test("geospatial: left drag pans the center; any other button rotates, yaw += dx*PI/500 with no inertia", () => {
    (globalThis as Record<string, unknown>).window = makeCanvas();
    try {
        const scene = makeScene();
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        const canvas = makeCanvas();
        attachGeospatialControls(cam, asCanvas(canvas), scene);
        fire(canvas, "pointerdown", pointer({ button: 2, clientX: 400, clientY: 300 }));
        fire(canvas, "pointermove", pointer({ button: 2, clientX: 450, clientY: 300 }));
        tick(scene, 1);
        expect(cam.yaw).toBeCloseTo((50 * Math.PI) / 500, 9);
        tick(scene, 5);
        expect(cam.yaw).toBeCloseTo((50 * Math.PI) / 500, 9);
        expect(cam.center).toEqual({ x: 1000, y: 0, z: 0 });
        fire(canvas, "pointerup", pointer({ button: 2 }));

        const cam2 = createGeospatialCamera({ planetRadius: 1000 });
        const canvas2 = makeCanvas();
        attachGeospatialControls(cam2, asCanvas(canvas2), scene);
        fire(canvas2, "pointerdown", pointer({ button: 0, clientX: 400, clientY: 300 }));
        fire(canvas2, "pointermove", pointer({ button: 0, clientX: 450, clientY: 300 }));
        tick(scene, 1);
        expect(cam2.yaw).toBe(0);
        expect(Math.hypot(cam2.center.y, cam2.center.z)).toBeGreaterThan(1);
    } finally {
        delete (globalThis as Record<string, unknown>).window;
    }
});

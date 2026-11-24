import { it, expect, afterEach } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation, attachGeospatialControls, createGeospatialLimits } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, makeScene, tick } from "./helpers";

afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

function zoomIn(swap: boolean) {
    (globalThis as Record<string, unknown>).window = makeCanvas();
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    setGeospatialOrientation(cam, { radius: 500, pitch: 0.001 });
    if (swap) {
        const fresh = createGeospatialLimits(1000);
        fresh.radiusMin = 480;
        cam.limits = fresh;
    }
    const c = makeCanvas();
    attachGeospatialControls(cam, asCanvas(c), scene);
    for (let i = 0; i < 20; i++) fire(c, "wheel", { deltaY: -100, clientX: 400, clientY: 300 });
    tick(scene, 60);
    return cam.radius;
}

it("c35: a new object assigned to camera.limits IS used by attachGeospatialControls to clamp zoom", () => {
    const plain = zoomIn(false);
    const swapped = zoomIn(true);
    expect(plain).toBeLessThan(470);
    expect(swapped).toBeGreaterThanOrEqual(479);
});

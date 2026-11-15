import { expect, test } from "vitest";
import { createGeospatialCamera, attachGeospatialControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

test("attachGeospatialControls reads keys from window, not the canvas; it throws where there is no window", () => {
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    const canvas = makeCanvas();
    expect(() => attachGeospatialControls(cam, asCanvas(canvas), scene)).toThrow(ReferenceError);
    const win = makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    try {
        const canvas2 = makeCanvas();
        attachGeospatialControls(cam, asCanvas(canvas2), scene);
        expect(canvas2.listeners.has("keydown")).toBe(false);
        expect(win.listeners.get("keydown")!.length).toBe(1);
        const c0 = { ...cam.center };
        fire(win, "keydown", key("ArrowUp"));
        tick(scene, 3);
        expect(cam.center.z).toBeGreaterThan(c0.z); // ArrowUp pans north (+Z)
    } finally {
        delete (globalThis as Record<string, unknown>).window;
    }
});

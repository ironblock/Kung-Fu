import { describe, it, expect, afterEach } from "vitest";
import { createGeospatialCamera, attachGeospatialControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

type H = (e: unknown) => void;
function stubWindow(): Map<string, H[]> {
    const map = new Map<string, H[]>();
    (globalThis as Record<string, unknown>).window = {
        addEventListener(t: string, h: H) {
            map.set(t, [...(map.get(t) ?? []), h]);
        },
        removeEventListener(t: string, h: H) {
            map.set(t, (map.get(t) ?? []).filter((x) => x !== h));
        },
    };
    return map;
}
afterEach(() => {
    delete (globalThis as Record<string, unknown>).window;
});

describe("n19 attachGeospatialControls listens for keys on window, not on the canvas", () => {
    it("throws when there is no global window", () => {
        delete (globalThis as Record<string, unknown>).window;
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        expect(() => attachGeospatialControls(cam, asCanvas(makeCanvas()), makeScene())).toThrow();
    });
    it("keydown/keyup go on window; the canvas gets none; a key sent to the canvas does nothing", () => {
        const win = stubWindow();
        const scene = makeScene();
        const cam = createGeospatialCamera({ planetRadius: 1000 });
        const canvas = makeCanvas();
        attachGeospatialControls(cam, asCanvas(canvas), scene);
        expect(win.get("keydown")?.length).toBe(1);
        expect(canvas.listeners.get("keydown")?.length ?? 0).toBe(0);
        const r = cam.radius;
        fire(canvas, "keydown", key("Equal"));
        tick(scene, 3);
        expect(cam.radius).toBe(r);
        for (const h of win.get("keydown")!) h(key("Equal"));
        tick(scene, 3);
        expect(cam.radius).toBeLessThan(r);
    });
});

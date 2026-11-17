import { it, expect, afterEach } from "vitest";
import { createGeospatialCamera, setGeospatialOrientation, attachGeospatialControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

it("c50: when the look vector misses the planet, the center does not move after a pan stops", () => {
    const win = makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    cam.limits.pitchDisabledRadiusScale = null;
    // center 500 above the surface, looking near the horizon: the ray through center misses the sphere
    setGeospatialOrientation(cam, { radius: 50, pitch: 1.5, center: { x: 1500, y: 0, z: 0 } });
    attachGeospatialControls(cam, asCanvas(makeCanvas()), scene);
    fire(win, "keydown", key("ArrowUp"));
    tick(scene);
    fire(win, "keyup", key("ArrowUp"));
    tick(scene, 3);
    const c = cam.center;
    expect(Math.hypot(c.x, c.y, c.z)).toBeCloseTo(1500, 3);
    expect(cam.radius).toBeCloseTo(50, 6);
});

it("c53: zoom keys move the center once the zoom stops, when the center is off the sphere", () => {
    const win = makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    cam.limits.pitchMin = 0;
    setGeospatialOrientation(cam, { radius: 500, pitch: 0, center: { x: 1100, y: 0, z: 0 } });
    attachGeospatialControls(cam, asCanvas(makeCanvas()), scene);
    fire(win, "keydown", key("Equal"));
    tick(scene);
    fire(win, "keyup", key("Equal"));
    tick(scene, 200);
    expect(cam.center.x).toBeCloseTo(1000, 3);
});

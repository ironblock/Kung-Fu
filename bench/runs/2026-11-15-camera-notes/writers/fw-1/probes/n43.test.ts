import { it, expect, afterEach } from "vitest";
import { createGeospatialCamera, attachGeospatialControls, flyGeospatialCameraToAsync, setGeospatialOrientation } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, makeScene, tick } from "./helpers";

afterEach(() => {
    delete (globalThis as Record<string, unknown>).window;
});

it("n43: control input during a fly ends the fly and resolves its promise", async () => {
    (globalThis as Record<string, unknown>).window = makeCanvas();
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    setGeospatialOrientation(cam, { radius: 500, pitch: 0.3 });
    const c = makeCanvas();
    attachGeospatialControls(cam, asCanvas(c), scene);
    let done = false;
    const p = flyGeospatialCameraToAsync(cam, scene, { radius: 3000, durationMs: 10000 }).then(() => (done = true));
    tick(scene, 2);
    fire(c, "wheel", { deltaY: -1, clientX: 400, clientY: 300 });
    tick(scene);
    await p;
    expect(done).toBe(true);
    expect(cam._cancelFly).toBeUndefined();
    expect(cam.radius).toBeLessThan(1000);
});

it("n43b: a wheel event with deltaY 0 does not end the fly", async () => {
    (globalThis as Record<string, unknown>).window = makeCanvas();
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    setGeospatialOrientation(cam, { radius: 500, pitch: 0.3 });
    const c = makeCanvas();
    attachGeospatialControls(cam, asCanvas(c), scene);
    let done = false;
    const p = flyGeospatialCameraToAsync(cam, scene, { radius: 3000, durationMs: 10000 }).then(() => (done = true));
    tick(scene, 2);
    fire(c, "wheel", { deltaY: 0, deltaX: 100, clientX: 400, clientY: 300 });
    tick(scene, 2);
    await Promise.resolve();
    await Promise.resolve();
    expect(done).toBe(false);
    expect(cam._cancelFly).toBeDefined();
    fire(c, "wheel", { deltaY: 1, clientX: 400, clientY: 300 });
    tick(scene);
    await p;
    expect(done).toBe(true);
});

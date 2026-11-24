import { it, expect, afterEach } from "vitest";
import { createGeospatialCamera, attachGeospatialControls, setGeospatialOrientation } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, makeScene, tick } from "./helpers";

afterEach(() => {
    delete (globalThis as Record<string, unknown>).window;
});

it("n41: a primary-button double click with no button held flies the centre to the clicked globe point over 1000 ms", () => {
    (globalThis as Record<string, unknown>).window = makeCanvas();
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    setGeospatialOrientation(cam, { radius: 500, pitch: 0.3 });
    const c = makeCanvas();
    attachGeospatialControls(cam, asCanvas(c), scene);
    const c0 = { ...cam.center };
    fire(c, "dblclick", { button: 0, buttons: 1, clientX: 450, clientY: 320 });
    expect(cam._cancelFly).toBeUndefined();
    fire(c, "dblclick", { button: 0, buttons: 0, clientX: 450, clientY: 320 });
    expect(cam._cancelFly).toBeDefined();
    tick(scene, 31, 16); // 496 ms
    expect(cam._cancelFly).toBeDefined();
    tick(scene, 33, 16); // past 1000 ms
    expect(cam._cancelFly).toBeUndefined();
    expect(Math.hypot(cam.center.x - c0.x, cam.center.y - c0.y, cam.center.z - c0.z)).toBeGreaterThan(1);
});

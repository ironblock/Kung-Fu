import { it, expect, afterEach } from "vitest";
import { createGeospatialCamera, attachGeospatialControls, setGeospatialOrientation } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

afterEach(() => {
    delete (globalThis as Record<string, unknown>).window;
});

function setup() {
    (globalThis as Record<string, unknown>).window = makeCanvas();
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    setGeospatialOrientation(cam, { radius: 500, pitch: 0.5 });
    const c = makeCanvas();
    attachGeospatialControls(cam, asCanvas(c), scene);
    return { scene, cam, c };
}

it("n40: wheel zoom uses only the sign of deltaY", () => {
    const a = setup();
    fire(a.c, "wheel", { deltaY: 1, clientX: 400, clientY: 300 });
    tick(a.scene, 30);
    const b = setup();
    fire(b.c, "wheel", { deltaY: 500, clientX: 400, clientY: 300 });
    tick(b.scene, 30);
    expect(a.cam.radius).toBeGreaterThan(500);
    expect(b.cam.radius).toBe(a.cam.radius);
});

it("n40b: rotation stops the frame input stops, zoom keeps coasting", () => {
    const { scene, cam, c } = setup();
    fire(c, "pointerdown", pointer({ button: 2, buttons: 2, clientX: 400, clientY: 300 }));
    fire(c, "pointermove", pointer({ button: 2, buttons: 2, clientX: 450, clientY: 300 }));
    tick(scene);
    const yaw = cam.yaw;
    tick(scene, 3);
    expect(cam.yaw).toBe(yaw);
    fire(c, "pointerup", pointer({ button: 2 }));
    fire(c, "wheel", { deltaY: 1, clientX: 400, clientY: 300 });
    tick(scene);
    const r1 = cam.radius;
    tick(scene);
    expect(cam.radius).toBeGreaterThan(r1);
});

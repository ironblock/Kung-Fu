import { it, expect, afterEach } from "vitest";
import { createGeospatialCamera, attachGeospatialControls, setGeospatialOrientation } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, key, makeScene, tick } from "./helpers";

afterEach(() => {
    delete (globalThis as Record<string, unknown>).window;
});

function setup() {
    const win = makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    setGeospatialOrientation(cam, { radius: 500, pitch: 0.5 });
    const c = makeCanvas();
    attachGeospatialControls(cam, asCanvas(c), scene);
    return { win, scene, cam, c };
}

it("n39: right drag rotates, left drag pans the centre; keys are heard on window, not on the canvas", () => {
    let { win, scene, cam, c } = setup();
    fire(c, "pointerdown", pointer({ button: 2, buttons: 2, clientX: 400, clientY: 300 }));
    fire(c, "pointermove", pointer({ button: 2, buttons: 2, clientX: 450, clientY: 300 }));
    tick(scene);
    expect(cam.yaw).not.toBe(0);
    fire(c, "pointerup", pointer({ button: 2 }));

    ({ win, scene, cam, c } = setup());
    const cx = { ...cam.center };
    fire(c, "pointerdown", pointer({ button: 0, clientX: 400, clientY: 300 }));
    fire(c, "pointermove", pointer({ button: 0, clientX: 450, clientY: 300 }));
    tick(scene);
    expect(cam.yaw).toBeCloseTo(0, 6);
    expect(Math.hypot(cam.center.x - cx.x, cam.center.y - cx.y, cam.center.z - cx.z)).toBeGreaterThan(0);
    fire(c, "pointerup", pointer());

    ({ win, scene, cam, c } = setup());
    const r0 = cam.radius;
    fire(c, "keydown", key("Minus"));
    tick(scene);
    expect(cam.radius).toBe(r0);
    expect(c.tabIndex).toBe(-1);
    fire(win, "keydown", key("Minus"));
    tick(scene);
    expect(cam.radius).toBeGreaterThan(r0);
});

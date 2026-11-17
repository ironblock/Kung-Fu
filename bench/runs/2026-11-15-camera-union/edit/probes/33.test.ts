import { it, expect, afterEach } from "vitest";
import { createGeospatialCamera, attachGeospatialControls, setGeospatialOrientation } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, key, makeScene, tick } from "./helpers";

afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

function setup(orient = { radius: 500, pitch: 0.5 }) {
    const win = makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    setGeospatialOrientation(cam, orient);
    const c = makeCanvas();
    attachGeospatialControls(cam, asCanvas(c), scene);
    return { win, scene, cam, c };
}

it("33a: keys on window, not the canvas; tabIndex untouched", () => {
    const { win, scene, cam, c } = setup();
    const r0 = cam.radius;
    fire(c, "keydown", key("Minus"));
    tick(scene);
    expect(cam.radius).toBe(r0);
    expect(c.tabIndex).toBe(-1);
    fire(win, "keydown", key("Minus"));
    tick(scene);
    expect(cam.radius).toBeGreaterThan(r0);
});

it("33b: a left drag pans the center only when the press hits the planet sphere", () => {
    let { scene, cam, c } = setup();
    const c0 = { ...cam.center };
    fire(c, "pointerdown", pointer({ button: 0, clientX: 400, clientY: 300 }));
    fire(c, "pointermove", pointer({ button: 0, clientX: 450, clientY: 300 }));
    tick(scene);
    expect(Math.hypot(cam.center.x - c0.x, cam.center.y - c0.y, cam.center.z - c0.z)).toBeGreaterThan(1);
    expect(cam.yaw).toBeCloseTo(0, 6);
    // looking at the horizon from low down: the top of the screen is sky
    ({ scene, cam, c } = setup({ radius: 50, pitch: 1.5 }));
    const c1 = { ...cam.center };
    fire(c, "pointerdown", pointer({ button: 0, clientX: 400, clientY: 0 }));
    fire(c, "pointermove", pointer({ button: 0, clientX: 450, clientY: 0 }));
    tick(scene);
    expect({ ...cam.center }).toEqual(c1);
});

it("33c: any other button rotates with no coasting: yaw += dx*PI/500, pitch += dy*PI/500", () => {
    for (const button of [1, 2]) {
        const { scene, cam, c } = setup();
        fire(c, "pointerdown", pointer({ button, buttons: 2, clientX: 400, clientY: 300 }));
        fire(c, "pointermove", pointer({ button, buttons: 2, clientX: 410, clientY: 305 }));
        tick(scene);
        expect(cam.yaw).toBeCloseTo((10 * Math.PI) / 500, 9);
        expect(cam.pitch).toBeCloseTo(0.5 + (5 * Math.PI) / 500, 9);
        const y = cam.yaw;
        tick(scene, 3);
        expect(cam.yaw).toBe(y);
    }
});

it("33d: the rotated pitch is clamped to [0, PI/2-0.001] before the limits", () => {
    const { scene, cam, c } = setup();
    cam.limits.pitchMax = 3;
    cam.limits.pitchDisabledRadiusScale = null;
    fire(c, "pointerdown", pointer({ button: 2, buttons: 2, clientX: 400, clientY: 0 }));
    fire(c, "pointermove", pointer({ button: 2, buttons: 2, clientX: 400, clientY: 600 }));
    tick(scene);
    expect(cam.pitch).toBeCloseTo(Math.PI / 2 - 0.001, 9);
});

import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

V2.afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

V2.it("33 (after check 2): a left drag whose press misses the sphere does nothing (no rotate either)", () => {
    (globalThis as Record<string, unknown>).window = H2.makeCanvas();
    const scene = H2.makeScene();
    const cam = L2.createGeospatialCamera({ planetRadius: 1000 });
    L2.setGeospatialOrientation(cam, { radius: 1500, pitch: 1.2 }); // the top of the view is sky
    const c = H2.makeCanvas();
    L2.attachGeospatialControls(cam, H2.asCanvas(c), scene);
    H2.tick(scene);
    const before = { yaw: cam.yaw, pitch: cam.pitch, ...cam.center };
    H2.fire(c, "pointerdown", H2.pointer({ clientX: 400, clientY: 2 }));
    H2.fire(c, "pointermove", H2.pointer({ clientX: 500, clientY: 60 }));
    H2.tick(scene);
    H2.fire(c, "pointerup", H2.pointer());
    H2.tick(scene, 3);
    V2.expect({ yaw: cam.yaw, pitch: cam.pitch, ...cam.center }).toEqual(before);
    // a left drag pressed on the planet does pan
    H2.fire(c, "pointerdown", H2.pointer({ clientX: 400, clientY: 500 }));
    H2.fire(c, "pointermove", H2.pointer({ clientX: 500, clientY: 560 }));
    H2.tick(scene);
    H2.fire(c, "pointerup", H2.pointer());
    V2.expect(cam.center).not.toEqual({ x: before.x, y: before.y, z: before.z });
    // the sky drag with button 2 rotates
    H2.fire(c, "pointerdown", H2.pointer({ button: 2, buttons: 2, clientX: 400, clientY: 2 }));
    H2.fire(c, "pointermove", H2.pointer({ button: 2, buttons: 2, clientX: 500, clientY: 60 }));
    H2.tick(scene);
    V2.expect(cam.yaw).not.toBe(before.yaw);
});

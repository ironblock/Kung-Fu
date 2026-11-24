import { it, expect, afterEach } from "vitest";
import { createGeospatialCamera, attachGeospatialControls, setGeospatialOrientation } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, key, makeScene, tick } from "./helpers";

afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

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

it("59a: the wheel zooms by the sign of deltaY only; positive zooms out", () => {
    const zoom = (deltaY: number) => {
        const { scene, cam, c } = setup();
        fire(c, "wheel", { deltaY, clientX: 400, clientY: 300 });
        tick(scene);
        return cam.radius;
    };
    expect(zoom(1)).toBeGreaterThan(500);
    expect(zoom(1)).toBeCloseTo(zoom(500), 9);
    expect(zoom(-3)).toBeLessThan(500);
    expect(zoom(-3)).toBeCloseTo(zoom(-300), 9);
});

it("59b: wheel and key zoom coast over later frames", () => {
    const { win, scene, cam, c } = setup();
    fire(c, "wheel", { deltaY: 100, clientX: 400, clientY: 300 });
    tick(scene);
    const r1 = cam.radius;
    tick(scene);
    expect(cam.radius).toBeGreaterThan(r1);
    const s = setup();
    fire(s.win, "keydown", key("Minus"));
    tick(s.scene);
    fire(s.win, "keyup", key("Minus"));
    const k1 = s.cam.radius;
    tick(s.scene);
    expect(s.cam.radius).toBeGreaterThan(k1);
    void win; void c;
});

it("59c: the coast decays per 1000/60 ms of frame time, so its total barely depends on frame rate", () => {
    const total = (dt: number) => {
        const { scene, cam, c } = setup();
        tick(scene, 1, dt);
        fire(c, "wheel", { deltaY: 100, clientX: 400, clientY: 300 });
        tick(scene, Math.round(3000 / dt), dt);
        return cam.radius - 500;
    };
    const a = total(1000 / 60);
    const b = total(1000 / 30);
    expect(Math.abs(a - b) / a).toBeLessThan(0.1);
});

it("59d: pan and rotation stop on the first frame without input", () => {
    const { scene, cam, c } = setup();
    fire(c, "pointerdown", pointer({ button: 2, buttons: 2, clientX: 400, clientY: 300 }));
    fire(c, "pointermove", pointer({ button: 2, buttons: 2, clientX: 420, clientY: 300 }));
    tick(scene);
    const y = cam.yaw;
    tick(scene);
    expect(cam.yaw).toBe(y);
    const s = setup();
    fire(s.c, "pointerdown", pointer({ button: 0, clientX: 400, clientY: 300 }));
    fire(s.c, "pointermove", pointer({ button: 0, clientX: 450, clientY: 300 }));
    tick(s.scene);
    const cx = { ...s.cam.center };
    tick(s.scene);
    tick(s.scene);
    expect(s.cam.center.y).toBeCloseTo(cx.y, 6);
    expect(s.cam.center.z).toBeCloseTo(cx.z, 6);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

it("59c (after check): zoom coasts with inertia 0.9 per 1/60 s: step ratio = 0.9 * r(n+1)/r(n)", () => {
    (globalThis as Record<string, unknown>).window = H.makeCanvas();
    const win = (globalThis as Record<string, unknown>).window as H.FakeCanvas;
    const scene = H.makeScene();
    const cam = L.createGeospatialCamera({ planetRadius: 1000 });
    L.setGeospatialOrientation(cam, { radius: 1500, pitch: 0.001 });
    L.attachGeospatialControls(cam, H.asCanvas(H.makeCanvas()), scene);
    H.fire(win, "keydown", H.key("Equal"));
    H.tick(scene, 1, 1000 / 60);
    H.fire(win, "keyup", H.key("Equal"));
    const r: number[] = [cam.radius];
    for (let i = 0; i < 5; i++) { H.tick(scene, 1, 1000 / 60); r.push(cam.radius); }
    for (let i = 1; i < 4; i++) {
        const s0 = r[i - 1]! - r[i]!, s1 = r[i]! - r[i + 1]!;
        expect(s1 / s0).toBeCloseTo(0.9 * r[i]! / r[i - 1]!, 6);
    }
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";


V3.afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

function geo3() {
    const win = H3.makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = H3.makeScene();
    const cam = L3.createGeospatialCamera({ planetRadius: 1e6 });
    const c = H3.makeCanvas();
    L3.attachGeospatialControls(cam, H3.asCanvas(c), scene);
    return { win, scene, cam, c };
}
function holdEqual3(fps: number) {
    const { win, scene, cam } = geo3();
    const r0 = cam.radius;
    H3.fire(win, "keydown", H3.key("Equal"));
    H3.tick(scene, fps / 10, 1000 / fps);
    H3.fire(win, "keyup", H3.key("Equal"));
    H3.tick(scene, fps * 5, 1000 / fps);
    V3.expect(cam.radius).toBeGreaterThan(cam.limits.radiusMin * 2);
    return Math.log(r0 / cam.radius);
}
function oneWheel3(fps: number) {
    const { scene, cam, c } = geo3();
    const r0 = cam.radius;
    H3.fire(c, "wheel", { deltaY: -1, clientX: 400, clientY: 300 });
    H3.tick(scene, fps * 5, 1000 / fps);
    return Math.log(r0 / cam.radius);
}
V3.it("59 (after check 3): one wheel step travels about as far at 30 fps as at 60", () => {
    const a = oneWheel3(60), b = oneWheel3(30);
    V3.expect(b / a).toBeGreaterThan(0.9);
    V3.expect(b / a).toBeLessThan(1.1);
});
V3.it("59 (after check 3): a held Equal key zooms about twice as far in the same time at 60 fps as at 30", () => {
    const a = holdEqual3(60), b = holdEqual3(30);
    V3.expect(a).toBeGreaterThan(0);
    V3.expect(b / a).toBeLessThan(0.7);
    V3.expect(b / a).toBeGreaterThan(0.3);
});

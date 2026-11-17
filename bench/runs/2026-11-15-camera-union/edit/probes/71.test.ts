import { it, expect, afterEach } from "vitest";
import { createGeospatialCamera, attachGeospatialControls, setGeospatialOrientation } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

function setup() {
    const win = makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    setGeospatialOrientation(cam, { radius: 500, pitch: 0.5 });
    attachGeospatialControls(cam, asCanvas(makeCanvas()), scene);
    tick(scene);
    return { win, scene, cam };
}

it("71c: Equal/NumpadAdd zoom in, Minus/NumpadSubtract zoom out, keeping the center", () => {
    for (const [code, sign] of [["Equal", -1], ["NumpadAdd", -1], ["Minus", 1], ["NumpadSubtract", 1]] as const) {
        const { win, scene, cam } = setup();
        const c0 = { ...cam.center };
        fire(win, "keydown", key(code));
        tick(scene);
        expect(Math.sign(cam.radius - 500)).toBe(sign);
        expect(cam.center.x).toBeCloseTo(c0.x, 6);
        expect(cam.center.z).toBeCloseTo(c0.z, 6);
    }
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

it("71c (after check): zoom keys keep the center only while the zoom runs; then an off-sphere center is moved onto it", () => {
    const win = H.makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = H.makeScene();
    const cam = L.createGeospatialCamera({ planetRadius: 1000 });
    cam.limits.pitchMin = 0;
    L.setGeospatialOrientation(cam, { radius: 500, pitch: 0, center: { x: 1100, y: 0, z: 0 } });
    L.attachGeospatialControls(cam, H.asCanvas(H.makeCanvas()), scene);
    H.fire(win, "keydown", H.key("Equal"));
    H.tick(scene, 3);
    expect(cam.center.x).toBeCloseTo(1100, 6);
    H.fire(win, "keyup", H.key("Equal"));
    H.tick(scene, 200);
    expect(cam.center.x).toBeCloseTo(1000, 3);
});

import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

V2.afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

V2.it("71 (after check 2): Equal zooms along the look vector: the eye moves along _lookAt toward the center", () => {
    const win = H2.makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = H2.makeScene();
    const cam = L2.createGeospatialCamera({ planetRadius: 1000 });
    L2.setGeospatialOrientation(cam, { radius: 500, pitch: 0.6 });
    L2.attachGeospatialControls(cam, H2.asCanvas(H2.makeCanvas()), scene);
    const p0 = { ...cam.position };
    const look = { ...cam._lookAt };
    H2.fire(win, "keydown", H2.key("Equal"));
    H2.tick(scene, 3);
    const d = { x: cam.position.x - p0.x, y: cam.position.y - p0.y, z: cam.position.z - p0.z };
    const len = Math.hypot(d.x, d.y, d.z);
    V2.expect(len).toBeGreaterThan(0);
    V2.expect((d.x * look.x + d.y * look.y + d.z * look.z) / len).toBeCloseTo(1, 9);
    V2.expect(cam.center.x).toBeCloseTo(1000, 9);
});

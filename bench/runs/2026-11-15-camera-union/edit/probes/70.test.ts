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

it("70a: arrows pan the center north (+Z here) / east (-Y here) by radius*0.0015 per frame at the equator", () => {
    let { win, scene, cam } = setup();
    fire(win, "keydown", key("ArrowUp"));
    tick(scene);
    expect(cam.center.z).toBeCloseTo(500 * 0.0015, 4);
    ({ win, scene, cam } = setup());
    fire(win, "keydown", key("ArrowRight"));
    tick(scene);
    expect(cam.center.y).toBeCloseTo(-500 * 0.0015, 4);
    expect(cam.yaw).toBeCloseTo(0, 9);
});

it("70b: with ControlLeft/ControlRight held the arrows rotate; the ctrlKey flag alone does not", () => {
    let { win, scene, cam } = setup();
    fire(win, "keydown", key("ControlLeft"));
    fire(win, "keydown", key("ArrowRight", { ctrlKey: true }));
    tick(scene);
    expect(cam.yaw).toBeCloseTo((6 * Math.PI) / 500, 9);
    expect(cam.center.y).toBeCloseTo(0, 9);
    ({ win, scene, cam } = setup());
    fire(win, "keydown", key("ArrowRight", { ctrlKey: true }));
    tick(scene);
    expect(cam.yaw).toBeCloseTo(0, 9);
    expect(cam.center.y).not.toBeCloseTo(0, 3);
});


import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";


V3.afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

V3.it("70 (after check 3): the pan step is radius*0.0015*min(1, sqrt(cos(lat))*max(1, |center|/h))", () => {
    function step(lat: number, radius: number) {
        const win = H3.makeCanvas();
        (globalThis as Record<string, unknown>).window = win;
        const scene = H3.makeScene();
        const cam = L3.createGeospatialCamera({ planetRadius: 1e6 });
        L3.setGeospatialOrientation(cam, { radius, center: { x: 1e6 * Math.cos(lat), y: 0, z: 1e6 * Math.sin(lat) } });
        L3.attachGeospatialControls(cam, H3.asCanvas(H3.makeCanvas()), scene);
        const c0 = { ...cam.center };
        H3.fire(win, "keydown", H3.key("ArrowRight"));
        H3.tick(scene);
        return Math.hypot(cam.center.x - c0.x, cam.center.y - c0.y, cam.center.z - c0.z) / (radius * 0.0015);
    }
    V3.expect(step(0, 4e6)).toBeCloseTo(1, 3); // equator, far up: full
    V3.expect(step(Math.PI / 3, 4e6)).toBeCloseTo(Math.sqrt(0.5), 3); // 60 degrees, h = 4e6 > |center|
    V3.expect(step(Math.PI / 3, 1e5)).toBeCloseTo(1, 3); // near the ground: full again
});

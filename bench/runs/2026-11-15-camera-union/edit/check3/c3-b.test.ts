import { it, expect, afterEach } from "vitest";
import * as L from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, key, makeScene, tick } from "./helpers";

afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

function geo() {
    const win = makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = makeScene();
    const cam = L.createGeospatialCamera({ planetRadius: 1e6 });
    const c = makeCanvas();
    L.attachGeospatialControls(cam, asCanvas(c), scene);
    return { win, scene, cam, c };
}

function holdEqual(fps: number) {
    const { win, scene, cam } = geo();
    const r0 = cam.radius;
    fire(win, "keydown", key("Equal"));
    tick(scene, fps / 10, 1000 / fps); // a tenth of a second held
    fire(win, "keyup", key("Equal"));
    tick(scene, fps * 5, 1000 / fps);
    expect(cam.radius).toBeGreaterThan(cam.limits.radiusMin * 2);
    return Math.log(r0 / cam.radius);
}

function oneWheel(fps: number) {
    const { scene, cam, c } = geo();
    const r0 = cam.radius;
    fire(c, "wheel", { deltaY: -1, clientX: 400, clientY: 300 });
    tick(scene, fps * 5, 1000 / fps);
    return Math.log(r0 / cam.radius);
}

it("n54: a single wheel step travels about the same at 30 and 60 fps", () => {
    const a = oneWheel(60), b = oneWheel(30);
    console.log("wheel", a, b);
    expect(b / a).toBeGreaterThan(0.9);
    expect(b / a).toBeLessThan(1.1);
});

it("n54: an Equal key held for the same time zooms about half as far at 30 fps as at 60 fps", () => {
    const a = holdEqual(60), b = holdEqual(30);
    console.log("key", a, b);
    expect(a).toBeGreaterThan(0);
    expect(b / a).toBeLessThan(0.7);
});

it("n61: with the eye inside the planet sphere the look ray hits the sphere but no re-centre happens", () => {
    const { win, scene, cam } = geo();
    cam.limits.pitchMin = 0;
    // center well inside the sphere, eye 1000 above it, still inside
    L.setGeospatialOrientation(cam, { radius: 1000, pitch: 0, center: { x: 5e5, y: 0, z: 0 } });
    expect(Math.hypot(cam.position.x, cam.position.y, cam.position.z)).toBeLessThan(1e6);
    fire(win, "keydown", key("ArrowUp"));
    tick(scene);
    fire(win, "keyup", key("ArrowUp"));
    const before = { ...cam.center };
    tick(scene);
    tick(scene);
    // look direction from eye (looking toward origin) – the ray from inside exits the sphere on the far side
    expect(cam.center.x).toBeCloseTo(before.x, 6);
    expect(Math.hypot(cam.center.x, cam.center.y, cam.center.z)).toBeLessThan(1e6);
});

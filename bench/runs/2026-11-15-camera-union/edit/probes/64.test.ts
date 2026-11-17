import { it, expect, afterEach } from "vitest";
import { createGeospatialCamera, attachGeospatialControls, setGeospatialOrientation } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, makeScene, tick } from "./helpers";

afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

function setup(opts?: Parameters<typeof attachGeospatialControls>[3]) {
    (globalThis as Record<string, unknown>).window = makeCanvas();
    const scene = makeScene();
    const cam = createGeospatialCamera({ planetRadius: 1000 });
    setGeospatialOrientation(cam, { radius: 500, pitch: 0.5 });
    const c = makeCanvas();
    attachGeospatialControls(cam, asCanvas(c), scene, opts);
    return { scene, cam, c };
}

const dbl = (fields: Record<string, unknown>) => ({ button: 0, buttons: 0, clientX: 400, clientY: 400, ...fields });

it("64a: a dblclick with button 0 and buttons 0 on the sphere flies center to the hit point over 1000 ms", () => {
    const { scene, cam, c } = setup();
    const c0 = { ...cam.center };
    fire(c, "dblclick", dbl({}));
    tick(scene, 1, 500);
    const mid = { ...cam.center };
    expect(mid).not.toEqual(c0);
    tick(scene, 1, 499);
    const nearly = { ...cam.center };
    tick(scene, 1, 1);
    const end = { ...cam.center };
    expect(end).not.toEqual(nearly);
    tick(scene, 1, 100);
    expect({ ...cam.center }).toEqual(end);
    // the end point is on the sphere of limits.planetRadius
    expect(Math.hypot(end.x, end.y, end.z)).toBeCloseTo(1000, 3);
});

it("64b: doubleTapAnimationDurationMs sets the time; buttons nonzero, another button, or a miss does nothing", () => {
    let s = setup({ doubleTapAnimationDurationMs: 100 });
    fire(s.c, "dblclick", dbl({}));
    tick(s.scene, 1, 100);
    const end = { ...s.cam.center };
    tick(s.scene, 1, 100);
    expect({ ...s.cam.center }).toEqual(end);
    for (const f of [{ buttons: 1 }, { button: 2 }]) {
        s = setup();
        const c0 = { ...s.cam.center };
        fire(s.c, "dblclick", dbl(f));
        tick(s.scene, 3, 100);
        expect({ ...s.cam.center }).toEqual(c0);
    }
    // a miss: low down, looking at the horizon, the top of the screen is sky
    s = setup();
    setGeospatialOrientation(s.cam, { radius: 50, pitch: 1.5 });
    const c1 = { ...s.cam.center };
    fire(s.c, "dblclick", dbl({ clientY: 0 }));
    tick(s.scene, 3, 500);
    expect({ ...s.cam.center }).toEqual(c1);
});

it("64c: picks against a sphere of limits.planetRadius at the origin, with no mesh in the scene", () => {
    const s = setup();
    fire(s.c, "dblclick", dbl({}));
    tick(s.scene, 1, 1000);
    const e = s.cam.center;
    expect(Math.hypot(e.x, e.y, e.z)).toBeCloseTo(1000, 3);
    const s2 = setup();
    s2.cam.limits.planetRadius = 990;
    fire(s2.c, "dblclick", dbl({}));
    tick(s2.scene, 1, 1000);
    const e2 = s2.cam.center;
    expect(Math.hypot(e2.x, e2.y, e2.z)).toBeCloseTo(990, 3);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

it("64d (after check): the pick ignores scene meshes: a mesh-like object in scene.meshes changes nothing", () => {
    const run = (withMesh: boolean) => {
        (globalThis as Record<string, unknown>).window = H.makeCanvas();
        const scene = H.makeScene();
        if (withMesh) (scene.meshes as unknown[]).push({ name: "blocker", isPickable: true, isVisible: true, _gpu: {}, material: {}, worldMatrix: new Float32Array([1,0,0,0,0,1,0,0,0,0,1,0,1200,0,0,1]) });
        const cam = L.createGeospatialCamera({ planetRadius: 1000 });
        L.setGeospatialOrientation(cam, { radius: 500, pitch: 0.5 });
        const c = H.makeCanvas();
        L.attachGeospatialControls(cam, H.asCanvas(c), scene);
        H.fire(c, "dblclick", { button: 0, buttons: 0, clientX: 400, clientY: 400 });
        H.tick(scene, 1, 2000);
        return { ...cam.center };
    };
    const a = run(false), b = run(true);
    expect(b).toEqual(a);
    expect(Math.hypot(b.x, b.y, b.z)).toBeCloseTo(1000, 3);
});

import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl, disposeScene, onSceneDispose } from "@babylonjs/lite";
import { makeCanvas, asCanvas, makeScene, listenerCount } from "./helpers";

it("25a: disposeScene leaves attachControl's canvas listeners; the returned function removes them", () => {
    const scene = makeScene();
    const c = makeCanvas();
    const detach = attachControl(createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 }), asCanvas(c), scene);
    const n = listenerCount(c);
    expect(n).toBeGreaterThan(0);
    disposeScene(scene);
    expect(listenerCount(c)).toBe(n);
    detach();
    expect(listenerCount(c)).toBe(0);
});

it("25b: registered with onSceneDispose, disposeScene does remove them", () => {
    const scene = makeScene();
    const c = makeCanvas();
    onSceneDispose(scene, attachControl(createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 }), asCanvas(c), scene));
    disposeScene(scene);
    expect(listenerCount(c)).toBe(0);
});

import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

V2.afterEach(() => { delete (globalThis as Record<string, unknown>).window; });

V2.it("25 (after check 2): disposeScene leaves the listeners of the free, configurable and geospatial controls too; their functions or onSceneDispose remove them", () => {
    const win = H2.makeCanvas();
    (globalThis as Record<string, unknown>).window = win;
    const scene = H2.makeScene();
    const c1 = H2.makeCanvas(), c2 = H2.makeCanvas(), c3 = H2.makeCanvas();
    const d1 = L2.attachFreeControl(L2.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }), H2.asCanvas(c1), scene);
    const d2 = L2.attachConfigurableFreeControl(L2.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }), H2.asCanvas(c2), scene);
    const d3 = L2.attachGeospatialControls(L2.createGeospatialCamera({ planetRadius: 1000 }), H2.asCanvas(c3), scene);
    const n = [c1, c2, c3, win].map(H2.listenerCount);
    V2.expect(n.every((x) => x > 0)).toBe(true);
    L2.disposeScene(scene);
    V2.expect([c1, c2, c3, win].map(H2.listenerCount)).toEqual(n);
    d1(); d2(); d3();
    V2.expect([c1, c2, c3, win].map(H2.listenerCount)).toEqual([0, 0, 0, 0]);

    const s2 = H2.makeScene();
    const g = H2.makeCanvas(), f = H2.makeCanvas();
    L2.onSceneDispose(s2, L2.attachGeospatialControls(L2.createGeospatialCamera({ planetRadius: 1000 }), H2.asCanvas(g), s2));
    L2.onSceneDispose(s2, L2.attachFreeControl(L2.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 }), H2.asCanvas(f), s2));
    L2.disposeScene(s2);
    V2.expect([g, f, win].map(H2.listenerCount)).toEqual([0, 0, 0]);
});

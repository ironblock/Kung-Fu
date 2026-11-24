import { it, expect } from "vitest";
import { createFreeCamera, attachFreeControl, attachConfigurableFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, key, makeScene, tick } from "./helpers";

it("11a: createFreeCamera sets _yaw = atan2(dx, dz) and _pitch from the start direction", () => {
    expect(createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 })._yaw).toBe(0);
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 1, y: 1, z: 0 });
    expect(cam._yaw).toBeCloseTo(Math.PI / 2, 12);
    expect(cam._pitch).toBeCloseTo(Math.PI / 4, 12);
});

for (const attach of [attachFreeControl, attachConfigurableFreeControl]) {
    it(`07b: ${attach.name}: a hand-set target is replaced 1 unit ahead along _yaw/_pitch on the next key move`, () => {
        const scene = makeScene();
        const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const c = makeCanvas();
        attach(cam, asCanvas(c), scene);
        cam.target.set(10, 0, 0);
        tick(scene, 2);
        expect(cam.target.x).toBe(10); // no input: kept
        fire(c, "keydown", key("KeyW"));
        tick(scene);
        fire(c, "keyup", key("KeyW"));
        expect(cam.target.x).toBeCloseTo(cam.position.x, 9);
        expect(cam.target.z - cam.position.z).toBeCloseTo(1, 9);
    });

    it(`07c: ${attach.name}: writing _yaw changes the view only at the next rebuild (a drag here)`, () => {
        const scene = makeScene();
        const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        const c = makeCanvas();
        attach(cam, asCanvas(c), scene);
        const w0 = Array.from(cam.worldMatrix);
        cam._yaw = Math.PI / 2;
        expect(Array.from(cam.worldMatrix)).toEqual(w0);
        tick(scene);
        expect(cam.target.z).toBe(10);
        fire(c, "pointerdown", pointer({ clientX: 0 }));
        fire(c, "pointermove", pointer({ clientX: 1 }));
        tick(scene);
        expect(cam.target.x).toBeCloseTo(1, 3);
        expect(cam.target.z).toBeCloseTo(0, 3);
    });
}

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("11 (after check 3): with no scene a drag and keys change neither _yaw nor target", () => {
    const cam = L3.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 5 });
    const c = H3.makeCanvas();
    L3.attachFreeControl(cam, H3.asCanvas(c));
    H3.fire(c, "pointerdown", H3.pointer({ clientX: 0 }));
    H3.fire(c, "pointermove", H3.pointer({ clientX: 300 }));
    H3.fire(c, "keydown", H3.key("KeyW"));
    V3.expect(cam._yaw).toBe(0);
    V3.expect(cam.target.z).toBe(5);
});

V3.it("11 (after check 3): a glide frame after release also replaces a hand-set target", () => {
    const scene = H3.makeScene();
    const cam = L3.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    const c = H3.makeCanvas();
    L3.attachFreeControl(cam, H3.asCanvas(c), scene);
    H3.fire(c, "keydown", H3.key("KeyW"));
    H3.tick(scene);
    H3.fire(c, "keyup", H3.key("KeyW"));
    cam.target.set(50, 0, 0);
    H3.tick(scene); // no key held, velocity still non-zero
    V3.expect(cam.target.x).toBeCloseTo(cam.position.x, 6);
    V3.expect(cam.target.z).toBeCloseTo(cam.position.z + 1, 6);
});

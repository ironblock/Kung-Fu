import { it, expect } from "vitest";
import { createFreeCamera, attachFreeControl, attachConfigurableFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

for (const attach of [attachFreeControl, attachConfigurableFreeControl]) {
    it(`34: ${attach.name}: a held key adds speed*max(deltaMs,1)/sqrt(100000) per frame; the velocity decays by inertia per frame`, () => {
        const run = (deltas: number[], hold: number) => {
            const scene = makeScene();
            const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
            cam.speed = 3;
            const c = makeCanvas();
            attach(cam, asCanvas(c), scene);
            fire(c, "keydown", key("KeyW"));
            const zs: number[] = [];
            deltas.forEach((d, i) => {
                if (i === hold) fire(c, "keyup", key("KeyW"));
                tick(scene, 1, d);
                zs.push(cam.position.z);
            });
            return zs;
        };
        const k = 3 / Math.sqrt(100000);
        expect(run([16], 99)[0]).toBeCloseTo(16 * k, 12);
        expect(run([40], 99)[0]).toBeCloseTo(40 * k, 12);
        expect(run([0], 99)[0]).toBeCloseTo(1 * k, 12);
        // released after one frame: glides by inertia (0.9) per frame whatever the delta
        const g = run([16, 100, 100], 1);
        expect(g[1] - g[0]).toBeCloseTo(16 * k * 0.9, 12);
        expect(g[2] - g[1]).toBeCloseTo(16 * k * 0.81, 12);
    });
}

it("39b: the velocity is zeroed once it falls below speed*0.001", () => {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    const c = makeCanvas();
    attachFreeControl(cam, asCanvas(c), scene);
    fire(c, "keydown", key("KeyW"));
    tick(scene);
    fire(c, "keyup", key("KeyW"));
    tick(scene, 200);
    const z = cam.position.z;
    tick(scene);
    expect(cam.position.z).toBe(z);
    // the last step taken was not below speed*0.001
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

it("39c (after check): a held fastKeys key multiplies the step by fastMultiplier; with the default 1 it does nothing", () => {
    for (const [mult, want] of [[3, 3], [undefined, 1]] as const) {
        const scene = H.makeScene();
        const cam = L.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        const c = H.makeCanvas();
        L.attachConfigurableFreeControl(cam, H.asCanvas(c), scene, { fastKeys: ["KeyF"], ...(mult ? { fastMultiplier: mult } : {}) });
        H.fire(c, "keydown", H.key("KeyW"));
        H.fire(c, "keydown", H.key("KeyF"));
        H.tick(scene, 1, 16);
        expect(cam.position.z).toBeCloseTo(want * 2 * 16 / Math.sqrt(100000), 12);
    }
});

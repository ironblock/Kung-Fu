import { it, expect } from "vitest";
import { createFreeCamera, attachFreeControl, attachConfigurableFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

function setup(attach = attachFreeControl) {
    const scene = makeScene();
    const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    const c = makeCanvas();
    attach(cam, asCanvas(c), scene);
    return { scene, cam, c };
}

for (const attach of [attachFreeControl, attachConfigurableFreeControl]) {
    it(`46a: ${attach.name}: buttons 0, 1 and 2 all turn; right drag turns right, down drag looks down; no pointer lock`, () => {
        for (const button of [0, 1, 2]) {
            const { scene, cam, c } = setup(attach);
            expect((c as unknown as Record<string, unknown>).requestPointerLock).toBeUndefined();
            fire(c, "pointerdown", pointer({ button, clientX: 0, clientY: 0 }));
            fire(c, "pointermove", pointer({ button, clientX: 200, clientY: 100 }));
            tick(scene);
            expect(cam._yaw).toBeCloseTo(200 / 2000, 12);
            expect(cam._pitch).toBeCloseTo(-100 / 2000, 12);
            expect(cam.target.x).toBeGreaterThan(0);
            expect(cam.target.y).toBeLessThan(0);
        }
    });
}

it("51b: the turn coasts, times inertia each frame; pitch is clamped to +-(PI/2-0.01)", () => {
    const { scene, cam, c } = setup();
    fire(c, "pointerdown", pointer({ clientX: 0 }));
    fire(c, "pointermove", pointer({ clientX: 200 }));
    fire(c, "pointerup", pointer());
    tick(scene, 2);
    expect(cam._yaw).toBeCloseTo(0.1 + 0.09, 12);
    const s2 = setup();
    fire(s2.c, "pointerdown", pointer({ clientY: 0 }));
    fire(s2.c, "pointermove", pointer({ clientY: 100000 }));
    tick(s2.scene);
    expect(s2.cam._pitch).toBeCloseTo(-(Math.PI / 2 - 0.01), 12);
});

it("51c: the glide stops once the decayed turn falls below speed*0.001", () => {
    const glide = (px: number) => {
        const { scene, cam, c } = setup();
        cam.speed = 1000;
        fire(c, "pointerdown", pointer({ clientX: 0 }));
        fire(c, "pointermove", pointer({ clientX: px }));
        tick(scene);
        const y = cam._yaw;
        tick(scene);
        return cam._yaw - y;
    };
    expect(glide(200)).toBe(0);
    expect(glide(3000)).toBeGreaterThan(0);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";
import * as V from "vitest";

it("51c (after check): _pitch is clamped only on frames with a turn", () => {
    const scene = H.makeScene();
    const cam = L.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 10, z: 0 });
    expect(cam._pitch).toBeCloseTo(Math.PI / 2, 12);
    const c = H.makeCanvas();
    L.attachFreeControl(cam, H.asCanvas(c), scene);
    H.fire(c, "keydown", H.key("KeyW"));
    H.tick(scene, 3);
    expect(cam._pitch).toBeCloseTo(Math.PI / 2, 12);
    const w = cam.worldMatrix;
    expect([w[0], w[5], w[10]]).toEqual([1, 1, 1]);
    cam._pitch = 3;
    H.tick(scene);
    expect(cam._pitch).toBe(3);
    H.fire(c, "pointerdown", H.pointer());
    H.fire(c, "pointermove", H.pointer({ clientX: 20 }));
    H.tick(scene);
    expect(cam._pitch).toBeCloseTo(Math.PI / 2 - 0.01, 12);
});

it("51d (after check): the turn cut-off is camera.speed*0.001: at speed 1000 a 200 px drag turns once, no glide", () => {
    const yaws = (speed: number) => {
        const scene = H.makeScene();
        const cam = L.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        cam.speed = speed;
        const c = H.makeCanvas();
        L.attachFreeControl(cam, H.asCanvas(c), scene);
        H.fire(c, "pointerdown", H.pointer());
        H.fire(c, "pointermove", H.pointer({ clientX: 200 }));
        H.fire(c, "pointerup", H.pointer({ clientX: 200 }));
        const out: number[] = [];
        for (let i = 0; i < 3; i++) { H.tick(scene); out.push(cam._yaw); }
        return out;
    };
    const fast = yaws(1000);
    expect(fast[0]).toBeCloseTo(0.1, 12);
    expect(fast[1]).toBe(fast[0]);
    const slow = yaws(2);
    expect(slow[1]).toBeGreaterThan(slow[0]!);
    expect(slow[2]).toBeGreaterThan(slow[1]!);
});

import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

V2.it("51 (after check 2): attachConfigurableFreeControl turns on a drag exactly as attachFreeControl does", () => {
    const run = (attach: typeof L2.attachFreeControl, button: number) => {
        const scene = H2.makeScene();
        const cam = L2.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        const c = H2.makeCanvas();
        attach(cam, H2.asCanvas(c), scene);
        H2.fire(c, "pointerdown", H2.pointer({ button, clientX: 0, clientY: 0 }));
        H2.fire(c, "pointermove", H2.pointer({ button, clientX: 300, clientY: 4000 }));
        const out: number[] = [];
        for (let i = 0; i < 5; i++) { H2.tick(scene); out.push(cam._yaw, cam._pitch); }
        return out;
    };
    for (const b of [0, 1, 2]) {
        const a = run(L2.attachFreeControl, b);
        V2.expect(a[0]).toBeGreaterThan(0);
        V2.expect(a[1]).toBeCloseTo(-(Math.PI / 2 - 0.01), 12);
        V2.expect(run(L2.attachConfigurableFreeControl, b)).toEqual(a);
    }
});

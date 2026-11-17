import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

it("44a: a rotate drag subtracts dx/angularSensibility and dy/angularSensibility", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c));
    fire(c, "pointerdown", pointer({ clientX: 0, clientY: 0 }));
    fire(c, "pointermove", pointer({ clientX: 100, clientY: 50 }));
    expect(cam.inertialAlphaOffset).toBeCloseTo(-0.1, 12);
    expect(cam.inertialBetaOffset).toBeCloseTo(-0.05, 12);
});

it("44b: each frame adds the whole offset, then multiplies by inertia; pan decays by panningInertia", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    attachControl(cam, asCanvas(makeCanvas()), scene);
    cam.inertia = 0.5;
    cam.inertialAlphaOffset = 0.2;
    cam.inertialRadiusOffset = 1;
    tick(scene);
    expect(cam.alpha).toBeCloseTo(1.2, 12);
    expect(cam.radius).toBeCloseTo(9, 12);
    expect(cam.inertialAlphaOffset).toBeCloseTo(0.1, 12);
    expect(cam.inertialRadiusOffset).toBeCloseTo(0.5, 12);
});

it("44c: inertia 0 stops rotation and zoom after one frame but not a pan", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    attachControl(cam, asCanvas(makeCanvas()), scene);
    cam.inertia = 0;
    cam.inertialAlphaOffset = 0.2;
    cam.inertialRadiusOffset = 1;
    cam.inertialPanningX = 1;
    tick(scene);
    expect(cam.inertialAlphaOffset).toBe(0);
    expect(cam.inertialRadiusOffset).toBe(0);
    expect(cam.inertialPanningX).toBeCloseTo(0.9, 12);
    const a = cam.alpha, r = cam.radius, tx = cam.target.x;
    tick(scene);
    expect(cam.alpha).toBe(a);
    expect(cam.radius).toBe(r);
    expect(cam.target.x).not.toBe(tx);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";


type Lite3 = typeof import("@babylonjs/lite");
async function load3(rightHanded: boolean): Promise<Lite3> {
    V3.vi.resetModules();
    V3.vi.doUnmock("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system.ts");
    if (rightHanded) {
        V3.vi.doMock("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system.ts", () => import("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system-rh.ts"));
    }
    return (await import("@babylonjs/lite")) as Lite3;
}

V3.it("44 (after check 3): the frame step adds inertialAlphaOffset to alpha, negated in a right-handed build", async () => {
    for (const rh of [false, true]) {
        const F = await load3(rh);
        const scene = H3.makeScene();
        const cam = F.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        F.attachControl(cam, H3.asCanvas(H3.makeCanvas()), scene);
        cam.inertialAlphaOffset = 0.1;
        cam.inertialBetaOffset = 0.1;
        H3.tick(scene);
        V3.expect(cam.alpha).toBeCloseTo(rh ? 0.9 : 1.1, 9);
        V3.expect(cam.beta).toBeCloseTo(1.1, 9);
    }
});

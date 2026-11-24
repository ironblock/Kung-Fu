import { it, expect, vi } from "vitest";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

type Lite = typeof import("@babylonjs/lite");

async function load(rightHanded: boolean): Promise<Lite> {
    vi.resetModules();
    vi.doUnmock("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system.ts");
    if (rightHanded) {
        // what the "babylon-lite-rh" build condition selects
        vi.doMock("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system.ts", () => import("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system-rh.ts"));
    }
    return (await import("@babylonjs/lite")) as Lite;
}

function arcDrag(L: Lite, button: number) {
    const cam = L.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const scene = makeScene();
    const c = makeCanvas();
    L.attachControl(cam, asCanvas(c), scene);
    const P = { x: 1, y: 0.5, z: -1 };
    const opts = { viewport: { x: 0, y: 0, width: 800, height: 600 }, backingWidth: 800, backingHeight: 600 };
    const sx = () => L.projectWorldToScreen(P, L.getViewMatrix(cam), L.getViewProjectionMatrix(cam, 800 / 600), opts).x;
    const x0 = sx();
    fire(c, "pointerdown", pointer({ button, buttons: button === 2 ? 2 : 1, clientX: 0 }));
    fire(c, "pointermove", pointer({ button, buttons: button === 2 ? 2 : 1, clientX: 100 }));
    tick(scene);
    return { dAlpha: cam.alpha - 1, target: { x: cam.target.x, z: cam.target.z }, dScreen: sx() - x0 };
}

function freeDrag(L: Lite) {
    const cam = L.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    const scene = makeScene();
    const c = makeCanvas();
    L.attachFreeControl(cam, asCanvas(c), scene);
    fire(c, "pointerdown", pointer({ clientX: 0 }));
    fire(c, "pointermove", pointer({ clientX: 100 }));
    tick(scene);
    return cam._yaw;
}

it("75: in the right-handed build the controls flip alpha/yaw and horizontal pan, so the screen motion is the same", async () => {
    const LH = await load(false);
    const lRot = arcDrag(LH, 0);
    const lPan = arcDrag(LH, 2);
    const lYaw = freeDrag(LH);
    const RH = await load(true);
    const rRot = arcDrag(RH, 0);
    const rPan = arcDrag(RH, 2);
    const rYaw = freeDrag(RH);
    expect(rRot.dAlpha).toBeCloseTo(-lRot.dAlpha, 12);
    expect(lRot.dAlpha).not.toBe(0);
    expect(rYaw).toBeCloseTo(-lYaw, 12);
    expect(rPan.target.x).toBeCloseTo(-lPan.target.x, 12);
    expect(rPan.target.z).toBeCloseTo(-lPan.target.z, 12);
    expect(Math.sign(rRot.dScreen)).toBe(Math.sign(lRot.dScreen));
    expect(Math.sign(rPan.dScreen)).toBe(Math.sign(lPan.dScreen));
    expect(Math.abs(lRot.dScreen)).toBeGreaterThan(1);
    expect(Math.abs(lPan.dScreen)).toBeGreaterThan(1);
});

import * as V2 from "vitest";
import * as H2 from "./helpers";

type Lite2 = typeof import("@babylonjs/lite");

async function load2(rightHanded: boolean): Promise<Lite2> {
    V2.vi.resetModules();
    V2.vi.doUnmock("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system.ts");
    if (rightHanded) {
        V2.vi.doMock("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system.ts", () => import("../../babylon-lite/packages/babylon-lite/src/engine/coordinate-system-rh.ts"));
    }
    return (await import("@babylonjs/lite")) as Lite2;
}

const opts2 = { viewport: { x: 0, y: 0, width: 800, height: 600 }, backingWidth: 800, backingHeight: 600 };

function arcKeys(L: Lite2, ctrl: boolean) {
    L.enableArcRotateKeyboardControls();
    const scene = H2.makeScene();
    const cam = L.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c = H2.makeCanvas();
    L.attachControl(cam, H2.asCanvas(c), scene, { keyboard: true });
    const P = { x: 1, y: 0.5, z: -1 };
    const sx = () => L.projectWorldToScreen(P, L.getViewMatrix(cam), L.getViewProjectionMatrix(cam, 800 / 600), opts2).x;
    const x0 = sx();
    H2.fire(c, "keydown", H2.key("ArrowRight", { ctrlKey: ctrl }));
    H2.tick(scene);
    return { dAlpha: cam.alpha - 1, tx: cam.target.x, tz: cam.target.z, dScreen: sx() - x0 };
}

function freeCam(L: Lite2, attach: "attachFreeControl" | "attachConfigurableFreeControl") {
    const scene = H2.makeScene();
    const cam = L.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 1 });
    const yaw0 = cam._yaw;
    const c = H2.makeCanvas();
    L[attach](cam, H2.asCanvas(c), scene);
    const P = { x: 2, y: 0, z: 3 };
    const sx = () => L.projectWorldToScreen(P, L.getViewMatrix(cam), L.getViewProjectionMatrix(cam, 800 / 600), opts2).x;
    const x0 = sx();
    H2.fire(c, "pointerdown", H2.pointer({ clientX: 0 }));
    H2.fire(c, "pointermove", H2.pointer({ clientX: 100 }));
    H2.fire(c, "pointerup", H2.pointer());
    H2.tick(scene);
    const dYaw = cam._yaw - yaw0;
    const dScreen = sx() - x0;
    // a forward key at _yaw 0
    const cam2 = L.createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    const c2 = H2.makeCanvas();
    L[attach](cam2, H2.asCanvas(c2), scene);
    H2.fire(c2, "keydown", H2.key("KeyW"));
    H2.tick(scene);
    return { yaw0, dYaw, dScreen, fwd: [cam2.position.x, cam2.position.z] };
}

V2.it("75 (after check 2): in the right-handed build keys flip like drags; both free controls flip the drag's _yaw step; _yaw = atan2(dx, dz) still", async () => {
    const LH = await load2(false);
    const lRot = arcKeys(LH, false), lPan = arcKeys(LH, true);
    const lF = freeCam(LH, "attachFreeControl"), lC = freeCam(LH, "attachConfigurableFreeControl");
    const RH = await load2(true);
    const rRot = arcKeys(RH, false), rPan = arcKeys(RH, true);
    const rF = freeCam(RH, "attachFreeControl"), rC = freeCam(RH, "attachConfigurableFreeControl");
    V2.expect(lRot.dAlpha).toBeCloseTo(0.01, 12);
    V2.expect(rRot.dAlpha).toBeCloseTo(-0.01, 12);
    V2.expect(rPan.tx).toBeCloseTo(-lPan.tx, 12);
    V2.expect(rPan.tz).toBeCloseTo(-lPan.tz, 12);
    V2.expect(Math.sign(rRot.dScreen)).toBe(Math.sign(lRot.dScreen));
    V2.expect(Math.sign(rPan.dScreen)).toBe(Math.sign(lPan.dScreen));
    for (const [l, r] of [[lF, rF], [lC, rC]]) {
        V2.expect(l.yaw0).toBeCloseTo(Math.PI / 4, 12);
        V2.expect(r.yaw0).toBeCloseTo(Math.PI / 4, 12);
        V2.expect(r.dYaw).toBeCloseTo(-l.dYaw, 12);
        V2.expect(l.dYaw).not.toBe(0);
        V2.expect(Math.sign(r.dScreen)).toBe(Math.sign(l.dScreen));
        V2.expect(Math.abs(l.dScreen)).toBeGreaterThan(1);
        V2.expect(l.fwd[0]).toBe(0);
        V2.expect(r.fwd[0]).toBe(0);
        V2.expect(l.fwd[1]).toBeGreaterThan(0);
        V2.expect(r.fwd[1]).toBeGreaterThan(0);
    }
});

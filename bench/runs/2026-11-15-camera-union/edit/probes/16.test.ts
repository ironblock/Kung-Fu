import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick } from "./helpers";

it("16a: keyboard is ignored before enableArcRotateKeyboardControls", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene, { keyboard: true });
    expect(c.listeners.get("keydown") ?? []).toHaveLength(0);
    expect(c.tabIndex).toBe(-1);
    fire(c, "keydown", key("ArrowRight"));
    tick(scene);
    expect(cam.alpha).toBe(0);
});

it("16b: after it, keys are heard on the canvas by code; tabIndex 0 unless a tabindex attribute exists; blur clears held keys", () => {
    enableArcRotateKeyboardControls();
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene, { keyboard: true });
    expect(c.tabIndex).toBe(0);
    fire(c, "keydown", { ...key("ArrowRight"), key: "x" });
    tick(scene);
    expect(cam.alpha).toBeGreaterThan(0);
    fire(c, "blur");
    cam.inertialAlphaOffset = 0;
    const a = cam.alpha;
    tick(scene, 3);
    expect(cam.alpha).toBe(a);

    const c2 = makeCanvas();
    c2.setAttribute("tabindex", "-1");
    attachControl(createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 }), asCanvas(c2), scene, { keyboard: true });
    expect(c2.tabIndex).toBe(-1);
});

it("16c: a custom list replaces that direction's arrow only", () => {
    enableArcRotateKeyboardControls();
    const scene = makeScene();
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene, { keyboard: { keys: { right: ["KeyD"] } } });
    fire(c, "keydown", key("ArrowRight"));
    tick(scene);
    expect(cam.alpha).toBe(0);
    fire(c, "keyup", key("ArrowRight"));
    fire(c, "keydown", key("KeyD"));
    tick(scene);
    expect(cam.alpha).toBeGreaterThan(0);
    fire(c, "keyup", key("KeyD"));
    fire(c, "keydown", key("ArrowLeft"));
    cam.inertialAlphaOffset = 0;
    const a = cam.alpha;
    tick(scene);
    expect(cam.alpha).toBeLessThan(a);
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

V3.it("16 (after check 3): enabling after attachControl does nothing for it; keyboard omitted means no keys", async () => {
    const L3 = await load3(false); // a module where the keyboard was never enabled
    const scene = H3.makeScene();
    const c = H3.makeCanvas();
    const cam = L3.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    L3.attachControl(cam, H3.asCanvas(c), scene, { keyboard: true });
    L3.enableArcRotateKeyboardControls();
    H3.fire(c, "keydown", H3.key("ArrowRight"));
    H3.tick(scene);
    V3.expect(cam.alpha).toBe(0);
    const c2 = H3.makeCanvas();
    const cam2 = L3.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    L3.attachControl(cam2, H3.asCanvas(c2), scene);
    H3.fire(c2, "keydown", H3.key("ArrowRight"));
    H3.tick(scene);
    V3.expect(cam2.alpha).toBe(0);
    const c3 = H3.makeCanvas();
    const cam3 = L3.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    L3.attachControl(cam3, H3.asCanvas(c3), scene, { keyboard: true });
    H3.fire(c3, "keydown", H3.key("ArrowRight"));
    H3.tick(scene);
    V3.expect(cam3.alpha).not.toBe(0);
});

import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

it("29: right drag pan offsets, then target moves offset*radius/1000 along the right vector, decaying by panningInertia", () => {
    const scene = makeScene();
    const alpha = 0.7, beta = 1.1, radius = 20;
    const cam = createArcRotateCamera(alpha, beta, radius, { x: 0, y: 0, z: 0 });
    cam.panningInertia = 0.5;
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene);
    fire(c, "pointerdown", pointer({ button: 2, buttons: 2, clientX: 0, clientY: 0 }));
    fire(c, "pointermove", pointer({ button: 2, buttons: 2, clientX: 100, clientY: 0 }));
    expect(cam.inertialPanningX).toBeCloseTo(-100 / 50, 12);
    expect(cam.inertialPanningY).toBe(0);
    tick(scene);
    const k = (-2 * radius) / 1000;
    expect(cam.target.x).toBeCloseTo(-Math.sin(alpha) * k, 9);
    expect(cam.target.y).toBeCloseTo(0, 12);
    expect(cam.target.z).toBeCloseTo(Math.cos(alpha) * k, 9);
    expect(cam.inertialPanningX).toBeCloseTo(-1, 12);
    // the right vector really is the camera's screen right (world matrix column 0)
    const w = cam.worldMatrix;
    expect(w[0]).toBeCloseTo(-Math.sin(alpha), 5);
    expect(w[2]).toBeCloseTo(Math.cos(alpha), 5);
    fire(c, "pointermove", pointer({ button: 2, buttons: 2, clientX: 100, clientY: 50 }));
    expect(cam.inertialPanningY).toBeCloseTo(1, 12); // +dy/panningSensibility
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

V3.it("29 (after check 3): a right drag pans only by default; a left drag mapped to pan adds the same", () => {
    function drag(button: number, opts?: Parameters<typeof L3.attachControl>[3]) {
        const cam = L3.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const c = H3.makeCanvas();
        L3.attachControl(cam, H3.asCanvas(c), undefined, opts);
        H3.fire(c, "pointerdown", H3.pointer({ button, buttons: button === 2 ? 2 : 1, clientX: 0, clientY: 0 }));
        H3.fire(c, "pointermove", H3.pointer({ button, buttons: button === 2 ? 2 : 1, clientX: 100, clientY: 50 }));
        return cam;
    }
    const r = drag(2, { pointerMappings: { secondaryButton: "rotate" } });
    V3.expect(r.inertialPanningX).toBe(0);
    const l = drag(0, { pointerMappings: { primaryButton: "pan" } });
    V3.expect(l.inertialPanningX).toBeCloseTo(-100 / 50, 9);
    V3.expect(l.inertialPanningY).toBeCloseTo(50 / 50, 9);
});

V3.it("29 (after check 3): in a right-handed build the X pan goes along the negated vector", async () => {
    for (const rh of [false, true]) {
        const F = await load3(rh);
        const scene = H3.makeScene();
        const cam = F.createArcRotateCamera(0.3, 1, 10, { x: 0, y: 0, z: 0 });
        F.attachControl(cam, H3.asCanvas(H3.makeCanvas()), scene);
        cam.inertialPanningX = 1;
        H3.tick(scene);
        const s = rh ? -1 : 1;
        V3.expect(cam.target.x).toBeCloseTo(s * -Math.sin(0.3) * 0.01, 9);
        V3.expect(cam.target.z).toBeCloseTo(s * Math.cos(0.3) * 0.01, 9);
    }
});

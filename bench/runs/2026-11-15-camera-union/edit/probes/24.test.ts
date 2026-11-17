import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer } from "./helpers";

function drag(fields: Record<string, unknown>, opts?: Parameters<typeof attachControl>[3]) {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), undefined, opts);
    fire(c, "pointerdown", pointer({ ...fields, clientX: 0, clientY: 0 }));
    fire(c, "pointermove", pointer({ ...fields, clientX: 50, clientY: 20 }));
    return cam;
}

it("24: only buttons 0 and 2 act; Ctrl+left rotates; mappings cover mouse and pen, not touch", () => {
    const mid = drag({ button: 1, buttons: 4 });
    expect([mid.inertialAlphaOffset, mid.inertialPanningX]).toEqual([0, 0]);
    const ctrl = drag({ button: 0, ctrlKey: true });
    expect(ctrl.inertialAlphaOffset).not.toBe(0);
    expect(ctrl.inertialPanningX).toBe(0);
    const right = drag({ button: 2, buttons: 2 });
    expect(right.inertialPanningX).not.toBe(0);
    const map = { pointerMappings: { primaryButton: "pan" as const, secondaryButton: "rotate" as const } };
    const pen = drag({ button: 0, pointerType: "pen" }, map);
    expect(pen.inertialPanningX).not.toBe(0);
    expect(pen.inertialAlphaOffset).toBe(0);
    const pen2 = drag({ button: 2, pointerType: "pen" }, map);
    expect(pen2.inertialAlphaOffset).not.toBe(0);
    const touch = drag({ button: 0, pointerType: "touch" }, map);
    expect(touch.inertialAlphaOffset).not.toBe(0);
    expect(touch.inertialPanningX).toBe(0);
});

import * as L2 from "@babylonjs/lite";
import * as H2 from "./helpers";
import * as V2 from "vitest";

V2.it("24 (after check 2): while two touches are down, touch pointer moves do not rotate; the pinch only zooms", () => {
    const cam = L2.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c = H2.makeCanvas();
    L2.attachControl(cam, H2.asCanvas(c));
    H2.fire(c, "pointerdown", H2.pointer({ pointerType: "touch", clientX: 100, clientY: 0 }));
    H2.fire(c, "touchstart", H2.touches([1, 100, 0]));
    H2.fire(c, "pointermove", H2.pointer({ pointerType: "touch", clientX: 120, clientY: 0 }));
    V2.expect(cam.inertialAlphaOffset).not.toBe(0); // one finger rotates
    cam.inertialAlphaOffset = 0;
    H2.fire(c, "touchstart", H2.touches([2, 300, 0]));
    H2.fire(c, "pointermove", H2.pointer({ pointerType: "touch", clientX: 200, clientY: 50 }));
    H2.fire(c, "touchmove", H2.touches([2, 500, 0]));
    V2.expect(cam.inertialAlphaOffset).toBe(0);
    V2.expect(cam.inertialBetaOffset).toBe(0);
    V2.expect(cam.radius).not.toBe(10);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("24 (after check 3): rotate and pan on buttons 0 and 2 are defaults: pointerMappings can swap them", () => {
    function drag(button: number, opts?: Parameters<typeof L3.attachControl>[3]) {
        const cam = L3.createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const c = H3.makeCanvas();
        L3.attachControl(cam, H3.asCanvas(c), undefined, opts);
        H3.fire(c, "pointerdown", H3.pointer({ button, buttons: button === 2 ? 2 : 1, clientX: 0 }));
        H3.fire(c, "pointermove", H3.pointer({ button, buttons: button === 2 ? 2 : 1, clientX: 50 }));
        return cam;
    }
    const l = drag(0, { pointerMappings: { primaryButton: "pan" } });
    V3.expect(l.inertialAlphaOffset).toBe(0);
    V3.expect(l.inertialPanningX).not.toBe(0);
    const r = drag(2, { pointerMappings: { secondaryButton: "rotate" } });
    V3.expect(r.inertialAlphaOffset).not.toBe(0);
    V3.expect(r.inertialPanningX).toBe(0);
});

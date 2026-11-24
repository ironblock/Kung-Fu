import { expect, test } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer } from "./helpers";

test("pointer: button 1 does nothing, ctrl+left rotates (no pan), touch always rotates whatever the mapping", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const canvas = makeCanvas();
    attachControl(cam, asCanvas(canvas), undefined, { pointerMappings: { primaryButton: "pan" } });
    fire(canvas, "pointerdown", pointer({ button: 1 }));
    fire(canvas, "pointermove", pointer({ button: 1, clientX: 30, clientY: 30 }));
    expect([cam.inertialAlphaOffset, cam.inertialBetaOffset, cam.inertialPanningX, cam.inertialPanningY]).toEqual([0, 0, 0, 0]);
    fire(canvas, "pointerup", pointer({ button: 1 }));

    fire(canvas, "pointerdown", pointer({ button: 0, pointerType: "touch", clientX: 0, clientY: 0 }));
    fire(canvas, "pointermove", pointer({ pointerType: "touch", clientX: 10, clientY: 0 }));
    expect(cam.inertialAlphaOffset).toBeCloseTo(-0.01);
    expect(cam.inertialPanningX).toBe(0);
    fire(canvas, "pointerup", pointer());

    const cam2 = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const c2 = makeCanvas();
    attachControl(cam2, asCanvas(c2));
    fire(c2, "pointerdown", pointer({ button: 0, ctrlKey: true, clientX: 0, clientY: 0 }));
    fire(c2, "pointermove", pointer({ ctrlKey: true, clientX: 10, clientY: 0 }));
    expect(cam2.inertialPanningX).toBe(0);
    expect(cam2.inertialAlphaOffset).toBeCloseTo(-0.01);
});

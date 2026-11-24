import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer } from "./helpers";

it("61a: shouldHandlePointerDown false ignores that press", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), undefined, { shouldHandlePointerDown: () => false });
    fire(c, "pointerdown", pointer());
    fire(c, "pointermove", pointer({ clientX: 50 }));
    expect(cam.inertialAlphaOffset).toBe(0);
    expect(c.captured).toEqual([]);
});

it("61b: isExternalDragActive true mid-drag ends the drag, zeroes rotation and pan offsets but not the radius one", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    let ext = false;
    attachControl(cam, asCanvas(c), undefined, { isExternalDragActive: () => ext });
    fire(c, "pointerdown", pointer());
    fire(c, "pointermove", pointer({ clientX: 50, clientY: 10 }));
    cam.inertialPanningX = 1;
    cam.inertialRadiusOffset = 1;
    ext = true;
    fire(c, "pointermove", pointer({ clientX: 60 }));
    expect([cam.inertialAlphaOffset, cam.inertialBetaOffset, cam.inertialPanningX, cam.inertialPanningY]).toEqual([0, 0, 0, 0]);
    expect(cam.inertialRadiusOffset).toBe(1);
    ext = false;
    fire(c, "pointermove", pointer({ clientX: 90 }));
    expect(cam.inertialAlphaOffset).toBe(0);
});

it("61c: isExternalPickPending true swallows moves; the drag goes on after", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    const c = makeCanvas();
    let pending = true;
    attachControl(cam, asCanvas(c), undefined, { isExternalPickPending: () => pending });
    fire(c, "pointerdown", pointer());
    fire(c, "pointermove", pointer({ clientX: 50 }));
    expect(cam.inertialAlphaOffset).toBe(0);
    pending = false;
    fire(c, "pointermove", pointer({ clientX: 60 }));
    expect(cam.inertialAlphaOffset).toBeCloseTo(-10 / 1000, 12);
});

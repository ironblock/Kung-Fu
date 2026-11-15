import { it, expect } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, makeScene, tick } from "./helpers";

it("n11: each frame applies the whole offset, then multiplies it by inertia", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    cam.inertia = 0.5;
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene);
    fire(c, "pointerdown", pointer({ clientX: 100 }));
    fire(c, "pointermove", pointer({ clientX: 0 }));
    fire(c, "pointerup", pointer());
    expect(cam.inertialAlphaOffset).toBeCloseTo(0.1, 12);
    tick(scene);
    expect(cam.alpha).toBeCloseTo(1.1, 12);
    expect(cam.inertialAlphaOffset).toBeCloseTo(0.05, 12);
    tick(scene);
    expect(cam.alpha).toBeCloseTo(1.15, 12);
});

it("n11b: radius subtracts its offset; pans decay by panningInertia, so inertia 0 does not stop a pan", () => {
    const scene = makeScene();
    const cam = createArcRotateCamera(1, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    cam.inertia = 0;
    cam.panningInertia = 0.5;
    const c = makeCanvas();
    attachControl(cam, asCanvas(c), scene);
    cam.inertialRadiusOffset = 1;
    tick(scene);
    expect(cam.radius).toBeCloseTo(9, 12);
    expect(cam.inertialRadiusOffset).toBe(0);
    fire(c, "pointerdown", pointer({ button: 2, buttons: 2, clientX: 0 }));
    fire(c, "pointermove", pointer({ button: 2, buttons: 2, clientX: 50 }));
    fire(c, "pointerup", pointer({ button: 2 }));
    tick(scene);
    const t1 = { x: cam.target.x, y: cam.target.y, z: cam.target.z };
    expect(Math.hypot(t1.x, t1.y, t1.z)).toBeGreaterThan(0);
    tick(scene);
    const d = Math.hypot(cam.target.x - t1.x, cam.target.y - t1.y, cam.target.z - t1.z);
    expect(d).toBeCloseTo(Math.hypot(t1.x, t1.y, t1.z) * 0.5, 9);
});

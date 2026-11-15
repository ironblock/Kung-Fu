import { expect, test } from "vitest";
import { createArcRotateCamera, createFreeCamera } from "@babylonjs/lite";

test("defaults: arc-rotate near 0.1 far 1000; free near 1 far 10000; both fov 0.8", () => {
    const a = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    expect([a.fov, a.nearPlane, a.farPlane]).toEqual([0.8, 0.1, 1000]);
    expect([a.inertia, a.panningInertia, a.angularSensibility, a.panningSensibility, a.wheelPrecision]).toEqual([0.9, 0.9, 1000, 50, 3]);
    const f = createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
    expect([f.fov, f.nearPlane, f.farPlane, f.speed, f.angularSensitivity, f.inertia]).toEqual([0.8, 1, 10000, 2, 2000, 0.9]);
});

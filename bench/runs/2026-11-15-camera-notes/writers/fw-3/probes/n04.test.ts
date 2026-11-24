import { expect, test } from "vitest";
import { createArcRotateCamera, setCameraLimits } from "@babylonjs/lite";

test("the disposer of setCameraLimits stops clamping but leaves the limit fields set", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const off = setCameraLimits(cam, { upperRadiusLimit: 20 });
    cam.radius = 30;
    expect(cam.radius).toBe(20);
    off();
    expect(cam.upperRadiusLimit).toBe(20);
    cam.radius = 30;
    expect(cam.radius).toBe(30);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: after a second setCameraLimits, the first disposer does nothing", () => {
    const cam = L.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const off1 = L.setCameraLimits(cam, { upperRadiusLimit: 20 });
    const off2 = L.setCameraLimits(cam, { upperRadiusLimit: 20 });
    off1();
    cam.radius = 30;
    expect(cam.radius).toBe(20);
    off2();
    cam.radius = 30;
    expect(cam.radius).toBe(30);
});

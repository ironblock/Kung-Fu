import { expect, test } from "vitest";
import { createArcRotateCamera, getCameraPosition } from "@babylonjs/lite";

test("arc-rotate: assigning a new object to camera.target does not update worldMatrix; writing target.x does", () => {
    const cam = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    expect(getCameraPosition(cam).x).toBeCloseTo(10);
    cam.target = { x: 5, y: 0, z: 0 };
    expect(getCameraPosition(cam).x).toBeCloseTo(10);
    cam.target.x = 6; // plain object now: still no update
    expect(getCameraPosition(cam).x).toBeCloseTo(10);

    const cam2 = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    getCameraPosition(cam2);
    cam2.target.x = 5;
    expect(getCameraPosition(cam2).x).toBeCloseTo(15);
});

import * as L from "@babylonjs/lite";
import * as H from "./helpers";

test("mended: after assigning a new target object, the next alpha/beta/radius write uses it as it then is", () => {
    const cam = L.createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    expect(L.getCameraPosition(cam).x).toBeCloseTo(10);
    cam.target = { x: 5, y: 0, z: 0 };
    cam.target.x = 6;
    expect(L.getCameraPosition(cam).x).toBeCloseTo(10);
    cam.radius = 10; // same value: skipped, still stale
    expect(L.getCameraPosition(cam).x).toBeCloseTo(10);
    cam.radius = 11;
    expect(L.getCameraPosition(cam).x).toBeCloseTo(17);
    const cam2 = L.createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    L.getCameraPosition(cam2);
    cam2.target = { x: 5, y: 0, z: 0 };
    cam2.alpha = 0.0000001;
    expect(L.getCameraPosition(cam2).x).toBeCloseTo(15);
});

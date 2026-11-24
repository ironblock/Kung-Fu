import { it, expect } from "vitest";
import { createArcRotateCamera, getViewMatrix } from "@babylonjs/lite";

it("09b: writing target.x in place on the original target is seen at once", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const ver0 = cam.worldMatrixVersion;
    cam.target.x = 3;
    expect(cam.worldMatrix[12]).toBeCloseTo(3 + 10 * Math.cos(1) * Math.sin(1), 4);
    expect(cam.worldMatrixVersion).not.toBe(ver0);
});


import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("09 (after check 3): writes to the original target object still mark the camera dirty after another object was assigned", () => {
    const cam = L3.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const orig = cam.target;
    L3.getViewMatrix(cam);
    const nu = { x: 5, y: 0, z: 0 };
    cam.target = nu;
    L3.getViewMatrix(cam);
    nu.x = 6; // missed
    V3.expect(cam.worldMatrix[12]).toBeCloseTo(10 * Math.cos(1) * Math.sin(1), 4);
    orig.x = 1; // the original's setter marks dirty; the current target is used
    V3.expect(cam.worldMatrix[12]).toBeCloseTo(6 + 10 * Math.cos(1) * Math.sin(1), 4);
});

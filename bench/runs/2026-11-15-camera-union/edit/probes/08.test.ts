import { it, expect } from "vitest";
import { createArcRotateCamera, getViewMatrix } from "@babylonjs/lite";

it("08: a new target object and writes to it are not seen until alpha/beta/radius change", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    const v0 = Array.from(getViewMatrix(cam));
    const ver0 = cam.worldMatrixVersion;
    cam.target = { x: 5, y: 0, z: 0 };
    cam.target.x = 7;
    expect(cam.worldMatrixVersion).toBe(ver0);
    expect(Array.from(getViewMatrix(cam))).toEqual(v0);
    cam.radius = cam.radius;
    expect(Array.from(getViewMatrix(cam))).toEqual(v0);
    cam.radius = 10.5;
    expect(Array.from(getViewMatrix(cam))).not.toEqual(v0);
    expect(cam.worldMatrix[12]).toBeCloseTo(7 + 10.5 * Math.cos(1) * Math.sin(1), 4);
});

import * as L2 from "@babylonjs/lite";
import * as V2 from "vitest";

V2.it("08 (after check 2): before the view is built after the last change, the new target object and writes to it are used", () => {
    const cam = L2.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    cam.target = { x: 5, y: 0, z: 0 }; // fresh camera, view never built
    L2.getViewMatrix(cam);
    V2.expect(cam.worldMatrix[12]).toBeCloseTo(5 + 10 * Math.cos(1) * Math.sin(1), 4);

    const cam2 = L2.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    L2.getViewMatrix(cam2);
    cam2.alpha = 1.2; // a change not yet built
    cam2.target = { x: 5, y: 0, z: 0 };
    cam2.target.x = 7;
    V2.expect(cam2.worldMatrix[12]).toBeCloseTo(7 + 10 * Math.cos(1.2) * Math.sin(1), 4);
    cam2.target.x = 9; // now built: this write is missed
    V2.expect(cam2.worldMatrix[12]).toBeCloseTo(7 + 10 * Math.cos(1.2) * Math.sin(1), 4);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("08 (after check 3): a read of worldMatrix (getCameraPosition) after a change already freezes the target", () => {
    const cam = L3.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    L3.getViewMatrix(cam);
    cam.alpha = 1.2;
    L3.getCameraPosition(cam); // reads worldMatrix, not the view
    cam.target = { x: 5, y: 0, z: 0 };
    L3.getViewMatrix(cam);
    V3.expect(cam.worldMatrix[12]).toBeCloseTo(10 * Math.cos(1.2) * Math.sin(1), 4);
});

V3.it("08 (after check 3): attachControl pans and a target-only interpolation write the assigned object in place, unseen", async () => {
    const scene = H3.makeScene();
    const cam = L3.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    L3.getViewMatrix(cam);
    const nu = { x: 0, y: 0, z: 0 };
    cam.target = nu;
    L3.attachControl(cam, H3.asCanvas(H3.makeCanvas()), scene);
    cam.inertialPanningX = 1;
    H3.tick(scene);
    V3.expect(nu.z).not.toBe(0);
    V3.expect(cam.target).toBe(nu);
    V3.expect(cam.worldMatrix[14]).toBeCloseTo(10 * Math.sin(1) * Math.sin(1), 6); // still around the old target
    const scene2 = H3.makeScene();
    const cam2 = L3.createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    L3.getViewMatrix(cam2);
    const nu2 = { x: 0, y: 0, z: 0 };
    cam2.target = nu2;
    const p = L3.interpolateArcRotateCamera(cam2, scene2, { target: { x: 3, y: 0, z: 0 } });
    H3.tick(scene2, 300);
    await p;
    V3.expect(cam2.target).toBe(nu2);
    V3.expect(nu2.x).toBe(3);
    V3.expect(cam2.worldMatrix[12]).toBeCloseTo(10 * Math.cos(1) * Math.sin(1), 6);
});

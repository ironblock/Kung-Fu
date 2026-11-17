import { it, expect } from "vitest";
import { createFreeCamera, createBankedFreeCamera } from "@babylonjs/lite";

it("40: createFreeCamera has no upVector and uses world +Y; a banked camera's upVector rolls it", () => {
    const free = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    expect("upVector" in free).toBe(false);
    expect(free.worldMatrix[5]).toBeCloseTo(1, 12); // camera up is +Y
    const banked = createBankedFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    expect(banked.worldMatrix[5]).toBeCloseTo(1, 12);
    banked.upVector.set(1, 1, 0);
    expect(banked.worldMatrix[5]).toBeCloseTo(Math.SQRT1_2, 6);
    expect(Math.abs(banked.worldMatrix[4]!)).toBeCloseTo(Math.SQRT1_2, 6);
});

import * as L2 from "@babylonjs/lite";
import * as V2 from "vitest";

V2.it("40 (after check 2): an upVector written parallel to the view does not roll the camera: it turns to look along +Z", () => {
    const cam = L2.createBankedFreeCamera({ x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 });
    L2.getViewMatrix(cam);
    V2.expect(cam.worldMatrix[8]).toBeCloseTo(1, 9);
    cam.upVector.x = 1;
    cam.upVector.y = 0;
    L2.getViewMatrix(cam);
    V2.expect([cam.worldMatrix[8], cam.worldMatrix[9], cam.worldMatrix[10]]).toEqual([0, 0, 1]);
});

import * as L3 from "@babylonjs/lite";
import * as V3 from "vitest";
import * as H3 from "./helpers";

V3.it("40 (after check 3): a zero upVector also gives the identity rotation (looks along +Z)", () => {
    const cam = L3.createBankedFreeCamera({ x: 0, y: 0, z: 0 }, { x: 1, y: 0, z: 0 });
    V3.expect(cam.worldMatrix[8]).toBeCloseTo(1, 6);
    cam.upVector.set(0, 0, 0);
    V3.expect(cam.worldMatrix[10]).toBeCloseTo(1, 6);
    V3.expect(cam.worldMatrix[8]).toBeCloseTo(0, 6);
});

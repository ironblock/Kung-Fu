import { describe, it, expect } from "vitest";
import { createArcRotateCamera, getCameraPosition } from "@babylonjs/lite";

describe("n02 replacing ArcRotateCamera.target with a new object does not update the camera", () => {
    it("assigning a new target object leaves the world matrix stale", () => {
        const cam = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        const before = getCameraPosition(cam);
        cam.target = { x: 5, y: 0, z: 0 };
        const after = getCameraPosition(cam);
        expect(after.x).toBeCloseTo(before.x, 6);
    });
    it("later writes to the replaced plain object do not mark the camera dirty either", () => {
        const cam = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        cam.target = { x: 0, y: 0, z: 0 };
        getCameraPosition(cam);
        const v = cam.worldMatrixVersion;
        cam.target.x = 20;
        expect(cam.worldMatrixVersion).toBe(v);
    });
    it("writing target.x in place does move the camera", () => {
        const cam = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        const before = getCameraPosition(cam);
        cam.target.x = 5;
        expect(getCameraPosition(cam).x).toBeCloseTo(before.x + 5, 4);
    });
});

describe("n02b the replaced target is picked up at the next alpha/beta/radius write", () => {
    it("a later radius write moves the camera to orbit the new target", () => {
        const cam = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        cam.target = { x: 5, y: 0, z: 0 };
        cam.radius = 11;
        expect(getCameraPosition(cam).x).toBeCloseTo(16, 4);
    });
});

describe("n02c a write of the current value does not pick up the replaced target", () => {
    it("cam.radius = cam.radius leaves the camera on the old target; a changing write moves it", () => {
        const cam = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        const before = getCameraPosition(cam).x;
        cam.target = { x: 5, y: 0, z: 0 };
        cam.radius = cam.radius;
        expect(getCameraPosition(cam).x).toBeCloseTo(before, 6);
        cam.radius = 10.5;
        expect(getCameraPosition(cam).x).toBeCloseTo(15.5, 4);
    });
});

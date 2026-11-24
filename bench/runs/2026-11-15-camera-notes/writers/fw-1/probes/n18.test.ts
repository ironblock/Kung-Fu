import { it, expect } from "vitest";
import { createArcRotateCamera, getCameraPosition } from "@babylonjs/lite";

it("n18: assigning a new object to target is not seen until alpha/beta/radius change, and later edits to it are not tracked", () => {
    const cam = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    expect(getCameraPosition(cam).x).toBeCloseTo(10, 6);
    cam.target = { x: 5, y: 0, z: 0 };
    expect(getCameraPosition(cam).x).toBeCloseTo(10, 6); // stale
    cam.radius = 11;
    expect(getCameraPosition(cam).x).toBeCloseTo(16, 5);
    cam.target.x = 100;
    expect(getCameraPosition(cam).x).toBeCloseTo(16, 5); // still stale
    // in-place edits of the original target are tracked
    const cam2 = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    getCameraPosition(cam2);
    cam2.target.x = 5;
    expect(getCameraPosition(cam2).x).toBeCloseTo(15, 5);
});

it("n18b: a target assigned before the first read is seen at once; edits to the replacing object show after the next alpha/beta/radius change", () => {
    const cam = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
    cam.target = { x: 5, y: 0, z: 0 };
    expect(getCameraPosition(cam).x).toBeCloseTo(15, 5); // first read: seen at once
    cam.target.x = 7;
    expect(getCameraPosition(cam).x).toBeCloseTo(15, 5); // edit not seen yet
    cam.alpha = 1e-9;
    expect(getCameraPosition(cam).x).toBeCloseTo(17, 5); // seen after a change
});

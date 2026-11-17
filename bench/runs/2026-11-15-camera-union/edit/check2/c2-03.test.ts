import { it, expect } from "vitest";
import { createArcRotateCamera, getViewMatrix } from "@babylonjs/lite";

it("c2-03: a new target object is seen with no alpha/beta/radius write when the view has not been built since the last change", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    cam.target = { x: 5, y: 0, z: 0 }; // fresh camera, view never read
    getViewMatrix(cam);
    expect(cam.worldMatrix[12]).toBeCloseTo(5 + 10 * Math.cos(1) * Math.sin(1), 4);

    const cam2 = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    getViewMatrix(cam2);
    cam2.alpha = 1.2; // a change, not yet read
    cam2.target = { x: 5, y: 0, z: 0 };
    cam2.target.x = 7; // write to the new object
    expect(cam2.worldMatrix[12]).toBeCloseTo(7 + 10 * Math.cos(1.2) * Math.sin(1), 4);
});

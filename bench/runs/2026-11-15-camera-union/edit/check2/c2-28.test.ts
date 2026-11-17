import { it, expect } from "vitest";
import { createBankedFreeCamera, getViewMatrix } from "@babylonjs/lite";

it("c2-28: writing a banked camera's upVector parallel to its view does not roll it: the view turns to look along +Z", () => {
    const cam = createBankedFreeCamera({ x: 0, y: 0, z: 0 }, { x: 10, y: 0, z: 0 });
    getViewMatrix(cam);
    expect(cam.worldMatrix[8]).toBeCloseTo(1, 9); // forward is +X
    cam.upVector.x = 1;
    cam.upVector.y = 0; // up now parallel to the view direction
    getViewMatrix(cam);
    expect([cam.worldMatrix[8], cam.worldMatrix[9], cam.worldMatrix[10]]).toEqual([0, 0, 1]); // forward is +Z
});

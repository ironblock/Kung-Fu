import { it, expect } from "vitest";
import { createArcRotateCamera, setCameraLimits } from "@babylonjs/lite";

it("n17: setCameraLimits writes only the keys present; an explicit undefined clears one", () => {
    const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
    setCameraLimits(cam, { lowerRadiusLimit: 5 });
    setCameraLimits(cam, { upperRadiusLimit: 20 });
    expect(cam.lowerRadiusLimit).toBe(5);
    expect(cam.upperRadiusLimit).toBe(20);
    setCameraLimits(cam, { lowerRadiusLimit: undefined });
    expect(cam.lowerRadiusLimit).toBeUndefined();
    cam.radius = 1;
    expect(cam.radius).toBe(1);
});

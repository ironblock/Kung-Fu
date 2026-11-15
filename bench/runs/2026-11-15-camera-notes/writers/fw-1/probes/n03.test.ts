import { it, expect } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";

it("n03: arc-rotate defaults", () => {
    const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
    expect(cam.fov).toBe(0.8);
    expect(cam.nearPlane).toBe(0.1);
    expect(cam.farPlane).toBe(1000);
});

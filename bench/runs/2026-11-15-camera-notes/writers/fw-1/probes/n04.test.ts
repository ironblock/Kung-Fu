import { it, expect } from "vitest";
import { createFreeCamera } from "@babylonjs/lite";

it("n04: free camera defaults", () => {
    const cam = createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
    expect(cam.fov).toBe(0.8);
    expect(cam.nearPlane).toBe(1);
    expect(cam.farPlane).toBe(10000);
});

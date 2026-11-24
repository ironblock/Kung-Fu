import { it, expect } from "vitest";
import { createBankedFreeCamera, createFreeCamera } from "@babylonjs/lite";

it("n24: writing upVector rolls a banked camera; createFreeCamera has no upVector", () => {
    const cam = createBankedFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    expect(cam.worldMatrix[5]).toBeCloseTo(1, 6);
    cam.upVector.set(1, 0, 0);
    // camera local up (column 1) is now world +X
    expect(cam.worldMatrix[4]).toBeCloseTo(1, 6);
    expect(cam.worldMatrix[5]).toBeCloseTo(0, 6);
    const free = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 }) as unknown as Record<string, unknown>;
    expect(free.upVector).toBeUndefined();
});

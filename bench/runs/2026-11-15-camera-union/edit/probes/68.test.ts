import { it, expect } from "vitest";
import { createFreeCamera, createBankedFreeCamera } from "@babylonjs/lite";

it("68: a view parallel to world Y gives the identity rotation, looking along +Z", () => {
    for (const ty of [5, -5]) {
        const cam = createFreeCamera({ x: 1, y: 2, z: 3 }, { x: 1, y: 2 + ty, z: 3 });
        const w = Array.from(cam.worldMatrix);
        expect([w[0], w[1], w[2], w[4], w[5], w[6], w[8], w[9], w[10]]).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
        expect([w[12], w[13], w[14]]).toEqual([1, 2, 3]);
    }
});

it("68b: a banked camera with another upVector is not caught by this", () => {
    const cam = createBankedFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 5, z: 0 }, { x: 1, y: 0, z: 0 });
    expect(cam.worldMatrix[9]).toBeCloseTo(1, 6); // forward is +Y
});

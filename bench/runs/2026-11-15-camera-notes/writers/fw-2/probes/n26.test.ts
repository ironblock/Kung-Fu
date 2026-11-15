import { describe, it, expect } from "vitest";
import { createFreeCamera, createBankedFreeCamera } from "@babylonjs/lite";

describe("n26 only createBankedFreeCamera can roll: createFreeCamera has no upVector and always builds on world +Y", () => {
    it("createFreeCamera has no upVector field", () => {
        const cam = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        expect("upVector" in cam).toBe(false);
    });
    it("writing upVector on a banked camera rolls its world matrix", () => {
        const cam = createBankedFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
        expect(cam.worldMatrix[5]).toBeCloseTo(1, 10);
        cam.upVector.set(1, 0, 0);
        expect(cam.worldMatrix[5]).toBeCloseTo(0, 10);
        expect(Math.abs(cam.worldMatrix[4]!)).toBeCloseTo(1, 10);
    });
});

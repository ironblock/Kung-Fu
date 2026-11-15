import { attachDevice } from "./scene-helpers";
import { createBox, createNullEngine } from "@babylonjs/lite";
import { describe, expect, it } from "vitest";

describe("n15: rotation is a live Euler view of rotationQuaternion; both always take effect", () => {
    const engine = createNullEngine();
    attachDevice(engine);

    it("writing rotation.y changes rotationQuaternion and the world matrix", () => {
        const box = createBox(engine);
        box.rotation.y = Math.PI / 2;
        expect(box.rotationQuaternion.y).toBeCloseTo(Math.SQRT1_2);
        expect(box.rotationQuaternion.w).toBeCloseTo(Math.SQRT1_2);
        expect(box.worldMatrix[8]).toBeCloseTo(1);
    });

    it("setting rotationQuaternion changes what rotation reads, and rotation writes still work afterwards", () => {
        const box = createBox(engine);
        box.rotationQuaternion.set(Math.sin(0.25), 0, 0, Math.cos(0.25));
        expect(box.rotation.x).toBeCloseTo(0.5);
        box.rotation.z = 0.3;
        expect(box.rotation.x).toBeCloseTo(0.5);
        expect(box.rotation.z).toBeCloseTo(0.3);
        expect(box.rotationQuaternion.z).not.toBe(0);
    });
});

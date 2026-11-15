import { describe, expect, it } from "vitest";
import { createFreeCamera } from "@babylonjs/lite";
import { labelPosition } from "../src/label-position";
import { asCanvas, makeCanvas } from "./helpers";

function rig() {
    const canvas = makeCanvas(800, 600);
    // At the origin, looking along +Z, world +Y up. Its far clipping distance is 10000.
    const camera = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 10 });
    return { canvas: asCanvas(canvas), camera };
}

describe("B5 label position", () => {
    it("puts a point straight ahead at the centre of the canvas, visible", () => {
        const { canvas, camera } = rig();
        const label = labelPosition(camera, canvas, { x: 0, y: 0, z: 50 });
        expect(label.visible).toBe(true);
        expect(label.x).toBeCloseTo(400, 6);
        expect(label.y).toBeCloseTo(300, 6);
    });

    it("measures y downward from the top and x rightward from the left", () => {
        const { canvas, camera } = rig();
        const above = labelPosition(camera, canvas, { x: 0, y: 5, z: 50 });
        const right = labelPosition(camera, canvas, { x: 5, y: 0, z: 50 });
        expect(above.visible).toBe(true);
        expect(above.y).toBeLessThan(300);
        expect(above.y).toBeGreaterThan(0);
        expect(right.visible).toBe(true);
        expect(right.x).toBeGreaterThan(400);
        expect(right.x).toBeLessThan(800);
    });

    it("counts a point beyond the far clipping distance as visible", () => {
        const { canvas, camera } = rig();
        const label = labelPosition(camera, canvas, { x: 0, y: 0, z: 50000 });
        expect(label.visible).toBe(true);
        expect(label.x).toBeCloseTo(400, 3);
        expect(label.y).toBeCloseTo(300, 3);

        const farUp = labelPosition(camera, canvas, { x: 0, y: 5000, z: 50000 });
        expect(farUp.visible).toBe(true);
        expect(farUp.y).toBeLessThan(300);
    });

    it("keeps the off-edge position of a point in front but outside the picture", () => {
        const { canvas, camera } = rig();
        const label = labelPosition(camera, canvas, { x: 500, y: 0, z: 50 });
        expect(label.visible).toBe(false);
        expect(Number.isFinite(label.x)).toBe(true);
        expect(label.x).toBeGreaterThan(800);
        expect(label.y).toBeCloseTo(300, 3);
    });

    it("never shows a point behind the camera", () => {
        const { canvas, camera } = rig();
        expect(labelPosition(camera, canvas, { x: 0, y: 0, z: -50 }).visible).toBe(false);
        expect(labelPosition(camera, canvas, { x: 1, y: 1, z: -50000 }).visible).toBe(false);
    });
});

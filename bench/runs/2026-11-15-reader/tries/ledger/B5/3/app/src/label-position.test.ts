import { describe, expect, it } from "vitest";
import { createFreeCamera, type Camera } from "@babylonjs/lite";
import { labelPosition } from "./label-position.ts";

// 800x600 backing store shown at 400x300 CSS pixels.
function fakeCanvas(): HTMLCanvasElement {
    return { width: 800, height: 600, clientWidth: 400, clientHeight: 300 } as unknown as HTMLCanvasElement;
}

function cameraAt(position: { x: number; y: number; z: number }): Camera {
    return createFreeCamera(position, { x: position.x, y: position.y, z: position.z + 1 }) as unknown as Camera;
}

describe("labelPosition", () => {
    it("puts a point on the view axis at the canvas centre", () => {
        const cam = cameraAt({ x: 0, y: 0, z: -10 });
        const p = labelPosition(cam, fakeCanvas(), { x: 0, y: 0, z: 0 });
        expect(p.x).toBeCloseTo(200, 3);
        expect(p.y).toBeCloseTo(150, 3);
        expect(p.visible).toBe(true);
    });

    it("treats a point far beyond the far plane as visible", () => {
        const cam = cameraAt({ x: 0, y: 0, z: -10 });
        cam.farPlane = 100;
        const p = labelPosition(cam, fakeCanvas(), { x: 0, y: 0, z: 5000 });
        expect(p.visible).toBe(true);
        expect(p.x).toBeCloseTo(200, 3);
    });

    it("reports a point in front but off the picture as not visible, with an extrapolated position", () => {
        const cam = cameraAt({ x: 0, y: 0, z: -10 });
        const p = labelPosition(cam, fakeCanvas(), { x: 1000, y: 0, z: 0 });
        expect(p.visible).toBe(false);
        expect(p.x).toBeGreaterThan(400);
        expect(p.y).toBeCloseTo(150, 3);
    });

    it("reports a point behind the camera as never visible", () => {
        const cam = cameraAt({ x: 0, y: 0, z: -10 });
        const p = labelPosition(cam, fakeCanvas(), { x: 0, y: 0, z: -50 });
        expect(p.visible).toBe(false);
    });

    it("projects correctly under floating origin with a large camera offset", () => {
        const cam = cameraAt({ x: 1_000_000, y: 0, z: -10 });
        cam._useFloatingOrigin = true;
        const p = labelPosition(cam, fakeCanvas(), { x: 1_000_000, y: 0, z: 0 });
        expect(p.x).toBeCloseTo(200, 2);
        expect(p.y).toBeCloseTo(150, 2);
        expect(p.visible).toBe(true);
    });
});

import { describe, expect, it } from "vitest";
import { createFreeCamera } from "@babylonjs/lite";
import { labelPosition } from "./label-position.ts";

function fakeCanvas(width: number, height: number): HTMLCanvasElement {
    return { width, height, clientWidth: width, clientHeight: height } as unknown as HTMLCanvasElement;
}

describe("labelPosition", () => {
    it("places the look-at point at the canvas centre and marks it visible", () => {
        const camera = createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
        camera.fov = 0.8;
        camera.nearPlane = 0.1;
        camera.farPlane = 100;
        const p = labelPosition(camera, fakeCanvas(800, 600), { x: 0, y: 0, z: 0 });
        expect(p.visible).toBe(true);
        expect(p.x).toBeCloseTo(400, 3);
        expect(p.y).toBeCloseTo(300, 3);
    });

    it("never marks a point behind the camera visible", () => {
        const camera = createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
        camera.fov = 0.8;
        camera.nearPlane = 0.1;
        camera.farPlane = 100;
        expect(labelPosition(camera, fakeCanvas(800, 600), { x: 0, y: 0, z: -20 }).visible).toBe(false);
    });

    it("treats a point beyond the far plane as visible when it is in the picture", () => {
        const camera = createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
        camera.fov = 0.8;
        camera.nearPlane = 0.1;
        camera.farPlane = 100;
        const p = labelPosition(camera, fakeCanvas(800, 600), { x: 0, y: 0, z: 5000 });
        expect(p.visible).toBe(true);
        expect(p.x).toBeCloseTo(400, 3);
        expect(p.y).toBeCloseTo(300, 3);
    });

    it("reports an in-front point past the right edge as not visible, with x beyond the canvas", () => {
        const camera = createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
        camera.fov = 0.8;
        camera.nearPlane = 0.1;
        camera.farPlane = 100;
        const p = labelPosition(camera, fakeCanvas(800, 600), { x: 1000, y: 0, z: 0 });
        expect(p.visible).toBe(false);
        expect(p.x).toBeGreaterThan(800);
        expect(p.y).toBeCloseTo(300, 3);
    });

    it("scales output to CSS pixels when the backing store differs from the layout size", () => {
        const camera = createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
        camera.fov = 0.8;
        camera.nearPlane = 0.1;
        camera.farPlane = 100;
        const canvas = { width: 1600, height: 1200, clientWidth: 800, clientHeight: 600 } as unknown as HTMLCanvasElement;
        const p = labelPosition(camera, canvas, { x: 0, y: 0, z: 0 });
        expect(p.visible).toBe(true);
        expect(p.x).toBeCloseTo(400, 3);
        expect(p.y).toBeCloseTo(300, 3);
    });

    it("rebases the point under floating origin, where the view matrix has no translation", () => {
        const far = 1e6;
        const camera = createFreeCamera({ x: far, y: 0, z: -10 }, { x: far, y: 0, z: 0 });
        camera.fov = 0.8;
        camera.nearPlane = 0.1;
        camera.farPlane = 100;
        camera._useFloatingOrigin = true;
        const p = labelPosition(camera, fakeCanvas(800, 600), { x: far, y: 0, z: 0 });
        expect(p.visible).toBe(true);
        expect(p.x).toBeCloseTo(400, 2);
        expect(p.y).toBeCloseTo(300, 2);
    });
});

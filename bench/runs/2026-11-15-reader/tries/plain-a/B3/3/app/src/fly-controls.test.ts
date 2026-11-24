import { describe, expect, it } from "vitest";
import type { FreeCamera, SceneContext } from "@babylonjs/lite";
import { attachFlyControls } from "./fly-controls.js";

function fakeCamera(): FreeCamera {
    const target = { x: 0, y: 0, z: 1, set(x: number, y: number, z: number) { this.x = x; this.y = y; this.z = z; } };
    return {
        position: { x: 0, y: 0, z: 0 },
        target,
        speed: 2,
        angularSensitivity: 2000,
        inertia: 0.9,
        _yaw: 0,
        _pitch: 0,
    } as unknown as FreeCamera;
}

function fakeCanvas() {
    const target = new EventTarget();
    const canvas = Object.assign(target, {
        tabIndex: -1,
        hasAttribute: () => false,
        setPointerCapture: () => {},
        releasePointerCapture: () => {},
    });
    return canvas as unknown as HTMLCanvasElement;
}

function key(canvas: HTMLCanvasElement, type: "keydown" | "keyup", code: string): void {
    const event = new Event(type) as Event & { code: string };
    event.code = code;
    canvas.dispatchEvent(event);
}

function frame(scene: { _beforeRender: Array<(dt: number) => void> }, frames: number): void {
    for (let i = 0; i < frames; i++) {
        for (const fn of [...scene._beforeRender]) {
            fn(16);
        }
    }
}

describe("attachFlyControls", () => {
    it("Shift alone never moves the camera vertically", () => {
        const camera = fakeCamera();
        const canvas = fakeCanvas();
        const scene = { _beforeRender: [] as Array<(dt: number) => void> };
        const detach = attachFlyControls(camera, canvas, scene as unknown as SceneContext);

        key(canvas, "keydown", "ShiftLeft");
        frame(scene, 30);
        key(canvas, "keyup", "ShiftLeft");
        key(canvas, "keydown", "ShiftRight");
        frame(scene, 30);
        key(canvas, "keyup", "ShiftRight");
        expect(camera.position.y).toBe(0);

        detach();
    });

    it("Shift with W moves forward at three times the normal speed", () => {
        const plain = fakeCamera();
        const boosted = fakeCamera();
        const plainCanvas = fakeCanvas();
        const boostCanvas = fakeCanvas();
        const plainScene = { _beforeRender: [] as Array<(dt: number) => void> };
        const boostScene = { _beforeRender: [] as Array<(dt: number) => void> };
        const detachPlain = attachFlyControls(plain, plainCanvas, plainScene as unknown as SceneContext);
        const detachBoost = attachFlyControls(boosted, boostCanvas, boostScene as unknown as SceneContext);

        key(plainCanvas, "keydown", "KeyW");
        frame(plainScene, 1);
        key(boostCanvas, "keydown", "KeyW");
        key(boostCanvas, "keydown", "ShiftLeft");
        frame(boostScene, 1);

        expect(boosted.position.z).toBeGreaterThan(0);
        expect(boosted.position.z / plain.position.z).toBeCloseTo(3, 6);
        expect(boosted.position.y).toBe(0);

        detachPlain();
        detachBoost();
    });

    it("Space rises and PageDown sinks", () => {
        const camera = fakeCamera();
        const canvas = fakeCanvas();
        const scene = { _beforeRender: [] as Array<(dt: number) => void> };
        const detach = attachFlyControls(camera, canvas, scene as unknown as SceneContext);

        key(canvas, "keydown", "Space");
        frame(scene, 1);
        const risen = camera.position.y;
        key(canvas, "keyup", "Space");
        expect(risen).toBeGreaterThan(0);

        key(canvas, "keydown", "PageDown");
        frame(scene, 1);
        key(canvas, "keyup", "PageDown");
        frame(scene, 200);
        expect(camera.position.y).toBeCloseTo(0, 1);

        detach();
    });

    it("cleanup removes the per-frame hook and canvas listeners", () => {
        const camera = fakeCamera();
        const canvas = fakeCanvas();
        const scene = { _beforeRender: [] as Array<(dt: number) => void> };
        const detach = attachFlyControls(camera, canvas, scene as unknown as SceneContext);
        expect(scene._beforeRender.length).toBe(1);

        detach();
        expect(scene._beforeRender.length).toBe(0);

        key(canvas, "keydown", "KeyW");
        frame(scene, 5);
        expect(camera.position.z).toBe(0);
    });
});

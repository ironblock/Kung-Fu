import { describe, it, expect } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";
import { attachLimitedOrbit } from "./limited-orbit.ts";

class FakeCanvas extends EventTarget {
    setPointerCapture(): void {}
    releasePointerCapture(): void {}
}

function makeScene(): { scene: SceneContext; frame: () => void } {
    const hooks: Array<() => void> = [];
    const scene = { _beforeRender: hooks } as unknown as SceneContext;
    return { scene, frame: () => hooks.slice().forEach((h) => h()) };
}

function wheel(canvas: EventTarget, deltaY: number): void {
    canvas.dispatchEvent(Object.assign(new Event("wheel", { cancelable: true }), { deltaY }));
}

function touches(canvas: EventTarget, type: string, list: Array<{ identifier: number; x: number; y: number }>): void {
    const changedTouches = list.map((t) => ({ identifier: t.identifier, clientX: t.x, clientY: t.y }));
    canvas.dispatchEvent(Object.assign(new Event(type, { cancelable: true }), { changedTouches }));
}

describe("attachLimitedOrbit", () => {
    it("keeps wheel zoom inside the range on every frame", () => {
        const camera = createArcRotateCamera(0, 1.2, 10, { x: 0, y: 0, z: 0 });
        const canvas = new FakeCanvas();
        const { scene, frame } = makeScene();
        const detach = attachLimitedOrbit(camera, canvas as unknown as HTMLCanvasElement, scene, 2, 20);

        for (let i = 0; i < 50; i++) {
            wheel(canvas, -2000); // zoom in hard
            frame();
            expect(camera.radius).toBeGreaterThanOrEqual(2);
            expect(camera.radius).toBeLessThanOrEqual(20);
        }
        expect(camera.radius).toBe(2);

        for (let i = 0; i < 50; i++) {
            wheel(canvas, 2000); // zoom out hard
            frame();
            expect(camera.radius).toBeGreaterThanOrEqual(2);
            expect(camera.radius).toBeLessThanOrEqual(20);
        }
        expect(camera.radius).toBe(20);
        detach();
    });

    it("keeps pinch zoom inside the range", () => {
        const camera = createArcRotateCamera(0, 1.2, 10, { x: 0, y: 0, z: 0 });
        const canvas = new FakeCanvas();
        const { scene, frame } = makeScene();
        const detach = attachLimitedOrbit(camera, canvas as unknown as HTMLCanvasElement, scene, 2, 20);

        touches(canvas, "touchstart", [{ identifier: 1, x: 0, y: 0 }]);
        touches(canvas, "touchstart", [{ identifier: 2, x: 100, y: 0 }]);
        touches(canvas, "touchmove", [{ identifier: 2, x: 1000, y: 0 }]); // spread far apart
        expect(camera.radius).toBe(2);
        frame();
        expect(camera.radius).toBe(2);

        touches(canvas, "touchmove", [{ identifier: 2, x: 1, y: 0 }]); // pinch together
        expect(camera.radius).toBe(20);
        frame();
        expect(camera.radius).toBe(20);
        detach();
    });

    it("brings a camera that starts outside the range inside immediately", () => {
        const camera = createArcRotateCamera(0, 1.2, 100, { x: 0, y: 0, z: 0 });
        const canvas = new FakeCanvas();
        const { scene } = makeScene();
        const detach = attachLimitedOrbit(camera, canvas as unknown as HTMLCanvasElement, scene, 2, 20);
        expect(camera.radius).toBe(20);
        detach();

        const near = createArcRotateCamera(0, 1.2, 0.5, { x: 0, y: 0, z: 0 });
        const detach2 = attachLimitedOrbit(near, canvas as unknown as HTMLCanvasElement, scene, 2, 20);
        expect(near.radius).toBe(2);
        detach2();
    });

    it("cleanup removes listeners, the frame hook, and the zoom range", () => {
        const camera = createArcRotateCamera(0, 1.2, 10, { x: 0, y: 0, z: 0 });
        const canvas = new FakeCanvas();
        const { scene, frame } = makeScene();
        const detach = attachLimitedOrbit(camera, canvas as unknown as HTMLCanvasElement, scene, 2, 20);
        expect(scene._beforeRender.length).toBe(1);

        detach();
        detach(); // idempotent
        expect(scene._beforeRender.length).toBe(0);

        for (let i = 0; i < 50; i++) {
            wheel(canvas, -2000);
            frame();
        }
        expect(camera.radius).toBe(10); // wheel listener removed
        camera.radius = 0.5; // below the old minimum: no clamp hook left
        expect(camera.radius).toBe(0.5);
        camera.radius = 500;
        expect(camera.radius).toBe(500);
        expect(camera.lowerRadiusLimit).toBeUndefined();
        expect(camera.upperRadiusLimit).toBeUndefined();
    });

    it("rejects an invalid range", () => {
        const camera = createArcRotateCamera(0, 1.2, 10, { x: 0, y: 0, z: 0 });
        const canvas = new FakeCanvas();
        const { scene } = makeScene();
        const el = canvas as unknown as HTMLCanvasElement;
        expect(() => attachLimitedOrbit(camera, el, scene, 20, 2)).toThrow(RangeError);
        expect(() => attachLimitedOrbit(camera, el, scene, 0, 2)).toThrow(RangeError);
        expect(() => attachLimitedOrbit(camera, el, scene, 2, Number.NaN)).toThrow(RangeError);
        expect(scene._beforeRender.length).toBe(0);
    });
});

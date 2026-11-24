import { describe, it, expect } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";
import { attachLimitedOrbit } from "./limited-orbit.ts";

class FakeCanvas extends EventTarget {
    pointerCaptures = new Set<number>();
    setPointerCapture(id: number): void {
        this.pointerCaptures.add(id);
    }
    releasePointerCapture(id: number): void {
        this.pointerCaptures.delete(id);
    }
}

function fakeScene(): { scene: SceneContext; frame: () => void } {
    const hooks: Array<() => void> = [];
    const scene = { _beforeRender: hooks } as unknown as SceneContext;
    return { scene, frame: () => hooks.slice().forEach((h) => h()) };
}

function wheel(canvas: FakeCanvas, deltaY: number): void {
    const e = new Event("wheel", { cancelable: true }) as Event & { deltaY: number };
    e.deltaY = deltaY;
    canvas.dispatchEvent(e);
}

function touches(canvas: FakeCanvas, type: "touchstart" | "touchmove" | "touchend", list: Array<{ id: number; x: number; y: number }>): void {
    const e = new Event(type, { cancelable: true }) as Event & { changedTouches: unknown };
    e.changedTouches = list.map((t) => ({ identifier: t.id, clientX: t.x, clientY: t.y }));
    canvas.dispatchEvent(e);
}

describe("attachLimitedOrbit", () => {
    it("moves a camera that starts outside the range inside it immediately", () => {
        const cam = createArcRotateCamera(0, Math.PI / 2, 100, { x: 0, y: 0, z: 0 });
        const canvas = new FakeCanvas();
        const { scene } = fakeScene();
        const detach = attachLimitedOrbit(cam, canvas as unknown as HTMLCanvasElement, scene, 5, 20);
        expect(cam.radius).toBe(20);
        detach();

        const cam2 = createArcRotateCamera(0, Math.PI / 2, 1, { x: 0, y: 0, z: 0 });
        const detach2 = attachLimitedOrbit(cam2, canvas as unknown as HTMLCanvasElement, scene, 5, 20);
        expect(cam2.radius).toBe(5);
        detach2();
    });

    it("keeps the radius in range under huge wheel input, and zoom still works", () => {
        const cam = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        const canvas = new FakeCanvas();
        const { scene, frame } = fakeScene();
        const detach = attachLimitedOrbit(cam, canvas as unknown as HTMLCanvasElement, scene, 2, 50);

        for (let i = 0; i < 200; i++) {
            wheel(canvas, 5000);
            frame();
            expect(cam.radius).toBeGreaterThanOrEqual(2);
            expect(cam.radius).toBeLessThanOrEqual(50);
        }
        expect(cam.radius).toBeCloseTo(50, 6);

        const before = cam.radius;
        for (let i = 0; i < 30; i++) {
            wheel(canvas, -2000);
            frame();
        }
        expect(cam.radius).toBeLessThan(before);

        for (let i = 0; i < 300; i++) {
            wheel(canvas, -5000);
            frame();
            expect(cam.radius).toBeGreaterThanOrEqual(2);
            expect(cam.radius).toBeLessThanOrEqual(50);
        }
        expect(cam.radius).toBeCloseTo(2, 6);
        detach();
    });

    it("keeps the radius in range during pinch, in both directions", () => {
        const cam = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        const canvas = new FakeCanvas();
        const { scene, frame } = fakeScene();
        const detach = attachLimitedOrbit(cam, canvas as unknown as HTMLCanvasElement, scene, 2, 50);

        touches(canvas, "touchstart", [{ id: 1, x: 100, y: 100 }]);
        touches(canvas, "touchstart", [{ id: 2, x: 110, y: 100 }]);
        // Spread the fingers far apart: zoom in hard.
        for (const sep of [200, 1000, 5000, 20000]) {
            touches(canvas, "touchmove", [{ id: 2, x: 100 + sep, y: 100 }]);
            frame();
            expect(cam.radius).toBeGreaterThanOrEqual(2);
            expect(cam.radius).toBeLessThanOrEqual(50);
        }
        expect(cam.radius).toBeCloseTo(2, 6);
        // Pinch the fingers together: zoom out hard.
        for (const sep of [5, 0.5, 0.01]) {
            touches(canvas, "touchmove", [{ id: 2, x: 100 + sep, y: 100 }]);
            frame();
            expect(cam.radius).toBeGreaterThanOrEqual(2);
            expect(cam.radius).toBeLessThanOrEqual(50);
        }
        expect(cam.radius).toBeCloseTo(50, 6);
        touches(canvas, "touchend", [{ id: 1, x: 100, y: 100 }]);
        touches(canvas, "touchend", [{ id: 2, x: 100, y: 100 }]);
        detach();
    });

    it("removes listeners, the frame hook and the limits when detached, and is idempotent", () => {
        const cam = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        const canvas = new FakeCanvas();
        const { scene } = fakeScene();
        const added = new Map<string, number>();
        const removed = new Map<string, number>();
        const origAdd = canvas.addEventListener.bind(canvas);
        const origRemove = canvas.removeEventListener.bind(canvas);
        canvas.addEventListener = ((t: string, l: EventListenerOrEventListenerObject, o?: unknown) => {
            added.set(t, (added.get(t) ?? 0) + 1);
            origAdd(t, l, o as AddEventListenerOptions);
        }) as typeof canvas.addEventListener;
        canvas.removeEventListener = ((t: string, l: EventListenerOrEventListenerObject, o?: unknown) => {
            removed.set(t, (removed.get(t) ?? 0) + 1);
            origRemove(t, l, o as EventListenerOptions);
        }) as typeof canvas.removeEventListener;

        const detach = attachLimitedOrbit(cam, canvas as unknown as HTMLCanvasElement, scene, 2, 50);
        expect(scene._beforeRender.length).toBe(1);
        detach();
        detach();

        for (const [t, n] of added) {
            expect(removed.get(t)).toBe(n);
        }
        expect(scene._beforeRender.length).toBe(0);
        expect(cam._clampToLimits).toBeUndefined();
        expect(cam.lowerRadiusLimit).toBeUndefined();
        expect(cam.upperRadiusLimit).toBeUndefined();

        // After detaching, wheel input no longer moves the camera.
        const r = cam.radius;
        wheel(canvas, 5000);
        expect(cam.radius).toBe(r);
    });

    it("rejects an invalid range", () => {
        const cam = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 });
        const canvas = new FakeCanvas();
        const { scene } = fakeScene();
        expect(() => attachLimitedOrbit(cam, canvas as unknown as HTMLCanvasElement, scene, 0, 10)).toThrow(RangeError);
        expect(() => attachLimitedOrbit(cam, canvas as unknown as HTMLCanvasElement, scene, 10, 5)).toThrow(RangeError);
    });
});

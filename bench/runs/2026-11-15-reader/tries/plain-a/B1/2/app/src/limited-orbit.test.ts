import { describe, it, expect } from "vitest";
import { createArcRotateCamera, type ArcRotateCamera, type SceneContext } from "@babylonjs/lite";
import { attachLimitedOrbit } from "./limited-orbit.ts";

type Listener = (e: unknown) => void;

function fakeCanvas() {
    const listeners = new Map<string, Set<Listener>>();
    const canvas = {
        addEventListener(type: string, fn: Listener) {
            if (!listeners.has(type)) listeners.set(type, new Set());
            listeners.get(type)!.add(fn);
        },
        removeEventListener(type: string, fn: Listener) {
            listeners.get(type)?.delete(fn);
        },
        setPointerCapture() {},
        releasePointerCapture() {},
        dispatch(type: string, event: unknown) {
            for (const fn of listeners.get(type) ?? []) fn(event);
        },
        count() {
            let n = 0;
            for (const set of listeners.values()) n += set.size;
            return n;
        },
    };
    return canvas;
}

function fakeScene() {
    const scene = { _beforeRender: [] as ((dt: number) => void)[] };
    return scene;
}

function wheel(deltaY: number) {
    return { deltaY, preventDefault() {} };
}

function frame(scene: { _beforeRender: ((dt: number) => void)[] }) {
    for (const cb of [...scene._beforeRender]) cb(16);
}

describe("attachLimitedOrbit", () => {
    it("keeps the radius within range while zooming hard", () => {
        const camera: ArcRotateCamera = createArcRotateCamera(0.5, 1.0, 10, { x: 0, y: 0, z: 0 });
        const canvas = fakeCanvas();
        const scene = fakeScene();
        const detach = attachLimitedOrbit(camera, canvas as unknown as HTMLCanvasElement, scene as unknown as SceneContext, 2, 20);

        for (let i = 0; i < 200; i++) {
            canvas.dispatch("wheel", wheel(-500));
            frame(scene);
            expect(camera.radius).toBeGreaterThanOrEqual(2);
            expect(camera.radius).toBeLessThanOrEqual(20);
        }
        expect(camera.radius).toBeCloseTo(2, 6);

        for (let i = 0; i < 200; i++) {
            canvas.dispatch("wheel", wheel(500));
            frame(scene);
            expect(camera.radius).toBeGreaterThanOrEqual(2);
            expect(camera.radius).toBeLessThanOrEqual(20);
        }
        expect(camera.radius).toBeCloseTo(20, 6);

        detach();
    });

    it("still zooms in and out in the middle of the range", () => {
        const camera = createArcRotateCamera(0.5, 1.0, 10, { x: 0, y: 0, z: 0 });
        const canvas = fakeCanvas();
        const scene = fakeScene();
        const detach = attachLimitedOrbit(camera, canvas as unknown as HTMLCanvasElement, scene as unknown as SceneContext, 2, 20);

        canvas.dispatch("wheel", wheel(100));
        frame(scene);
        expect(camera.radius).toBeGreaterThan(10);
        expect(camera.radius).toBeLessThan(20);

        const outRadius = camera.radius;
        canvas.dispatch("wheel", wheel(-100));
        frame(scene);
        expect(camera.radius).toBeLessThan(outRadius);
        expect(camera.radius).toBeGreaterThanOrEqual(2);
        detach();
    });

    it("moves a camera that starts outside the range inside immediately", () => {
        const low = createArcRotateCamera(0, 1, 0.5, { x: 0, y: 0, z: 0 });
        const high = createArcRotateCamera(0, 1, 100, { x: 0, y: 0, z: 0 });
        const canvas = fakeCanvas();
        const scene = fakeScene();
        const d1 = attachLimitedOrbit(low, canvas as unknown as HTMLCanvasElement, scene as unknown as SceneContext, 2, 20);
        const d2 = attachLimitedOrbit(high, canvas as unknown as HTMLCanvasElement, scene as unknown as SceneContext, 2, 20);
        expect(low.radius).toBe(2);
        expect(high.radius).toBe(20);
        d1();
        d2();
    });

    it("removes canvas listeners and the per-frame hook on detach", () => {
        const camera = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = fakeCanvas();
        const scene = fakeScene();
        const before = canvas.count();
        const detach = attachLimitedOrbit(camera, canvas as unknown as HTMLCanvasElement, scene as unknown as SceneContext, 2, 20);
        expect(canvas.count()).toBeGreaterThan(before);
        expect(scene._beforeRender.length).toBe(1);

        detach();
        expect(canvas.count()).toBe(before);
        expect(scene._beforeRender.length).toBe(0);
        expect(camera.lowerRadiusLimit).toBeUndefined();
        expect(camera.upperRadiusLimit).toBeUndefined();

        // Detach is safe to call twice.
        detach();
        expect(scene._beforeRender.length).toBe(0);
    });

    it("rejects an invalid range", () => {
        const camera = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = fakeCanvas();
        const scene = fakeScene();
        expect(() => attachLimitedOrbit(camera, canvas as unknown as HTMLCanvasElement, scene as unknown as SceneContext, 20, 2)).toThrow(RangeError);
        expect(canvas.count()).toBe(0);
    });
});

import { describe, expect, it } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";
import { attachLimitedOrbit } from "./limited-orbit.js";

type Handler = (e: unknown) => void;

function fakeCanvas() {
    const listeners = new Map<string, Set<Handler>>();
    const canvas = {
        addEventListener(type: string, h: Handler) {
            if (!listeners.has(type)) listeners.set(type, new Set());
            listeners.get(type)!.add(h);
        },
        removeEventListener(type: string, h: Handler) {
            listeners.get(type)?.delete(h);
        },
        setPointerCapture() {},
        releasePointerCapture() {},
    };
    const count = () => [...listeners.values()].reduce((n, s) => n + s.size, 0);
    const fire = (type: string, e: Record<string, unknown>) => {
        for (const h of [...(listeners.get(type) ?? [])]) h({ preventDefault() {}, ...e });
    };
    return { canvas: canvas as unknown as HTMLCanvasElement, count, fire };
}

function fakeScene() {
    return { _beforeRender: [] as ((deltaMs: number) => void)[] } as unknown as SceneContext & { _beforeRender: ((d: number) => void)[] };
}

function frame(scene: { _beforeRender: ((d: number) => void)[] }) {
    for (const cb of [...scene._beforeRender]) cb(16);
}

function setup(radius: number, min = 2, max = 10) {
    const camera = createArcRotateCamera(0.3, 1.2, radius, { x: 0, y: 0, z: 0 });
    const { canvas, count, fire } = fakeCanvas();
    const scene = fakeScene();
    return { camera, canvas, count, fire, scene, min, max };
}

describe("attachLimitedOrbit", () => {
    it("moves an out-of-range camera inside the range immediately", () => {
        const low = setup(0.5);
        const detach1 = attachLimitedOrbit(low.camera, low.canvas, low.scene, low.min, low.max);
        expect(low.camera.radius).toBe(2);
        detach1();

        const high = setup(50);
        const detach2 = attachLimitedOrbit(high.camera, high.canvas, high.scene, high.min, high.max);
        expect(high.camera.radius).toBe(10);
        detach2();
    });

    it("keeps the radius in range under heavy wheel zoom, every frame", () => {
        const t = setup(5);
        const detach = attachLimitedOrbit(t.camera, t.canvas, t.scene, t.min, t.max);
        for (let i = 0; i < 200; i++) {
            t.fire("wheel", { deltaY: i % 2 === 0 ? -5000 : 5000 });
            frame(t.scene);
            expect(t.camera.radius).toBeGreaterThanOrEqual(t.min);
            expect(t.camera.radius).toBeLessThanOrEqual(t.max);
        }
        // Zooming in hard reaches the near limit exactly.
        t.fire("wheel", { deltaY: -1e6 });
        frame(t.scene);
        expect(t.camera.radius).toBe(t.min);
        // Zooming out hard reaches the far limit exactly.
        t.fire("wheel", { deltaY: 1e6 });
        frame(t.scene);
        expect(t.camera.radius).toBe(t.max);
        detach();
    });

    it("keeps the radius in range under pinch, and zoom still works", () => {
        const t = setup(5);
        const detach = attachLimitedOrbit(t.camera, t.canvas, t.scene, t.min, t.max);
        const touches = (a: [number, number], b: [number, number]) => [
            { identifier: 1, clientX: a[0], clientY: a[1] },
            { identifier: 2, clientX: b[0], clientY: b[1] },
        ];
        // Start with fingers 100px apart, then spread them far apart (zoom in).
        t.fire("touchstart", { changedTouches: touches([0, 0], [100, 0]).slice(0, 1) });
        t.fire("touchstart", { changedTouches: touches([0, 0], [100, 0]).slice(1) });
        t.fire("touchmove", { changedTouches: [{ identifier: 2, clientX: 10000, clientY: 0 }] });
        expect(t.camera.radius).toBe(t.min);
        frame(t.scene);
        expect(t.camera.radius).toBe(t.min);
        // Pinch the other way (zoom out) past the far limit.
        t.fire("touchmove", { changedTouches: [{ identifier: 2, clientX: 1, clientY: 0 }] });
        expect(t.camera.radius).toBe(t.max);
        frame(t.scene);
        expect(t.camera.radius).toBe(t.max);
        detach();
    });

    it("removes canvas listeners and the per-frame hook on cleanup, and is idempotent", () => {
        const t = setup(5);
        const before = t.count();
        const detach = attachLimitedOrbit(t.camera, t.canvas, t.scene, t.min, t.max);
        expect(t.count()).toBeGreaterThan(before);
        expect(t.scene._beforeRender.length).toBe(1);
        detach();
        detach();
        expect(t.count()).toBe(before);
        expect(t.scene._beforeRender.length).toBe(0);
        // After cleanup, wheel no longer changes the camera.
        t.fire("wheel", { deltaY: -1e6 });
        frame(t.scene);
        expect(t.camera.radius).toBe(5);
        // And the range is no longer enforced on direct writes.
        t.camera.radius = 100;
        expect(t.camera.radius).toBe(100);
    });

    it("rejects an invalid range", () => {
        const t = setup(5);
        expect(() => attachLimitedOrbit(t.camera, t.canvas, t.scene, 10, 2)).toThrow(RangeError);
        expect(() => attachLimitedOrbit(t.camera, t.canvas, t.scene, 0, 2)).toThrow(RangeError);
        expect(() => attachLimitedOrbit(t.camera, t.canvas, t.scene, 2, Infinity)).toThrow(RangeError);
        expect(t.count()).toBe(0);
    });
});

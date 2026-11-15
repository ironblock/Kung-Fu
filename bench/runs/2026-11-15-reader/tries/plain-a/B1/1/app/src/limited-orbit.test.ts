import { describe, expect, it } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";
import { attachLimitedOrbit } from "./limited-orbit";

type Listener = (ev: unknown) => void;

function makeCanvas() {
    const listeners = new Map<string, Set<Listener>>();
    const canvas = {
        addEventListener(type: string, h: Listener) {
            if (!listeners.has(type)) listeners.set(type, new Set());
            listeners.get(type)!.add(h);
        },
        removeEventListener(type: string, h: Listener) {
            listeners.get(type)?.delete(h);
        },
        setPointerCapture() {},
        releasePointerCapture() {},
    };
    const count = () => [...listeners.values()].reduce((n, s) => n + s.size, 0);
    const fire = (type: string, ev: Record<string, unknown>) => {
        for (const h of [...(listeners.get(type) ?? [])]) h({ preventDefault() {}, ...ev });
    };
    return { canvas: canvas as unknown as HTMLCanvasElement, count, fire };
}

function makeScene() {
    return { _beforeRender: [] as Array<(dt: number) => void> } as unknown as SceneContext & {
        _beforeRender: Array<(dt: number) => void>;
    };
}

function frame(scene: { _beforeRender: Array<(dt: number) => void> }) {
    for (const cb of [...scene._beforeRender]) cb(16);
}

describe("attachLimitedOrbit", () => {
    it("keeps radius in range under heavy wheel zoom in and out", () => {
        const cam = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const { canvas, fire } = makeCanvas();
        const scene = makeScene();
        const dispose = attachLimitedOrbit(cam, canvas, scene, 2, 10);
        for (let i = 0; i < 200; i++) {
            fire("wheel", { deltaY: i % 2 === 0 ? -5000 : 5000 });
            expect(cam.radius).toBeGreaterThanOrEqual(2);
            expect(cam.radius).toBeLessThanOrEqual(10);
            frame(scene);
            expect(cam.radius).toBeGreaterThanOrEqual(2);
            expect(cam.radius).toBeLessThanOrEqual(10);
        }
        dispose();
    });

    it("keeps radius in range during pinch zoom", () => {
        const cam = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const { canvas, fire } = makeCanvas();
        const scene = makeScene();
        const dispose = attachLimitedOrbit(cam, canvas, scene, 2, 10);
        const touch = (id: number, x: number, y: number) => ({ identifier: id, clientX: x, clientY: y });
        fire("touchstart", { changedTouches: [touch(1, 0, 0), touch(2, 100, 0)] });
        for (const d of [1000, 1, 0.01, 500, 0.001]) {
            fire("touchmove", { changedTouches: [touch(1, 0, 0), touch(2, d, 0)] });
            expect(cam.radius).toBeGreaterThanOrEqual(2);
            expect(cam.radius).toBeLessThanOrEqual(10);
            frame(scene);
            expect(cam.radius).toBeGreaterThanOrEqual(2);
            expect(cam.radius).toBeLessThanOrEqual(10);
        }
        dispose();
    });

    it("moves a camera that starts outside the range inside as soon as attached", () => {
        const far = createArcRotateCamera(0, 1, 50, { x: 0, y: 0, z: 0 });
        const d1 = makeCanvas();
        const d1Dispose = attachLimitedOrbit(far, d1.canvas, makeScene(), 2, 10);
        expect(far.radius).toBe(10);
        d1Dispose();

        const near = createArcRotateCamera(0, 1, 0.1, { x: 0, y: 0, z: 0 });
        const d2 = makeCanvas();
        const d2Dispose = attachLimitedOrbit(near, d2.canvas, makeScene(), 2, 10);
        expect(near.radius).toBe(2);
        d2Dispose();
    });

    it("removes listeners and the per-frame hook on dispose, and is idempotent", () => {
        const cam = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const { canvas, count } = makeCanvas();
        const scene = makeScene();
        const dispose = attachLimitedOrbit(cam, canvas, scene, 2, 10);
        expect(count()).toBeGreaterThan(0);
        expect(scene._beforeRender.length).toBe(1);
        dispose();
        dispose();
        expect(count()).toBe(0);
        expect(scene._beforeRender.length).toBe(0);
    });

    it("no longer clamps the camera after dispose", () => {
        const cam = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const { canvas } = makeCanvas();
        const dispose = attachLimitedOrbit(cam, canvas, makeScene(), 2, 10);
        dispose();
        cam.radius = 50;
        expect(cam.radius).toBe(50);
        expect(cam.lowerRadiusLimit).toBeUndefined();
        expect(cam.upperRadiusLimit).toBeUndefined();
    });

    it("rejects an invalid range", () => {
        const cam = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const { canvas } = makeCanvas();
        expect(() => attachLimitedOrbit(cam, canvas, makeScene(), 10, 2)).toThrow(RangeError);
        expect(() => attachLimitedOrbit(cam, canvas, makeScene(), 0, 2)).toThrow(RangeError);
    });
});

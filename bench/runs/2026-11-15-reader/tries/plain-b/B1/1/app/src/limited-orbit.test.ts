import { describe, expect, it } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";
import { attachLimitedOrbit } from "./limited-orbit";

type Handler = (ev: unknown) => void;

function makeCanvas() {
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
    const fire = (type: string, ev: Record<string, unknown>) => {
        for (const h of [...(listeners.get(type) ?? [])]) h({ preventDefault() {}, ...ev });
    };
    return { canvas: canvas as unknown as HTMLCanvasElement, count, fire };
}

function makeScene() {
    const scene = { _beforeRender: [] as ((dt: number) => void)[] };
    const frame = () => {
        for (const cb of [...scene._beforeRender]) cb(16);
    };
    return { scene: scene as unknown as SceneContext, hooks: scene._beforeRender, frame };
}

describe("attachLimitedOrbit", () => {
    it("moves a camera that starts outside the range inside it immediately", () => {
        const { canvas } = makeCanvas();
        const { scene } = makeScene();
        const camera = createArcRotateCamera(0, 1, 50, { x: 0, y: 0, z: 0 });
        const detach = attachLimitedOrbit(camera, canvas, scene, 2, 10);
        expect(camera.radius).toBe(10);
        detach();

        const camera2 = createArcRotateCamera(0, 1, 0.5, { x: 0, y: 0, z: 0 });
        const detach2 = attachLimitedOrbit(camera2, canvas, scene, 2, 10);
        expect(camera2.radius).toBe(2);
        detach2();
    });

    it("keeps the radius in range under heavy wheel input across frames", () => {
        const { canvas, fire } = makeCanvas();
        const { scene, frame } = makeScene();
        const camera = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const detach = attachLimitedOrbit(camera, canvas, scene, 2, 10);

        const seen: number[] = [];
        for (let i = 0; i < 200; i++) {
            fire("wheel", { deltaY: i % 3 === 0 ? -5000 : 5000 });
            frame();
            seen.push(camera.radius);
        }
        fire("wheel", { deltaY: -100000 });
        frame();
        expect(camera.radius).toBeGreaterThanOrEqual(2);
        expect(camera.radius).toBeLessThanOrEqual(10);
        for (const r of seen) {
            expect(r).toBeGreaterThanOrEqual(2);
            expect(r).toBeLessThanOrEqual(10);
        }
        detach();
    });

    it("keeps the radius in range during an extreme pinch", () => {
        const { canvas, fire } = makeCanvas();
        const { scene } = makeScene();
        const camera = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const detach = attachLimitedOrbit(camera, canvas, scene, 2, 10);

        const touch = (id: number, x: number, y: number) => ({ identifier: id, clientX: x, clientY: y });
        fire("touchstart", { changedTouches: [touch(1, 0, 0)] });
        fire("touchstart", { changedTouches: [touch(2, 100, 0)] });
        for (const d of [1000, 1, 5000, 0.5, 300]) {
            fire("touchmove", { changedTouches: [touch(2, 100 * d, 0)] });
            expect(camera.radius).toBeGreaterThanOrEqual(2);
            expect(camera.radius).toBeLessThanOrEqual(10);
        }
        detach();
    });

    it("removes listeners and the per-frame hook on cleanup, and is idempotent", () => {
        const { canvas, count, fire } = makeCanvas();
        const { scene, hooks } = makeScene();
        const camera = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const before = count();
        const detach = attachLimitedOrbit(camera, canvas, scene, 2, 10);
        expect(count()).toBeGreaterThan(before);
        expect(hooks.length).toBe(1);

        detach();
        detach();
        expect(count()).toBe(before);
        expect(hooks.length).toBe(0);

        const radiusBefore = camera.radius;
        fire("wheel", { deltaY: 5000 });
        for (const cb of [...hooks]) cb(16);
        expect(camera.radius).toBe(radiusBefore);
        expect(camera.lowerRadiusLimit).toBeUndefined();
        expect(camera.upperRadiusLimit).toBeUndefined();
    });

    it("rejects an invalid range", () => {
        const { canvas } = makeCanvas();
        const { scene } = makeScene();
        const camera = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        expect(() => attachLimitedOrbit(camera, canvas, scene, 10, 2)).toThrow(RangeError);
        expect(() => attachLimitedOrbit(camera, canvas, scene, 0, 2)).toThrow(RangeError);
    });
});

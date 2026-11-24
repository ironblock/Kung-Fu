import { describe, expect, it } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";
import { attachLimitedOrbit } from "./limited-orbit.ts";

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
        dispatch(type: string, e: object) {
            for (const h of listeners.get(type) ?? []) h({ preventDefault() {}, ...e });
        },
        count() {
            let n = 0;
            for (const s of listeners.values()) n += s.size;
            return n;
        },
    };
    return canvas;
}

function fakeScene() {
    return { _beforeRender: [] as ((dt: number) => void)[] } as unknown as SceneContext & { _beforeRender: ((dt: number) => void)[] };
}

const frame = (scene: { _beforeRender: ((dt: number) => void)[] }) => {
    for (const cb of [...scene._beforeRender]) cb(16);
};

describe("attachLimitedOrbit", () => {
    it("clamps an out-of-range camera immediately", () => {
        const cam = createArcRotateCamera(0, 1, 100, { x: 0, y: 0, z: 0 });
        const canvas = fakeCanvas();
        attachLimitedOrbit(cam, canvas as unknown as HTMLCanvasElement, fakeScene(), 2, 10);
        expect(cam.radius).toBe(10);
    });

    it("keeps wheel zoom in range on every frame", () => {
        const cam = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const canvas = fakeCanvas();
        const scene = fakeScene();
        attachLimitedOrbit(cam, canvas as unknown as HTMLCanvasElement, scene, 2, 10);
        canvas.dispatch("wheel", { deltaY: -100 });
        frame(scene);
        expect(cam.radius).toBeLessThan(5); // zoom still works
        for (let i = 0; i < 50; i++) {
            canvas.dispatch("wheel", { deltaY: 1e6 });
            frame(scene);
            expect(cam.radius).toBeGreaterThanOrEqual(2);
            expect(cam.radius).toBeLessThanOrEqual(10);
        }
        expect(cam.radius).toBe(10);
        for (let i = 0; i < 50; i++) {
            canvas.dispatch("wheel", { deltaY: -1e6 });
            frame(scene);
            expect(cam.radius).toBeGreaterThanOrEqual(2);
        }
        expect(cam.radius).toBe(2);
    });

    it("keeps pinch zoom in range", () => {
        const cam = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const canvas = fakeCanvas();
        attachLimitedOrbit(cam, canvas as unknown as HTMLCanvasElement, fakeScene(), 2, 10);
        const t = (id: number, x: number) => ({ identifier: id, clientX: x, clientY: 0 });
        canvas.dispatch("touchstart", { changedTouches: [t(1, 0), t(2, 100)] });
        canvas.dispatch("touchmove", { changedTouches: [t(1, 0), t(2, 1)] });
        expect(cam.radius).toBe(10);
        canvas.dispatch("touchmove", { changedTouches: [t(1, 0), t(2, 100000)] });
        expect(cam.radius).toBe(2);
    });

    it("detaches listeners and the per-frame hook, and restores limits", () => {
        const cam = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const canvas = fakeCanvas();
        const scene = fakeScene();
        const detach = attachLimitedOrbit(cam, canvas as unknown as HTMLCanvasElement, scene, 2, 10);
        expect(canvas.count()).toBeGreaterThan(0);
        expect(scene._beforeRender.length).toBe(1);
        detach();
        detach();
        expect(canvas.count()).toBe(0);
        expect(scene._beforeRender.length).toBe(0);
        expect(cam._clampToLimits).toBeUndefined();
        expect(cam.lowerRadiusLimit).toBeUndefined();
        cam.radius = 50;
        expect(cam.radius).toBe(50);
    });
});

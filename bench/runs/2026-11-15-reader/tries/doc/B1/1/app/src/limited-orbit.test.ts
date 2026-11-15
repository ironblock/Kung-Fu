import { describe, it, expect } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";
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
        dispatch(type: string, event: object) {
            for (const fn of [...(listeners.get(type) ?? [])]) fn({ preventDefault() {}, ...event });
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
    return { _beforeRender: [] as ((deltaMs: number) => void)[] } as unknown as SceneContext;
}

function frame(scene: SceneContext) {
    for (const cb of [...scene._beforeRender]) cb(16);
}

function touch(id: number, x: number, y: number) {
    return { identifier: id, clientX: x, clientY: y };
}

describe("attachLimitedOrbit", () => {
    it("clamps a camera that starts outside the range as soon as it is attached", () => {
        const camera = createArcRotateCamera(0, 1, 50, { x: 0, y: 0, z: 0 });
        const canvas = fakeCanvas();
        const scene = fakeScene();
        const detach = attachLimitedOrbit(camera, canvas as unknown as HTMLCanvasElement, scene, 2, 10);
        expect(camera.radius).toBe(10);
        detach();
    });

    it("keeps radius in range under heavy wheel zoom, in both directions, every frame", () => {
        const camera = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const canvas = fakeCanvas();
        const scene = fakeScene();
        const detach = attachLimitedOrbit(camera, canvas as unknown as HTMLCanvasElement, scene, 2, 10);

        for (let i = 0; i < 50; i++) {
            canvas.dispatch("wheel", { deltaY: 5000 }); // zoom out hard
            frame(scene);
            expect(camera.radius).toBeGreaterThanOrEqual(2);
            expect(camera.radius).toBeLessThanOrEqual(10);
        }
        expect(camera.radius).toBe(10);

        for (let i = 0; i < 50; i++) {
            canvas.dispatch("wheel", { deltaY: -5000 }); // zoom in hard
            frame(scene);
            expect(camera.radius).toBeGreaterThanOrEqual(2);
            expect(camera.radius).toBeLessThanOrEqual(10);
        }
        expect(camera.radius).toBe(2);
        detach();
    });

    it("does not wind up inertia at the wall", () => {
        const camera = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const canvas = fakeCanvas();
        const scene = fakeScene();
        const detach = attachLimitedOrbit(camera, canvas as unknown as HTMLCanvasElement, scene, 2, 10);
        for (let i = 0; i < 20; i++) canvas.dispatch("wheel", { deltaY: 5000 });
        frame(scene);
        expect(camera.radius).toBe(10);
        // Reversing immediately should move the camera inward right away.
        canvas.dispatch("wheel", { deltaY: -200 });
        frame(scene);
        expect(camera.radius).toBeLessThan(10);
        detach();
    });

    it("keeps radius in range under pinch zoom", () => {
        const camera = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const canvas = fakeCanvas();
        const scene = fakeScene();
        const detach = attachLimitedOrbit(camera, canvas as unknown as HTMLCanvasElement, scene, 2, 10);

        canvas.dispatch("touchstart", { changedTouches: [touch(1, 100, 100), touch(2, 110, 100)] });
        // Spread fingers far apart: pinch-out, radius would shrink hard.
        canvas.dispatch("touchmove", { changedTouches: [touch(1, 0, 100), touch(2, 1000, 100)] });
        frame(scene);
        expect(camera.radius).toBe(2);
        // Bring fingers almost together: radius would grow hard.
        canvas.dispatch("touchmove", { changedTouches: [touch(1, 499, 100), touch(2, 501, 100)] });
        frame(scene);
        expect(camera.radius).toBe(10);
        canvas.dispatch("touchend", { changedTouches: [touch(1, 499, 100)] });
        canvas.dispatch("touchend", { changedTouches: [touch(2, 501, 100)] });
        detach();
    });

    it("cleanup removes listeners, the per-frame hook and the radius clamp", () => {
        const camera = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const canvas = fakeCanvas();
        const scene = fakeScene();
        const before = canvas.count();
        const detach = attachLimitedOrbit(camera, canvas as unknown as HTMLCanvasElement, scene, 2, 10);
        expect(canvas.count()).toBeGreaterThan(before);
        expect(scene._beforeRender.length).toBe(1);

        detach();
        detach(); // idempotent
        expect(canvas.count()).toBe(before);
        expect(scene._beforeRender.length).toBe(0);

        camera.radius = 50;
        expect(camera.radius).toBe(50);
        expect(camera.lowerRadiusLimit).toBeUndefined();
        expect(camera.upperRadiusLimit).toBeUndefined();
    });

    it("rejects invalid limits", () => {
        const camera = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const canvas = fakeCanvas() as unknown as HTMLCanvasElement;
        const scene = fakeScene();
        expect(() => attachLimitedOrbit(camera, canvas, scene, 10, 2)).toThrow(RangeError);
        expect(() => attachLimitedOrbit(camera, canvas, scene, 0, 2)).toThrow(RangeError);
        expect(() => attachLimitedOrbit(camera, canvas, scene, 1, Number.NaN)).toThrow(RangeError);
    });
});

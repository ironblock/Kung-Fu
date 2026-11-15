import { describe, expect, it } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachLimitedOrbit } from "./limited-orbit.ts";

type Listener = (e: Event) => void;

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
    };
    const count = () => [...listeners.values()].reduce((n, s) => n + s.size, 0);
    const dispatch = (type: string, props: Record<string, unknown> = {}) => {
        const ev = new Event(type, { cancelable: true });
        Object.assign(ev, props);
        for (const fn of [...(listeners.get(type) ?? [])]) fn(ev);
    };
    return { canvas: canvas as unknown as HTMLCanvasElement, count, dispatch };
}

function fakeScene() {
    return { _beforeRender: [] as ((d: number) => void)[] } as unknown as SceneContext & { _beforeRender: ((d: number) => void)[] };
}

function frame(scene: { _beforeRender: ((d: number) => void)[] }) {
    for (const cb of [...scene._beforeRender]) cb(16);
}

function touch(id: number, x: number, y: number) {
    return { identifier: id, clientX: x, clientY: y };
}

describe("attachLimitedOrbit", () => {
    it("clamps a camera that starts outside the range immediately", () => {
        const cam: ArcRotateCamera = createArcRotateCamera(0, 1, 50, { x: 0, y: 0, z: 0 });
        const { canvas } = fakeCanvas();
        const scene = fakeScene();
        attachLimitedOrbit(cam, canvas, scene, 2, 20);
        expect(cam.radius).toBe(20);
        const cam2 = createArcRotateCamera(0, 1, 0.5, { x: 0, y: 0, z: 0 });
        attachLimitedOrbit(cam2, canvas, fakeScene(), 2, 20);
        expect(cam2.radius).toBe(2);
    });

    it("keeps radius in range under heavy wheel zoom, every frame", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const { canvas, dispatch } = fakeCanvas();
        const scene = fakeScene();
        attachLimitedOrbit(cam, canvas, scene, 2, 20);
        for (let i = 0; i < 300; i++) {
            dispatch("wheel", { deltaY: i % 2 ? 2000 : -2000 });
            frame(scene);
            expect(cam.radius).toBeGreaterThanOrEqual(2);
            expect(cam.radius).toBeLessThanOrEqual(20);
        }
        for (let i = 0; i < 50; i++) {
            dispatch("wheel", { deltaY: -5000 });
            frame(scene);
        }
        expect(cam.radius).toBe(2);
        for (let i = 0; i < 50; i++) {
            dispatch("wheel", { deltaY: 5000 });
            frame(scene);
        }
        expect(cam.radius).toBe(20);
        expect(cam.inertialRadiusOffset).toBe(0);
    });

    it("keeps radius in range under pinch, including extreme spreads", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const { canvas, dispatch } = fakeCanvas();
        const scene = fakeScene();
        attachLimitedOrbit(cam, canvas, scene, 2, 20);
        dispatch("touchstart", { changedTouches: [touch(1, 100, 100)] });
        dispatch("touchstart", { changedTouches: [touch(2, 101, 100)] });
        for (const gap of [1000, 0.001, 5000, 3, 0.0000001]) {
            dispatch("touchmove", { changedTouches: [touch(2, 100 + gap, 100)] });
            expect(cam.radius).toBeGreaterThanOrEqual(2);
            expect(cam.radius).toBeLessThanOrEqual(20);
            frame(scene);
        }
    });

    it("still orbits on drag and keeps radius in range", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const { canvas, dispatch } = fakeCanvas();
        const scene = fakeScene();
        attachLimitedOrbit(cam, canvas, scene, 2, 20);
        const alpha0 = cam.alpha;
        dispatch("pointerdown", { button: 0, pointerId: 1, pointerType: "mouse", clientX: 0, clientY: 0 });
        dispatch("pointermove", { pointerId: 1, pointerType: "mouse", clientX: 300, clientY: 0 });
        dispatch("pointerup", { pointerId: 1, button: 0, pointerType: "mouse", clientX: 300, clientY: 0 });
        frame(scene);
        expect(cam.alpha).not.toBe(alpha0);
        expect(cam.radius).toBe(10);
    });

    it("cleanup removes listeners, the frame hook, and the limit hook, and is idempotent", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const { canvas, count, dispatch } = fakeCanvas();
        const scene = fakeScene();
        const before = count();
        const detach = attachLimitedOrbit(cam, canvas, scene, 2, 20);
        expect(count()).toBeGreaterThan(before);
        expect(scene._beforeRender.length).toBe(1);
        detach();
        detach();
        expect(count()).toBe(before);
        expect(scene._beforeRender.length).toBe(0);
        expect(cam._clampToLimits).toBeUndefined();
        expect(cam.lowerRadiusLimit).toBeUndefined();
        expect(cam.upperRadiusLimit).toBeUndefined();
        dispatch("wheel", { deltaY: -5000 });
        expect(cam.inertialRadiusOffset).toBe(0);
    });

    it("rejects an invalid range", () => {
        const cam = createArcRotateCamera(0, 1, 10, { x: 0, y: 0, z: 0 });
        const { canvas } = fakeCanvas();
        expect(() => attachLimitedOrbit(cam, canvas, fakeScene(), 5, 2)).toThrow(RangeError);
        expect(() => attachLimitedOrbit(cam, canvas, fakeScene(), 0, 2)).toThrow(RangeError);
    });
});

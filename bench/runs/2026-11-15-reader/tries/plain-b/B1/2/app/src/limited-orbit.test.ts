import { describe, it, expect, vi } from "vitest";
import { createArcRotateCamera } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";
import { attachLimitedOrbit } from "./limited-orbit.ts";

const MIN = 2;
const MAX = 10;

function makeCanvas() {
    const target = new EventTarget();
    const canvas = Object.assign(target, {
        setPointerCapture: () => {},
        releasePointerCapture: () => {},
    });
    return canvas as unknown as HTMLCanvasElement;
}

function makeScene() {
    return { _beforeRender: [] as ((dt: number) => void)[] } as unknown as SceneContext & { _beforeRender: ((dt: number) => void)[] };
}

function frame(scene: { _beforeRender: ((dt: number) => void)[] }) {
    for (const cb of [...scene._beforeRender]) cb(16);
}

function wheel(canvas: HTMLCanvasElement, deltaY: number) {
    const ev = new Event("wheel", { cancelable: true }) as Event & { deltaY: number };
    ev.deltaY = deltaY;
    canvas.dispatchEvent(ev);
}

function touches(canvas: HTMLCanvasElement, type: string, points: { id: number; x: number; y: number }[]) {
    const ev = new Event(type, { cancelable: true }) as Event & { changedTouches: unknown[] };
    ev.changedTouches = points.map((p) => ({ identifier: p.id, clientX: p.x, clientY: p.y }));
    canvas.dispatchEvent(ev);
}

describe("attachLimitedOrbit", () => {
    it("moves a camera that starts outside the range inside it immediately", () => {
        const canvas = makeCanvas();
        const scene = makeScene();
        const far = createArcRotateCamera(0, 1, 100, { x: 0, y: 0, z: 0 });
        attachLimitedOrbit(far, canvas, scene, MIN, MAX);
        expect(far.radius).toBe(MAX);

        const near = createArcRotateCamera(0, 1, 0.1, { x: 0, y: 0, z: 0 });
        attachLimitedOrbit(near, makeCanvas(), makeScene(), MIN, MAX);
        expect(near.radius).toBe(MIN);
    });

    it("keeps the radius in range under heavy wheel zoom in both directions", () => {
        const canvas = makeCanvas();
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        attachLimitedOrbit(cam, canvas, scene, MIN, MAX);

        for (let i = 0; i < 300; i++) {
            wheel(canvas, i < 150 ? -5000 : 5000);
            frame(scene);
            expect(cam.radius).toBeGreaterThanOrEqual(MIN);
            expect(cam.radius).toBeLessThanOrEqual(MAX);
        }
        // Zoom in hard and check the camera reaches the minimum.
        for (let i = 0; i < 300; i++) {
            wheel(canvas, -5000);
            frame(scene);
        }
        expect(cam.radius).toBe(MIN);
        // Zoom out hard and check the camera reaches the maximum.
        for (let i = 0; i < 300; i++) {
            wheel(canvas, 5000);
            frame(scene);
        }
        expect(cam.radius).toBe(MAX);
    });

    it("keeps the radius in range during a pinch", () => {
        const canvas = makeCanvas();
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        attachLimitedOrbit(cam, canvas, scene, MIN, MAX);

        touches(canvas, "touchstart", [{ id: 1, x: 100, y: 100 }]);
        touches(canvas, "touchstart", [{ id: 2, x: 200, y: 100 }]);
        for (const gap of [10000, 1, 5000, 0.5, 300, 1, 4000]) {
            touches(canvas, "touchmove", [{ id: 2, x: 100 + gap, y: 100 }]);
            expect(cam.radius).toBeGreaterThanOrEqual(MIN);
            expect(cam.radius).toBeLessThanOrEqual(MAX);
        }
    });

    it("removes listeners and the per-frame hook on detach, and frees the radius", () => {
        const canvas = makeCanvas();
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        const add = vi.spyOn(canvas, "addEventListener");
        const remove = vi.spyOn(canvas, "removeEventListener");

        const detach = attachLimitedOrbit(cam, canvas, scene, MIN, MAX);
        expect(scene._beforeRender.length).toBe(1);
        expect(add).toHaveBeenCalled();

        detach();
        detach(); // idempotent
        expect(scene._beforeRender.length).toBe(0);
        for (const [type, handler] of add.mock.calls.map((c) => [c[0], c[1]])) {
            expect(remove.mock.calls.some((c) => c[0] === type && c[1] === handler)).toBe(true);
        }

        // After detach, the range no longer constrains programmatic writes.
        cam.radius = 50;
        expect(cam.radius).toBe(50);
        wheel(canvas, -5000);
        frame(scene);
        expect(cam.radius).toBeGreaterThan(0);
    });

    it("rejects an invalid range", () => {
        const canvas = makeCanvas();
        const scene = makeScene();
        const cam = createArcRotateCamera(0, 1, 5, { x: 0, y: 0, z: 0 });
        expect(() => attachLimitedOrbit(cam, canvas, scene, 10, 2)).toThrow(RangeError);
        expect(() => attachLimitedOrbit(cam, canvas, scene, 0, 2)).toThrow(RangeError);
        expect(() => attachLimitedOrbit(cam, canvas, scene, 1, Number.NaN)).toThrow(RangeError);
    });
});

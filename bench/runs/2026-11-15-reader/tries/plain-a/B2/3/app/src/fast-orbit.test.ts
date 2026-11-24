import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachFastOrbit } from "./fast-orbit";

class FakeCanvas extends EventTarget {
    setPointerCapture(): void {}
    releasePointerCapture(): void {}
}

type FrameScene = { _beforeRender: Array<() => void> };

function makeScene(): FrameScene & SceneContext {
    return { _beforeRender: [] } as unknown as FrameScene & SceneContext;
}

function runFrames(scene: FrameScene, count: number): void {
    for (let i = 0; i < count; i++) {
        for (const fn of [...scene._beforeRender]) fn();
    }
}

function fire(target: EventTarget, type: string, props: Record<string, unknown>): void {
    const e = new Event(type, { cancelable: true });
    Object.assign(e, props);
    target.dispatchEvent(e);
}

function makeCamera(): ArcRotateCamera {
    return createArcRotateCamera(0.5, 1.2, 10, { x: 0, y: 0, z: 0 });
}

function drag(canvas: FakeCanvas, dx: number, dy: number, pointerType = "mouse"): void {
    fire(canvas, "pointerdown", { pointerId: 1, pointerType, button: 0, clientX: 100, clientY: 100 });
    fire(canvas, "pointermove", { pointerId: 1, pointerType, button: 0, clientX: 100 + dx, clientY: 100 + dy });
    fire(canvas, "pointerup", { pointerId: 1, pointerType, button: 0, clientX: 100 + dx, clientY: 100 + dy });
}

/** A default-controls camera and a fast-orbit camera, identical except for the controls. */
function pair(setup?: (cam: ArcRotateCamera) => void) {
    const baseCam = makeCamera();
    const baseCanvas = new FakeCanvas();
    const baseScene = makeScene();
    attachControl(baseCam, baseCanvas as unknown as HTMLCanvasElement, baseScene);

    const fastCam = makeCamera();
    const fastCanvas = new FakeCanvas();
    const fastScene = makeScene();
    attachFastOrbit(fastCam, fastCanvas as unknown as HTMLCanvasElement, fastScene);

    setup?.(baseCam);
    setup?.(fastCam);
    return { baseCam, baseCanvas, baseScene, fastCam, fastCanvas, fastScene };
}

describe("attachFastOrbit", () => {
    it("turns the camera exactly twice as far for a horizontal drag, including glide", () => {
        const p = pair();
        const a0 = p.baseCam.alpha;
        const f0 = p.fastCam.alpha;
        drag(p.baseCanvas, 37, 0);
        drag(p.fastCanvas, 37, 0);
        runFrames(p.baseScene, 600);
        runFrames(p.fastScene, 600);

        const baseDelta = p.baseCam.alpha - a0;
        expect(Math.abs(baseDelta)).toBeGreaterThan(0.01);
        expect((p.fastCam.alpha - f0) / baseDelta).toBeCloseTo(2, 9);
    });

    it("turns the camera exactly twice as far for a vertical drag, including glide", () => {
        const p = pair();
        const b0 = p.baseCam.beta;
        const g0 = p.fastCam.beta;
        drag(p.baseCanvas, 0, -25);
        drag(p.fastCanvas, 0, -25);
        runFrames(p.baseScene, 600);
        runFrames(p.fastScene, 600);

        expect(Math.abs(p.baseCam.beta - b0)).toBeGreaterThan(0.01);
        expect((p.fastCam.beta - g0) / (p.baseCam.beta - b0)).toBeCloseTo(2, 9);
    });

    it("matches the 2x ratio over several drags, with glide between them", () => {
        const p = pair();
        const moves: Array<[number, number]> = [
            [12, -4],
            [-55, 9],
            [3, 2],
        ];
        for (const [dx, dy] of moves) {
            drag(p.baseCanvas, dx, dy);
            drag(p.fastCanvas, dx, dy);
            runFrames(p.baseScene, 7);
            runFrames(p.fastScene, 7);
        }
        runFrames(p.baseScene, 600);
        runFrames(p.fastScene, 600);
        expect((p.fastCam.alpha - 0.5) / (p.baseCam.alpha - 0.5)).toBeCloseTo(2, 9);
        expect((p.fastCam.beta - 1.2) / (p.baseCam.beta - 1.2)).toBeCloseTo(2, 9);
    });

    it("doubles touch drag rotation as well", () => {
        const p = pair();
        const a0 = p.baseCam.alpha;
        const f0 = p.fastCam.alpha;
        drag(p.baseCanvas, 50, 0, "touch");
        drag(p.fastCanvas, 50, 0, "touch");
        runFrames(p.baseScene, 600);
        runFrames(p.fastScene, 600);
        expect((p.fastCam.alpha - f0) / (p.baseCam.alpha - a0)).toBeCloseTo(2, 9);
    });

    it("holds the 2x ratio with a custom angularSensibility, and leaves it untouched", () => {
        const p = pair((cam) => {
            cam.angularSensibility = 800;
        });
        const a0 = p.baseCam.alpha;
        const f0 = p.fastCam.alpha;
        drag(p.baseCanvas, 40, 0);
        drag(p.fastCanvas, 40, 0);
        runFrames(p.baseScene, 600);
        runFrames(p.fastScene, 600);
        expect(p.fastCam.angularSensibility).toBe(800);
        expect((p.fastCam.alpha - f0) / (p.baseCam.alpha - a0)).toBeCloseTo(2, 9);
    });

    it("keeps beta inside the library's limits when dragged past the poles", () => {
        const p = pair();
        drag(p.fastCanvas, 0, 5000);
        runFrames(p.fastScene, 600);
        expect(p.fastCam.beta).toBeGreaterThanOrEqual(0.01);
        expect(p.fastCam.beta).toBeLessThanOrEqual(Math.PI - 0.01);
    });

    it("leaves wheel zoom identical to the default controls", () => {
        const p = pair();
        fire(p.baseCanvas, "wheel", { deltaY: 120 });
        fire(p.fastCanvas, "wheel", { deltaY: 120 });
        runFrames(p.baseScene, 600);
        runFrames(p.fastScene, 600);

        expect(p.fastCam.radius).toBeCloseTo(p.baseCam.radius, 9);
        expect(p.fastCam.radius).not.toBeCloseTo(10, 3);
    });

    it("removes every listener and frame hook, and stops responding, on detach", () => {
        const cam = makeCamera();
        const canvas = new FakeCanvas();
        const scene = makeScene();
        const originalAdd = canvas.addEventListener.bind(canvas);
        const originalRemove = canvas.removeEventListener.bind(canvas);
        const live = new Map<string, Set<unknown>>();
        canvas.addEventListener = (type, listener, options) => {
            if (listener) {
                if (!live.has(type)) live.set(type, new Set());
                live.get(type)!.add(listener);
            }
            originalAdd(type, listener, options);
        };
        canvas.removeEventListener = (type, listener, options) => {
            if (listener) live.get(type)?.delete(listener);
            originalRemove(type, listener, options);
        };
        const liveCount = (): number => [...live.values()].reduce((n, s) => n + s.size, 0);

        const detach = attachFastOrbit(cam, canvas as unknown as HTMLCanvasElement, scene);
        expect(liveCount()).toBeGreaterThan(0);
        expect(scene._beforeRender.length).toBeGreaterThan(0);

        detach();
        detach();

        expect(liveCount()).toBe(0);
        expect(scene._beforeRender.length).toBe(0);

        const alpha = cam.alpha;
        drag(canvas, 60, 20);
        runFrames(scene, 5);
        expect(cam.alpha).toBe(alpha);
    });

    it("refuses a second attach on the same camera until the first is detached", () => {
        const cam = makeCamera();
        const canvas = new FakeCanvas() as unknown as HTMLCanvasElement;
        const scene = makeScene();
        const detach = attachFastOrbit(cam, canvas, scene);
        expect(() => attachFastOrbit(cam, canvas, scene)).toThrow();
        detach();
        const again = attachFastOrbit(cam, canvas, scene);
        again();
        expect(scene._beforeRender.length).toBe(0);
    });
});

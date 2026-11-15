import { describe, expect, it } from "vitest";
import { createArcRotateCamera, attachControl } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachFastOrbit } from "./fast-orbit";

interface FakeCanvas {
    listeners: Map<string, EventListener[]>;
    addEventListener(type: string, h: EventListener): void;
    removeEventListener(type: string, h: EventListener): void;
    setPointerCapture(id: number): void;
    releasePointerCapture(id: number): void;
}

function makeCanvas(): FakeCanvas {
    const listeners = new Map<string, EventListener[]>();
    return {
        listeners,
        addEventListener(type, h): void {
            listeners.set(type, [...(listeners.get(type) ?? []), h]);
        },
        removeEventListener(type, h): void {
            listeners.set(
                type,
                (listeners.get(type) ?? []).filter((x) => x !== h)
            );
        },
        setPointerCapture(): void {},
        releasePointerCapture(): void {},
    };
}

function fire(canvas: FakeCanvas, type: string, ev: object): void {
    for (const h of [...(canvas.listeners.get(type) ?? [])]) {
        h(ev as Event);
    }
}

function totalListeners(canvas: FakeCanvas): number {
    let n = 0;
    for (const arr of canvas.listeners.values()) {
        n += arr.length;
    }
    return n;
}

function makeScene(): SceneContext {
    return { _beforeRender: [] } as unknown as SceneContext;
}

function runFrames(scene: SceneContext, frames: number): void {
    for (let i = 0; i < frames; i++) {
        for (const f of [...scene._beforeRender]) {
            f(16);
        }
    }
}

function drag(canvas: FakeCanvas, button: number, from: [number, number], to: [number, number]): void {
    fire(canvas, "pointerdown", { button, pointerType: "mouse", pointerId: 1, clientX: from[0], clientY: from[1] });
    fire(canvas, "pointermove", { pointerId: 1, clientX: to[0], clientY: to[1] });
    fire(canvas, "pointerup", { pointerId: 1, clientX: to[0], clientY: to[1] });
}

function makeCamera(): ArcRotateCamera {
    return createArcRotateCamera(0.5, 1.0, 10, { x: 0, y: 0, z: 0 });
}

describe("attachFastOrbit", () => {
    it("turns the camera exactly twice as far as the standard controls, drag and glide", () => {
        const stockCam = makeCamera();
        const stockCanvas = makeCanvas();
        const stockScene = makeScene();
        const detachStock = attachControl(stockCam, stockCanvas as unknown as HTMLCanvasElement, stockScene);

        const fastCam = makeCamera();
        const fastCanvas = makeCanvas();
        const fastScene = makeScene();
        const detachFast = attachFastOrbit(fastCam, fastCanvas as unknown as HTMLCanvasElement, fastScene);

        const stockAlpha0 = stockCam.alpha;
        const stockBeta0 = stockCam.beta;
        const fastAlpha0 = fastCam.alpha;
        const fastBeta0 = fastCam.beta;

        drag(stockCanvas, 0, [100, 100], [160, 70]);
        drag(fastCanvas, 0, [100, 100], [160, 70]);

        // Check the first frame (direct drag) and then the full glide, frame by frame.
        runFrames(stockScene, 1);
        runFrames(fastScene, 1);
        expect(fastCam.alpha - fastAlpha0).toBeCloseTo(2 * (stockCam.alpha - stockAlpha0), 12);
        expect(fastCam.beta - fastBeta0).toBeCloseTo(2 * (stockCam.beta - stockBeta0), 12);
        expect(stockCam.alpha - stockAlpha0).not.toBe(0);

        runFrames(stockScene, 300);
        runFrames(fastScene, 300);
        expect(fastCam.alpha - fastAlpha0).toBeCloseTo(2 * (stockCam.alpha - stockAlpha0), 9);
        expect(fastCam.beta - fastBeta0).toBeCloseTo(2 * (stockCam.beta - stockBeta0), 9);

        detachStock();
        detachFast();
    });

    it("leaves wheel zoom identical to the standard controls", () => {
        const stockCam = makeCamera();
        const stockCanvas = makeCanvas();
        const detachStock = attachControl(stockCam, stockCanvas as unknown as HTMLCanvasElement, makeScene());

        const fastCam = makeCamera();
        const fastCanvas = makeCanvas();
        const detachFast = attachFastOrbit(fastCam, fastCanvas as unknown as HTMLCanvasElement, makeScene());

        const wheel = { deltaY: 120, preventDefault(): void {} };
        fire(stockCanvas, "wheel", wheel);
        fire(fastCanvas, "wheel", wheel);

        expect(fastCam.inertialRadiusOffset).toBe(stockCam.inertialRadiusOffset);
        expect(fastCam.inertialRadiusOffset).not.toBe(0);

        detachStock();
        detachFast();
    });

    it("removes all listeners and both per-frame hooks on detach, and is idempotent", () => {
        const cam = makeCamera();
        const canvas = makeCanvas();
        const scene = makeScene();

        const detach = attachFastOrbit(cam, canvas as unknown as HTMLCanvasElement, scene);
        expect(totalListeners(canvas)).toBeGreaterThan(0);
        expect(scene._beforeRender.length).toBe(3);

        detach();
        expect(totalListeners(canvas)).toBe(0);
        expect(scene._beforeRender.length).toBe(0);

        expect(() => detach()).not.toThrow();
        expect(scene._beforeRender.length).toBe(0);
    });
});

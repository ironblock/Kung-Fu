import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachFastOrbit } from "./fast-orbit.ts";

type Listener = (e: unknown) => void;

/** Minimal canvas stand-in that records listeners and dispatches synthetic events. */
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
    const dispatch = (type: string, event: Record<string, unknown>) => {
        for (const fn of listeners.get(type) ?? []) fn(event);
    };
    const count = () => [...listeners.values()].reduce((n, s) => n + s.size, 0);
    return { canvas: canvas as unknown as HTMLCanvasElement, dispatch, count };
}

function fakeScene() {
    return { _beforeRender: [] as ((deltaMs: number) => void)[] } as unknown as SceneContext & {
        _beforeRender: ((deltaMs: number) => void)[];
    };
}

function runFrames(scene: { _beforeRender: ((d: number) => void)[] }, frames = 600) {
    for (let i = 0; i < frames; i++) for (const cb of [...scene._beforeRender]) cb(16);
}

function newCamera(): ArcRotateCamera {
    return createArcRotateCamera(0.3, Math.PI / 2, 10, { x: 0, y: 0, z: 0 } as never);
}

/** Drags with the primary button by (dx, dy) in several steps, then releases and lets inertia settle. */
function drag(canvas: ReturnType<typeof fakeCanvas>, scene: { _beforeRender: ((d: number) => void)[] }, dx: number, dy: number) {
    canvas.dispatch("pointerdown", { pointerId: 1, pointerType: "mouse", button: 0, clientX: 200, clientY: 200 });
    const steps = 5;
    for (let i = 1; i <= steps; i++) {
        canvas.dispatch("pointermove", {
            pointerId: 1,
            pointerType: "mouse",
            button: 0,
            clientX: 200 + (dx * i) / steps,
            clientY: 200 + (dy * i) / steps,
        });
    }
    canvas.dispatch("pointerup", { pointerId: 1, pointerType: "mouse", button: 0, clientX: 200 + dx, clientY: 200 + dy });
    runFrames(scene);
}

describe("attachFastOrbit", () => {
    it("turns the camera twice as far as the library default for horizontal and vertical drags, including glide", () => {
        const refCam = newCamera();
        const refCanvas = fakeCanvas();
        const refScene = fakeScene();
        attachControl(refCam, refCanvas.canvas, refScene);

        const fastCam = newCamera();
        const fastCanvas = fakeCanvas();
        const fastScene = fakeScene();
        const detach = attachFastOrbit(fastCam, fastCanvas.canvas, fastScene);

        const refStart = { a: refCam.alpha, b: refCam.beta };
        const fastStart = { a: fastCam.alpha, b: fastCam.beta };

        drag(refCanvas, refScene, 80, -30);
        drag(fastCanvas, fastScene, 80, -30);

        const refDA = refCam.alpha - refStart.a;
        const refDB = refCam.beta - refStart.b;
        const fastDA = fastCam.alpha - fastStart.a;
        const fastDB = fastCam.beta - fastStart.b;

        expect(Math.abs(refDA)).toBeGreaterThan(0.01);
        expect(Math.abs(refDB)).toBeGreaterThan(0.01);
        expect(fastDA / refDA).toBeCloseTo(2, 9);
        expect(fastDB / refDB).toBeCloseTo(2, 9);

        detach();
    });

    it("keeps the 2x ratio for small drags, where the glide cutoff matters most", () => {
        const refCam = newCamera();
        const refCanvas = fakeCanvas();
        const refScene = fakeScene();
        attachControl(refCam, refCanvas.canvas, refScene);

        const fastCam = newCamera();
        const fastCanvas = fakeCanvas();
        const fastScene = fakeScene();
        const detach = attachFastOrbit(fastCam, fastCanvas.canvas, fastScene);

        drag(refCanvas, refScene, 6, 4);
        drag(fastCanvas, fastScene, 6, 4);

        expect((fastCam.alpha - 0.3) / (refCam.alpha - 0.3)).toBeCloseTo(2, 9);
        expect((fastCam.beta - Math.PI / 2) / (refCam.beta - Math.PI / 2)).toBeCloseTo(2, 9);
        detach();
    });

    it("leaves wheel zoom identical to the library default", () => {
        const refCam = newCamera();
        const refCanvas = fakeCanvas();
        const refScene = fakeScene();
        attachControl(refCam, refCanvas.canvas, refScene);

        const fastCam = newCamera();
        const fastCanvas = fakeCanvas();
        const fastScene = fakeScene();
        const detach = attachFastOrbit(fastCam, fastCanvas.canvas, fastScene);

        const wheel = { deltaY: 120, preventDefault() {} };
        refCanvas.dispatch("wheel", wheel);
        fastCanvas.dispatch("wheel", wheel);
        runFrames(refScene);
        runFrames(fastScene);

        expect(fastCam.radius).toBeCloseTo(refCam.radius, 9);
        detach();
    });

    it("removes all canvas listeners and per-frame hooks on cleanup, and leaves camera config untouched", () => {
        const cam = newCamera();
        const original = cam.angularSensibility;
        const canvas = fakeCanvas();
        const scene = fakeScene();

        const detach = attachFastOrbit(cam, canvas.canvas, scene);
        expect(canvas.count()).toBeGreaterThan(0);
        expect(scene._beforeRender.length).toBe(3); // capture, library inertia, extra rotation
        expect(cam.angularSensibility).toBe(original);

        detach();
        detach(); // idempotent
        expect(canvas.count()).toBe(0);
        expect(scene._beforeRender.length).toBe(0);
        expect(cam.angularSensibility).toBe(original);
    });
});

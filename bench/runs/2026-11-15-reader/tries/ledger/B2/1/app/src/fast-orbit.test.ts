import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachFastOrbit } from "./fast-orbit.ts";

type Hook = (deltaMs: number) => void;

function makeScene(): SceneContext {
    return { _beforeRender: [] as Hook[] } as unknown as SceneContext;
}

function makeCanvas() {
    const target = new EventTarget();
    const added: [string, EventListenerOrEventListenerObject][] = [];
    const removed: [string, EventListenerOrEventListenerObject][] = [];
    const canvas = Object.assign(target, {
        setPointerCapture() {},
        releasePointerCapture() {},
        addEventListener(type: string, listener: EventListenerOrEventListenerObject | null) {
            added.push([type, listener!]);
            EventTarget.prototype.addEventListener.call(target, type, listener);
        },
        removeEventListener(type: string, listener: EventListenerOrEventListenerObject | null) {
            removed.push([type, listener!]);
            EventTarget.prototype.removeEventListener.call(target, type, listener);
        },
    });
    return { canvas: canvas as unknown as HTMLCanvasElement, added, removed };
}

function pointer(canvas: HTMLCanvasElement, type: string, x: number, y: number, button = 0, pointerType = "mouse"): void {
    canvas.dispatchEvent(Object.assign(new Event(type), { clientX: x, clientY: y, button, pointerId: 1, pointerType }));
}

function frames(scene: SceneContext, count: number): void {
    for (let i = 0; i < count; i++) {
        for (const hook of scene._beforeRender) {
            hook(16);
        }
    }
}

function makeCamera(): ArcRotateCamera {
    return createArcRotateCamera(0.5, 1.2, 10, { x: 0, y: 0, z: 0 });
}

/** Drag by a fixed mouse path, one frame per move, then glide until the offsets have decayed. */
function dragAndGlide(camera: ArcRotateCamera, canvas: HTMLCanvasElement, scene: SceneContext, moves: [number, number][]): void {
    pointer(canvas, "pointerdown", 100, 100);
    let x = 100;
    let y = 100;
    for (const [dx, dy] of moves) {
        x += dx;
        y += dy;
        pointer(canvas, "pointermove", x, y);
        frames(scene, 1);
    }
    pointer(canvas, "pointerup", x, y);
    frames(scene, 600);
    expect(camera.inertialAlphaOffset).toBe(0);
    expect(camera.inertialBetaOffset).toBe(0);
}

const PATH: [number, number][] = [
    [12, -8],
    [30, 5],
    [-7, 14],
    [4, -3],
];

describe("attachFastOrbit", () => {
    it("turns the camera exactly twice as far as the default controls for the same drag and glide", () => {
        const defaultCam = makeCamera();
        const defaultScene = makeScene();
        const defaultCanvas = makeCanvas();
        attachControl(defaultCam, defaultCanvas.canvas, defaultScene);
        dragAndGlide(defaultCam, defaultCanvas.canvas, defaultScene, PATH);

        const fastCam = makeCamera();
        const fastScene = makeScene();
        const fastCanvas = makeCanvas();
        attachFastOrbit(fastCam, fastCanvas.canvas, fastScene);
        dragAndGlide(fastCam, fastCanvas.canvas, fastScene, PATH);

        const dAlphaDefault = defaultCam.alpha - 0.5;
        const dBetaDefault = defaultCam.beta - 1.2;
        expect(Math.abs(dAlphaDefault)).toBeGreaterThan(0.01);
        expect(Math.abs(dBetaDefault)).toBeGreaterThan(0.01);
        expect((fastCam.alpha - 0.5) / dAlphaDefault).toBeCloseTo(2, 9);
        expect((fastCam.beta - 1.2) / dBetaDefault).toBeCloseTo(2, 9);
    });

    it("doubles each frame's step during the drag itself", () => {
        const defaultCam = makeCamera();
        const defaultScene = makeScene();
        const defaultCanvas = makeCanvas();
        attachControl(defaultCam, defaultCanvas.canvas, defaultScene);
        const fastCam = makeCamera();
        const fastScene = makeScene();
        const fastCanvas = makeCanvas();
        attachFastOrbit(fastCam, fastCanvas.canvas, fastScene);

        pointer(defaultCanvas.canvas, "pointerdown", 0, 0);
        pointer(fastCanvas.canvas, "pointerdown", 0, 0);
        pointer(defaultCanvas.canvas, "pointermove", 40, -25);
        pointer(fastCanvas.canvas, "pointermove", 40, -25);
        frames(defaultScene, 1);
        frames(fastScene, 1);
        expect((fastCam.alpha - 0.5) / (defaultCam.alpha - 0.5)).toBeCloseTo(2, 12);
        expect((fastCam.beta - 1.2) / (defaultCam.beta - 1.2)).toBeCloseTo(2, 12);
    });

    it("leaves wheel zoom exactly as the default controls do it", () => {
        const defaultCam = makeCamera();
        const defaultScene = makeScene();
        const defaultCanvas = makeCanvas();
        attachControl(defaultCam, defaultCanvas.canvas, defaultScene);
        const fastCam = makeCamera();
        const fastScene = makeScene();
        const fastCanvas = makeCanvas();
        attachFastOrbit(fastCam, fastCanvas.canvas, fastScene);

        for (const [canvas, scene] of [
            [defaultCanvas.canvas, defaultScene],
            [fastCanvas.canvas, fastScene],
        ] as const) {
            canvas.dispatchEvent(Object.assign(new Event("wheel", { cancelable: true }), { deltaY: 120 }));
            frames(scene, 300);
        }
        expect(fastCam.radius).toBe(defaultCam.radius);
        expect(fastCam.radius).not.toBe(10);
    });

    it("doubles one-finger touch drags too", () => {
        const defaultCam = makeCamera();
        const defaultScene = makeScene();
        const defaultCanvas = makeCanvas();
        attachControl(defaultCam, defaultCanvas.canvas, defaultScene);
        const fastCam = makeCamera();
        const fastScene = makeScene();
        const fastCanvas = makeCanvas();
        attachFastOrbit(fastCam, fastCanvas.canvas, fastScene);

        dragAndGlide(defaultCam, defaultCanvas.canvas, defaultScene, PATH.map(([dx, dy]) => [dx, dy]));
        // Re-run as a touch sequence on the fast camera only: same path, pointerType "touch".
        pointer(fastCanvas.canvas, "pointerdown", 100, 100, 0, "touch");
        let x = 100;
        let y = 100;
        for (const [dx, dy] of PATH) {
            x += dx;
            y += dy;
            pointer(fastCanvas.canvas, "pointermove", x, y, 0, "touch");
            frames(fastScene, 1);
        }
        pointer(fastCanvas.canvas, "pointerup", x, y, 0, "touch");
        frames(fastScene, 600);
        expect((fastCam.alpha - 0.5) / (defaultCam.alpha - 0.5)).toBeCloseTo(2, 9);
    });

    it("removes its canvas listeners and both frame hooks when detached, and is safe to call twice", () => {
        const cam = makeCamera();
        const scene = makeScene();
        const { canvas, added, removed } = makeCanvas();
        const detach = attachFastOrbit(cam, canvas, scene);
        expect(scene._beforeRender.length).toBe(3);
        expect(added.length).toBe(11);

        detach();
        expect(scene._beforeRender.length).toBe(0);
        for (const [type, listener] of added) {
            expect(removed.some(([t, l]) => t === type && l === listener)).toBe(true);
        }

        const alphaBefore = cam.alpha;
        pointer(canvas, "pointerdown", 0, 0);
        pointer(canvas, "pointermove", 50, 50);
        frames(scene, 5);
        expect(cam.alpha).toBe(alphaBefore);

        expect(() => detach()).not.toThrow();
        expect(scene._beforeRender.length).toBe(0);
    });
});

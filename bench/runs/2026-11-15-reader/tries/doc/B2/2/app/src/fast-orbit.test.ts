import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachFastOrbit } from "./fast-orbit";

type Listener = (ev: unknown) => void;

function makeCanvas() {
    const listeners = new Map<string, Listener[]>();
    return {
        listeners,
        addEventListener(type: string, h: Listener) {
            listeners.set(type, [...(listeners.get(type) ?? []), h]);
        },
        removeEventListener(type: string, h: Listener) {
            listeners.set(
                type,
                (listeners.get(type) ?? []).filter((x) => x !== h)
            );
        },
        setPointerCapture() {},
        releasePointerCapture() {},
    };
}
type FakeCanvas = ReturnType<typeof makeCanvas>;

function fire(canvas: FakeCanvas, type: string, ev: unknown) {
    for (const h of [...(canvas.listeners.get(type) ?? [])]) h(ev);
}

function makeScene() {
    return { _beforeRender: [] as ((deltaMs: number) => void)[] };
}

function runFrames(scene: { _beforeRender: ((deltaMs: number) => void)[] }, n: number) {
    for (let i = 0; i < n; i++) for (const f of [...scene._beforeRender]) f(16);
}

function press(canvas: FakeCanvas, button = 0, pointerType = "mouse") {
    fire(canvas, "pointerdown", { button, pointerId: 1, pointerType, clientX: 0, clientY: 0 });
}
function move(canvas: FakeCanvas, x: number, y: number, pointerType = "mouse") {
    fire(canvas, "pointermove", { pointerId: 1, pointerType, clientX: x, clientY: y });
}
function release(canvas: FakeCanvas, pointerType = "mouse") {
    fire(canvas, "pointerup", { button: 0, pointerId: 1, pointerType, clientX: 0, clientY: 0 });
}

function makeCam(): ArcRotateCamera {
    return createArcRotateCamera(0.5, 1.0, 10, { x: 0, y: 0, z: 0 } as never);
}

/** Two identical cameras: one driven by the library default, one by attachFastOrbit. */
function pair() {
    const ref = makeCam();
    const refCanvas = makeCanvas();
    const refScene = makeScene();
    attachControl(ref, refCanvas as unknown as HTMLCanvasElement, refScene as unknown as SceneContext);

    const fast = makeCam();
    const fastCanvas = makeCanvas();
    const fastScene = makeScene();
    const detach = attachFastOrbit(fast, fastCanvas as unknown as HTMLCanvasElement, fastScene as unknown as SceneContext);
    return { ref, refCanvas, refScene, fast, fastCanvas, fastScene, detach };
}

describe("attachFastOrbit", () => {
    it("turns the camera exactly twice as far as the default for the same drag, both axes", () => {
        const p = pair();
        const a0 = p.ref.alpha,
            b0 = p.ref.beta;
        const fa0 = p.fast.alpha,
            fb0 = p.fast.beta;
        for (const c of [p.refCanvas, p.fastCanvas]) {
            press(c);
            move(c, 37, -21);
        }
        runFrames(p.refScene, 1);
        runFrames(p.fastScene, 1);

        expect(p.ref.alpha - a0).not.toBe(0);
        expect(p.fast.alpha - fa0).toBeCloseTo(2 * (p.ref.alpha - a0), 12);
        expect(p.fast.beta - fb0).toBeCloseTo(2 * (p.ref.beta - b0), 12);
    });

    it("doubles the glide after release exactly, including tiny slow drags", () => {
        for (const dx of [50, 1, 0.3]) {
            const p = pair();
            for (const c of [p.refCanvas, p.fastCanvas]) {
                press(c);
                move(c, dx, dx / 2);
                release(c);
            }
            const a0 = p.ref.alpha,
                b0 = p.ref.beta;
            const fa0 = p.fast.alpha,
                fb0 = p.fast.beta;
            runFrames(p.refScene, 120);
            runFrames(p.fastScene, 120);
            expect(p.ref.alpha - a0).not.toBe(0);
            expect(p.fast.alpha - fa0).toBeCloseTo(2 * (p.ref.alpha - a0), 12);
            expect(p.fast.beta - fb0).toBeCloseTo(2 * (p.ref.beta - b0), 12);
        }
    });

    it("leaves wheel zoom unchanged", () => {
        const p = pair();
        const wheel = { deltaY: 120, preventDefault() {} };
        fire(p.refCanvas, "wheel", wheel);
        fire(p.fastCanvas, "wheel", wheel);
        expect(p.fast.inertialRadiusOffset).toBe(p.ref.inertialRadiusOffset);
        expect(p.fast.angularSensibility).toBe(p.ref.angularSensibility);
    });

    it("cleanup removes canvas listeners and the per-frame hook, and is idempotent", () => {
        const p = pair();
        expect(p.fastScene._beforeRender.length).toBe(1);
        p.detach();
        p.detach();
        for (const [, hs] of p.fastCanvas.listeners) expect(hs.length).toBe(0);
        expect(p.fastScene._beforeRender.length).toBe(0);
    });
});

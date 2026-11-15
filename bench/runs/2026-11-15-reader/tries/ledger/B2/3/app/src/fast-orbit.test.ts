import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";
import { attachFastOrbit } from "./fast-orbit";

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
    };
    const dispatch = (type: string, e: object) => {
        for (const fn of [...(listeners.get(type) ?? [])]) fn(e);
    };
    const count = () => [...listeners.values()].reduce((n, s) => n + s.size, 0);
    return { canvas: canvas as unknown as HTMLCanvasElement, dispatch, count };
}

function fakeScene() {
    const beforeRender: ((dt: number) => void)[] = [];
    const frame = () => beforeRender.forEach((cb) => cb(16));
    return { scene: { _beforeRender: beforeRender } as unknown as SceneContext, beforeRender, frame };
}

/** Drive one drag of (dx, dy) pixels then run frames until the glide is over. */
function runGesture(
    attach: (cam: ReturnType<typeof createArcRotateCamera>, canvas: HTMLCanvasElement, scene: SceneContext) => () => void,
    moves: [number, number][]
) {
    const cam = createArcRotateCamera(0.7, 1.1, 10, { x: 0, y: 0, z: 0 });
    const { canvas, dispatch } = fakeCanvas();
    const { scene, frame } = fakeScene();
    const detach = attach(cam, canvas, scene);
    let x = 100;
    let y = 100;
    dispatch("pointerdown", { clientX: x, clientY: y, button: 0, pointerType: "mouse", pointerId: 1 });
    for (const [dx, dy] of moves) {
        x += dx;
        y += dy;
        dispatch("pointermove", { clientX: x, clientY: y, button: 0, pointerType: "mouse", pointerId: 1 });
        frame();
    }
    dispatch("pointerup", { clientX: x, clientY: y, button: 0, pointerType: "mouse", pointerId: 1 });
    const a0 = cam.alpha;
    const b0 = cam.beta;
    for (let i = 0; i < 400; i++) frame();
    return { cam, detach, alpha: cam.alpha - a0 + 0, beta: cam.beta - b0, alphaStart: a0, betaStart: b0 };
}

describe("attachFastOrbit", () => {
    const gestures: Record<string, [number, number][]> = {
        "single flick": [[30, -12]],
        "slow drag": [[2, 1], [3, -2], [4, 0], [1, 1]],
        "horizontal only": [[-25, 0], [-10, 0]],
        "vertical only": [[0, 18], [0, 6]],
    };

    for (const [name, moves] of Object.entries(gestures)) {
        it(`turns exactly twice as far as the library default, including glide: ${name}`, () => {
            const base = runGesture((c, cv, s) => attachControl(c, cv, s), moves);
            const fast = runGesture((c, cv, s) => attachFastOrbit(c, cv, s), moves);
            const baseAlpha = base.cam.alpha - base.alphaStart;
            const fastAlpha = fast.cam.alpha - fast.alphaStart;
            const baseBeta = base.cam.beta - base.betaStart;
            const fastBeta = fast.cam.beta - fast.betaStart;
            expect(Math.abs(baseAlpha) + Math.abs(baseBeta)).toBeGreaterThan(0);
            expect(fastAlpha).toBeCloseTo(2 * baseAlpha, 12);
            expect(fastBeta).toBeCloseTo(2 * baseBeta, 12);
            base.detach();
            fast.detach();
        });
    }

    it("leaves wheel zoom identical to the library default", () => {
        const run = (attach: typeof attachControl | typeof attachFastOrbit) => {
            const cam = createArcRotateCamera(0.7, 1.1, 10, { x: 0, y: 0, z: 0 });
            const { canvas, dispatch } = fakeCanvas();
            const { scene, frame } = fakeScene();
            attach(cam, canvas, scene);
            dispatch("wheel", { deltaY: 120, preventDefault() {} });
            for (let i = 0; i < 200; i++) frame();
            return cam.radius;
        };
        expect(run(attachFastOrbit)).toBeCloseTo(run(attachControl), 12);
    });

    it("removes its canvas listeners and per-frame hook on cleanup", () => {
        const cam = createArcRotateCamera(0.7, 1.1, 10, { x: 0, y: 0, z: 0 });
        const { canvas, count } = fakeCanvas();
        const { scene, beforeRender } = fakeScene();
        const detach = attachFastOrbit(cam, canvas, scene);
        expect(count()).toBeGreaterThan(0);
        expect(beforeRender.length).toBe(1);
        detach();
        expect(count()).toBe(0);
        expect(beforeRender.length).toBe(0);
        detach();
        expect(beforeRender.length).toBe(0);
    });
});

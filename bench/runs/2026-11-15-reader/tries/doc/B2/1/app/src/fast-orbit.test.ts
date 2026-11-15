import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachFastOrbit } from "./fast-orbit";

type Handler = (e: unknown) => void;

/** Minimal canvas double: records listeners and pointer capture. */
function fakeCanvas() {
    const listeners = new Map<string, Set<Handler>>();
    const canvas = {
        addEventListener(type: string, fn: Handler) {
            if (!listeners.has(type)) listeners.set(type, new Set());
            listeners.get(type)!.add(fn);
        },
        removeEventListener(type: string, fn: Handler) {
            listeners.get(type)?.delete(fn);
        },
        setPointerCapture() {},
        releasePointerCapture() {},
    };
    const dispatch = (type: string, e: Record<string, unknown>) => {
        for (const fn of [...(listeners.get(type) ?? [])]) fn({ preventDefault() {}, ...e });
    };
    const count = () => [...listeners.values()].reduce((n, s) => n + s.size, 0);
    return { canvas: canvas as unknown as HTMLCanvasElement, dispatch, count };
}

function fakeScene() {
    const beforeRender: Array<() => void> = [];
    const scene = { _beforeRender: beforeRender } as unknown as SceneContext;
    const frame = () => beforeRender.slice().forEach((fn) => fn());
    return { scene, beforeRender, frame };
}

function drag(dispatch: (type: string, e: Record<string, unknown>) => void, dx: number, dy: number) {
    dispatch("pointerdown", { button: 0, pointerType: "mouse", pointerId: 1, clientX: 100, clientY: 100 });
    dispatch("pointermove", { pointerId: 1, clientX: 100 + dx, clientY: 100 + dy });
    dispatch("pointerup", { pointerId: 1, button: 0, pointerType: "mouse", clientX: 100 + dx, clientY: 100 + dy });
}

describe("attachFastOrbit", () => {
    it("turns the camera exactly twice as far as the default controls, including glide", () => {
        const refCam: ArcRotateCamera = createArcRotateCamera(0.5, 1.0, 10, { x: 0, y: 0, z: 0 });
        const refC = fakeCanvas();
        const refS = fakeScene();
        const detachRef = attachControl(refCam, refC.canvas, refS.scene);

        const fastCam: ArcRotateCamera = createArcRotateCamera(0.5, 1.0, 10, { x: 0, y: 0, z: 0 });
        const fastC = fakeCanvas();
        const fastS = fakeScene();
        const detachFast = attachFastOrbit(fastCam, fastC.canvas, fastS.scene);

        drag(refC.dispatch, 30, -20);
        drag(fastC.dispatch, 30, -20);
        // Input is the library's own; the doubling happens when the offsets are applied.
        expect(fastCam.inertialAlphaOffset).toBeCloseTo(refCam.inertialAlphaOffset, 12);
        expect(fastCam.inertialBetaOffset).toBeCloseTo(refCam.inertialBetaOffset, 12);

        const refAlpha0 = refCam.alpha;
        const refBeta0 = refCam.beta;
        const fastAlpha0 = fastCam.alpha;
        const fastBeta0 = fastCam.beta;
        for (let i = 0; i < 300; i++) {
            refS.frame();
            fastS.frame();
        }
        expect(fastCam.alpha - fastAlpha0).toBeCloseTo(2 * (refCam.alpha - refAlpha0), 9);
        expect(fastCam.beta - fastBeta0).toBeCloseTo(2 * (refCam.beta - refBeta0), 9);

        detachRef();
        detachFast();
    });

    it("leaves wheel zoom unchanged", () => {
        const refCam = createArcRotateCamera(0.5, 1.0, 10, { x: 0, y: 0, z: 0 });
        const refC = fakeCanvas();
        const refS = fakeScene();
        const detachRef = attachControl(refCam, refC.canvas, refS.scene);

        const fastCam = createArcRotateCamera(0.5, 1.0, 10, { x: 0, y: 0, z: 0 });
        const fastC = fakeCanvas();
        const fastS = fakeScene();
        const detachFast = attachFastOrbit(fastCam, fastC.canvas, fastS.scene);

        refC.dispatch("wheel", { deltaY: 120 });
        fastC.dispatch("wheel", { deltaY: 120 });
        expect(fastCam.inertialRadiusOffset).toBe(refCam.inertialRadiusOffset);

        detachRef();
        detachFast();
    });

    it("cleanup removes all canvas listeners and both per-frame hooks", () => {
        const cam = createArcRotateCamera(0.5, 1.0, 10, { x: 0, y: 0, z: 0 });
        const c = fakeCanvas();
        const s = fakeScene();
        const before = c.count();

        const detach = attachFastOrbit(cam, c.canvas, s.scene);
        expect(c.count()).toBeGreaterThan(before);
        expect(s.beforeRender.length).toBe(3);

        detach();
        expect(c.count()).toBe(before);
        expect(s.beforeRender.length).toBe(0);

        // Second call is a no-op.
        detach();
        expect(c.count()).toBe(before);
    });
});

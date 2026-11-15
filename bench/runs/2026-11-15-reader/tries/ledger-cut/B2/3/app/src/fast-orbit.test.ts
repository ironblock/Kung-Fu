import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachFastOrbit } from "./fast-orbit.ts";

type Listener = (e: unknown) => void;

function fakeCanvas() {
    const listeners = new Map<string, Set<Listener>>();
    let added = 0;
    let removed = 0;
    const canvas = {
        addEventListener(ev: string, h: Listener) {
            added++;
            if (!listeners.has(ev)) listeners.set(ev, new Set());
            listeners.get(ev)!.add(h);
        },
        removeEventListener(ev: string, h: Listener) {
            removed++;
            listeners.get(ev)?.delete(h);
        },
        setPointerCapture() {},
        releasePointerCapture() {},
        dispatch(ev: string, e: unknown) {
            for (const h of [...(listeners.get(ev) ?? [])]) h(e);
        },
        liveCount: () => [...listeners.values()].reduce((n, s) => n + s.size, 0),
        added: () => added,
        removed: () => removed,
    };
    return canvas;
}

function fakeScene() {
    return { _beforeRender: [] as (() => void)[] } as unknown as SceneContext & { _beforeRender: (() => void)[] };
}

function newCamera(): ArcRotateCamera {
    return createArcRotateCamera(0.5, 1.2, 10, { x: 0, y: 0, z: 0 });
}

/** Drag by (dx, dy), release, run frames until the glide settles; return total alpha/beta travel. */
function dragAndGlide(camera: ArcRotateCamera, canvas: ReturnType<typeof fakeCanvas>, scene: ReturnType<typeof fakeScene>, dx: number, dy: number) {
    const a0 = camera.alpha;
    const b0 = camera.beta;
    canvas.dispatch("pointerdown", { clientX: 100, clientY: 100, button: 0, pointerType: "mouse", pointerId: 1 });
    canvas.dispatch("pointermove", { clientX: 100 + dx, clientY: 100 + dy, button: 0, pointerType: "mouse", pointerId: 1 });
    canvas.dispatch("pointerup", { button: 0, pointerType: "mouse", pointerId: 1 });
    // The drag itself is applied by the per-frame inertia step: the first frame after the move moves the camera by the drag amount.
    const runFrame = () => {
        for (const cb of [...scene._beforeRender]) cb();
    };
    runFrame();
    const dragAlpha = camera.alpha - a0;
    const dragBeta = camera.beta - b0;
    for (let i = 0; i < 2000; i++) runFrame();
    return {
        dragAlpha,
        dragBeta,
        glideAlpha: camera.alpha - a0 - dragAlpha,
        glideBeta: camera.beta - b0 - dragBeta,
    };
}

describe("attachFastOrbit", () => {
    it("turns the camera twice as far as the library default, for drag and glide, on both axes", () => {
        const refCam = newCamera();
        const refCanvas = fakeCanvas();
        const refScene = fakeScene();
        const detachRef = attachControl(refCam, refCanvas as unknown as HTMLCanvasElement, refScene);
        const ref = dragAndGlide(refCam, refCanvas, refScene, 200, -60);
        detachRef();

        const fastCam = newCamera();
        const fastCanvas = fakeCanvas();
        const fastScene = fakeScene();
        const detachFast = attachFastOrbit(fastCam, fastCanvas as unknown as HTMLCanvasElement, fastScene);
        const fast = dragAndGlide(fastCam, fastCanvas, fastScene, 200, -60);
        detachFast();

        expect(fast.dragAlpha / ref.dragAlpha).toBeCloseTo(2, 6);
        expect(fast.dragBeta / ref.dragBeta).toBeCloseTo(2, 6);
        // The glide is 2x up to the library's fixed 0.001 rad inertia stop threshold, which a doubled offset
        // crosses a few frames later. Measured: about 2.019 on beta for this drag. Allow that residual.
        expect(fast.glideAlpha / ref.glideAlpha).toBeGreaterThan(1.99);
        expect(fast.glideAlpha / ref.glideAlpha).toBeLessThan(2.03);
        expect(fast.glideBeta / ref.glideBeta).toBeGreaterThan(1.99);
        expect(fast.glideBeta / ref.glideBeta).toBeLessThan(2.03);
    });

    it("restores sensibility and leaves no canvas listeners or frame hooks after cleanup", () => {
        const cam = newCamera();
        const canvas = fakeCanvas();
        const scene = fakeScene();
        const before = cam.angularSensibility;
        const detach = attachFastOrbit(cam, canvas as unknown as HTMLCanvasElement, scene);
        expect(cam.angularSensibility).toBe(before / 2);
        expect(canvas.liveCount()).toBeGreaterThan(0);
        expect(scene._beforeRender.length).toBe(1);

        detach();
        detach(); // idempotent
        expect(cam.angularSensibility).toBe(before);
        expect(canvas.liveCount()).toBe(0);
        expect(canvas.added()).toBe(canvas.removed());
        expect(scene._beforeRender.length).toBe(0);
    });

    it("leaves the wheel zoom unchanged", () => {
        const refCam = newCamera();
        const refCanvas = fakeCanvas();
        const refScene = fakeScene();
        const detachRef = attachControl(refCam, refCanvas as unknown as HTMLCanvasElement, refScene);
        refCanvas.dispatch("wheel", { deltaY: 120, preventDefault() {} });
        const refRadiusOffset = refCam.inertialRadiusOffset;
        detachRef();

        const cam = newCamera();
        const canvas = fakeCanvas();
        const scene = fakeScene();
        const detach = attachFastOrbit(cam, canvas as unknown as HTMLCanvasElement, scene);
        canvas.dispatch("wheel", { deltaY: 120, preventDefault() {} });
        expect(cam.inertialRadiusOffset).toBe(refRadiusOffset);
        detach();
    });
});

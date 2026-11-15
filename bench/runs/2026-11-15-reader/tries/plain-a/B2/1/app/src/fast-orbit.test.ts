import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera, SceneContext } from "@babylonjs/lite";
import { attachFastOrbit } from "./fast-orbit.ts";

type Handler = (e: unknown) => void;

/** Minimal canvas stand-in that records listeners so tests can drive them directly. */
function fakeCanvas() {
    const listeners = new Map<string, Set<Handler>>();
    const canvas = {
        addEventListener(ev: string, h: Handler) {
            if (!listeners.has(ev)) listeners.set(ev, new Set());
            listeners.get(ev)!.add(h);
        },
        removeEventListener(ev: string, h: Handler) {
            listeners.get(ev)?.delete(h);
        },
        setPointerCapture() {},
        releasePointerCapture() {},
    };
    const fire = (ev: string, e: Record<string, unknown>) => {
        for (const h of [...(listeners.get(ev) ?? [])]) h(e);
    };
    const count = () => [...listeners.values()].reduce((n, s) => n + s.size, 0);
    return { canvas: canvas as unknown as HTMLCanvasElement, fire, count };
}

function fakeScene() {
    const scene = { _beforeRender: [] as ((ms: number) => void)[] };
    const frame = () => [...scene._beforeRender].forEach((f) => f(16));
    return { scene: scene as unknown as SceneContext, frame, hooks: scene._beforeRender };
}

function makeCamera(): ArcRotateCamera {
    return createArcRotateCamera(0.3, 1.1, 10, { x: 0, y: 0, z: 0 });
}

function drag(fire: (ev: string, e: Record<string, unknown>) => void, button: number, dx: number, dy: number, pointerType = "mouse") {
    fire("pointerdown", { button, pointerId: 1, pointerType, clientX: 100, clientY: 100 });
    fire("pointermove", { button, pointerId: 1, pointerType, clientX: 100 + dx, clientY: 100 + dy });
    fire("pointerup", { button, pointerId: 1, pointerType, clientX: 100 + dx, clientY: 100 + dy });
}

/** Run the default controls and the fast controls side by side with the same input. */
function setup() {
    const ref = makeCamera();
    const refCanvas = fakeCanvas();
    const refScene = fakeScene();
    attachControl(ref, refCanvas.canvas, refScene.scene);

    const fast = makeCamera();
    const fastCanvas = fakeCanvas();
    const fastScene = fakeScene();
    const detach = attachFastOrbit(fast, fastCanvas.canvas, fastScene.scene);
    return { ref, refCanvas, refScene, fast, fastCanvas, fastScene, detach };
}

describe("attachFastOrbit", () => {
    it("turns the camera twice as far per frame as the default controls, drag and glide", () => {
        const s = setup();
        const { ref, fast } = s;
        const refAlpha0 = ref.alpha, refBeta0 = ref.beta;
        const fastAlpha0 = fast.alpha, fastBeta0 = fast.beta;

        drag(s.refCanvas.fire, 0, 37, -21);
        drag(s.fastCanvas.fire, 0, 37, -21);

        // Same input, same accumulated offsets: the doubling happens when they are applied.
        expect(fast.inertialAlphaOffset).toBeCloseTo(ref.inertialAlphaOffset, 12);
        expect(fast.inertialBetaOffset).toBeCloseTo(ref.inertialBetaOffset, 12);

        s.refScene.frame();
        s.fastScene.frame();
        expect(fast.alpha - fastAlpha0).toBeCloseTo(2 * (ref.alpha - refAlpha0), 12);
        expect(fast.beta - fastBeta0).toBeCloseTo(2 * (ref.beta - refBeta0), 12);

        for (let i = 0; i < 300; i++) {
            s.refScene.frame();
            s.fastScene.frame();
        }
        expect(Math.abs(ref.alpha - refAlpha0)).toBeGreaterThan(0.1);
        expect(fast.alpha - fastAlpha0).toBeCloseTo(2 * (ref.alpha - refAlpha0), 10);
        expect(fast.beta - fastBeta0).toBeCloseTo(2 * (ref.beta - refBeta0), 10);
    });

    it("doubles tiny flicks exactly, where the library glide snaps to zero", () => {
        const s = setup();
        const { ref, fast } = s;
        const refAlpha0 = ref.alpha, fastAlpha0 = fast.alpha;
        drag(s.refCanvas.fire, 0, 2, 0);
        drag(s.fastCanvas.fire, 0, 2, 0);
        for (let i = 0; i < 300; i++) {
            s.refScene.frame();
            s.fastScene.frame();
        }
        expect(ref.alpha - refAlpha0).not.toBe(0);
        expect(fast.alpha - fastAlpha0).toBeCloseTo(2 * (ref.alpha - refAlpha0), 12);
    });

    it("leaves panning and wheel zoom identical to the default controls", () => {
        const s = setup();
        const { ref, fast } = s;

        drag(s.refCanvas.fire, 2, 15, 9);
        drag(s.fastCanvas.fire, 2, 15, 9);
        s.refCanvas.fire("wheel", { deltaY: 120, preventDefault() {} });
        s.fastCanvas.fire("wheel", { deltaY: 120, preventDefault() {} });

        expect(fast.inertialPanningX).toBeCloseTo(ref.inertialPanningX, 12);
        expect(fast.inertialPanningY).toBeCloseTo(ref.inertialPanningY, 12);
        expect(fast.inertialRadiusOffset).toBeCloseTo(ref.inertialRadiusOffset, 12);

        for (let i = 0; i < 300; i++) {
            s.refScene.frame();
            s.fastScene.frame();
        }
        expect(fast.target.x).toBeCloseTo(ref.target.x, 10);
        expect(fast.target.y).toBeCloseTo(ref.target.y, 10);
        expect(fast.target.z).toBeCloseTo(ref.target.z, 10);
        expect(fast.radius).toBeCloseTo(ref.radius, 10);
    });

    it("removes listeners and both per-frame hooks on cleanup, and is idempotent", () => {
        const camera = makeCamera();
        const original = camera.angularSensibility;
        const c = fakeCanvas();
        const f = fakeScene();

        const detach = attachFastOrbit(camera, c.canvas, f.scene);
        expect(c.count()).toBeGreaterThan(0);
        expect(f.hooks.length).toBe(3); // capture, library inertia, double step

        detach();
        detach();
        expect(c.count()).toBe(0);
        expect(f.hooks.length).toBe(0);
        expect(camera.angularSensibility).toBe(original);
    });
});

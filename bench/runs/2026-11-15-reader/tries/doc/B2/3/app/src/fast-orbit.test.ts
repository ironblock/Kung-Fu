import { describe, it, expect } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";
import { attachFastOrbit } from "./fast-orbit.ts";

class FakeCanvas extends EventTarget {
    setPointerCapture(): void {}
    releasePointerCapture(): void {}
    listenerCount = 0;
    override addEventListener(type: string, cb: EventListenerOrEventListenerObject | null, opts?: AddEventListenerOptions | boolean): void {
        this.listenerCount++;
        super.addEventListener(type, cb, opts);
    }
    override removeEventListener(type: string, cb: EventListenerOrEventListenerObject | null, opts?: EventListenerOptions | boolean): void {
        this.listenerCount--;
        super.removeEventListener(type, cb, opts);
    }
}

function makeEvent(type: string, props: Record<string, unknown>): Event {
    return Object.assign(new Event(type), props);
}

function makeScene(): { scene: SceneContext; frame: () => void } {
    const hooks: ((deltaMs: number) => void)[] = [];
    const scene = { _beforeRender: hooks } as unknown as SceneContext;
    return { scene, frame: () => hooks.forEach((h) => h(16)) };
}

/** Drag by (dx, dy) in one move, release, then run frames until the glide settles. */
function drag(canvas: FakeCanvas, frame: () => void, dx: number, dy: number): void {
    canvas.dispatchEvent(makeEvent("pointerdown", { button: 0, pointerId: 1, pointerType: "mouse", clientX: 100, clientY: 100 }));
    canvas.dispatchEvent(makeEvent("pointermove", { pointerId: 1, pointerType: "mouse", clientX: 100 + dx, clientY: 100 + dy }));
    canvas.dispatchEvent(makeEvent("pointerup", { button: 0, pointerId: 1, pointerType: "mouse", clientX: 100 + dx, clientY: 100 + dy }));
    for (let i = 0; i < 600; i++) frame();
}

function stockCamera(run: (cam: ReturnType<typeof createArcRotateCamera>, canvas: FakeCanvas, scene: SceneContext, frame: () => void) => void) {
    const cam = createArcRotateCamera(0.5, 1.0, 10, { x: 0, y: 0, z: 0 });
    const canvas = new FakeCanvas();
    const { scene, frame } = makeScene();
    const detach = attachControl(cam, canvas as unknown as HTMLCanvasElement, scene);
    run(cam, canvas, scene, frame);
    detach();
    return cam;
}

describe("attachFastOrbit", () => {
    it("doubles the stock drag and glide in alpha and beta", () => {
        const stockH = stockCamera((cam, canvas, _s, frame) => drag(canvas, frame, 80, 0));
        const stockV = stockCamera((cam, canvas, _s, frame) => drag(canvas, frame, 0, 40));

        for (const [dx, dy, stock] of [
            [80, 0, stockH],
            [0, 40, stockV],
        ] as const) {
            const cam = createArcRotateCamera(0.5, 1.0, 10, { x: 0, y: 0, z: 0 });
            const canvas = new FakeCanvas();
            const { scene, frame } = makeScene();
            const detach = attachFastOrbit(cam, canvas as unknown as HTMLCanvasElement, scene);
            drag(canvas, frame, dx, dy);
            detach();
            expect(cam.alpha - 0.5).toBeCloseTo(2 * (stock.alpha - 0.5), 9);
            expect(cam.beta - 1.0).toBeCloseTo(2 * (stock.beta - 1.0), 9);
        }
    });

    it("leaves wheel zoom identical to the stock controls", () => {
        const wheel = (cam: ReturnType<typeof createArcRotateCamera>, canvas: FakeCanvas, frame: () => void) => {
            canvas.dispatchEvent(makeEvent("wheel", { deltaY: 120, preventDefault() {} }));
            for (let i = 0; i < 600; i++) frame();
            return cam.radius;
        };
        const stockCam = createArcRotateCamera(0.5, 1.0, 10, { x: 0, y: 0, z: 0 });
        const stockCanvas = new FakeCanvas();
        const s1 = makeScene();
        const d1 = attachControl(stockCam, stockCanvas as unknown as HTMLCanvasElement, s1.scene);
        const stockRadius = wheel(stockCam, stockCanvas, s1.frame);
        d1();

        const fastCam = createArcRotateCamera(0.5, 1.0, 10, { x: 0, y: 0, z: 0 });
        const fastCanvas = new FakeCanvas();
        const s2 = makeScene();
        const d2 = attachFastOrbit(fastCam, fastCanvas as unknown as HTMLCanvasElement, s2.scene);
        const fastRadius = wheel(fastCam, fastCanvas, s2.frame);
        d2();

        expect(fastRadius).toBeCloseTo(stockRadius, 12);
    });

    it("cleanup removes listeners and the per-frame hook, and restores sensitivity", () => {
        const cam = createArcRotateCamera(0.5, 1.0, 10, { x: 0, y: 0, z: 0 });
        const canvas = new FakeCanvas();
        const { scene, frame } = makeScene();
        const detach = attachFastOrbit(cam, canvas as unknown as HTMLCanvasElement, scene);
        expect(canvas.listenerCount).toBeGreaterThan(0);
        expect(scene._beforeRender.length).toBe(3);

        detach();
        detach(); // idempotent
        expect(canvas.listenerCount).toBe(0);
        expect(scene._beforeRender.length).toBe(0);

        // Dragging after cleanup must not move the camera.
        const alpha = cam.alpha;
        drag(canvas, frame, 200, 200);
        expect(cam.alpha).toBe(alpha);
    });
});

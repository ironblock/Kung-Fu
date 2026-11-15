import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";
import { attachFastOrbit } from "./fast-orbit.ts";

class FakeCanvas extends EventTarget {
    added = 0;
    setPointerCapture(): void {}
    releasePointerCapture(): void {}
    override addEventListener(...a: Parameters<EventTarget["addEventListener"]>): void {
        this.added++;
        super.addEventListener(...a);
    }
    override removeEventListener(...a: Parameters<EventTarget["removeEventListener"]>): void {
        this.added--;
        super.removeEventListener(...a);
    }
}

function ev(type: string, props: Record<string, unknown>): Event {
    const e = new Event(type, { cancelable: true });
    Object.assign(e, props);
    return e;
}

function run(fast: boolean) {
    const camera = createArcRotateCamera(1, 1.2, 10, { x: 0, y: 0, z: 0 });
    const canvas = new FakeCanvas();
    const scene = { _beforeRender: [] as ((d: number) => void)[] } as unknown as SceneContext;
    const c = canvas as unknown as HTMLCanvasElement;
    const detach = fast ? attachFastOrbit(camera, c, scene) : attachControl(camera, c, scene);
    const frame = () => scene._beforeRender.forEach((f) => f(16));
    const p = { pointerId: 1, button: 0, pointerType: "mouse" };
    canvas.dispatchEvent(ev("pointerdown", { ...p, clientX: 100, clientY: 100 }));
    const trace: number[][] = [];
    for (let i = 1; i <= 5; i++) {
        canvas.dispatchEvent(ev("pointermove", { ...p, clientX: 100 + 7 * i, clientY: 100 + 3 * i }));
        frame();
        trace.push([camera.alpha, camera.beta]);
    }
    canvas.dispatchEvent(ev("pointerup", { ...p, clientX: 135, clientY: 115 }));
    for (let i = 0; i < 200; i++) {
        frame();
        trace.push([camera.alpha, camera.beta]);
    }
    canvas.dispatchEvent(ev("wheel", { deltaY: 100 }));
    for (let i = 0; i < 200; i++) frame();
    return { camera, canvas, scene, detach, trace };
}

describe("attachFastOrbit", () => {
    it("turns twice as far per frame, including glide; zoom unchanged", () => {
        const a = run(false);
        const b = run(true);
        a.trace.forEach(([al, be], i) => {
            expect(b.trace[i]![0] - 1).toBeCloseTo(2 * (al! - 1), 12);
            expect(b.trace[i]![1] - 1.2).toBeCloseTo(2 * (be! - 1.2), 12);
        });
        expect(a.trace.at(-1)![0]).not.toBe(1);
        expect(b.camera.radius).toBe(a.camera.radius);
        expect(b.camera.radius).not.toBe(10);
    });

    it("cleanup removes listeners and per-frame hooks", () => {
        const b = run(true);
        expect(b.canvas.added).toBeGreaterThan(0);
        b.detach();
        expect(b.canvas.added).toBe(0);
        expect(b.scene._beforeRender.length).toBe(0);
        b.detach();
    });
});

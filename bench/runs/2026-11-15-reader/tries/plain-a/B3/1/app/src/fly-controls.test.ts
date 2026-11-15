import { describe, expect, it } from "vitest";
import { createFreeCamera } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";
import { attachFlyControls } from "./fly-controls.ts";

class FakeCanvas extends EventTarget {
    tabIndex = -1;
    hasAttribute(name: string): boolean {
        return name === "tabindex" && this.tabIndex >= 0;
    }
    setPointerCapture(): void {}
    releasePointerCapture(): void {}
}

function setup() {
    const canvas = new FakeCanvas();
    const camera = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    const hooks: Array<(dt: number) => void> = [];
    const scene = { _beforeRender: hooks } as unknown as SceneContext;
    const cleanup = attachFlyControls(camera, canvas as unknown as HTMLCanvasElement, scene);
    const key = (type: "keydown" | "keyup", code: string) => canvas.dispatchEvent(Object.assign(new Event(type), { code }));
    const frame = (ms: number) => hooks.slice().forEach((h) => h(ms));
    return { canvas, camera, hooks, cleanup, key, frame };
}

describe("attachFlyControls", () => {
    it("Shift alone does not move the camera", () => {
        const { camera, key, frame } = setup();
        const [x0, y0, z0] = [camera.position.x, camera.position.y, camera.position.z];
        key("keydown", "ShiftLeft");
        for (let i = 0; i < 30; i++) frame(16);
        key("keydown", "ShiftRight");
        for (let i = 0; i < 30; i++) frame(16);
        expect(camera.position.x).toBe(x0);
        expect(camera.position.y).toBe(y0);
        expect(camera.position.z).toBe(z0);
    });

    it("Shift with W moves three times as far as W alone (first frame)", () => {
        const firstFrameZ = (shift: boolean) => {
            const { camera, key, frame } = setup();
            if (shift) key("keydown", "ShiftLeft");
            key("keydown", "KeyW");
            frame(16);
            return camera.position.z;
        };
        const normal = firstFrameZ(false);
        const boosted = firstFrameZ(true);
        expect(normal).toBeGreaterThan(0);
        expect(boosted / normal).toBeCloseTo(3, 6);
    });

    it("Space rises and PageDown sinks", () => {
        const { camera, key, frame } = setup();
        key("keydown", "Space");
        frame(16);
        key("keyup", "Space");
        for (let i = 0; i < 200; i++) frame(16);
        expect(camera.position.y).toBeGreaterThan(0);

        const up = camera.position.y;
        key("keydown", "PageDown");
        frame(16);
        key("keyup", "PageDown");
        for (let i = 0; i < 200; i++) frame(16);
        expect(camera.position.y).toBeLessThan(up);
    });

    it("cleanup removes the frame hook and every canvas listener it added", () => {
        const canvas = new FakeCanvas();
        const added = new Set<string>();
        const removed = new Set<string>();
        const add = canvas.addEventListener.bind(canvas);
        const remove = canvas.removeEventListener.bind(canvas);
        canvas.addEventListener = (type: string, fn: any, opts?: any) => {
            added.add(`${type}`);
            add(type, fn, opts);
        };
        canvas.removeEventListener = (type: string, fn: any, opts?: any) => {
            removed.add(`${type}`);
            remove(type, fn, opts);
        };
        const camera = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
        const hooks: Array<(dt: number) => void> = [];
        const scene = { _beforeRender: hooks } as unknown as SceneContext;
        const cleanup = attachFlyControls(camera, canvas as unknown as HTMLCanvasElement, scene);

        expect(hooks.length).toBe(1);
        expect(added.size).toBeGreaterThan(0);
        cleanup();
        expect(hooks.length).toBe(0);
        for (const type of added) {
            expect(removed.has(type)).toBe(true);
        }

        // After cleanup, key input must not move the camera.
        const start = camera.position.z;
        canvas.dispatchEvent(Object.assign(new Event("keydown"), { code: "KeyW" }));
        for (const h of hooks) h(16);
        expect(camera.position.z).toBe(start);
    });
});

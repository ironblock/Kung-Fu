import { describe, expect, it } from "vitest";
import { createFreeCamera } from "@babylonjs/lite";
import type { SceneContext } from "@babylonjs/lite";
import { attachFlyControls } from "./fly-controls.ts";

type Listener = (event: unknown) => void;

function fakeCanvas() {
    const listeners = new Map<string, Set<Listener>>();
    const canvas = {
        tabIndex: -1,
        hasAttribute: () => false,
        setPointerCapture: () => {},
        releasePointerCapture: () => {},
        addEventListener(type: string, fn: Listener) {
            if (!listeners.has(type)) {
                listeners.set(type, new Set());
            }
            listeners.get(type)!.add(fn);
        },
        removeEventListener(type: string, fn: Listener) {
            listeners.get(type)?.delete(fn);
        },
        count: () => [...listeners.values()].reduce((n, s) => n + s.size, 0),
        dispatch(type: string, event: object) {
            for (const fn of listeners.get(type) ?? []) {
                fn(event);
            }
        },
    };
    return canvas;
}

function key(canvas: ReturnType<typeof fakeCanvas>, type: "keydown" | "keyup", code: string) {
    canvas.dispatch(type, { code, preventDefault() {}, metaKey: false });
}

function setup() {
    const canvas = fakeCanvas();
    const camera = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 0, z: 1 });
    const scene = { _beforeRender: [] as Array<(dt: number) => void> } as unknown as SceneContext;
    const hooks = (scene as unknown as { _beforeRender: Array<(dt: number) => void> })._beforeRender;
    const cleanup = attachFlyControls(camera, canvas as unknown as HTMLCanvasElement, scene);
    const step = (ms = 16) => {
        for (const fn of hooks) {
            fn(ms);
        }
    };
    return { canvas, camera, scene, cleanup, step };
}

describe("attachFlyControls", () => {
    it("Shift alone does not move the camera vertically", () => {
        const { canvas, camera, step } = setup();
        key(canvas, "keydown", "ShiftLeft");
        for (let i = 0; i < 60; i++) {
            step();
        }
        key(canvas, "keydown", "ShiftRight");
        for (let i = 0; i < 60; i++) {
            step();
        }
        expect(camera.position.y).toBe(0);
    });

    it("Shift plus W moves forward at three times the plain W speed", () => {
        const plain = setup();
        key(plain.canvas, "keydown", "KeyW");
        plain.step();
        const plainDistance = plain.camera.position.z;

        const fast = setup();
        key(fast.canvas, "keydown", "ShiftLeft");
        key(fast.canvas, "keydown", "KeyW");
        fast.step();
        expect(fast.camera.position.z).toBeCloseTo(plainDistance * 3, 6);
        expect(fast.camera.position.y).toBe(0);
    });

    it("Space rises and PageDown sinks", () => {
        const rising = setup();
        key(rising.canvas, "keydown", "Space");
        rising.step();
        expect(rising.camera.position.y).toBeGreaterThan(0);

        const sinking = setup();
        key(sinking.canvas, "keydown", "PageDown");
        sinking.step();
        expect(sinking.camera.position.y).toBeLessThan(0);
    });

    it("Shift plus Space rises at the boosted rate", () => {
        const plain = setup();
        key(plain.canvas, "keydown", "Space");
        plain.step();
        const plainUp = plain.camera.position.y;

        const fast = setup();
        key(fast.canvas, "keydown", "ShiftRight");
        key(fast.canvas, "keydown", "Space");
        fast.step();
        expect(fast.camera.position.y).toBeCloseTo(plainUp * 3, 6);
    });

    it("cleanup removes canvas listeners and the per-frame update", () => {
        const { canvas, scene, cleanup } = setup();
        expect(canvas.count()).toBeGreaterThan(0);
        expect((scene as unknown as { _beforeRender: unknown[] })._beforeRender.length).toBe(1);
        cleanup();
        expect(canvas.count()).toBe(0);
        expect((scene as unknown as { _beforeRender: unknown[] })._beforeRender.length).toBe(0);
    });
});

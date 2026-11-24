import { describe, expect, it } from "vitest";
import { attachFlyControls } from "./fly-controls.ts";

function fakeCanvas() {
    const listeners = new Map<string, Set<(e: unknown) => void>>();
    return {
        listeners,
        tabIndex: -1,
        hasAttribute: () => false,
        setPointerCapture() {},
        releasePointerCapture() {},
        addEventListener(t: string, f: (e: unknown) => void) {
            if (!listeners.has(t)) listeners.set(t, new Set());
            listeners.get(t)!.add(f);
        },
        removeEventListener(t: string, f: (e: unknown) => void) {
            listeners.get(t)?.delete(f);
        },
        fire(t: string, e: unknown) {
            listeners.get(t)?.forEach((f) => f(e));
        },
    };
}

function fakeCamera() {
    const v = (x: number, y: number, z: number) => ({ x, y, z, set(a: number, b: number, c: number) { this.x = a; this.y = b; this.z = c; } });
    return { position: v(0, 0, 0), target: v(0, 0, 1), _yaw: 0, _pitch: 0, speed: 1, inertia: 0.9, angularSensitivity: 1000 };
}

function run(codes: string[]) {
    const canvas = fakeCanvas();
    const camera = fakeCamera();
    const scene = { _beforeRender: [] as ((d: number) => void)[] };
    const detach = attachFlyControls(camera as never, canvas as never, scene as never);
    for (const code of codes) canvas.fire("keydown", { code });
    for (let i = 0; i < 30; i++) scene._beforeRender.forEach((f) => f(16));
    return { camera, canvas, scene, detach };
}

describe("attachFlyControls", () => {
    it("Shift alone or with other keys does not move vertically", () => {
        expect(run(["ShiftLeft"]).camera.position.y).toBe(0);
        expect(run(["ShiftRight", "KeyW"]).camera.position.y).toBe(0);
        expect(run(["ShiftLeft", "KeyD"]).camera.position.y).toBe(0);
    });
    it("Shift triples speed", () => {
        const slow = run(["KeyW"]).camera.position.z;
        const fast = run(["KeyW", "ShiftRight"]).camera.position.z;
        expect(slow).toBeGreaterThan(0);
        expect(fast / slow).toBeCloseTo(3, 1);
    });
    it("Space rises and PageDown sinks", () => {
        expect(run(["Space"]).camera.position.y).toBeGreaterThan(0);
        expect(run(["PageDown"]).camera.position.y).toBeLessThan(0);
        const boosted = run(["Space", "ShiftLeft"]).camera.position.y;
        expect(boosted / run(["Space"]).camera.position.y).toBeCloseTo(3, 1);
    });
    it("detach removes listeners and the frame hook", () => {
        const { canvas, scene, detach } = run([]);
        detach();
        expect(scene._beforeRender.length).toBe(0);
        for (const set of canvas.listeners.values()) expect(set.size).toBe(0);
    });
});

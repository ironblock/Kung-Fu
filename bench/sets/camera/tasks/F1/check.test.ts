import { describe, expect, it } from "vitest";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";
import { attachBigWorldFly } from "../src/big-world-fly";
import { asCanvas, fire, key, listenerCount, makeCanvas, makeScene, pointer, tick } from "./helpers";

type Setup = { camera: FreeCamera; canvas: ReturnType<typeof makeCanvas>; scene: ReturnType<typeof makeScene>; detach: () => void };

function setup(ours: boolean): Setup {
    const camera = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 3, y: 1, z: 10 });
    const canvas = makeCanvas();
    const scene = makeScene();
    const detach = ours ? attachBigWorldFly(camera, asCanvas(canvas), scene) : attachFreeControl(camera, asCanvas(canvas), scene);
    return { camera, canvas, scene, detach };
}

function look(camera: FreeCamera): [number, number, number] {
    const x = camera.target.x - camera.position.x;
    const y = camera.target.y - camera.position.y;
    const z = camera.target.z - camera.position.z;
    const l = Math.hypot(x, y, z);
    return [x / l, y / l, z / l];
}

function angle(a: [number, number, number], b: [number, number, number]): number {
    return Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]));
}

function holdDisplacement(s: Setup, code: string, frames: number, deltaMs?: number): [number, number, number] {
    const start = [s.camera.position.x, s.camera.position.y, s.camera.position.z];
    fire(s.canvas, "keydown", key(code));
    if (deltaMs === undefined) {
        tick(s.scene, frames);
    } else {
        tick(s.scene, frames, deltaMs);
    }
    fire(s.canvas, "keyup", key(code));
    return [s.camera.position.x - start[0]!, s.camera.position.y - start[1]!, s.camera.position.z - start[2]!];
}

function drag(s: Setup, dx: number, dy: number): void {
    fire(s.canvas, "pointerdown", pointer({ clientX: 100, clientY: 100 }));
    fire(s.canvas, "pointermove", pointer({ clientX: 100 + dx, clientY: 100 + dy }));
    fire(s.canvas, "pointerup", pointer({ clientX: 100 + dx, clientY: 100 + dy }));
}

describe("big-world fly controls", () => {
    // Every movement key: W/A/S/D, the arrows, and the keys the library's fly controls rise and sink with.
    for (const code of ["KeyW", "KeyA", "KeyS", "KeyD", "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space", "PageUp", "ShiftLeft", "ShiftRight", "PageDown"]) {
        it(`moves 20 times as far while ${code} is held`, () => {
            const ours = setup(true);
            const base = setup(false);
            const a = holdDisplacement(ours, code, 30);
            const b = holdDisplacement(base, code, 30);
            const la = Math.hypot(...a);
            const lb = Math.hypot(...b);
            expect(lb).toBeGreaterThan(0);
            expect(la / lb).toBeCloseTo(20, 1);
            expect(angle([a[0] / la, a[1] / la, a[2] / la], [b[0] / lb, b[1] / lb, b[2] / lb])).toBeLessThan(1e-6);
        });
    }

    for (const code of ["KeyW", "ArrowLeft", "Space", "PageDown"]) {
        it(`moves 20 times as far while ${code} is held, at frames of 33 ms`, () => {
            const ours = setup(true);
            const base = setup(false);
            const a = holdDisplacement(ours, code, 30, 33);
            const b = holdDisplacement(base, code, 30, 33);
            const la = Math.hypot(...a);
            const lb = Math.hypot(...b);
            expect(lb).toBeGreaterThan(0);
            expect(la / lb).toBeCloseTo(20, 1);
            expect(angle([a[0] / la, a[1] / la, a[2] / la], [b[0] / lb, b[1] / lb, b[2] / lb])).toBeLessThan(1e-6);
        });
    }

    it("leaves the camera where the app puts it when no key is held, as the default does", () => {
        const ours = setup(true);
        const base = setup(false);
        for (const s of [ours, base]) {
            tick(s.scene, 2);
            s.camera.position.set(500, 0, 0);
            s.camera.target.set(503, 1, 10);
            tick(s.scene, 3);
        }
        expect(base.camera.position.x).toBeCloseTo(500, 6);
        for (const [axis, want] of [["x", 500], ["y", 0], ["z", 0]] as const) {
            expect(ours.camera.position[axis]).toBeCloseTo(want, 6);
        }
        expect(ours.camera.target.x).toBeCloseTo(503, 6);
        expect(ours.camera.target.y).toBeCloseTo(1, 6);
        expect(ours.camera.target.z).toBeCloseTo(10, 6);
    });

    it("turns by the same total amount as the default for the same drag, glide included", () => {
        const ours = setup(true);
        const base = setup(false);
        drag(ours, 120, -40);
        drag(base, 120, -40);
        tick(ours.scene, 400);
        tick(base.scene, 400);
        const turned = angle(look(base.camera), [3 / Math.hypot(3, 1, 10), 1 / Math.hypot(3, 1, 10), 10 / Math.hypot(3, 1, 10)]);
        expect(turned).toBeGreaterThan(0.1);
        expect(angle(look(ours.camera), look(base.camera))).toBeLessThan(1e-3);
    });

    for (const deltaMs of [16, 33]) {
        it(`turns by the same total amount as the default for a drag made while flying forward, at frames of ${deltaMs} ms`, () => {
            const ours = setup(true);
            const base = setup(false);
            const looks: [number, number, number][] = [];
            for (const s of [ours, base]) {
                // The camera's own world matrix, read as a renderer reads it each frame.
                const ownWorld = Object.getOwnPropertyDescriptor(s.camera, "worldMatrix")?.get;
                const world = () => (ownWorld ? ownWorld.call(s.camera) : s.camera.worldMatrix) as ArrayLike<number>;
                const frames = (n: number) => {
                    for (let i = 0; i < n; i++) {
                        tick(s.scene, 1, deltaMs);
                        world();
                    }
                };
                fire(s.canvas, "keydown", key("KeyW"));
                frames(5);
                drag(s, 120, -40);
                frames(20);
                fire(s.canvas, "keyup", key("KeyW"));
                frames(400);
                const m = world();
                const l = Math.hypot(m[8]!, m[9]!, m[10]!);
                looks.push([m[8]! / l, m[9]! / l, m[10]! / l]);
            }
            const start: [number, number, number] = [3 / Math.hypot(3, 1, 10), 1 / Math.hypot(3, 1, 10), 10 / Math.hypot(3, 1, 10)];
            expect(angle(looks[1]!, start)).toBeGreaterThan(0.1);
            expect(angle(looks[0]!, looks[1]!)).toBeLessThan(1e-3);
        });
    }

    it("removes everything it added", () => {
        const s = setup(true);
        const before = s.scene._beforeRender.length;
        expect(listenerCount(s.canvas)).toBeGreaterThan(0);
        s.detach();
        expect(listenerCount(s.canvas)).toBe(0);
        expect(s.scene._beforeRender.length).toBeLessThan(before);
        expect(s.scene._beforeRender.length).toBe(makeScene()._beforeRender.length);
    });
});

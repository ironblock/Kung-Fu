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

function holdDisplacement(s: Setup, code: string, frames: number): [number, number, number] {
    const start = [s.camera.position.x, s.camera.position.y, s.camera.position.z];
    fire(s.canvas, "keydown", key(code));
    tick(s.scene, frames);
    fire(s.canvas, "keyup", key(code));
    return [s.camera.position.x - start[0]!, s.camera.position.y - start[1]!, s.camera.position.z - start[2]!];
}

function drag(s: Setup, dx: number, dy: number): void {
    fire(s.canvas, "pointerdown", pointer({ clientX: 100, clientY: 100 }));
    fire(s.canvas, "pointermove", pointer({ clientX: 100 + dx, clientY: 100 + dy }));
    fire(s.canvas, "pointerup", pointer({ clientX: 100 + dx, clientY: 100 + dy }));
}

describe("big-world fly controls", () => {
    for (const code of ["KeyW", "KeyD", "ArrowLeft", "Space", "PageDown"]) {
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

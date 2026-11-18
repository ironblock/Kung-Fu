import { expect, it } from "vitest";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";
import { attachBigWorldFly } from "../src/big-world-fly";
import { asCanvas, fire, key, makeCanvas, makeScene, pointer, tick } from "./helpers";

// Real state: the camera's own worldMatrix getter (kept before the call): eye and forward axis.
function setup(ours: boolean) {
    const camera = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 3, y: 1, z: 10 });
    const canvas = makeCanvas();
    const scene = makeScene();
    const ownWm = Object.getOwnPropertyDescriptor(camera, "worldMatrix")!.get!;
    const wm = () => ownWm.call(camera as FreeCamera);
    wm();
    if (ours) attachBigWorldFly(camera, asCanvas(canvas), scene); else attachFreeControl(camera, asCanvas(canvas), scene);
    const frames = (n: number) => { for (let i = 0; i < n; i++) { tick(scene); wm(); } };
    const fwd = (): [number, number, number] => { const m = wm(); const l = Math.hypot(m[8]!, m[9]!, m[10]!); return [m[8]! / l, m[9]! / l, m[10]! / l]; };
    const eye = (): [number, number, number] => { const m = wm(); return [m[12]!, m[13]!, m[14]!]; };
    return { camera, canvas, scene, frames, fwd, eye };
}
const angle = (a: number[], b: number[]) => Math.acos(Math.min(1, a[0]! * b[0]! + a[1]! * b[1]! + a[2]! * b[2]!));

it("F1 a drag made while W is held turns by the same total amount as the default", () => {
    const ours = setup(true), base = setup(false);
    for (const s of [ours, base]) {
        fire(s.canvas, "keydown", key("KeyW"));
        s.frames(5);
        fire(s.canvas, "pointerdown", pointer({ clientX: 100, clientY: 100 }));
        fire(s.canvas, "pointermove", pointer({ clientX: 220, clientY: 60 }));
        fire(s.canvas, "pointerup", pointer({ clientX: 220, clientY: 60 }));
        s.frames(20);
        fire(s.canvas, "keyup", key("KeyW"));
        s.frames(400);
    }
    const off = angle(ours.fwd(), base.fwd());
    console.log(`PROBE drag-with-W look off by ${off.toFixed(4)} rad`);
    expect(off).toBeLessThan(1e-3);
});

for (const code of ["ShiftLeft", "ShiftRight", "PageUp", "KeyA", "KeyS", "ArrowUp", "ArrowDown", "ArrowRight"]) {
    it(`F1 ${code} moves 20 times as far`, () => {
        const ours = setup(true), base = setup(false);
        const d = (s: ReturnType<typeof setup>) => { const a = s.eye(); fire(s.canvas, "keydown", key(code)); s.frames(30); fire(s.canvas, "keyup", key(code)); const b = s.eye(); return Math.hypot(b[0] - a[0], b[1] - a[1], b[2] - a[2]); };
        const ratio = d(ours) / d(base);
        console.log(`PROBE ${code} ratio ${ratio.toFixed(3)}`);
        expect(ratio).toBeCloseTo(20, 1);
    });
}

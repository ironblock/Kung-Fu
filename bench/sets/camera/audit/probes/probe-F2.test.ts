import { expect, it } from "vitest";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
import type { FreeCamera } from "@babylonjs/lite";
import { createWalkthrough } from "../src/walkthrough";
import { asCanvas, fire, key, makeCanvas, makeScene, pointer, tick } from "./helpers";

// After a jump, the answer's camera must move as a fresh library free camera at the new view, given the
// library's own controls and the same input. Read through the camera's own worldMatrix getter.
const EYE = { x: 0, y: 2, z: -20 }, TARGET = { x: 0, y: 2, z: 0 };
const EYE2 = { x: 30, y: 5, z: 10 }, TARGET2 = { x: 10, y: 0, z: 30 };
function drive(canvas: ReturnType<typeof makeCanvas>, frames: (n: number) => void) {
    fire(canvas, "keydown", key("KeyW"));
    frames(20);
    fire(canvas, "keyup", key("KeyW"));
    frames(5);
    fire(canvas, "pointerdown", pointer({ clientX: 400, clientY: 300 }));
    fire(canvas, "pointermove", pointer({ clientX: 440, clientY: 280 }));
    fire(canvas, "pointerup", pointer({ clientX: 440, clientY: 280 }));
    frames(100);
    fire(canvas, "keydown", key("KeyD"));
    frames(10);
    fire(canvas, "keyup", key("KeyD"));
    frames(60);
}
const wmOf = (c: FreeCamera) => (Object.getOwnPropertyDescriptor(c, "worldMatrix")?.get?.call(c) ?? c.worldMatrix) as unknown as number[];

it("F2 after a jump, the same input moves the camera as the library's controls on a fresh camera do", () => {
    const canvas = makeCanvas(), scene = makeScene();
    const w = createWalkthrough(asCanvas(canvas), scene, EYE, TARGET);
    tick(scene, 2);
    w.jumpTo(EYE2, TARGET2);
    tick(scene, 2);
    drive(canvas, (n) => { for (let i = 0; i < n; i++) { tick(scene); wmOf(w.camera); } });

    const c2 = makeCanvas(), s2 = makeScene();
    const lib = createFreeCamera(EYE2, TARGET2);
    attachFreeControl(lib, asCanvas(c2), s2);
    tick(s2, 2);
    drive(c2, (n) => { for (let i = 0; i < n; i++) { tick(s2); wmOf(lib); } });

    const a = wmOf(w.camera), b = wmOf(lib);
    console.log(`PROBE eye ${[12, 13, 14].map((i) => a[i]!.toFixed(4)).join(",")} lib ${[12, 13, 14].map((i) => b[i]!.toFixed(4)).join(",")} fwd ${[8, 9, 10].map((i) => a[i]!.toFixed(4)).join(",")} lib ${[8, 9, 10].map((i) => b[i]!.toFixed(4)).join(",")}`);
    for (const i of [8, 9, 10, 12, 13, 14]) expect(a[i]).toBeCloseTo(b[i]!, 4);
});

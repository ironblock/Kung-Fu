import { expect, it } from "vitest";
import { attachConfigurableFreeControl, createFreeCamera } from "@babylonjs/lite";
import { attachFlyControls } from "../src/fly-controls";
import { asCanvas, fire, key, makeCanvas, makeScene, pointer, tick } from "./helpers";

// Real state: the camera's own worldMatrix getter (kept before the call) and the position's own storage (_x/_y/_z).
type P = { x: number; y: number; z: number };
function rig(useSubject: boolean, target: P = { x: 0, y: 0, z: 10 }) {
    const canvas = makeCanvas();
    const scene = makeScene();
    const camera = createFreeCamera({ x: 0, y: 0, z: 0 }, target);
    const ownWm = Object.getOwnPropertyDescriptor(camera, "worldMatrix")!.get!;
    const wm = () => ownWm.call(camera);
    wm();
    if (useSubject) attachFlyControls(camera, asCanvas(canvas), scene);
    else attachConfigurableFreeControl(camera, asCanvas(canvas), scene, { downKeys: ["PageDown"], fastKeys: ["ShiftLeft", "ShiftRight"], fastMultiplier: 3 });
    const pos = camera.position as unknown as { _x: number; _y: number; _z: number };
    const real = () => ({ x: pos._x, y: pos._y, z: pos._z });
    const frames = (n: number) => { for (let i = 0; i < n; i++) { tick(scene); wm(); } };
    const fwd = () => { const m = wm(); return { x: m[8]!, y: m[9]!, z: m[10]! }; };
    const eye = () => { const m = wm(); return { x: m[12]!, y: m[13]!, z: m[14]! }; };
    return { canvas, scene, camera, frames, fwd, eye, real };
}

function dragThenW(r: ReturnType<typeof rig>) {
    fire(r.canvas, "pointerdown", pointer({ clientX: 100, clientY: 100 }));
    fire(r.canvas, "pointermove", pointer({ clientX: 400, clientY: 100 }));
    fire(r.canvas, "pointerup", pointer({ clientX: 400, clientY: 100, buttons: 0 }));
    r.frames(60);
    const look = r.fwd();
    const start = r.eye();
    fire(r.canvas, "keydown", key("KeyW"));
    r.frames(10);
    fire(r.canvas, "keyup", key("KeyW"));
    r.frames(60);
    const end = r.eye();
    return { look, start, end };
}

const f = (p: P) => `${p.x.toFixed(3)},${p.y.toFixed(3)},${p.z.toFixed(3)}`;

it("B3 mouse look turns the real view, and W then moves along it", () => {
    const r = rig(true);
    const { look, start, end } = dragThenW(r);
    const d = { x: end.x - start.x, y: end.y - start.y, z: end.z - start.z };
    const len = Math.hypot(d.x, d.y, d.z);
    console.log("PROBE look", f(look), "moved", f(d), "target", f(r.camera.target), "real pos", f(r.real()), "eye", f(end));
    expect(Math.abs(look.x)).toBeGreaterThan(0.05);
    expect(len).toBeGreaterThan(0);
    expect((d.x * look.x + d.y * look.y + d.z * look.z) / len).toBeGreaterThan(0.999);
    expect(r.real().x).toBeCloseTo(end.x, 6);
});

it("B3 a camera facing +X: W moves it along +X, position's own fields agree with the eye", () => {
    const r = rig(true, { x: 10, y: 0, z: 0 });
    fire(r.canvas, "keydown", key("KeyW"));
    r.frames(10);
    const e = r.eye();
    console.log("PROBE faceX eye", f(e), "real", f(r.real()), "camera.position", f(r.camera.position));
    expect(e.x).toBeGreaterThan(0.01);
    expect(Math.abs(e.z)).toBeLessThan(1e-6);
    expect(r.real().x).toBeCloseTo(e.x, 6);
    expect(r.real().y).toBeCloseTo(r.camera.position.y, 9);
});

it("B3 same as the library's controls (Shift as boost) for the same input", () => {
    const a = rig(true), b = rig(false);
    const x = dragThenW(a), y = dragThenW(b);
    for (const r of [a, b]) {
        fire(r.canvas, "keydown", key("ShiftLeft", { shiftKey: true }));
        fire(r.canvas, "keydown", key("KeyD", { shiftKey: true }));
        r.frames(10);
    }
    console.log("PROBE lib-compare subject end", f(x.end), "lib end", f(y.end), "after shift+D subject", f(a.eye()), "lib", f(b.eye()));
    for (const k of ["x", "y", "z"] as const) {
        expect(a.eye()[k]).toBeCloseTo(b.eye()[k], 4);
        expect(a.fwd()[k]).toBeCloseTo(b.fwd()[k], 4);
    }
});

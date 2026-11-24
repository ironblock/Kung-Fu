import { expect, it } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import { attachFastOrbit } from "../src/fast-orbit";
import { asCanvas, fire, makeCanvas, makeScene, pointer, tick } from "./helpers";

// Real state: the turn read from the camera's own worldMatrix getter (kept before the call), read every frame.
function rig(useSubject: boolean) {
    const canvas = makeCanvas();
    const scene = makeScene();
    const camera = createArcRotateCamera(0, 1.2, 10, { x: 0, y: 0, z: 0 });
    const ownWm = Object.getOwnPropertyDescriptor(camera, "worldMatrix")!.get!;
    const ownA = Object.getOwnPropertyDescriptor(camera, "alpha")!.get!;
    const eye = () => { const m = ownWm.call(camera); return { x: m[12]!, y: m[13]!, z: m[14]! }; };
    eye();
    if (useSubject) attachFastOrbit(camera, asCanvas(canvas), scene); else attachControl(camera, asCanvas(canvas), scene);
    const frames = (n: number) => { for (let i = 0; i < n; i++) { tick(scene); eye(); } };
    const eyeAlpha = () => { const e = eye(); return Math.atan2(e.z, e.x); };
    const eyeBeta = () => { const e = eye(); return Math.acos(e.y / Math.hypot(e.x, e.y, e.z)); };
    return { canvas, scene, camera, eye, frames, eyeAlpha, eyeBeta, realA: () => ownA.call(camera) };
}

function oneMove(r: ReturnType<typeof rig>, dx: number, dy: number): void {
    fire(r.canvas, "pointerdown", pointer({ clientX: 100, clientY: 100 }));
    fire(r.canvas, "pointermove", pointer({ clientX: 100 + dx, clientY: 100 + dy }));
    fire(r.canvas, "pointerup", pointer({ clientX: 100 + dx, clientY: 100 + dy, buttons: 0 }));
    r.frames(200);
}

function manyMoves(r: ReturnType<typeof rig>, dx: number, dy: number, n: number): void {
    fire(r.canvas, "pointerdown", pointer({ clientX: 100, clientY: 100 }));
    for (let i = 1; i <= n; i++) {
        fire(r.canvas, "pointermove", pointer({ clientX: 100 + (dx * i) / n, clientY: 100 + (dy * i) / n }));
        r.frames(1);
    }
    fire(r.canvas, "pointerup", pointer({ clientX: 100 + dx, clientY: 100 + dy, buttons: 0 }));
    r.frames(200);
}

it("B2 one-move drag: the real view turns twice as far", () => {
    const base = rig(false), fast = rig(true);
    oneMove(base, 100, 0); oneMove(fast, 100, 0);
    const ratio = fast.eyeAlpha() / base.eyeAlpha();
    console.log("PROBE one-move base eye alpha", base.eyeAlpha().toFixed(4), "fast eye alpha", fast.eyeAlpha().toFixed(4), "fast camera.alpha", fast.camera.alpha.toFixed(4), "fast real alpha", fast.realA().toFixed(4), "ratio", ratio.toFixed(3));
    expect(ratio).toBeGreaterThan(1.9);
    expect(ratio).toBeLessThan(2.1);
});

it("B2 drag of many moves, a frame after each: the real view turns twice as far", () => {
    const base = rig(false), fast = rig(true);
    manyMoves(base, 100, 30, 10); manyMoves(fast, 100, 30, 10);
    const ra = fast.eyeAlpha() / base.eyeAlpha();
    const rb = (fast.eyeBeta() - 1.2) / (base.eyeBeta() - 1.2);
    console.log("PROBE many-moves alpha ratio", ra.toFixed(3), "beta ratio", rb.toFixed(3), "camera.alpha ratio", (fast.camera.alpha / base.camera.alpha).toFixed(3));
    expect(ra).toBeGreaterThan(1.9);
    expect(ra).toBeLessThan(2.1);
    expect(rb).toBeGreaterThan(1.9);
    expect(rb).toBeLessThan(2.1);
});

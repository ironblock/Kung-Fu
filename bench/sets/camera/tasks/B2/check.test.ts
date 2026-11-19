import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import { attachFastOrbit } from "../src/fast-orbit";
import { asCanvas, fire, listenerCount, makeCanvas, makeScene, pointer, tick } from "./helpers";

function rig(useSubject: boolean) {
    const canvas = makeCanvas();
    const scene = makeScene();
    const before = scene._beforeRender.length;
    const camera = createArcRotateCamera(0, 1.2, 10, { x: 0, y: 0, z: 0 });
    // The camera's own angle and world-matrix getters, kept before the controls are attached: what the
    // library itself holds, whatever is put on the camera object afterwards.
    const ownAlpha = Object.getOwnPropertyDescriptor(camera, "alpha")!.get!;
    const ownBeta = Object.getOwnPropertyDescriptor(camera, "beta")!.get!;
    const ownWorld = Object.getOwnPropertyDescriptor(camera, "worldMatrix")!.get!;
    const detach = useSubject ? attachFastOrbit(camera, asCanvas(canvas), scene) : attachControl(camera, asCanvas(canvas), scene);
    /**
     * The camera's angles as the library holds them, after checking that the eye in the world matrix, read
     * as a renderer reads it, is where those angles put it.
     */
    const real = (): { alpha: number; beta: number } => {
        const alpha = ownAlpha.call(camera) as number;
        const beta = ownBeta.call(camera) as number;
        expect(alpha).toBeCloseTo(camera.alpha, 6);
        expect(beta).toBeCloseTo(camera.beta, 6);
        const w = ownWorld.call(camera) as ArrayLike<number>;
        const eye = { x: w[12]!, y: w[13]!, z: w[14]! };
        const seen = Math.atan2(eye.z, eye.x);
        // The eye gives alpha only up to whole turns.
        expect(Math.abs(Math.atan2(Math.sin(seen - alpha), Math.cos(seen - alpha)))).toBeLessThan(1e-4);
        expect(Math.acos(eye.y / Math.hypot(eye.x, eye.y, eye.z))).toBeCloseTo(beta, 4);
        return { alpha, beta };
    };
    return { canvas, scene, camera, detach, before, real };
}

/** A drag of dx, dy pixels in ten moves, with a frame after each, as a real drag comes; then the glide. */
function drag(r: ReturnType<typeof rig>, dx: number, dy: number): void {
    const steps = 10;
    fire(r.canvas, "pointerdown", pointer({ clientX: 100, clientY: 100 }));
    for (let i = 1; i <= steps; i++) {
        fire(r.canvas, "pointermove", pointer({ clientX: 100 + (dx * i) / steps, clientY: 100 + (dy * i) / steps }));
        tick(r.scene);
        r.real();
    }
    fire(r.canvas, "pointerup", pointer({ clientX: 100 + dx, clientY: 100 + dy, buttons: 0 }));
    for (let i = 0; i < 200; i++) {
        tick(r.scene);
        if (i % 20 === 0) {
            r.real();
        }
    }
}

describe("B2 fast orbit", () => {
    it("turns left-right twice as far as the default controls, glide included", () => {
        const base = rig(false);
        const fast = rig(true);
        drag(base, 100, 0);
        drag(fast, 100, 0);
        const baseTurn = base.real().alpha;
        const fastTurn = fast.real().alpha;
        expect(Math.abs(baseTurn)).toBeGreaterThan(0.1);
        expect(Math.sign(fastTurn)).toBe(Math.sign(baseTurn));
        expect(fastTurn / baseTurn).toBeGreaterThan(1.9);
        expect(fastTurn / baseTurn).toBeLessThan(2.1);
    });

    it("turns up-down twice as far as the default controls, glide included", () => {
        const base = rig(false);
        const fast = rig(true);
        drag(base, 0, 30);
        drag(fast, 0, 30);
        const baseTurn = base.real().beta - 1.2;
        const fastTurn = fast.real().beta - 1.2;
        expect(Math.abs(baseTurn)).toBeGreaterThan(0.1);
        expect(Math.sign(fastTurn)).toBe(Math.sign(baseTurn));
        expect(fastTurn / baseTurn).toBeGreaterThan(1.9);
        expect(fastTurn / baseTurn).toBeLessThan(2.1);
    });

    it("turns twice as far both ways in one diagonal drag, twice in a row", () => {
        const base = rig(false);
        const fast = rig(true);
        for (const r of [base, fast]) {
            drag(r, 150, -40);
            drag(r, -60, -20);
        }
        const b = base.real();
        const f = fast.real();
        expect(Math.abs(b.alpha)).toBeGreaterThan(0.1);
        expect(f.alpha / b.alpha).toBeGreaterThan(1.9);
        expect(f.alpha / b.alpha).toBeLessThan(2.1);
        expect(Math.abs(b.beta - 1.2)).toBeGreaterThan(0.1);
        expect((f.beta - 1.2) / (b.beta - 1.2)).toBeGreaterThan(1.9);
        expect((f.beta - 1.2) / (b.beta - 1.2)).toBeLessThan(2.1);
    });

    it("zooms with the wheel exactly as the default controls do", () => {
        const base = rig(false);
        const fast = rig(true);
        for (const r of [base, fast]) {
            fire(r.canvas, "wheel", { deltaY: 300, deltaX: 0, deltaMode: 0 });
            tick(r.scene, 200);
        }
        expect(base.camera.radius).not.toBeCloseTo(10, 3);
        expect(fast.camera.radius).toBeCloseTo(base.camera.radius, 9);
        base.real();
        fast.real();
    });

    it("pans with a right-drag exactly as the default controls do", () => {
        const base = rig(false);
        const fast = rig(true);
        for (const r of [base, fast]) {
            fire(r.canvas, "pointerdown", pointer({ button: 2, buttons: 2, clientX: 100, clientY: 100 }));
            for (let i = 1; i <= 10; i++) {
                fire(r.canvas, "pointermove", pointer({ button: 2, buttons: 2, clientX: 100 + 10 * i, clientY: 100 + 3 * i }));
                tick(r.scene);
            }
            fire(r.canvas, "pointerup", pointer({ button: 2, buttons: 0, clientX: 200, clientY: 130 }));
            tick(r.scene, 200);
        }
        const b = base.camera.target;
        const f = fast.camera.target;
        expect(Math.hypot(b.x, b.y, b.z)).toBeGreaterThan(0.05);
        expect(f.x).toBeCloseTo(b.x, 6);
        expect(f.y).toBeCloseTo(b.y, 6);
        expect(f.z).toBeCloseTo(b.z, 6);
        // The eye has moved with the centre, so the angles are compared as the camera reports them.
        expect(fast.camera.alpha).toBeCloseTo(base.camera.alpha, 6);
        expect(fast.camera.beta).toBeCloseTo(base.camera.beta, 6);
    });

    it("leaves the app's own writes to the angles as they are", () => {
        // Only a drag turns twice as far: when the app sets an angle, the camera takes that angle.
        const r = rig(true);
        r.camera.alpha = 1;
        r.camera.beta = 0.9;
        tick(r.scene);
        const a = r.real();
        expect(a.alpha).toBeCloseTo(1, 9);
        expect(a.beta).toBeCloseTo(0.9, 9);
        r.camera.alpha = -0.5;
        r.camera.beta = 1.4;
        tick(r.scene, 3);
        const b = r.real();
        expect(b.alpha).toBeCloseTo(-0.5, 9);
        expect(b.beta).toBeCloseTo(1.4, 9);
    });

    it("removes everything it added", () => {
        const r = rig(true);
        expect(listenerCount(r.canvas)).toBeGreaterThan(0);
        r.detach();
        expect(listenerCount(r.canvas)).toBe(0);
        expect(r.scene._beforeRender.length).toBe(r.before);
    });
});

import { describe, expect, it } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import { attachFastOrbit } from "../src/fast-orbit";
import { asCanvas, fire, listenerCount, makeCanvas, makeScene, pointer, tick } from "./helpers";

function rig(useSubject: boolean) {
    const canvas = makeCanvas();
    const scene = makeScene();
    const before = scene._beforeRender.length;
    const camera = createArcRotateCamera(0, 1.2, 10, { x: 0, y: 0, z: 0 });
    const detach = useSubject ? attachFastOrbit(camera, asCanvas(canvas), scene) : attachControl(camera, asCanvas(canvas), scene);
    return { canvas, scene, camera, detach, before };
}

function drag(r: ReturnType<typeof rig>, dx: number, dy: number): void {
    fire(r.canvas, "pointerdown", pointer({ clientX: 100, clientY: 100 }));
    fire(r.canvas, "pointermove", pointer({ clientX: 100 + dx, clientY: 100 + dy }));
    fire(r.canvas, "pointerup", pointer({ clientX: 100 + dx, clientY: 100 + dy, buttons: 0 }));
    tick(r.scene, 200);
}

describe("B2 fast orbit", () => {
    it("turns left-right twice as far as the default controls, glide included", () => {
        const base = rig(false);
        const fast = rig(true);
        drag(base, 100, 0);
        drag(fast, 100, 0);
        const baseTurn = base.camera.alpha;
        const fastTurn = fast.camera.alpha;
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
        const baseTurn = base.camera.beta - 1.2;
        const fastTurn = fast.camera.beta - 1.2;
        expect(Math.abs(baseTurn)).toBeGreaterThan(0.1);
        expect(Math.sign(fastTurn)).toBe(Math.sign(baseTurn));
        expect(fastTurn / baseTurn).toBeGreaterThan(1.9);
        expect(fastTurn / baseTurn).toBeLessThan(2.1);
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
    });

    it("removes everything it added", () => {
        const r = rig(true);
        expect(listenerCount(r.canvas)).toBeGreaterThan(0);
        r.detach();
        expect(listenerCount(r.canvas)).toBe(0);
        expect(r.scene._beforeRender.length).toBe(r.before);
    });
});

import { describe, expect, it } from "vitest";
import { createWalkthrough } from "../src/walkthrough";
import { asCanvas, fire, key, listenerCount, makeCanvas, makeScene, pointer, tick } from "./helpers";

type V = [number, number, number];
const unit = (v: V): V => {
    const l = Math.hypot(...v);
    return [v[0] / l, v[1] / l, v[2] / l];
};
const angle = (a: V, b: V) => {
    const u = unit(a), w = unit(b);
    return Math.acos(Math.max(-1, Math.min(1, u[0] * w[0] + u[1] * w[1] + u[2] * w[2])));
};
type Cam = { position: { x: number; y: number; z: number }; target: { x: number; y: number; z: number } };
const pos = (c: Cam): V => [c.position.x, c.position.y, c.position.z];
const look = (c: Cam): V => [c.target.x - c.position.x, c.target.y - c.position.y, c.target.z - c.position.z];
const sub = (a: V, b: V): V => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];

const EYE = { x: 0, y: 2, z: -20 };
const TARGET = { x: 0, y: 2, z: 0 };
const EYE2 = { x: 30, y: 5, z: 10 };
const TARGET2 = { x: 10, y: 0, z: 30 }; // seen from EYE2: toward -x, +z, slightly down

function make() {
    const canvas = makeCanvas();
    const scene = makeScene();
    const w = createWalkthrough(asCanvas(canvas), scene, EYE, TARGET);
    return { canvas, scene, w };
}

describe("walkthrough viewpoints", () => {
    it("starts at the eye, looking at the target, as the scene's camera", () => {
        const { scene, w } = make();
        expect(scene.camera).toBe(w.camera);
        expect(angle(look(w.camera), sub([0, 2, 0], [0, 2, -20]))).toBeLessThan(1e-6);
        expect(pos(w.camera)).toEqual([0, 2, -20]);
    });

    it("after a jump, shows the new view as the scene's camera", () => {
        const { scene, w } = make();
        w.jumpTo(EYE2, TARGET2);
        tick(scene, 3);
        expect(scene.camera).toBe(w.camera);
        const p = pos(w.camera);
        expect(Math.hypot(...sub(p, [30, 5, 10]))).toBeLessThan(1e-6);
        expect(angle(look(w.camera), sub([10, 0, 30], [30, 5, 10]))).toBeLessThan(1e-6);
    });

    it("after a jump, W flies toward the new target", () => {
        const { canvas, scene, w } = make();
        tick(scene, 2);
        w.jumpTo(EYE2, TARGET2);
        tick(scene, 2);
        fire(canvas, "keydown", key("KeyW"));
        tick(scene, 20);
        fire(canvas, "keyup", key("KeyW"));
        tick(scene, 5);
        const moved = sub(pos(w.camera), [30, 5, 10]);
        expect(Math.hypot(...moved)).toBeGreaterThan(0.5);
        const toTarget = sub([10, 0, 30], [30, 5, 10]);
        expect(angle(moved, toTarget)).toBeLessThan(1e-3);
        expect(angle(look(w.camera), toTarget)).toBeLessThan(1e-3);
    });

    it("after a jump, a small drag turns the view only a little from the new view", () => {
        const { canvas, scene, w } = make();
        w.jumpTo(EYE2, TARGET2);
        tick(scene, 2);
        fire(canvas, "pointerdown", pointer({ clientX: 400, clientY: 300 }));
        fire(canvas, "pointermove", pointer({ clientX: 410, clientY: 300 }));
        fire(canvas, "pointerup", pointer({ clientX: 410, clientY: 300 }));
        tick(scene, 100);
        const turned = angle(look(w.camera), sub([10, 0, 30], [30, 5, 10]));
        expect(turned).toBeGreaterThan(0);
        expect(turned).toBeLessThan(0.2);
    });

    it("dispose removes everything it added", () => {
        const { canvas, scene, w } = make();
        w.jumpTo(EYE2, TARGET2);
        w.jumpTo(EYE, TARGET);
        w.dispose();
        expect(listenerCount(canvas)).toBe(0);
        expect(scene._beforeRender.length).toBe(makeScene()._beforeRender.length);
    });
});

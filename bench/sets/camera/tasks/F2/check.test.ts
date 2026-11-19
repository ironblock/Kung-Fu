import { describe, expect, it } from "vitest";
import { attachFreeControl, createFreeCamera } from "@babylonjs/lite";
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

    it("after a jump, the same keys and drags move the view as the library's controls move a fresh camera there", () => {
        // "the library's usual keyboard and mouse controls" and "the controls carry on from that view":
        // a free camera made at the new eye and target, given attachFreeControl, is what the view must do.
        // The view is read through the camera's own world matrix, frame by frame.
        const wm = (c: object): number[] => {
            const own = Object.getOwnPropertyDescriptor(c, "worldMatrix")?.get;
            let proto = Object.getPrototypeOf(c);
            let get = own;
            while (!get && proto) {
                get = Object.getOwnPropertyDescriptor(proto, "worldMatrix")?.get;
                proto = Object.getPrototypeOf(proto);
            }
            return Array.from((get ? get.call(c) : (c as { worldMatrix: ArrayLike<number> }).worldMatrix) as ArrayLike<number>);
        };
        const drive = (canvas: ReturnType<typeof makeCanvas>, frame: () => void) => {
            const frames = (n: number) => {
                for (let i = 0; i < n; i++) frame();
            };
            fire(canvas, "keydown", key("KeyW"));
            frames(20);
            fire(canvas, "keyup", key("KeyW"));
            frames(5);
            fire(canvas, "pointerdown", pointer({ clientX: 400, clientY: 300 }));
            for (let i = 1; i <= 4; i++) {
                fire(canvas, "pointermove", pointer({ clientX: 400 + 10 * i, clientY: 300 - 5 * i }));
                frames(2);
            }
            fire(canvas, "pointerup", pointer({ clientX: 440, clientY: 280 }));
            frames(60);
            fire(canvas, "keydown", key("KeyD"));
            frames(10);
            fire(canvas, "keyup", key("KeyD"));
            frames(40);
        };
        const { canvas, scene, w } = make();
        tick(scene, 2);
        w.jumpTo(EYE2, TARGET2);
        tick(scene, 2);
        const lc = makeCanvas();
        const ls = makeScene();
        const lib = createFreeCamera({ ...EYE2 }, { ...TARGET2 });
        attachFreeControl(lib, asCanvas(lc), ls);
        tick(ls, 2);
        const seen: number[][] = [];
        drive(canvas, () => {
            tick(scene);
            seen.push(wm(w.camera));
        });
        let at = 0;
        drive(lc, () => {
            tick(ls);
            const want = wm(lib);
            const got = seen[at++]!;
            for (const i of [8, 9, 10, 12, 13, 14]) expect(Math.abs(got[i]! - want[i]!)).toBeLessThan(1e-6);
        });
        expect(Math.hypot(wm(w.camera)[12]! - 30, wm(w.camera)[14]! - 10)).toBeGreaterThan(1);
    });

    // Added 2026-11-19, after a fresh attack. The test above sends input only after a jump, from rest, at
    // 16 ms frames, and only W, D and a drag. Answers that turned the controls on only at the first jump,
    // or kept the glide of the old view across a jump, or had their own controls with no arrow keys and
    // a fixed step, passed it. Here the same input goes to a library free camera, given attachFreeControl
    // on a canvas and a scene of its own: before any jump, a camera at the first eye and target; after the
    // jump, a fresh camera at the new eye and target. The jump comes while the view still glides, and the
    // view must then rest at the new eye. Part of the input comes in frames of 33 ms.
    it("before and after a jump made while the view glides, moves as the library's controls move a fresh camera", () => {
        const wm = (c: object): number[] => {
            let get = Object.getOwnPropertyDescriptor(c, "worldMatrix")?.get;
            let proto = Object.getPrototypeOf(c);
            while (!get && proto) {
                get = Object.getOwnPropertyDescriptor(proto, "worldMatrix")?.get;
                proto = Object.getPrototypeOf(proto);
            }
            return Array.from((get ? get.call(c) : (c as { worldMatrix: ArrayLike<number> }).worldMatrix) as ArrayLike<number>);
        };
        type Frame = (dt: number) => void;
        const hold = (canvas: ReturnType<typeof makeCanvas>, frame: Frame, code: string, n: number, dt = 16) => {
            fire(canvas, "keydown", key(code));
            for (let i = 0; i < n; i++) frame(dt);
            fire(canvas, "keyup", key(code));
        };
        const idle = (frame: Frame, n: number, dt = 16) => {
            for (let i = 0; i < n; i++) frame(dt);
        };
        const drag = (canvas: ReturnType<typeof makeCanvas>, frame: Frame, dx: number, dy: number, dt = 16) => {
            fire(canvas, "pointerdown", pointer({ clientX: 400, clientY: 300 }));
            for (let i = 1; i <= 4; i++) {
                fire(canvas, "pointermove", pointer({ clientX: 400 + dx * i, clientY: 300 + dy * i }));
                frame(dt);
            }
            fire(canvas, "pointerup", pointer({ clientX: 400 + 4 * dx, clientY: 300 + 4 * dy }));
        };
        // Before any jump; it ends with a W held at 33 ms frames and let go just before the jump.
        const before = (canvas: ReturnType<typeof makeCanvas>, frame: Frame) => {
            hold(canvas, frame, "KeyW", 15);
            idle(frame, 5);
            hold(canvas, frame, "ArrowUp", 10);
            hold(canvas, frame, "Space", 8);
            idle(frame, 4);
            hold(canvas, frame, "ShiftLeft", 8);
            drag(canvas, frame, -8, 6);
            idle(frame, 30);
            hold(canvas, frame, "KeyW", 10, 33);
            idle(frame, 2, 33);
        };
        // After the jump: first nothing, then every kind of input, part of it at 33 ms frames.
        const after = (canvas: ReturnType<typeof makeCanvas>, frame: Frame) => {
            idle(frame, 60);
            hold(canvas, frame, "ArrowUp", 12);
            idle(frame, 5);
            hold(canvas, frame, "Space", 6, 33);
            hold(canvas, frame, "ShiftLeft", 6);
            drag(canvas, frame, 9, -4, 33);
            idle(frame, 20, 33);
            hold(canvas, frame, "KeyW", 12, 33);
            idle(frame, 40, 33);
        };
        const same = (got: number[], want: number[]) => {
            for (const i of [8, 9, 10, 12, 13, 14]) expect(Math.abs(got[i]! - want[i]!)).toBeLessThan(1e-6);
        };
        const record = (canvas: ReturnType<typeof makeCanvas>, scene: ReturnType<typeof makeScene>, cam: () => object, plan: typeof before) => {
            const seen: number[][] = [];
            plan(canvas, (dt) => {
                tick(scene, 1, dt);
                seen.push(wm(cam()));
            });
            return seen;
        };
        const compare = (seen: number[][], plan: typeof before, from: { x: number; y: number; z: number }, to: { x: number; y: number; z: number }) => {
            const lc = makeCanvas();
            const ls = makeScene();
            const lib = createFreeCamera({ ...from }, { ...to });
            attachFreeControl(lib, asCanvas(lc), ls);
            let at = 0;
            plan(lc, (dt) => {
                tick(ls, 1, dt);
                same(seen[at++]!, wm(lib));
            });
            expect(at).toBe(seen.length);
        };
        const { canvas, scene, w } = make();
        const one = record(canvas, scene, () => w.camera, before);
        expect(Math.hypot(one[one.length - 1]![12]! - 0, one[one.length - 1]![14]! + 20)).toBeGreaterThan(1);
        w.jumpTo(EYE2, TARGET2);
        const two = record(canvas, scene, () => w.camera, after);
        compare(one, before, EYE, TARGET);
        compare(two, after, EYE2, TARGET2);
        // Resting at the new eye after the jump, for all of the first 60 frames.
        for (let i = 0; i < 60; i++) {
            expect(Math.hypot(two[i]![12]! - 30, two[i]![13]! - 5, two[i]![14]! - 10)).toBeLessThan(1e-6);
        }
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

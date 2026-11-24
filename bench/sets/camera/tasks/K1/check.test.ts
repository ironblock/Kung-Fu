import { describe, expect, it, vi } from "vitest";
import { attachControl, createArcRotateCamera } from "@babylonjs/lite";
import type { ArcRotateCamera } from "@babylonjs/lite";
import { asCanvas, fire, key, makeCanvas, makeScene, pointer, tick } from "./helpers";
import { createOrbitCamera } from "../src/orbit-camera";

describe("createOrbitCamera", () => {
    it("returns an orbit camera 10 units from the origin", () => {
        const camera = createOrbitCamera(asCanvas(makeCanvas()), makeScene());
        expect(camera.radius).toBeCloseTo(10, 6);
        expect(camera.target.x).toBeCloseTo(0, 6);
        expect(camera.target.y).toBeCloseTo(0, 6);
        expect(camera.target.z).toBeCloseTo(0, 6);
    });

    it("a mouse drag turns the camera", () => {
        const canvas = makeCanvas();
        const scene = makeScene();
        const camera = createOrbitCamera(asCanvas(canvas), scene);
        const before = camera.alpha;
        fire(canvas, "pointerdown", pointer({ clientX: 100, clientY: 100 }));
        fire(canvas, "pointermove", pointer({ clientX: 220, clientY: 100 }));
        fire(canvas, "pointerup", pointer({ clientX: 220, clientY: 100 }));
        tick(scene, 3);
        expect(camera.alpha).not.toBe(before);
    });

    it("the left arrow key turns the camera", () => {
        const canvas = makeCanvas();
        const scene = makeScene();
        const camera = createOrbitCamera(asCanvas(canvas), scene);
        const before = camera.alpha;
        fire(canvas, "keydown", key("ArrowLeft"));
        tick(scene, 3);
        fire(canvas, "keyup", key("ArrowLeft"));
        expect(camera.alpha).not.toBe(before);
    });

    // Added 2026-11-19. The test above asks only that ArrowLeft changes alpha. An answer with key handlers
    // of its own, which never turned on the library's arrow-key control, passed it. This file never turns
    // that control on itself, so a second camera given { keyboard: true } turns from the keys only when
    // the answer has turned the library's control on.
    it("turns on the library's own arrow-key control, so another camera attached with keyboard input also turns", () => {
        createOrbitCamera(asCanvas(makeCanvas()), makeScene());
        const canvas = makeCanvas();
        const scene = makeScene();
        const other = createArcRotateCamera(Math.PI / 2, Math.PI / 3, 10, { x: 0, y: 0, z: 0 });
        attachControl(other, asCanvas(canvas), scene, { keyboard: true });
        const before = other.alpha;
        fire(canvas, "keydown", key("ArrowLeft"));
        tick(scene, 5);
        fire(canvas, "keyup", key("ArrowLeft"));
        tick(scene, 20);
        expect(Math.abs(other.alpha - before)).toBeGreaterThan(1e-3);
    });

    // Changed 2026-11-19, after a fresh attack. The tests above call createOrbitCamera first, so an answer
    // that attached the keyboard before turning the library's control on passed here: the control was on
    // from an earlier test. This test loads the library and the answer afresh, so its call is the first.
    it("answers the arrow keys, with and without Ctrl or Alt, as the library's own arrow-key control does, from the first call", async () => {
        vi.resetModules();
        const fresh = await import("@babylonjs/lite");
        const { createOrbitCamera: firstCall } = await import("../src/orbit-camera");
        const newScene = () => fresh.createSceneContext(fresh.createNullEngine(), { defaultRenderTask: false });
        const canvas = makeCanvas();
        const scene = newScene();
        const camera = firstCall(asCanvas(canvas), scene);
        const lc = makeCanvas();
        const ls = newScene();
        const lib = fresh.createArcRotateCamera(camera.alpha, camera.beta, camera.radius, { x: camera.target.x, y: camera.target.y, z: camera.target.z });
        fresh.attachControl(lib, asCanvas(lc), ls, { keyboard: true });
        // The pose read through the camera's own accessors, kept now, before any key.
        const reader = (c: ArcRotateCamera) => {
            const get = (k: string) => {
                const g = Object.getOwnPropertyDescriptor(c, k)?.get;
                return g ? () => g.call(c) as number : () => (c as unknown as Record<string, number>)[k]!;
            };
            const [a, b, r] = [get("alpha"), get("beta"), get("radius")];
            return () => [a(), b(), r(), c.target.x, c.target.y, c.target.z];
        };
        const mine = reader(camera);
        const theirs = reader(lib);
        const start = mine();
        const steps = [["ArrowLeft", {}], ["ArrowUp", {}], ["ArrowLeft", { ctrlKey: true }], ["ArrowUp", { altKey: true }], ["ArrowRight", {}]] as const;
        for (const [code, mods] of steps) {
            for (const [c, s] of [[canvas, scene], [lc, ls]] as const) {
                fire(c, "keydown", key(code, mods));
                tick(s, 8);
                fire(c, "keyup", key(code, mods));
                tick(s, 60);
            }
            const a = mine();
            const b = theirs();
            for (let i = 0; i < a.length; i++) expect(Math.abs(a[i]! - b[i]!)).toBeLessThan(1e-6);
        }
        expect(Math.max(...mine().map((v, i) => Math.abs(v - start[i]!)))).toBeGreaterThan(1e-3);
    });
});

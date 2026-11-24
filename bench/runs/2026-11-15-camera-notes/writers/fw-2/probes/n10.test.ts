import { describe, it, expect } from "vitest";
import { createArcRotateCamera, attachControl, enableArcRotateKeyboardControls } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, key, makeScene, tick, listenerCount } from "./helpers";

describe("n10 arc-rotate keyboard needs enableArcRotateKeyboardControls() before attachControl plus a truthy keyboard option", () => {
    it("before enableArcRotateKeyboardControls, keyboard: true adds no key listener and arrows do nothing", () => {
        const scene = makeScene();
        const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas), scene, { keyboard: true });
        expect(canvas.listeners.get("keydown")?.length ?? 0).toBe(0);
        fire(canvas, "keydown", key("ArrowLeft"));
        tick(scene, 3);
        expect(cam.alpha).toBe(1);
    });
    it("after enabling, omitting keyboard still gives no keyboard input", () => {
        enableArcRotateKeyboardControls();
        const scene = makeScene();
        const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas), scene);
        expect(canvas.listeners.get("keydown")?.length ?? 0).toBe(0);
    });
    it("after enabling, keyboard: true listens on the canvas; a held arrow adds 1/100 rad of alpha offset per frame", () => {
        enableArcRotateKeyboardControls();
        const scene = makeScene();
        const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas), scene, { keyboard: true });
        expect(canvas.listeners.get("keydown")?.length).toBe(1);
        expect(canvas.tabIndex).toBe(0);
        fire(canvas, "keydown", key("ArrowRight"));
        tick(scene);
        expect(cam.alpha).toBeCloseTo(1 + 1 / 100, 10);
        void listenerCount;
    });
    it("Ctrl+arrow pans, Alt+ArrowUp feeds inertialRadiusOffset (zoom in) by 1/25", () => {
        enableArcRotateKeyboardControls();
        const scene = makeScene();
        const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas), scene, { keyboard: true });
        fire(canvas, "keydown", key("ArrowUp", { altKey: true }));
        tick(scene);
        expect(cam.radius).toBeCloseTo(10 - 1 / 25, 10);
        fire(canvas, "keyup", key("ArrowUp", { altKey: false }));
        fire(canvas, "keydown", key("ArrowRight", { ctrlKey: true }));
        const a = cam.alpha;
        tick(scene);
        expect(cam.alpha).toBe(a);
        expect(Math.hypot(cam.target.x, cam.target.y, cam.target.z)).toBeGreaterThan(0);
    });
});

describe("n10b the 1/100 goes to the inertial offset, so the turn grows; two arrows split it", () => {
    it("the second frame of a held arrow turns more than 1/100", () => {
        enableArcRotateKeyboardControls();
        const scene = makeScene();
        const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas), scene, { keyboard: true });
        fire(canvas, "keydown", key("ArrowRight"));
        tick(scene);
        const a1 = cam.alpha;
        tick(scene);
        expect(cam.alpha - a1).toBeCloseTo(0.01 + 0.009, 10);
    });
    it("two held arrows add 1/100/sqrt(2) to each axis", () => {
        enableArcRotateKeyboardControls();
        const scene = makeScene();
        const cam = createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
        const canvas = makeCanvas();
        attachControl(cam, asCanvas(canvas), scene, { keyboard: true });
        fire(canvas, "keydown", key("ArrowRight"));
        fire(canvas, "keydown", key("ArrowDown"));
        tick(scene);
        expect(cam.alpha - 1).toBeCloseTo(0.01 / Math.SQRT2, 10);
        expect(cam.beta - 1).toBeCloseTo(0.01 / Math.SQRT2, 10);
    });
});

import { describe, it, expect } from "vitest";
import { createFreeCamera, createBankedFreeCamera, attachFreeControl, attachConfigurableFreeControl } from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, key, makeScene, tick } from "./helpers";

const mk = () => createFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 });
const pos = (c: any) => ({ x: c.position.x, y: c.position.y, z: c.position.z });

describe("free", () => {
    it("n07 defaults", () => {
        const c = mk(); expect([c.fov, c.nearPlane, c.farPlane, c.speed, c.angularSensitivity, c.inertia]).toEqual([0.8, 1, 10000, 2, 2000, 0.9]);
    });
    it("n03 no scene: never moves", () => {
        const c = mk(); const cv = makeCanvas(); attachFreeControl(c, asCanvas(cv));
        fire(cv, "keydown", key("KeyW")); fire(cv, "pointerdown", pointer()); fire(cv, "pointermove", pointer({ clientX: 100 }));
        tick(makeScene(), 10); expect(pos(c)).toEqual({ x: 0, y: 0, z: -10 }); expect(c._yaw).toBe(0);
        const s = makeScene(); attachFreeControl(c, asCanvas(cv), s); expect(s._beforeRender.length).toBe(1);
    });
    it("n08 stale yaw/pitch", () => {
        const s = makeScene(); const c = mk(); const cv = makeCanvas(); attachFreeControl(c, asCanvas(cv), s);
        c.target.set(10, 0, -10); // look +X
        fire(cv, "keydown", key("KeyD")); tick(s); fire(cv, "keyup", key("KeyD"));
        // view direction back to +Z (yaw 0)
        expect(c.target.z - c.position.z).toBeCloseTo(1); expect(c.target.x - c.position.x).toBeCloseTo(0);
        const c2 = mk(); const cv2 = makeCanvas(); attachFreeControl(c2, asCanvas(cv2), s);
        c2.position.set(10, 0, -10); // now looking toward origin at -X+Z
        fire(cv2, "keydown", key("KeyW")); tick(s);
        expect(c2.target.x - c2.position.x).toBeCloseTo(0); expect(c2.target.z - c2.position.z).toBeCloseTo(1);
    });
    it("n09 target unit dist; yaw formulas", () => {
        const c = createFreeCamera({ x: 1, y: 2, z: 3 }, { x: 4, y: 6, z: 3 });
        expect(c._yaw).toBeCloseTo(Math.atan2(3, 0)); expect(c._pitch).toBeCloseTo(Math.atan2(4, 3));
        const s = makeScene(); const cv = makeCanvas(); attachFreeControl(c, asCanvas(cv), s);
        fire(cv, "pointerdown", pointer()); fire(cv, "pointermove", pointer({ clientX: 10 })); tick(s);
        const d = Math.hypot(c.target.x - c.position.x, c.target.y - c.position.y, c.target.z - c.position.z);
        expect(d).toBeCloseTo(1, 10);
        const c0 = mk(); expect(c0._yaw).toBe(0); // looks +Z
    });
    it("n10 keys by code; W along pitch; A/D level; Space/Shift world Y", () => {
        const s = makeScene();
        const run = (code: string, extra = {}) => { const c = createFreeCamera({ x: 0, y: 0, z: 0 }, { x: 0, y: 1, z: 1 }); const cv = makeCanvas(); attachFreeControl(c, asCanvas(cv), s); fire(cv, "keydown", key(code, extra)); tick(s); s._beforeRender.length = 0; return pos(c); };
        const w = run("KeyW", { key: "q" }); expect(w.y).toBeGreaterThan(0); expect(w.z).toBeCloseTo(w.y);
        expect(run("ArrowUp")).toEqual(w);
        const sDown = run("KeyS"); expect(sDown.y).toBeLessThan(0);
        const a = run("KeyA"); expect(a.y).toBe(0); expect(a.x).toBeLessThan(0);
        const d = run("ArrowRight"); expect(d.y).toBe(0); expect(d.x).toBeGreaterThan(0);
        expect(run("Space").y).toBeGreaterThan(0); expect(run("PageUp").y).toBeGreaterThan(0);
        expect(run("ShiftLeft").y).toBeLessThan(0); expect(run("ShiftRight").y).toBeLessThan(0); expect(run("PageDown").y).toBeLessThan(0);
        const sp = run("Space"); expect(sp.x).toBe(0); expect(sp.z).toBe(0);
        expect(run("w", { key: "w" })).toEqual({ x: 0, y: 0, z: 0 });
    });
    it("n11 speed formula, floor, steady 10x", () => {
        const s = makeScene(); const c = mk(); const cv = makeCanvas(); attachFreeControl(c, asCanvas(cv), s);
        fire(cv, "keydown", key("KeyW")); tick(s, 1, 16);
        expect(c.position.z + 10).toBeCloseTo(2 * 16 / Math.sqrt(100000), 10);
        for (let i = 0; i < 300; i++) tick(s, 1, 16);
        const z0 = c.position.z; tick(s, 1, 16); expect(c.position.z - z0).toBeCloseTo(10 * 2 * 16 / Math.sqrt(100000), 6);
        const c2 = mk(); const cv2 = makeCanvas(); const s2 = makeScene(); attachFreeControl(c2, asCanvas(cv2), s2);
        fire(cv2, "keydown", key("KeyW")); tick(s2, 1, 0); expect(c2.position.z + 10).toBeCloseTo(2 / Math.sqrt(100000), 10);
    });
    it("n12 tabindex, canvas keys, buttons", () => {
        const cv = makeCanvas(); attachFreeControl(mk(), asCanvas(cv), makeScene()); expect(cv.tabIndex).toBe(0);
        const cv2 = makeCanvas(); cv2.setAttribute("tabindex", "5"); cv2.tabIndex = 5; attachFreeControl(mk(), asCanvas(cv2)); expect(cv2.tabIndex).toBe(5);
        expect(cv.listeners.get("keydown")?.length).toBe(1);
        for (const b of [0, 1, 2]) { const s = makeScene(); const c = mk(); const k = makeCanvas(); attachFreeControl(c, asCanvas(k), s); fire(k, "pointerdown", pointer({ button: b })); fire(k, "pointermove", pointer({ clientX: 50 })); tick(s); expect(c._yaw).not.toBe(0); }
        const s = makeScene(); const c = mk(); const k = makeCanvas(); attachFreeControl(c, asCanvas(k), s); fire(k, "pointerdown", pointer({ button: 3 })); fire(k, "pointermove", pointer({ clientX: 50 })); tick(s); expect(c._yaw).toBe(0);
    });
    it("n13 turn rate, decay, pitch clamp, down lowers", () => {
        const s = makeScene(); const c = mk(); const cv = makeCanvas(); attachFreeControl(c, asCanvas(cv), s);
        fire(cv, "pointerdown", pointer()); fire(cv, "pointermove", pointer({ clientX: 20 })); tick(s);
        expect(c._yaw).toBeCloseTo(20 / 2000); tick(s); expect(c._yaw).toBeCloseTo(0.01 + 0.009);
        fire(cv, "pointermove", pointer({ clientX: 20, clientY: 100 })); tick(s); expect(c._pitch).toBeLessThan(0); expect(c.target.y).toBeLessThan(c.position.y);
        fire(cv, "pointermove", pointer({ clientX: 20, clientY: 100000 })); tick(s); expect(c._pitch).toBeCloseTo(-(Math.PI / 2 - 0.01));
    });
    it("n14 configurable", () => {
        const s = makeScene();
        const run = (opts: any, codes: string[]) => { const c = mk(); const cv = makeCanvas(); const sc = makeScene(); attachConfigurableFreeControl(c, asCanvas(cv), sc, opts); for (const k of codes) fire(cv, "keydown", key(k)); tick(sc); return pos(c); };
        expect(run({ upKeys: ["KeyE"] }, ["Space"]).y).toBe(0);
        expect(run({ upKeys: ["KeyE"] }, ["KeyE"]).y).toBeGreaterThan(0);
        expect(run({ downKeys: ["KeyQ"] }, ["ShiftLeft"]).y).toBe(0);
        const base = run({}, ["KeyW"]); expect(run({ fastMultiplier: 5 }, ["KeyW", "ShiftLeft"]).z).toBe(base.z);
        const fs = run({ fastKeys: ["ShiftLeft"], fastMultiplier: 3 }, ["KeyW", "ShiftLeft"]);
        expect(fs.z + 10).toBeCloseTo((base.z + 10) * 3); expect(fs.y).toBeLessThan(0);
        void s;
    });
    it("n53 vertical view gives identity rotation", () => {
        const c = createFreeCamera({ x: 1, y: 0, z: 2 }, { x: 1, y: 10, z: 2 }); const m = Array.from(c.worldMatrix);
        expect(m.slice(0, 3)).toEqual([1, 0, 0]); expect(m.slice(4, 7)).toEqual([0, 1, 0]); expect(m.slice(8, 11)).toEqual([0, 0, 1]);
        const d = createFreeCamera({ x: 1, y: 0, z: 2 }, { x: 1, y: -10, z: 2 }); expect(Array.from(d.worldMatrix).slice(8, 11)).toEqual([0, 0, 1]);
    });
    it("n52 banked", () => {
        const c = createBankedFreeCamera({ x: 0, y: 0, z: -10 }, { x: 0, y: 0, z: 0 }); const m0 = Array.from(c.worldMatrix);
        c.upVector.x = 1; const m1 = Array.from(c.worldMatrix); expect(m1).not.toEqual(m0);
        c.upVector.set(0, 0, 1); expect(Array.from(c.worldMatrix).slice(0, 11)).toEqual([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]);
        expect(() => { (c as any).upVector = { x: 0, y: 1, z: 0 }; }).toThrow(TypeError);
        expect(Object.getOwnPropertyDescriptor(c, "upVector")!.writable).toBe(false);
    });
});

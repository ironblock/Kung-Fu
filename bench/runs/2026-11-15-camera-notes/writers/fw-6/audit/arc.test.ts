import { describe, it, expect } from "vitest";
import {
    createArcRotateCamera, attachControl, setCameraLimits, enableArcRotateKeyboardControls,
    interpolateArcRotateCamera, disposeScene, onSceneDispose,
} from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, touches, key, makeScene, tick, listenerCount } from "./helpers";

const mk = () => createArcRotateCamera(1, 1, 10, { x: 0, y: 0, z: 0 });
const wm = (c: { worldMatrix: ArrayLike<number> }) => Array.from(c.worldMatrix);

describe("arc", () => {
    it("n02 no scene: inputs only add offsets; pinch moves", () => {
        const cam = mk(); const cv = makeCanvas();
        attachControl(cam, asCanvas(cv));
        fire(cv, "pointerdown", pointer({ clientX: 0 })); fire(cv, "pointermove", pointer({ clientX: 50, clientY: 20 }));
        expect(cam.inertialAlphaOffset).not.toBe(0);
        fire(cv, "wheel", { deltaY: 100 });
        expect(cam.inertialRadiusOffset).not.toBe(0);
        const other = makeScene(); tick(other, 5);
        expect(cam.alpha).toBe(1); expect(cam.beta).toBe(1); expect(cam.radius).toBe(10);
        fire(cv, "pointerup", pointer());
        fire(cv, "touchstart", touches([1, 0, 0], [2, 100, 0]));
        fire(cv, "touchmove", touches([1, 0, 0], [2, 200, 0]));
        expect(cam.radius).toBeCloseTo(5);
        // with a scene the hook moves it
        const cam2 = mk(); const cv2 = makeCanvas(); const s = makeScene();
        attachControl(cam2, asCanvas(cv2), s);
        fire(cv2, "pointerdown", pointer()); fire(cv2, "pointermove", pointer({ clientX: 50 }));
        expect(cam2.alpha).toBe(1); tick(s); expect(cam2.alpha).not.toBe(1);
    });
    it("n04 direct limit fields inert until setCameraLimits; then every write clamped", () => {
        const cam = mk(); cam.lowerRadiusLimit = 5; cam.radius = 2; expect(cam.radius).toBe(2);
        cam.upperBetaLimit = 1.2; cam.beta = 2; expect(cam.beta).toBe(2);
        setCameraLimits(cam, {});
        expect(cam.radius).toBe(5); expect(cam.beta).toBe(1.2);
        cam.upperRadiusLimit = 8; cam.radius = 20; expect(cam.radius).toBe(8);
        const cv = makeCanvas(); const s = makeScene(); attachControl(cam, asCanvas(cv), s);
        fire(cv, "wheel", { deltaY: -100000 }); // big zoom in (offset positive -> radius decreases)
        tick(s); expect(cam.radius).toBe(5);
    });
    it("n55 setCameraLimits keys, undefined clears, zero offset, disposer", () => {
        const cam = mk(); cam.inertialRadiusOffset = 1; cam.inertialAlphaOffset = 1; cam.radius = 2;
        const d1 = setCameraLimits(cam, { lowerRadiusLimit: 5 });
        expect(cam.radius).toBe(5); expect(cam.inertialRadiusOffset).toBe(0); expect(cam.inertialAlphaOffset).toBe(1);
        setCameraLimits(cam, { upperBetaLimit: 1.2 }); expect(cam.lowerRadiusLimit).toBe(5);
        setCameraLimits(cam, { lowerRadiusLimit: undefined }); expect(cam.lowerRadiusLimit).toBeUndefined();
        const d = setCameraLimits(cam, { lowerRadiusLimit: 5 });
        d(); expect(cam.lowerRadiusLimit).toBe(5); cam.radius = 1; expect(cam.radius).toBe(1);
        // an earlier disposer after a later call: does it drop the hook?
        const c2 = mk(); const a = setCameraLimits(c2, { lowerRadiusLimit: 5 }); setCameraLimits(c2, { upperRadiusLimit: 50 });
        a(); c2.radius = 1;
        (globalThis as any).__n55_old_disposer_clamped = c2.radius; // record
        expect(c2.radius).toBe(5); // old disposer did NOT drop the hook
        void d1;
    });
    it("n05 builtin clamps only in rotation/zoom/pinch; limit fields undefined", () => {
        const cam = mk();
        for (const k of ["lowerAlphaLimit", "upperAlphaLimit", "lowerBetaLimit", "upperBetaLimit", "lowerRadiusLimit", "upperRadiusLimit"] as const) expect(cam[k]).toBeUndefined();
        cam.beta = 0; cam.radius = -1; expect(cam.beta).toBe(0); expect(cam.radius).toBe(-1);
        const cv = makeCanvas(); const s = makeScene(); attachControl(cam, asCanvas(cv), s);
        cam.inertialPanningX = 1; tick(s); expect(cam.beta).toBe(0); expect(cam.radius).toBe(-1); // pan step: no clamp
        cam.inertialAlphaOffset = 0.1; tick(s); expect(cam.beta).toBeCloseTo(0.01);
        cam.radius = 1; cam.inertialRadiusOffset = 5; tick(s); expect(cam.radius).toBeCloseTo(0.01);
        cam.beta = 4; cam.inertialBetaOffset = 0.01; tick(s); expect(cam.beta).toBeCloseTo(Math.PI - 0.01);
        cam.radius = 1;
        fire(cv, "touchstart", touches([1, 0, 0], [2, 100, 0])); fire(cv, "touchmove", touches([1, 0, 0], [2, 100000000, 0]));
        expect(cam.radius).toBeCloseTo(0.01);
    });
    it("n06 defaults", () => {
        const c = mk();
        expect([c.fov, c.nearPlane, c.farPlane, c.inertia, c.panningInertia, c.angularSensibility, c.panningSensibility, c.wheelPrecision]).toEqual([0.8, 0.1, 1000, 0.9, 0.9, 1000, 50, 3]);
    });
    it("n25 rejects on outside change, newer interpolation, input, abort", async () => {
        const s = makeScene();
        const c = mk(); const p = interpolateArcRotateCamera(c, s, { alpha: 3 }); tick(s); c.alpha = 2; tick(s);
        await expect(p).rejects.toThrow();
        const c2 = mk(); const p2 = interpolateArcRotateCamera(c2, s, { radius: 50 }); tick(s);
        const p3 = interpolateArcRotateCamera(c2, s, { radius: 2 }); tick(s); tick(s);
        await expect(p2).rejects.toThrow(); p3.catch(() => {});
        const c3 = mk(); const cv = makeCanvas(); attachControl(c3, asCanvas(cv), s);
        const p4 = interpolateArcRotateCamera(c3, s, { alpha: 3 }); tick(s);
        fire(cv, "pointerdown", pointer()); fire(cv, "pointermove", pointer({ clientX: 30 })); tick(s); tick(s);
        await expect(p4).rejects.toThrow();
        const c4 = mk(); const ac = new AbortController(); const p5 = interpolateArcRotateCamera(c4, s, { alpha: 3 }, ac.signal); tick(s); ac.abort();
        await expect(p5).rejects.toBeTruthy();
        // target change
        const c5 = mk(); const p6 = interpolateArcRotateCamera(c5, s, { alpha: 3 }); tick(s); c5.target.x = 1; tick(s);
        await expect(p6).rejects.toThrow();
    });
    it("n26 starts next frame; zeroes inertia; omitted from pose then; half-life", () => {
        const s = makeScene(); const c = mk(); c.inertialAlphaOffset = 0.5; c.inertialPanningY = 0.3;
        interpolateArcRotateCamera(c, s, { radius: 20 }).catch(() => {});
        expect(c.inertialAlphaOffset).toBe(0.5); expect(c.radius).toBe(10);
        c.alpha = 2; // before first frame: becomes the held alpha
        tick(s, 1, 16);
        expect(c.inertialAlphaOffset).toBe(0); expect(c.inertialPanningY).toBe(0);
        expect(c.alpha).toBe(2);
        expect(c.radius).toBeCloseTo(10 + 10 * (1 - Math.pow(2, -0.016 / 0.1)), 10);
        const r1 = c.radius; tick(s, 1, 100);
        expect(c.radius).toBeCloseTo(r1 + (20 - r1) * 0.5, 10);
    });
    it("n27 shortest arc alpha/beta, clamp goals every frame, NaN omitted, snap", async () => {
        const s = makeScene(); const c = createArcRotateCamera(3, 0.1, 10, { x: 0, y: 0, z: 0 });
        const p = interpolateArcRotateCamera(c, s, { alpha: -3, beta: 6.2, radius: NaN });
        tick(s); expect(c.alpha).toBeGreaterThan(3); expect(c.beta).toBeLessThan(0.1); expect(c.radius).toBe(10);
        for (let i = 0; i < 200; i++) tick(s);
        await p; expect(c.alpha).toBe(-3); expect(c.beta).toBe(6.2); expect(c.radius).toBe(10);
        const c2 = mk(); const p2 = interpolateArcRotateCamera(c2, s, { radius: 100 }); tick(s, 1); expect(c2.radius).toBeLessThan(30);
        setCameraLimits(c2, { upperRadiusLimit: 30 });
        // setCameraLimits clamps only if over; continue
        for (let i = 0; i < 300; i++) tick(s);
        await p2; expect(c2.radius).toBe(30);
    });
    it("n43 buttons, touch rotates regardless, pinch writes radius no inertia", () => {
        const s = makeScene(); const c = mk(); const cv = makeCanvas(); attachControl(c, asCanvas(cv), s, { pointerMappings: { primaryButton: "pan" } });
        fire(cv, "pointerdown", pointer({ pointerType: "touch" })); fire(cv, "pointermove", pointer({ clientX: 20, pointerType: "touch" }));
        expect(c.inertialAlphaOffset).not.toBe(0); expect(c.inertialPanningX).toBe(0); fire(cv, "pointerup", pointer());
        const c2 = mk(); const cv2 = makeCanvas(); attachControl(c2, asCanvas(cv2), s);
        fire(cv2, "pointerdown", pointer({ button: 1 })); fire(cv2, "pointermove", pointer({ clientX: 20, clientY: 20 }));
        expect([c2.inertialAlphaOffset, c2.inertialBetaOffset, c2.inertialPanningX, c2.inertialPanningY]).toEqual([0, 0, 0, 0]); fire(cv2, "pointerup", pointer());
        fire(cv2, "pointerdown", pointer({ button: 0 })); fire(cv2, "pointermove", pointer({ clientX: 40, clientY: 20 })); expect(c2.inertialAlphaOffset).not.toBe(0); fire(cv2, "pointerup", pointer());
        c2.inertialAlphaOffset = 0; c2.inertialBetaOffset = 0;
        fire(cv2, "pointerdown", pointer({ button: 2, clientX: 40, clientY: 20 })); fire(cv2, "pointermove", pointer({ clientX: 60, clientY: 20 })); expect(c2.inertialPanningX).not.toBe(0); expect(c2.inertialAlphaOffset).toBe(0); fire(cv2, "pointerup", pointer({ button: 2 }));
        fire(cv2, "touchstart", touches([1, 0, 0], [2, 100, 0])); fire(cv2, "touchmove", touches([1, 0, 0], [2, 50, 0]));
        expect(c2.radius).toBeCloseTo(20); expect(c2.inertialRadiusOffset).toBe(0);
    });
    it("n44 pan scale radius/1000, drag sign, panningInertia", () => {
        const s = makeScene(); const c = createArcRotateCamera(0, Math.PI / 2, 10, { x: 0, y: 0, z: 0 }); const cv = makeCanvas(); attachControl(c, asCanvas(cv), s);
        c.panningInertia = 0.5; c.inertia = 0.1;
        fire(cv, "pointerdown", pointer({ button: 2 })); fire(cv, "pointermove", pointer({ button: 2, clientX: 10, clientY: 5 }));
        (globalThis as any).__n44 = [c.inertialPanningX, c.inertialPanningY];
        expect(c.inertialPanningY).toBeCloseTo(5 / 50);
        const px = c.inertialPanningX;
        const t0 = { x: c.target.x, y: c.target.y, z: c.target.z };
        tick(s);
        const moved = Math.hypot(c.target.x - t0.x, c.target.y - t0.y, c.target.z - t0.z);
        expect(moved).toBeCloseTo(Math.hypot(px, 5 / 50) * 10 / 1000, 10);
        expect(c.inertialPanningX).toBeCloseTo(px * 0.5);
        expect(px).toBeCloseTo(10 / 50); // the note's sign: +dx/panningSensibility
    });
    it("n45 wheel offset sign and proportional", () => {
        const s = makeScene(); const c = mk(); const cv = makeCanvas(); attachControl(c, asCanvas(cv), s);
        fire(cv, "wheel", { deltaY: 100 });
        (globalThis as any).__n45 = c.inertialRadiusOffset;
        const off = c.inertialRadiusOffset; expect(Math.abs(off)).toBeCloseTo(100 * 10 / 3000);
        tick(s); expect(c.radius).toBeCloseTo(10 - off); expect(c.inertialRadiusOffset).toBeCloseTo(off * 0.9);
        expect(off).toBeCloseTo(100 * 10 / 3000); // note says "adds"
    });
    it("n46 inertia ignores frame time; epsilons", () => {
        const s = makeScene(); const a = mk(); attachControl(a, asCanvas(makeCanvas()), s);
        a.inertialAlphaOffset = 0.1; tick(s, 1, 16); const x16 = a.alpha;
        const s2 = makeScene(); const b = mk(); attachControl(b, asCanvas(makeCanvas()), s2);
        b.inertialAlphaOffset = 0.1; tick(s2, 1, 200); expect(b.alpha).toBe(x16);
        expect(a.inertialAlphaOffset).toBeCloseTo(0.09);
        a.inertialAlphaOffset = 0.0011; tick(s); expect(a.inertialAlphaOffset).toBe(0);
        a.inertialRadiusOffset = 0.0011; tick(s); expect(a.inertialRadiusOffset).toBe(0);
        a.inertialPanningX = 0.00011; tick(s); expect(a.inertialPanningX).toBe(0);
        a.inertialPanningX = 0.0002; tick(s); expect(a.inertialPanningX).toBeCloseTo(0.00018);
    });
    it("n47/n48 keyboard: order, truthy, mapping, modifiers, sensitivities", () => {
        const s = makeScene(); const c0 = mk(); const cv0 = makeCanvas();
        attachControl(c0, asCanvas(cv0), s, { keyboard: true });
        enableArcRotateKeyboardControls();
        fire(cv0, "keydown", key("ArrowRight")); tick(s); expect(c0.alpha).toBe(1); // attached before enable
        const c1 = mk(); const cv1 = makeCanvas(); attachControl(c1, asCanvas(cv1), s);
        fire(cv1, "keydown", key("ArrowRight")); tick(s); expect(c1.alpha).toBe(1); // keyboard not given
        const sc = makeScene(); const c = mk(); const cv = makeCanvas(); attachControl(c, asCanvas(cv), sc, { keyboard: true });
        c.angularSensibility = 1; c.panningSensibility = 1;
        fire(cv, "keydown", key("ArrowRight")); tick(sc); expect(c.alpha).toBeCloseTo(1 + 1 / 100);
        tick(sc); expect(c.alpha).toBeCloseTo(1 + 0.01 + 0.01 * 0.9 + 0.01); // held adds each frame
        fire(cv, "keyup", key("ArrowRight")); for (let i = 0; i < 100; i++) tick(sc);
        const a0 = c.alpha;
        fire(cv, "keydown", key("ArrowUp", { ctrlKey: true, altKey: true })); tick(sc);
        expect(c.alpha).toBe(a0); expect(c.inertialPanningY).toBeCloseTo((1 / 50) * 0.9); expect(c.radius).toBe(10);
        fire(cv, "keyup", key("ArrowUp")); for (let i = 0; i < 200; i++) tick(sc);
        fire(cv, "keydown", key("ArrowUp", { altKey: true })); tick(sc); expect(c.radius).toBeCloseTo(10 - 1 / 25);
        fire(cv, "keyup", key("ArrowUp")); for (let i = 0; i < 200; i++) tick(sc);
        const b = c.beta; const al = c.alpha; const r = c.radius;
        fire(cv, "keydown", key("ArrowLeft")); fire(cv, "keydown", key("MetaLeft", { metaKey: true })); tick(sc);
        expect([c.alpha, c.beta, c.radius]).toEqual([al, b, r]);
        // keys are on canvas
        expect(cv.listeners.get("keydown")?.length).toBe(1);
        // keyboard options control speed
        const c3 = mk(); const cv3 = makeCanvas(); attachControl(c3, asCanvas(cv3), sc, { keyboard: { angularSensitivity: 10 } });
        fire(cv3, "keydown", key("ArrowRight")); const a3 = c3.alpha; tick(sc); expect(c3.alpha - a3).toBeCloseTo(0.1);
    });
    it("n49 disposeScene leaves listeners; onSceneDispose; idempotent", () => {
        const s = makeScene(); const c = mk(); const cv = makeCanvas(); attachControl(c, asCanvas(cv), s);
        const n = listenerCount(cv); expect(n).toBeGreaterThan(0); disposeScene(s); expect(listenerCount(cv)).toBe(n);
        const s2 = makeScene(); const cv2 = makeCanvas(); const det = attachControl(mk(), asCanvas(cv2), s2); onSceneDispose(s2, det); disposeScene(s2);
        expect(listenerCount(cv2)).toBe(0); det(); expect(listenerCount(cv2)).toBe(0);
    });
    it("n51 option hooks", () => {
        const s = makeScene(); const c = mk(); const cv = makeCanvas();
        let drag = false; let pend = false;
        attachControl(c, asCanvas(cv), s, { shouldHandlePointerDown: (e) => (e as any).clientX !== 999, isExternalDragActive: () => drag, isExternalPickPending: () => pend });
        fire(cv, "pointerdown", pointer({ clientX: 999 })); fire(cv, "pointermove", pointer({ clientX: 1100 })); expect(c.inertialAlphaOffset).toBe(0); expect(cv.captured.length).toBe(0);
        fire(cv, "pointerdown", pointer({ clientX: 0 })); pend = true; fire(cv, "pointermove", pointer({ clientX: 30 })); expect(c.inertialAlphaOffset).toBe(0);
        pend = false; fire(cv, "pointermove", pointer({ clientX: 60 })); expect(c.inertialAlphaOffset).not.toBe(0);
        c.inertialRadiusOffset = 0.5; c.inertialPanningX = 0.2;
        drag = true; fire(cv, "pointermove", pointer({ clientX: 90 }));
        expect([c.inertialAlphaOffset, c.inertialBetaOffset, c.inertialPanningX, c.inertialPanningY]).toEqual([0, 0, 0, 0]); expect(c.inertialRadiusOffset).toBe(0.5);
        drag = false; fire(cv, "pointermove", pointer({ clientX: 120 })); expect(c.inertialAlphaOffset).toBe(0); // drag ended
    });
    it("n01 target assignment", () => {
        const c = mk(); const before = wm(c);
        c.target = { x: 5, y: 0, z: 0 }; expect(wm(c)).toEqual(before);
        c.target.x = 7; expect(wm(c)).toEqual(before);
        const c2 = mk(); c2.target.x = 5; expect(wm(c2)).not.toEqual(before);
        // later scalar write picks the new object up
        c.alpha = 1.0000001; expect(wm(c)[12]).toBeGreaterThan(5);
    });
});

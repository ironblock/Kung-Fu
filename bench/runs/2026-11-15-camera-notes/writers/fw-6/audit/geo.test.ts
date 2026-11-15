import { describe, it, expect } from "vitest";
import {
    createGeospatialCamera, setGeospatialOrientation, attachGeospatialControls, flyGeospatialCameraToAsync,
    getViewMatrix, getViewProjectionMatrix, projectWorldToScreen,
} from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, key, makeScene, tick } from "./helpers";

const win = makeCanvas(); (globalThis as any).window = win;
const R = 1000;
const mk = () => createGeospatialCamera({ planetRadius: R });
const v3 = (v: any) => ({ x: v.x, y: v.y, z: v.z });
const len = (v: any) => Math.hypot(v.x, v.y, v.z);

describe("geo", () => {
    it("n28 pitch forced at >=4R, free <=2R; starts 4R", () => {
        const c = mk(); expect(c.radius).toBe(4 * R); c.pitch = 1; expect(c.pitch).toBeCloseTo(0.001, 10);
        setGeospatialOrientation(c, { radius: 3.5 * R, pitch: 1.5 }); expect(c.pitch).toBeLessThan(1.5); expect(c.pitch).toBeGreaterThan(0.001);
        setGeospatialOrientation(c, { radius: 2 * R, pitch: 1.5 }); expect(c.pitch).toBe(1.5);
        setGeospatialOrientation(c, { radius: 4.5 * R, pitch: 1.5 }); expect(c.radius).toBe(4 * R); expect(c.pitch).toBeCloseTo(0.001);
    });
    it("n29 setters reclamp; order", () => {
        const c = mk(); c.pitch = 1; c.radius = R; expect(c.pitch).toBeCloseTo(0.001);
        const d = mk(); d.radius = R; d.pitch = 1; expect(d.pitch).toBe(1);
        const e = mk(); setGeospatialOrientation(e, { pitch: 1, radius: R }); expect(e.pitch).toBe(1);
        const f = mk(); f.radius = 1; expect(f.radius).toBe(10);
    });
    it("n30 center returns internal vector", () => {
        const c = mk(); const p0 = v3(c.position); const m0 = Array.from(c.worldMatrix);
        c.center.x = 0; c.center.y = R; expect(v3(c.position)).toEqual(p0); expect(Array.from(c.worldMatrix)).toEqual(m0);
        expect(c.center).toBe(c.center);
        const v = { x: 0, y: R, z: 0 }; const d = mk(); d.center = v; expect(d.center).not.toBe(v); expect(d.position.y).toBeGreaterThan(R);
        v.x = 5; expect(d.center.x).toBe(0);
        // a later orientation change uses the mutated vector
        c.yaw = 0.5; (globalThis as any).__n30 = v3(c.position); expect(c.position.y).toBeGreaterThan(R);
    });
    it("n31 start state", () => {
        const c = mk(); expect(v3(c.center)).toEqual({ x: R, y: 0, z: 0 }); expect(c.yaw).toBe(0);
        expect([c.fov, c.nearPlane, c.farPlane]).toEqual([0.8, 1, 16 * R]);
        (globalThis as any).__n31 = c.pitch; expect(c.pitch).toBe(0);
    });
    it("n32 yaw/pitch directions, wrap then clamp", () => {
        const c = mk(); setGeospatialOrientation(c, { radius: 100, pitch: Math.PI / 2 - 0.01 });
        const look = (cc: any) => { const m = cc.worldMatrix; return { x: m[8], y: m[9], z: m[10] }; };
        expect(look(c).z).toBeCloseTo(1, 3);
        c.yaw = Math.PI / 2; const l = look(c); expect(l.y).toBeCloseTo(-1, 3); // library's east at (R,0,0) is -Y
        const d = mk(); setGeospatialOrientation(d, { radius: 100, pitch: 0.001 }); expect(look(d).x).toBeCloseTo(-1, 3);
        d.yaw = 4; expect(d.yaw).toBeCloseTo(4 - 2 * Math.PI); d.yaw = Math.PI; expect(d.yaw).toBeCloseTo(-Math.PI);
        d.limits.yawMin = -1; d.limits.yawMax = 1; d.yaw = 5; expect(d.yaw).toBe(-1); // 5 wraps to -1.28 -> clamp -1
    });
    it("n33 limit defaults; edits apply at next change", () => {
        const c = mk(); const L = c.limits;
        expect([L.radiusMin, L.radiusMax, L.pitchMin, L.pitchMax, L.yawMin, L.yawMax]).toEqual([10, 4 * R, 0.001, Math.PI / 2 - 0.01, -Infinity, Infinity]);
        expect(L.pitchDisabledRadiusScale).toEqual({ x: 2, y: 4 });
        L.radiusMax = 2 * R; expect(c.radius).toBe(4 * R); c.yaw = 0.1; expect(c.radius).toBe(2 * R);
    });
    it("n34 pole clamp keeps distance", () => {
        const c = mk(); c.center = { x: 0, y: 0, z: 2 * R };
        expect(Math.abs(c.center.z / len(c.center))).toBeCloseTo(0.998749218, 8); expect(len(c.center)).toBeCloseTo(2 * R);
        c.center = { x: 0, y: 3 * R, z: 0 }; expect(len(c.center)).toBeCloseTo(3 * R);
    });
    it("n38 flight resolves when cut short", async () => {
        const s = makeScene(); const c = mk(); let done = false;
        const p1 = flyGeospatialCameraToAsync(c, s, { yaw: 1 }).then(() => { done = true; }); tick(s);
        flyGeospatialCameraToAsync(c, s, { yaw: -1 }); await p1; expect(done).toBe(true); expect(c.yaw).not.toBeCloseTo(1);
        const c2 = mk(); const cv = makeCanvas(); attachGeospatialControls(c2, asCanvas(cv), s);
        let d2 = false; const p2 = flyGeospatialCameraToAsync(c2, s, { radius: 100 }).then(() => { d2 = true; }); tick(s);
        fire(win, "keydown", key("Equal")); tick(s); await p2; expect(d2).toBe(true); expect(c2.radius).toBeGreaterThan(200);
        fire(win, "keyup", key("Equal"));
    });
    it("n39 fly paths, duration, clamp", async () => {
        const s = makeScene(); const c = mk(); setGeospatialOrientation(c, { radius: 500, yaw: 3 });
        const p = flyGeospatialCameraToAsync(c, s, { yaw: -3, pitch: 5 });
        tick(s, 1, 500); expect(Math.abs(c.yaw)).toBeGreaterThan(3); // through PI
        tick(s, 1, 500); await p; expect(c.yaw).toBeCloseTo(-3);
        expect(c.pitch).toBeCloseTo(0.001, 10); // 5 wraps to -1.28, then clamped to pitchMin
        const c2 = mk(); setGeospatialOrientation(c2, { radius: 500 }); let res = false;
        const p2 = flyGeospatialCameraToAsync(c2, s, { center: { x: 0, y: 2 * R, z: 0 } }).then(() => { res = true; });
        tick(s, 1, 500); expect(len(c2.center)).toBeCloseTo(1.5 * R, 0); expect(c2.center.x).toBeCloseTo(c2.center.y, 3);
        tick(s, 1, 499); await Promise.resolve(); expect(res).toBe(false); tick(s, 1, 1); await p2; expect(res).toBe(true);
        const c3 = mk(); const p3 = flyGeospatialCameraToAsync(c3, s, { radius: 1, durationMs: 0 }); tick(s, 1, 1); await p3; expect(c3.radius).toBe(10);
    });
    it("n39b pitch lerped directly", async () => {
        const s = makeScene(); const c = mk(); setGeospatialOrientation(c, { radius: 500, pitch: 0.2 });
        const p = flyGeospatialCameraToAsync(c, s, { pitch: 1.2, durationMs: 1000, ease: (g) => g }); tick(s, 1, 500); expect(c.pitch).toBeCloseTo(0.7); tick(s, 1, 500); await p;
    });
    it("n35 buttons, sign-only wheel, step", () => {
        const s = makeScene();
        const run = (dy: number, r = 500, frames = 1) => { const c = mk(); setGeospatialOrientation(c, { radius: r, pitch: 0.3 }); const cv = makeCanvas(); const d = attachGeospatialControls(c, asCanvas(cv), s); fire(cv, "wheel", { deltaY: dy, clientX: 400, clientY: 300 }); tick(s, frames); d(); return c; };
        expect(run(1).radius).toBe(run(1000).radius);
        const one = run(-1, 500, 1).radius; const many = run(-1, 500, 30).radius; (globalThis as any).__n35 = [500 - one, 500 - many];
        expect(500 - many).toBeGreaterThan(500 - one); // coasts beyond the first frame
        const a = 500 - run(-1, 500, 1).radius; const b = 2000 - run(-1, 2000, 1).radius; expect(b).not.toBeCloseTo(a); // step not fixed in world units
        // rotate with button 1 and 2, pan with 0
        for (const btn of [1, 2]) { const c = mk(); setGeospatialOrientation(c, { radius: 500, pitch: 0.3 }); const cv = makeCanvas(); const d = attachGeospatialControls(c, asCanvas(cv), s); const y0 = c.yaw; const ct = v3(c.center); fire(cv, "pointerdown", pointer({ button: btn, clientX: 400, clientY: 300 })); fire(cv, "pointermove", pointer({ button: btn, clientX: 450, clientY: 300 })); tick(s); expect(c.yaw).not.toBe(y0); expect(v3(c.center)).toEqual(ct); d(); }
    });
    it("n35b pan keeps picked point under cursor", () => {
        const s = makeScene(); const c = mk(); setGeospatialOrientation(c, { radius: 500, pitch: 0.3 }); const cv = makeCanvas(); attachGeospatialControls(c, asCanvas(cv), s);
        // pick point under (420,330) by projecting candidate: use ray via projecting center point first
        const proj = (p: any) => projectWorldToScreen(p, getViewMatrix(c), getViewProjectionMatrix(c, 800 / 600), { viewport: { x: 0, y: 0, width: 800, height: 600 }, backingWidth: 800, backingHeight: 600 });
        const P0 = v3(c.center); const s0 = proj(P0); expect(s0.x).toBeCloseTo(400, 0);
        fire(cv, "pointerdown", pointer({ clientX: s0.x, clientY: s0.y }));
        fire(cv, "pointermove", pointer({ clientX: s0.x + 40, clientY: s0.y + 25 })); tick(s);
        const s1 = proj(P0); expect(s1.x).toBeCloseTo(s0.x + 40, -0.5); expect(s1.y).toBeCloseTo(s0.y + 25, -0.5);
        (globalThis as any).__n35b = [s1.x - s0.x, s1.y - s0.y];
    });
    it("n36 keys on window", () => {
        const s = makeScene(); const cv = makeCanvas();
        const run = (codes: string[], mods = {}) => { const c = mk(); setGeospatialOrientation(c, { radius: 500, pitch: 0.3 }); const d = attachGeospatialControls(c, asCanvas(cv), s); const before = { y: c.yaw, p: c.pitch, r: c.radius, c: v3(c.center) }; for (const k of codes) fire(win, "keydown", key(k, mods)); tick(s); for (const k of codes) fire(win, "keyup", key(k)); d(); return { before, c }; };
        expect(cv.listeners.get("keydown")).toBeUndefined();
        let r = run(["ArrowUp"]); expect(r.c.center.z).toBeGreaterThan(0); // north
        r = run(["ArrowRight"]); expect(r.c.center.y).toBeLessThan(0); // east (-Y here)
        r = run(["ControlLeft", "ArrowUp"]); expect(r.c.pitch).toBeGreaterThan(r.before.p); expect(v3(r.c.center)).toEqual(r.before.c);
        r = run(["ControlLeft", "ArrowRight"]); expect(r.c.yaw).toBeGreaterThan(r.before.y);
        for (const k of ["Equal", "NumpadAdd"]) { r = run([k]); expect(r.c.radius).toBeLessThan(500); expect(r.c.center.x).toBeCloseTo(r.before.c.x, 6); }
        for (const k of ["Minus", "NumpadSubtract"]) { r = run([k]); expect(r.c.radius).toBeGreaterThan(500); }
    });
    it("n37 pan/rotate stop; zoom coasts; no options", () => {
        const s = makeScene(); const c = mk(); setGeospatialOrientation(c, { radius: 500, pitch: 0.3 }); const cv = makeCanvas(); attachGeospatialControls(c, asCanvas(cv), s);
        fire(cv, "pointerdown", pointer({ button: 2, clientX: 400, clientY: 300 })); fire(cv, "pointermove", pointer({ button: 2, clientX: 450, clientY: 300 })); tick(s);
        const y1 = c.yaw; tick(s, 5); expect(c.yaw).toBe(y1); fire(cv, "pointerup", pointer({ button: 2 }));
        fire(cv, "wheel", { deltaY: -1, clientX: 400, clientY: 300 }); tick(s); const r1 = c.radius; tick(s); expect(c.radius).toBeLessThan(r1);
        // frame-rate normalised: one wheel event, total over 1 s at 60fps vs 30fps similar
        const tot = (dt: number) => { const sc = makeScene(); const cc = mk(); setGeospatialOrientation(cc, { radius: 500, pitch: 0.3 }); const k = makeCanvas(); attachGeospatialControls(cc, asCanvas(k), sc); fire(k, "wheel", { deltaY: -1, clientX: 400, clientY: 300 }); tick(sc, Math.round(2000 / dt), dt); return 500 - cc.radius; };
        (globalThis as any).__n37 = [tot(1000 / 60), tot(1000 / 30)];
        expect(tot(1000 / 30) / tot(1000 / 60)).toBeGreaterThan(0.8); expect(tot(1000 / 30) / tot(1000 / 60)).toBeLessThan(1.25);
    });
    it("n40 sphere pick, dblclick fly", async () => {
        const s = makeScene(); const c = mk(); setGeospatialOrientation(c, { radius: 500, pitch: 0.3 }); const cv = makeCanvas(); attachGeospatialControls(c, asCanvas(cv), s);
        c.limits.planetRadius = R; const c0 = v3(c.center);
        fire(cv, "dblclick", { button: 0, buttons: 0, clientX: 500, clientY: 300 });
        expect(c._cancelFly).toBeDefined(); tick(s, 1, 999); expect(c._cancelFly).toBeDefined(); tick(s, 1, 1); expect(c._cancelFly).toBeUndefined();
        expect(len(c.center)).toBeCloseTo(R, 3); expect(v3(c.center)).not.toEqual(c0);
        fire(cv, "dblclick", { button: 2, buttons: 0, clientX: 500, clientY: 300 }); expect(c._cancelFly).toBeUndefined();
        const c2 = mk(); setGeospatialOrientation(c2, { radius: 500, pitch: 0.3 }); const cv2 = makeCanvas(); attachGeospatialControls(c2, asCanvas(cv2), s, { doubleTapAnimationDurationMs: 100 });
        fire(cv2, "dblclick", { button: 0, buttons: 0, clientX: 400, clientY: 300 }); tick(s, 1, 100); expect(c2._cancelFly).toBeUndefined();
        // planetRadius in limits drives the pick sphere
        const c3 = mk(); setGeospatialOrientation(c3, { radius: 500, pitch: 0.3 }); c3.limits.planetRadius = 1200; const cv3 = makeCanvas(); attachGeospatialControls(c3, asCanvas(cv3), s);
        fire(cv3, "dblclick", { button: 0, buttons: 0, clientX: 400, clientY: 300 }); tick(s, 1, 1000); expect(len(c3.center)).toBeCloseTo(1200, 3);
    });
    it("n41 collisions", () => {
        const s = makeScene(); const c = mk(); setGeospatialOrientation(c, { radius: 20, pitch: 1.4 }); const cv = makeCanvas(); attachGeospatialControls(c, asCanvas(cv), s, { checkCollisions: true });
        // eye is near surface; ensure lifted
        tick(s); const l1 = len(c.position); (globalThis as any).__n41 = [l1]; expect(l1).toBeGreaterThan(R + 10 - 0.01); expect(l1).toBeGreaterThan(R); tick(s, 20); const l2 = len(c.position); (globalThis as any).__n41.push(l2); console.log('n41', l1, l2); expect(l2).toBeGreaterThan(R + 10 - 1e-3);
        const d = mk(); setGeospatialOrientation(d, { radius: 20, pitch: 1.4 }); const before = len(d.position); attachGeospatialControls(d, asCanvas(makeCanvas()), s); tick(s); expect(len(d.position)).toBeCloseTo(before);
        expect(before).toBeLessThan(R + 10);
    });
    it("n42 rotation pitch pre-clamp", () => {
        const s = makeScene(); const c = mk(); setGeospatialOrientation(c, { radius: 500, pitch: 0.3 });
        c.limits.pitchMax = 3; c.limits.pitchMin = -1; c.limits.pitchDisabledRadiusScale = null;
        const cv = makeCanvas(); attachGeospatialControls(c, asCanvas(cv), s);
        fire(cv, "pointerdown", pointer({ button: 2, clientX: 0, clientY: 0 })); fire(cv, "pointermove", pointer({ button: 2, clientX: 0, clientY: 5000 })); tick(s);
        expect(c.pitch).toBeCloseTo(Math.PI / 2 - 0.001, 10);
        fire(cv, "pointermove", pointer({ button: 2, clientX: 0, clientY: -50000 })); tick(s); expect(c.pitch).toBe(0);
    });
});

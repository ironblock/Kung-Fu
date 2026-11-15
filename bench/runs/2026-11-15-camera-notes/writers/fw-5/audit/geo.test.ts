import { describe, it, expect, beforeAll } from "vitest";
import {
    createGeospatialCamera,
    setGeospatialOrientation,
    createGeospatialLimits,
    getEffectivePitchMax,
    attachGeospatialControls,
    flyGeospatialCameraToAsync,
} from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, key, makeScene, tick, listenerCount, type FakeCanvas } from "./helpers";

const R = 1000;
let win: FakeCanvas;
beforeAll(() => {
    win = makeCanvas();
    (globalThis as unknown as { window: unknown }).window = win;
});
const len = (v: { x: number; y: number; z: number }) => Math.hypot(v.x, v.y, v.z);

describe("geospatial camera", () => {
    it("n42 center live; component write no recompute; whole assign copied", () => {
        const c = createGeospatialCamera({ planetRadius: R });
        const p0 = { ...c.position };
        const v0 = c.worldMatrixVersion;
        c.center.y = 100;
        expect(c.position).toEqual(p0);
        expect(c.worldMatrixVersion).toBe(v0);
        const nc = { x: 0, y: R, z: 0 };
        c.center = nc;
        expect(c.center).not.toBe(nc);
        nc.x = 5;
        expect(c.center.x).toBe(0);
        expect(c.position.y).toBeGreaterThan(R);
    });
    it("n43 setter clamps with current values", () => {
        const c = createGeospatialCamera({ planetRadius: R });
        c.pitch = 1;
        expect(c.pitch).toBe(0.001);
        c.radius = 100;
        c.pitch = 1;
        expect(c.pitch).toBe(1);
        const d = createGeospatialCamera({ planetRadius: R });
        setGeospatialOrientation(d, { radius: 100, pitch: 1 });
        expect(d.pitch).toBe(1);
    });
    it("n44 start pose", () => {
        const c = createGeospatialCamera({ planetRadius: R });
        expect(c.center).toEqual({ x: R, y: 0, z: 0 });
        expect(c.yaw).toBe(0);
        expect(c.radius).toBe(4 * R);
        expect([c.nearPlane, c.farPlane]).toEqual([1, 16 * R]);
        expect(c.pitch).toBe(0); // the note says pitch 0
    });
    it("n45 axes and pole limit", () => {
        const c = createGeospatialCamera({ planetRadius: R });
        setGeospatialOrientation(c, { radius: 100, pitch: Math.PI / 2 - 0.01, yaw: 0 });
        expect(c._lookAt.z).toBeGreaterThan(0.99); // north = +Z
        setGeospatialOrientation(c, { center: { x: 0, y: 0, z: R } });
        const lat = (Math.asin(c.center.z / len(c.center)) * 180) / Math.PI;
        expect(lat).toBeGreaterThan(89.9); // note: held under ~89.96
    });
    it("n46/n47 limits", () => {
        const l = createGeospatialLimits(R);
        expect(l).toEqual({ planetRadius: R, radiusMin: 10, radiusMax: 4 * R, pitchMin: 0.001, pitchMax: Math.PI / 2 - 0.01, pitchDisabledRadiusScale: { x: 2, y: 4 }, yawMin: -Infinity, yawMax: Infinity });
        expect(createGeospatialLimits(1e6).radiusMin).toBe(10);
        expect(getEffectivePitchMax(l, 2 * R)).toBe(l.pitchMax);
        expect(getEffectivePitchMax(l, 3 * R)).toBeCloseTo((l.pitchMax + l.pitchMin) / 2);
        expect(getEffectivePitchMax(l, 4 * R)).toBe(l.pitchMin);
        l.pitchDisabledRadiusScale = null;
        expect(getEffectivePitchMax(l, 100 * R)).toBe(l.pitchMax);
    });
    it("n48 limits apply at next change", () => {
        const c = createGeospatialCamera({ planetRadius: R });
        c.limits.radiusMax = 2 * R;
        expect(c.radius).toBe(4 * R);
        c.yaw = 0.5;
        expect(c.radius).toBe(2 * R);
    });
});

describe("fly", () => {
    it("n49 resolves when cut off; default duration; shortest yaw", async () => {
        const c = createGeospatialCamera({ planetRadius: R });
        c.radius = 100;
        const s = makeScene();
        let done1 = false;
        const p1 = flyGeospatialCameraToAsync(c, s, { radius: 50 }).then(() => (done1 = true));
        tick(s, 2);
        const p2 = flyGeospatialCameraToAsync(c, s, { yaw: -3, radius: 200 });
        await p1;
        expect(done1).toBe(true);
        tick(s, 1, 250);
        expect(c.yaw).toBeLessThan(0); // went the short way from ~0 to -3
        tick(s, 1, 250);
        expect(c.radius).toBeCloseTo(100 + 100 * 0.5, 0); // mid-flight cubic ease = 0.5
        tick(s, 1, 499);
        expect(c.radius).not.toBe(200);
        tick(s, 1, 1);
        expect(c.radius).toBe(200);
        await p2;
        // input through controls
        const canvas = makeCanvas();
        attachGeospatialControls(c, asCanvas(canvas), s);
        const p3 = flyGeospatialCameraToAsync(c, s, { radius: 300, durationMs: 10000 });
        tick(s, 1);
        fire(win, "keydown", key("Equal"));
        tick(s, 1);
        fire(win, "keyup", key("Equal"));
        await expect(p3).resolves.toBeUndefined();
    });
    it("n50 limits clamp, great circle with hop", () => {
        const c = createGeospatialCamera({ planetRadius: R });
        c.radius = 100;
        const s = makeScene();
        void flyGeospatialCameraToAsync(c, s, { radius: 1e9, durationMs: 100 });
        tick(s, 10, 16);
        expect(c.radius).toBe(4 * R);
        const d = createGeospatialCamera({ planetRadius: R });
        d.radius = 100;
        const end = { x: 0, y: R, z: 0 };
        const dist = Math.hypot(R, R);
        void flyGeospatialCameraToAsync(d, s, { center: end, durationMs: 1000, centerHopScale: 0.5 });
        tick(s, 1, 500);
        expect(len(d.center)).toBeCloseTo(R + 0.5 * dist, 3);
        expect(Math.atan2(d.center.y, d.center.x)).toBeCloseTo(Math.PI / 4);
    });
});

describe("controls", () => {
    function setup(opts?: object) {
        const c = createGeospatialCamera({ planetRadius: R });
        c.radius = 300;
        c.pitch = 0.3;
        const s = makeScene();
        const canvas = makeCanvas(800, 600);
        const off = attachGeospatialControls(c, asCanvas(canvas), s, opts);
        return { c, s, canvas, off };
    }
    it("n52 window keys; arrows pan north/east; ctrl rotates; zoom keys", () => {
        let { c, s, canvas, off } = setup();
        expect(win.listeners.get("keydown")?.length).toBeGreaterThan(0);
        expect(canvas.listeners.has("keydown")).toBe(false);
        const z0 = c.center.z;
        fire(win, "keydown", key("ArrowUp"));
        tick(s, 1);
        fire(win, "keyup", key("ArrowUp"));
        expect(c.center.z).toBeGreaterThan(z0);
        off();
        ({ c, s, canvas, off } = setup());
        const y0 = c.yaw;
        fire(win, "keydown", key("ControlLeft"));
        fire(win, "keydown", key("ArrowRight"));
        tick(s, 1);
        fire(win, "keyup", key("ArrowRight"));
        fire(win, "keyup", key("ControlLeft"));
        expect(c.yaw).toBeGreaterThan(y0);
        off();
        for (const code of ["Equal", "NumpadAdd"]) {
            ({ c, s, canvas, off } = setup());
            fire(win, "keydown", key(code));
            tick(s, 2);
            fire(win, "keyup", key(code));
            expect(c.radius).toBeLessThan(300);
            off();
        }
        for (const code of ["Minus", "NumpadSubtract"]) {
            ({ c, s, canvas, off } = setup());
            fire(win, "keydown", key(code));
            tick(s, 2);
            fire(win, "keyup", key(code));
            expect(c.radius).toBeGreaterThan(300);
            off();
        }
    });
    it("n51 buttons, dblclick flies center only", async () => {
        let { c, s, canvas, off } = setup();
        fire(canvas, "pointerdown", pointer({ button: 2, clientX: 400, clientY: 300 }));
        fire(canvas, "pointermove", pointer({ button: 2, clientX: 450, clientY: 300 }));
        tick(s, 1);
        expect(c.yaw).not.toBe(0);
        off();
        ({ c, s, canvas, off } = setup());
        const before = { ...c.center };
        fire(canvas, "pointerdown", pointer({ button: 0, clientX: 400, clientY: 300 }));
        fire(canvas, "pointermove", pointer({ clientX: 420, clientY: 300 }));
        tick(s, 1);
        expect(c.center).not.toEqual(before);
        expect(c.yaw).toBe(0);
        off();
        ({ c, s, canvas, off } = setup());
        const yaw = c.yaw, pitch = c.pitch, radius = c.radius;
        fire(canvas, "dblclick", { button: 0, buttons: 0, clientX: 450, clientY: 300 });
        tick(s, 80, 16);
        expect([c.yaw, c.pitch, c.radius]).toEqual([yaw, pitch, radius]);
        expect(c.center.y).not.toBe(0);
        off();
    });
    it("n53 aspect from bounding rect; viewport ignored", () => {
        const a = setup();
        a.c.viewport = { x: 0, y: 0, width: 0.25, height: 1 };
        fire(a.canvas, "wheel", { deltaY: -1, clientX: 700, clientY: 300 });
        tick(a.s, 5);
        const b = setup();
        fire(b.canvas, "wheel", { deltaY: -1, clientX: 700, clientY: 300 });
        tick(b.s, 5);
        expect(a.c.center.x).toBeCloseTo(b.c.center.x, 6);
        expect(a.c.center.y).toBeCloseTo(b.c.center.y, 6);
        a.off();
        b.off();
    });
    it("n54 zoom coasts, rotation stops; wheel sign only", () => {
        let { c, s, canvas, off } = setup();
        fire(canvas, "pointerdown", pointer({ button: 2, clientX: 400, clientY: 300 }));
        fire(canvas, "pointermove", pointer({ button: 2, clientX: 450, clientY: 300 }));
        tick(s, 1);
        const y1 = c.yaw;
        tick(s, 3);
        expect(c.yaw).toBe(y1);
        off();
        const runWheel = (deltaY: number) => {
            const t = setup();
            fire(t.canvas, "wheel", { deltaY, clientX: 400, clientY: 300 });
            tick(t.s, 1);
            const r1 = t.c.radius;
            tick(t.s, 1);
            const r2 = t.c.radius;
            t.off();
            return [r1, r2];
        };
        const [a1, a2] = runWheel(1);
        const [b1] = runWheel(500);
        expect(a1).toBeCloseTo(b1, 6);
        expect(a2).not.toBe(a1); // still coasting next frame
    });
    it("n55 recenter after zoom; collisions", () => {
        let { c, s, canvas, off } = setup();
        fire(canvas, "wheel", { deltaY: 1, clientX: 400, clientY: 300 });
        tick(s, 200);
        // center on planet surface under look vector
        expect(len(c.center)).toBeCloseTo(R, 3);
        off();
        ({ c, s, canvas, off } = setup({ checkCollisions: true }));
        setGeospatialOrientation(c, { pitch: 1.2, radius: 20 });
        c.limits.radiusMin = 50;
        tick(s, 1);
        expect(len(c.position)).toBeGreaterThanOrEqual(R + 50 - 1e-6);
        off();
        expect(listenerCount(canvas)).toBe(0);
    });
});

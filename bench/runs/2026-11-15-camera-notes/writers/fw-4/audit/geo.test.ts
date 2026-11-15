import { beforeAll, describe, expect, it } from "vitest";
import {
    createGeospatialCamera,
    createGeospatialLimits,
    setGeospatialOrientation,
    flyGeospatialCameraToAsync,
    attachGeospatialControls,
    computeLocalBasis,
} from "@babylonjs/lite";
import { makeCanvas, asCanvas, fire, pointer, key, makeScene, tick } from "./helpers";

const win = makeCanvas();
beforeAll(() => {
    (globalThis as any).window = win;
});
const flush = () => new Promise((r) => setTimeout(r, 0));
const R = 1000;
const geo = () => createGeospatialCamera({ planetRadius: R });
function track(p: Promise<void>) {
    const s = { state: "pending" as string };
    p.then(() => (s.state = "resolved"), () => (s.state = "rejected"));
    return s;
}

describe("n25 start pose and north", () => {
    it("start values", () => {
        const c = geo();
        expect(c.center).toEqual({ x: R, y: 0, z: 0 });
        expect(c.yaw).toBe(0);
        expect(c.radius).toBe(4 * R);
        expect(c.pitch).toBe(0);
    });
    it("north is +Z, poles on Z", () => {
        const e = { x: 0, y: 0, z: 0 }, n = { x: 0, y: 0, z: 0 }, u = { x: 0, y: 0, z: 0 };
        computeLocalBasis({ x: R, y: 0, z: 0 }, e, n, u);
        expect(n.z).toBeCloseTo(1, 12);
        const c = geo();
        c.center = { x: 0, y: 0, z: R };
        expect(Math.abs(c.center.z) / R).toBeLessThan(1); // moved off the Z pole
        const c2 = geo();
        c2.center = { x: 0, y: R, z: 0 };
        expect(c2.center).toEqual({ x: expect.closeTo(0, 9), y: R, z: 0 }); // Y is not a pole
    });
});

describe("n26 pitch disabled by radius", () => {
    it("", () => {
        const c = geo();
        expect(c.limits.pitchDisabledRadiusScale).toEqual({ x: 2, y: 4 });
        c.pitch = 1;
        expect(c.pitch).toBe(0.001);
        c.radius = 2 * R;
        c.pitch = 3;
        expect(c.pitch).toBeCloseTo(Math.PI / 2 - 0.01, 12);
        c.radius = 3 * R;
        c.pitch = 1.5;
        expect(c.pitch).toBeLessThan(Math.PI / 2 - 0.01);
        expect(c.pitch).toBeGreaterThan(0.001);
        c.radius = 4 * R;
        expect(c.pitch).toBe(0.001);
    });
});

describe("n27 limits defaults", () => {
    it("", () => {
        const l = createGeospatialLimits(5);
        expect([l.radiusMin, l.radiusMax, l.pitchMin, l.pitchMax, l.yawMin, l.yawMax]).toEqual([10, 20, 0.001, Math.PI / 2 - 0.01, -Infinity, Infinity]);
        expect(createGeospatialLimits(1e6).radiusMin).toBe(10);
    });
});

describe("n28 limits changes", () => {
    it("", () => {
        const c = geo();
        c.radius = 100;
        c.limits.radiusMin = 500;
        expect(c.radius).toBe(100);
        c.yaw = 0.5;
        expect(c.radius).toBe(500);
    });
});

describe("n29 center object", () => {
    it("", () => {
        const c = geo();
        const p0 = { ...c.position };
        c.center.y = 200;
        expect(c.position).toEqual(p0);
        c.yaw = 0.1;
        expect(c.position.y).toBeGreaterThan(200);
        const c2 = geo();
        c2.center = { x: R, y: 300, z: 0 };
        expect(c2.position.y).toBeGreaterThan(300);
    });
});

describe("n30 order of writes", () => {
    it("", () => {
        const c = geo();
        c.pitch = 1;
        c.radius = 100;
        expect(c.pitch).toBe(0.001);
        const c2 = geo();
        setGeospatialOrientation(c2, { pitch: 1, radius: 100 });
        expect(c2.pitch).toBe(1);
    });
});

describe("n31 wrap and poles", () => {
    it("wrap before clamp", () => {
        const c = geo();
        c.yaw = 3 * Math.PI / 2;
        expect(c.yaw).toBeCloseTo(-Math.PI / 2, 12);
        c.yaw = Math.PI;
        expect(c.yaw).toBeCloseTo(-Math.PI, 12);
        c.limits.yawMin = 0;
        c.yaw = 2 * Math.PI + 0.5;
        expect(c.yaw).toBeCloseTo(0.5, 12);
    });
    it("pole latitude about 89.96 degrees", () => {
        const c = geo();
        c.center = { x: 0, y: 0, z: R };
        const lat = (Math.asin(c.center.z / Math.hypot(c.center.x, c.center.y, c.center.z)) * 180) / Math.PI;
        expect(lat).toBeCloseTo(89.96, 1);
    });
});

describe("n32 controls", () => {
    it("needs scene? signature requires it; keys on window; wheel sign only; buttons", () => {
        const c = geo();
        const cv = makeCanvas();
        const s = makeScene();
        const n0 = win.listeners.get("keydown")?.length ?? 0;
        const off = attachGeospatialControls(c, asCanvas(cv), s);
        expect(win.listeners.get("keydown")?.length).toBe(n0 + 1);
        expect(cv.listeners.has("keydown")).toBe(false);
        off();
        expect(() => attachGeospatialControls(c, asCanvas(makeCanvas()), undefined as any)).toThrow();
    });
    it("wheel by sign only", () => {
        const r: number[] = [];
        for (const dy of [-1, -1000]) {
            const c = geo();
            const cv = makeCanvas();
            const s = makeScene();
            attachGeospatialControls(c, asCanvas(cv), s, { zoomToCursor: false });
            fire(cv, "wheel", { deltaY: dy, clientX: 400, clientY: 300 });
            tick(s, 5);
            r.push(c.radius);
        }
        expect(r[0]).toBeLessThan(4 * R);
        expect(r[0]).toBe(r[1]);
    });
    it("right/middle rotate, left pans", () => {
        for (const button of [1, 2, 3]) {
            const c = geo();
            c.radius = 1.5 * R;
            const cv = makeCanvas();
            const s = makeScene();
            attachGeospatialControls(c, asCanvas(cv), s);
            fire(cv, "pointerdown", pointer({ button, clientX: 400, clientY: 300 }));
            fire(cv, "pointermove", pointer({ button, clientX: 450, clientY: 330 }));
            tick(s);
            expect(c.yaw, `button ${button}`).not.toBe(0);
        }
        const c = geo();
        c.radius = 1.5 * R;
        const cv = makeCanvas();
        const s = makeScene();
        attachGeospatialControls(c, asCanvas(cv), s);
        fire(cv, "pointerdown", pointer({ button: 0, clientX: 400, clientY: 300 }));
        fire(cv, "pointermove", pointer({ button: 0, clientX: 450, clientY: 330 }));
        tick(s);
        expect(c.yaw).toBe(0);
        expect(c.center.x === R && c.center.y === 0 && c.center.z === 0).toBe(false);
    });
    it("left double-click on planet flies", async () => {
        const c = geo();
        const cv = makeCanvas();
        const s = makeScene();
        attachGeospatialControls(c, asCanvas(cv), s);
        const n = s._beforeRender.length;
        fire(cv, "dblclick", { button: 2, buttons: 0, clientX: 420, clientY: 300 });
        expect(s._beforeRender.length).toBe(n);
        fire(cv, "dblclick", { button: 0, buttons: 0, clientX: 0, clientY: 0 }); // off planet (corner)
        expect(s._beforeRender.length).toBe(n);
        fire(cv, "dblclick", { button: 0, buttons: 0, clientX: 420, clientY: 300 });
        expect(s._beforeRender.length).toBe(n + 1);
        expect(c._cancelFly).toBeDefined();
    });
});

describe("n33 fixed speeds, inertia, cancels flight", () => {
    it("rotation has no inertia; zoom coasts", () => {
        const c = geo();
        c.radius = 1.5 * R;
        const cv = makeCanvas();
        const s = makeScene();
        attachGeospatialControls(c, asCanvas(cv), s);
        fire(cv, "pointerdown", pointer({ button: 2, clientX: 400, clientY: 300 }));
        fire(cv, "pointermove", pointer({ button: 2, clientX: 450, clientY: 300 }));
        tick(s);
        const y1 = c.yaw;
        tick(s);
        expect(c.yaw).toBe(y1);
        fire(cv, "pointerup", pointer({ button: 2 }));
        fire(cv, "wheel", { deltaY: -1, clientX: 400, clientY: 300 });
        tick(s);
        const r1 = c.radius;
        tick(s);
        expect(c.radius).toBeLessThan(r1);
    });
    it("any input cancels a flight: wheel", async () => {
        const c = geo();
        const cv = makeCanvas();
        const s = makeScene();
        attachGeospatialControls(c, asCanvas(cv), s);
        const st = track(flyGeospatialCameraToAsync(c, s, { yaw: 1, durationMs: 10000 }));
        tick(s);
        fire(cv, "wheel", { deltaY: -1, clientX: 400, clientY: 300 });
        tick(s);
        await flush();
        expect(st.state).toBe("resolved");
    });
    it("any input cancels a flight: left drag off the planet", async () => {
        const c = geo();
        const cv = makeCanvas();
        const s = makeScene();
        attachGeospatialControls(c, asCanvas(cv), s);
        const st = track(flyGeospatialCameraToAsync(c, s, { yaw: 1, durationMs: 10000 }));
        tick(s);
        fire(cv, "pointerdown", pointer({ button: 0, clientX: 2, clientY: 2 }));
        fire(cv, "pointermove", pointer({ button: 0, clientX: 60, clientY: 40 }));
        tick(s);
        await flush();
        expect(st.state).toBe("resolved");
    });
    it("any input cancels a flight: key held", async () => {
        const c = geo();
        const cv = makeCanvas();
        const s = makeScene();
        attachGeospatialControls(c, asCanvas(cv), s);
        const st = track(flyGeospatialCameraToAsync(c, s, { yaw: 1, durationMs: 10000 }));
        tick(s);
        fire(win, "keydown", key("ArrowUp"));
        tick(s);
        fire(win, "keyup", key("ArrowUp"));
        await flush();
        expect(st.state).toBe("resolved");
    });
});

describe("n34 recenter when pan/zoom stops", () => {
    it("", () => {
        const c = geo();
        c.radius = 1.5 * R;
        setGeospatialOrientation(c, { pitch: 0.3, yaw: 0.2 });
        const cv = makeCanvas();
        const s = makeScene();
        attachGeospatialControls(c, asCanvas(cv), s, { zoomToCursor: false });
        fire(cv, "wheel", { deltaY: -1, clientX: 400, clientY: 300 });
        for (let i = 0; i < 200; i++) tick(s);
        const pos = { ...c.position };
        const look = { ...c._lookAt };
        // center on sphere and along look vector
        expect(Math.hypot(c.center.x, c.center.y, c.center.z)).toBeCloseTo(R, 6);
        const d = { x: c.center.x - pos.x, y: c.center.y - pos.y, z: c.center.z - pos.z };
        expect(Math.hypot(d.x, d.y, d.z)).toBeCloseTo(c.radius, 6);
        expect(d.x / c.radius).toBeCloseTo(look.x, 6);
    });
});

describe("n35 pitch clamp and sphere pick", () => {
    it("rotation pitch clamp [0, PI/2-0.001] then limits", () => {
        const c = geo();
        c.radius = 1.5 * R;
        c.limits.pitchMax = 3;
        c.limits.pitchDisabledRadiusScale = null;
        const cv = makeCanvas();
        const s = makeScene();
        attachGeospatialControls(c, asCanvas(cv), s);
        fire(cv, "pointerdown", pointer({ button: 2, clientX: 400, clientY: 300 }));
        fire(cv, "pointermove", pointer({ button: 2, clientX: 400, clientY: 300 + 100000 }));
        tick(s);
        expect(c.pitch).toBeCloseTo(Math.PI / 2 - 0.001, 9);
    });
    it("pick against limits.planetRadius sphere", () => {
        const c = geo();
        c.limits.planetRadius = 10; // tiny sphere: centre of the screen still hits, a ray at 300px off misses
        const cv = makeCanvas();
        const s = makeScene();
        attachGeospatialControls(c, asCanvas(cv), s);
        const n = s._beforeRender.length;
        fire(cv, "dblclick", { button: 0, buttons: 0, clientX: 600, clientY: 300 });
        expect(s._beforeRender.length).toBe(n);
    });
});

describe("n36 collisions", () => {
    it("lifts center", () => {
        const c = geo();
        const cv = makeCanvas();
        const s = makeScene();
        setGeospatialOrientation(c, { radius: 20, pitch: 0.001, center: { x: R - 50, y: 0, z: 0 } });
        expect(Math.hypot(c.position.x, c.position.y, c.position.z)).toBeLessThan(R + 10);
        attachGeospatialControls(c, asCanvas(cv), s, { checkCollisions: true });
        tick(s);
        expect(Math.hypot(c.position.x, c.position.y, c.position.z)).toBeGreaterThanOrEqual(R + 10 - 1e-6);
        const c2 = geo();
        setGeospatialOrientation(c2, { radius: 20, pitch: 0.001, center: { x: R - 50, y: 0, z: 0 } });
        attachGeospatialControls(c2, asCanvas(makeCanvas()), makeScene());
        expect(c2.limits).toBeDefined();
    });
});

describe("n37 keys", () => {
    function run(code: string, mods: string[] = []) {
        const c = geo();
        c.radius = 1.5 * R;
        const cv = makeCanvas();
        const s = makeScene();
        attachGeospatialControls(c, asCanvas(cv), s);
        for (const m of mods) fire(win, "keydown", key(m));
        fire(win, "keydown", key(code));
        tick(s);
        const out = { yaw: c.yaw, pitch: c.pitch, radius: c.radius, center: { ...c.center } };
        fire(win, "keyup", key(code));
        for (const m of mods) fire(win, "keyup", key(m));
        return out;
    }
    it("arrows pan north/east", () => {
        const up = run("ArrowUp");
        expect(up.center.z).toBeGreaterThan(0);
        const right = run("ArrowRight");
        expect(Math.abs(right.center.y)).toBeGreaterThan(0);
        expect(right.center.z).toBeCloseTo(0, 6);
    });
    it("pan per frame equals radius*0.0015", () => {
        const up = run("ArrowUp");
        expect(Math.hypot(up.center.x - R, up.center.y, up.center.z)).toBeCloseTo(1.5 * R * 0.0015, 3);
    });
    it("ctrl rotates, +/- zoom", () => {
        const r = run("ArrowRight", ["ControlLeft"]);
        expect(r.yaw).not.toBe(0);
        expect(run("Equal").radius).toBeLessThan(1.5 * R);
        expect(run("NumpadAdd").radius).toBeLessThan(1.5 * R);
        expect(run("Minus").radius).toBeGreaterThan(1.5 * R);
        expect(run("NumpadSubtract").radius).toBeGreaterThan(1.5 * R);
    });
});

describe("n23 fly never rejects; defaults", () => {
    it("new flight resolves old; duration default 1000", async () => {
        const c = geo();
        const s = makeScene();
        const a = track(flyGeospatialCameraToAsync(c, s, { yaw: 1 }));
        tick(s, 1, 500);
        // cubic in-out at g=0.5 is 0.5
        expect(c.yaw).toBeCloseTo(0.5, 9);
        const b = track(flyGeospatialCameraToAsync(c, s, { yaw: 0 }));
        await flush();
        expect(a.state).toBe("resolved");
        tick(s, 1, 250);
        // g=0.25: ease = 0.5*(0.5)^3 = 0.0625
        expect(c.yaw).toBeCloseTo(0.5 - 0.5 * 0.0625, 9);
        tick(s, 1, 750);
        await flush();
        expect(b.state).toBe("resolved");
        expect(c.yaw).toBeCloseTo(0, 12);
    });
});

describe("n24 fly paths and clamping", () => {
    it("yaw shortest, pitch/radius linear in eased progress, clamped", async () => {
        const c = geo();
        setGeospatialOrientation(c, { yaw: 3, radius: 1.5 * R, pitch: 0.2 });
        const s = makeScene();
        const ease = (g: number) => g;
        void flyGeospatialCameraToAsync(c, s, { yaw: -3, pitch: 0.6, radius: 1.7 * R, ease });
        tick(s, 1, 500);
        // shortest yaw from 3 to -3 goes through PI
        expect(Math.abs(c.yaw)).toBeGreaterThan(3);
        expect(c.pitch).toBeCloseTo(0.4, 9);
        expect(c.radius).toBeCloseTo(1.6 * R, 9);
        const c2 = geo();
        const s2 = makeScene();
        const p = flyGeospatialCameraToAsync(c2, s2, { radius: 100 * R });
        tick(s2, 1, 1000);
        await p;
        expect(c2.radius).toBe(4 * R);
    });
});
